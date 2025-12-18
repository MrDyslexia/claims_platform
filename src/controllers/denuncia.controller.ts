import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import type { Transaction } from 'sequelize';
import { sequelize, models } from '../db/sequelize';
import { emailService } from '../utils/email.service';
import {
    DEFAULT_EMPRESA,
    DEFAULT_ESTADO,
    FORM_CATEGORIES,
    FORM_RELATIONSHIPS,
    FORM_TIMEFRAMES,
    ensureFormMetadataSeeded,
} from '../data/form-metadata';
import {
    sha256Buffer,
    verifyClaveWithSalt,
} from '../utils/crypto';

import {
    uploadFile,
} from '../services/upload.service';
import { getUploadErrorMessage } from '../config/upload';

const CLAVE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CLAVE_LENGTH = 8;
const NUMERO_PADDING = 6;

interface InvolvedPartyPayload {
    name?: string;
    type?: string;
}

interface EvidencePayload {
    name?: string;
    type?: string;
    size?: number;
}

interface PublicDenunciaPayload {
    subcategory: string;
    subcategoryName?: string;
    description: string;
    details?: string;
    country?: string;
    relationship?: string;
    relationshipLabel?: string;
    timeframe?: string;
    timeframeLabel?: string;
    involvedParties?: InvolvedPartyPayload[];
    evidence?: EvidencePayload[];
    isAnonymous?: boolean;
    canal_id?: number | null;
    fullName?: string;
    rut?: string;
    email?: string;
    phone?: string;
}

interface CreateDenunciaInput {
    empresaId: number;
    tipoId: number;
    estadoId: number;
    asunto: string;
    descripcion: string;
    canalOrigen?: string;
    canalId?: number | null;
    denuncianteNombre?: string | null;
    denuncianteEmail?: string | null;
    denuncianteFono?: string | null;
    esAnonima?: boolean | number;
    createdBy?: number | null;
    prioridad?: string;
    pais?: string | null;
}

interface CreateDenunciaResult {
    denuncia: any;
    clave: string;
}

function sanitizeString(value: unknown): string {
    if (typeof value !== 'string') return '';
    return value.trim();
}

function normalizeNullableString(value: unknown): string | null {
    const sanitized = sanitizeString(value);
    return sanitized ? sanitized : null;
}

function generateRandomClave(length = CLAVE_LENGTH) {
    const bytes = crypto.randomBytes(length);
    const chars = CLAVE_CHARSET;
    let result = '';
    for (let i = 0; i < length; i += 1) {
        result += chars[bytes[i] % chars.length];
    }
    return result;
}

async function nextNumero(transaction: Transaction) {
    const currentYear = new Date().getFullYear();
    const [seq] = await models.SeqDenuncia.findOrCreate({
        where: { anio: currentYear },
        defaults: { correlativo: 0 },
        transaction,
    });
    const correlativoActual = Number(seq.get('correlativo')) || 0;
    const siguiente = correlativoActual + 1;
    await seq.update({ correlativo: siguiente }, { transaction });
    const correlativoStr = String(siguiente).padStart(NUMERO_PADDING, '0');
    return `${currentYear}-${correlativoStr}`;
}

async function createDenunciaRecord(
    input: CreateDenunciaInput
): Promise<CreateDenunciaResult> {
    return sequelize.transaction(async (transaction) => {
        const numero = await nextNumero(transaction);
        const clave = generateRandomClave();
        const saltBuffer = crypto.randomBytes(16);
        const saltHex = saltBuffer.toString('hex').toUpperCase();
        const claveHash = sha256Buffer(`${clave}${saltHex}`);

        const denuncia = await models.Denuncia.create(
            {
                numero,
                clave_hash: claveHash,
                clave_salt: saltBuffer,
                empresa_id: input.empresaId,
                tipo_id: input.tipoId,
                estado_id: input.estadoId,
                asunto: input.asunto,
                descripcion: input.descripcion,
                canal_origen: sanitizeString(input.canalOrigen) || 'WEB',
                canal_id: input.canalId ?? null,
                denunciante_nombre: normalizeNullableString(
                    input.denuncianteNombre
                ),
                denunciante_email: normalizeNullableString(
                    input.denuncianteEmail
                ),
                denunciante_fono: normalizeNullableString(
                    input.denuncianteFono
                ),
                es_anonima: input.esAnonima ? 1 : 0,
                is_anonymous: input.esAnonima ? 1 : 0,
                created_by: input.createdBy ?? null,
                pais: normalizeNullableString(input.pais),
            },
            { transaction }
        );

        return { denuncia, clave };
    });
}

function findSubcategoryName(subcategoryCode?: string) {
    if (!subcategoryCode) return undefined;
    const upper = subcategoryCode.toUpperCase();
    for (const category of FORM_CATEGORIES) {
        const found = category.subcategories.find(
            (sub) => sub.code.toUpperCase() === upper
        );
        if (found) return found.name;
    }
    return undefined;
}

function getRelationshipLabel(id?: string) {
    if (!id) return undefined;
    return FORM_RELATIONSHIPS.find((rel) => rel.id === id)?.title;
}

function getTimeframeLabel(id?: string) {
    if (!id) return undefined;
    return FORM_TIMEFRAMES.find((tf) => tf.id === id)?.title;
}

const INVOLVED_TYPE_LABELS: Record<string, string> = {
    person: 'Persona',
    company: 'Empresa',
    entity: 'Entidad',
};

function formatInvolvedParties(parties: InvolvedPartyPayload[]) {
    if (!Array.isArray(parties) || !parties.length) return undefined;
    const lines = parties
        .map((party) => {
            const name = sanitizeString(party.name);
            const typeLabel =
                INVOLVED_TYPE_LABELS[sanitizeString(party.type)] ?? 'Otro';
            if (name) {
                return `• ${name} (${typeLabel})`;
            }
            return undefined;
        })
        .filter(Boolean);

    if (!lines.length) return undefined;
    return `Partes involucradas:\n${lines.join('\n')}`;
}

function formatEvidenceSummary(evidence: EvidencePayload[]) {
    if (!Array.isArray(evidence) || !evidence.length) return undefined;
    const lines = evidence
        .map((item) => {
            const name = sanitizeString(item.name) || 'Archivo';
            const type = sanitizeString(item.type) || 'desconocido';
            const size = item.size ? `${item.size} bytes` : '';
            return `• ${name} (${type}${size ? `, ${size}` : ''})`;
        })
        .filter(Boolean);
    if (!lines.length) return undefined;
    return `Evidencias adjuntas (meta):\n${lines.join('\n')}`;
}

function buildDescripcionFromPayload(payload: PublicDenunciaPayload) {
    const sections: string[] = [];

    const relato = sanitizeString(payload.description);
    if (relato) sections.push(`Relato detallado:\n${relato}`);

    const detalles = sanitizeString(payload.details);
    if (detalles) sections.push(`Detalles adicionales:\n${detalles}`);

    const relationshipLabel = getRelationshipLabel(payload.relationship);
    if (relationshipLabel) {
        sections.push(`Relación con la empresa: ${relationshipLabel}`);
    }

    const timeframeLabel =
        sanitizeString(payload.timeframeLabel) ||
        getTimeframeLabel(payload.timeframe);
    if (timeframeLabel) {
        sections.push(`Duración del problema: ${timeframeLabel}`);
    }

    // const country = sanitizeString(payload.country);
    // if (country) {
    //     sections.push(`País del incidente: ${country}`);
    // }

    const involvedSection = formatInvolvedParties(
        payload.involvedParties ?? []
    );
    if (involvedSection) sections.push(involvedSection);

    if (!payload.isAnonymous) {
        const identificacion: string[] = [];
        const fullName = sanitizeString(payload.fullName);
        if (fullName) identificacion.push(`Nombre: ${fullName}`);
        const rut = sanitizeString(payload.rut);
        if (rut) identificacion.push(`RUT: ${rut}`);
        const email = sanitizeString(payload.email);
        if (email) identificacion.push(`Email: ${email}`);
        const phone = sanitizeString(payload.phone);
        if (phone) identificacion.push(`Teléfono: ${phone}`);
        if (identificacion.length) {
            sections.push(
                `Datos del denunciante:\n${identificacion.join('\n')}`
            );
        }
    }

    const evidenceSection = formatEvidenceSummary(payload.evidence ?? []);
    if (evidenceSection) sections.push(evidenceSection);

    const descripcion = sections.filter(Boolean).join('\n\n').trim();
    if (descripcion.length >= 10) return descripcion;

    const fallbackDetalle = relato || detalles;
    if (fallbackDetalle && fallbackDetalle.length >= 10) {
        return fallbackDetalle;
    }

    const fallbackSubcategoria =
        sanitizeString(payload.subcategoryName) ||
        findSubcategoryName(payload.subcategory) ||
        'Tipo no especificado';
    return `Reclamo registrado para la categoría ${fallbackSubcategoria}.`;
}

export const crearDenuncia = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        const payload = req.body;
        const empresaId = Number(payload.empresa_id);
        const tipoId = Number(payload.tipo_id);
        const estadoId = Number(payload.estado_id);
        const asunto = sanitizeString(payload.asunto);
        const descripcion = sanitizeString(payload.descripcion);

        if (
            !empresaId ||
            !tipoId ||
            !estadoId ||
            !asunto ||
            descripcion.length < 10
        ) {
            return res.status(400).json({ error: 'missing or invalid fields' });
        }

        const createdBy = req.user?.get?.('id') ?? null;

        const { denuncia, clave } = await createDenunciaRecord({
            empresaId,
            tipoId,
            estadoId,
            asunto,
            descripcion,
            canalOrigen: payload.canal_origen,
            denuncianteNombre: payload.denunciante_nombre,
            denuncianteEmail: payload.denunciante_email,
            denuncianteFono: payload.denunciante_fono,
            esAnonima: payload.es_anonima,
            createdBy,
            prioridad: payload.prioridad,
            pais: payload.pais,
        });

        // Enviar correo de confirmación si hay email
        const emailDenunciante = normalizeNullableString(
            payload.denunciante_email
        );
        if (emailDenunciante) {
            try {
                await emailService.sendDenunciaConfirmation(emailDenunciante, {
                    numero: denuncia.get('numero') as string,
                    clave,
                    asunto,
                    nombreDenunciante:
                        normalizeNullableString(payload.denunciante_nombre) ||
                        undefined,
                });
            } catch (emailError) {
                console.error('Error sending confirmation email:', emailError);
                // No fallar la creación de la denuncia si falla el email
            }
        }

        return res.status(201).json({
            id: denuncia.get('id'),
            numero: denuncia.get('numero'),
            clave,
        });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

export const crearDenunciaPublica = async (req: Request, res: Response) => {
    const payload = (req.body ?? {}) as PublicDenunciaPayload;
    const subcategoryCode = sanitizeString(payload.subcategory);
    if (!subcategoryCode) {
        return res
            .status(400)
            .json({ error: 'subcategory (code) is required to registrar' });
    }

    const descripcionBruta = sanitizeString(payload.description);
    if (descripcionBruta.length < 20) {
        return res
            .status(400)
            .json({ error: 'description must be at least 20 characters' });
    }

    // Validar canal si se proporciona
    const canalId = payload.canal_id ? Number(payload.canal_id) : undefined;
    let canal: any = null;

    if (canalId) {
        canal = await models.CanalDenuncia.findByPk(canalId);

        if (!canal) {
            return res.status(400).json({
                error: 'Canal de denuncia inválido',
            });
        }

        if (!canal.get('activo')) {
            return res.status(400).json({
                error: 'El canal seleccionado no está activo',
            });
        }

        // Validar Ley Karim no permite anónimo
        if (canal.get('requiere_identificacion') && payload.isAnonymous) {
            return res.status(400).json({
                error: 'El canal Ley Karim requiere identificación del denunciante',
                canal: canal.get('nombre'),
            });
        }

        // Validar que haya correo si el canal requiere identificación
        const emailProvided = sanitizeString(payload.email);
        if (canal.get('requiere_identificacion') && !emailProvided) {
            return res.status(400).json({
                error: 'Debe proporcionar un correo electrónico para este canal',
                canal: canal.get('nombre'),
            });
        }
    }

    try {
        await ensureFormMetadataSeeded(models);

        const tipo = await models.TipoDenuncia.findOne({
            where: { codigo: subcategoryCode.toUpperCase() },
        });
        
        // Si no se encuentra por código, buscar por nombre
        const tipoFinal = tipo || await models.TipoDenuncia.findOne({
            where: { nombre: subcategoryCode },
        });
        
        if (!tipoFinal) {
            return res.status(400).json({ error: 'tipo denuncia not found', subcategory: subcategoryCode });
        }

        const estado = await models.EstadoDenuncia.findOne({
            where: { codigo: DEFAULT_ESTADO.code.toUpperCase() },
        });
        if (!estado) {
            return res
                .status(500)
                .json({ error: 'estado default not available' });
        }

        const empresa = await models.Empresa.findOne({
            where: { rut: DEFAULT_EMPRESA.rut },
        });
        if (!empresa) {
            return res
                .status(500)
                .json({ error: 'empresa default not available' });
        }

        const subcategoryName =
            sanitizeString(payload.subcategoryName) ||
            findSubcategoryName(subcategoryCode) ||
            (tipoFinal?.get('nombre') as string);

        let asunto =
            sanitizeString(payload.details).slice(0, 300) ||
            subcategoryName.slice(0, 300);

        // Asegurar longitud mínima de 5 caracteres
        if (asunto.length < 5) {
            asunto = `${asunto} (Denuncia)`;
        }

        const descripcionFinal = buildDescripcionFromPayload({
            ...payload,
            subcategoryName,
        });

        const denuncianteNombre = payload.isAnonymous
            ? null
            : sanitizeString(payload.fullName);
        const denuncianteFono = payload.isAnonymous
            ? null
            : sanitizeString(payload.phone);

        // Email para notificaciones
        const emailDenunciante = sanitizeString(payload.email) || null;

        const { denuncia, clave } = await createDenunciaRecord({
            empresaId: Number(empresa!.get('id')),
            tipoId: Number(tipoFinal!.get('id')),
            estadoId: Number(estado!.get('id')),
            asunto,
            descripcion: descripcionFinal,
            canalOrigen: 'WEB',
            canalId,
            denuncianteNombre,
            denuncianteEmail: emailDenunciante,
            denuncianteFono,
            esAnonima: payload.isAnonymous ?? false,
            createdBy: null,
            pais: payload.country,
        });

        // Enviar correo de confirmación si hay email
        if (emailDenunciante) {
            try {
                await emailService.sendDenunciaConfirmation(
                    emailDenunciante,
                    {
                        numero: denuncia.get('numero') as string,
                        clave,
                        asunto,
                        nombreDenunciante: denuncianteNombre || undefined,
                    }
                );
            } catch (emailError) {
                console.error('Error sending confirmation email:', emailError);
                // No fallar la creación de la denuncia si falla el email
            }
        }

        // Subir archivos adjuntos si existen
        const files = req.files as Express.Multer.File[];
        let uploadResults: any = null;

        if (files && files.length > 0) {
            try {
                const results = await Promise.all(
                    files.map((file) =>
                        uploadFile(
                            file,
                            Number(denuncia.get('id')),
                            null, // userId es null para denuncias públicas
                            'DENUNCIA'
                        )
                    )
                );

                const successful = results.filter((r: any) => r.success);
                const failed = results.filter((r: any) => !r.success);

                uploadResults = {
                    uploaded: successful.length,
                    failed: failed.length,
                    files: successful.map((r: any) => ({
                        id: r.fileId,
                        filename: r.filename,
                        size: r.size,
                        path: r.path,
                    })),
                    errors: failed.map((r: any) => ({
                        filename: r.filename,
                        error: getUploadErrorMessage(
                            r.errorCode || 'UPLOAD_ERROR'
                        ),
                        code: r.errorCode,
                    })),
                };
            } catch (uploadError) {
                console.error('Error uploading files:', uploadError);
                // No fallar la creación de la denuncia si fallan los archivos, pero reportarlo
                uploadResults = { error: 'Error processing uploads' };
            }
        }

        return res.status(201).json({
            id: denuncia.get('id'),
            numero: denuncia.get('numero'),
            clave,
            estado: DEFAULT_ESTADO.code,
            uploads: uploadResults,
        });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

export const lookupDenuncia = async (req: Request, res: Response) => {
    const { numero, clave } = req.body as { numero?: string; clave?: string };
    if (!numero || !clave) {
        return res.status(400).json({ error: 'numero and clave required' });
    }

    const denuncia = await models.Denuncia.findOne({ where: { numero } });
    if (!denuncia) return res.status(404).json({ error: 'not found' });

    const ok = verifyClaveWithSalt(
        String(clave),
        denuncia.get('clave_salt') as Buffer,
        denuncia.get('clave_hash') as Buffer
    );
    if (!ok) return res.status(401).json({ error: 'clave invalida' });

    // Obtener información relacionada
    const estado = await models.EstadoDenuncia.findByPk(
        Number(denuncia.get('estado_id'))
    );
    const empresa = await models.Empresa.findByPk(
        Number(denuncia.get('empresa_id'))
    );
    const tipo = await models.TipoDenuncia.findByPk(
        Number(denuncia.get('tipo_id'))
    );

    // Obtener historial de estados con nombres de estados
    const statusHistory = await models.DenunciaHistorialEstado.findAll({
        where: { denuncia_id: denuncia.get('id') },
        order: [['created_at', 'DESC']],
    });

    const statusHistoryWithNames = await Promise.all(
        statusHistory.map(async (sh) => {
            const deEstado = sh.get('de_estado_id')
                ? await models.EstadoDenuncia.findByPk(
                      Number(sh.get('de_estado_id'))
                  )
                : null;
            const aEstado = await models.EstadoDenuncia.findByPk(
                Number(sh.get('a_estado_id'))
            );

            return {
                id: sh.get('id'),
                denuncia_id: sh.get('denuncia_id'),
                de_estado_id: sh.get('de_estado_id'),
                de_estado_nombre: deEstado?.get('nombre') || null,
                a_estado_id: sh.get('a_estado_id'),
                a_estado_nombre: aEstado?.get('nombre') || 'Desconocido',
                motivo: sh.get('motivo') || null,
                fecha_cambio: sh.get('created_at'),
            };
        })
    );

    // Obtener comentarios con información del autor
    // Solo comentarios públicos para denunciantes que hacen lookup
    const comentarios = await models.Comentario.findAll({
        where: {
            denuncia_id: denuncia.get('id'),
            visibility: 'publico', // Solo comentarios públicos
        },
        order: [['created_at', 'ASC']],
    });

    const commentsWithAuthor = await Promise.all(
        comentarios.map(async (c) => {
            let autorNombre = 'Equipo de Soporte';

            console.log(c);
            if (c.get('usuario_id')) {
                const usuario = await models.Usuario.findByPk(
                    Number(c.get('usuario_id'))
                );
                if (usuario) {
                    autorNombre = usuario.get('nombre_completo') as string;
                }
            }

            // Si no hay usuario_id, usar el autor_nombre del comentario
            if (!c.get('usuario_id') && c.get('autor_nombre')) {
                autorNombre = c.get('autor_nombre') as string;
            }

            return {
                id: c.get('id'),
                contenido: c.get('contenido'),
                autor_nombre: autorNombre,
                fecha_creacion: c.get('created_at'),
            };
        })
    );

    return res.json({
        id: denuncia.get('id'),
        numero: denuncia.get('numero'),
        codigo: denuncia.get('numero'),
        asunto: denuncia.get('asunto'),
        descripcion: denuncia.get('descripcion'),
        pais: denuncia.get('pais') || null,
        estado_id: denuncia.get('estado_id'),
        estado: estado?.get('nombre') || 'Desconocido',
        empresa_id: denuncia.get('empresa_id'),
        empresa: {
            id: empresa?.get('id'),
            nombre: empresa?.get('nombre') || 'Empresa Desconocida',
            email_contacto: empresa?.get('email_contacto') || null,
            telefono_contacto: empresa?.get('telefono_contacto') || null,
        },
        tipo_id: denuncia.get('tipo_id'),
        tipo: tipo?.get('nombre') || 'Tipo desconocido',
        fecha_creacion: denuncia.get('created_at'),
        fecha_actualizacion: denuncia.get('fecha_actualizacion'),
        denunciante_nombre: denuncia.get('denunciante_nombre') || null,
        denunciante_email: denuncia.get('denunciante_email') || null,
        denunciante_fono: denuncia.get('denunciante_fono') || null,
        es_anonima: denuncia.get('es_anonima'),
        nota_satisfaccion: denuncia.get('nota_satisfaccion') || null,
        statusHistory: statusHistoryWithNames,
        comments: commentsWithAuthor,
    });
};

/**
 * Autorizar revelado de correo usando clave de seguimiento + recovery code
 * POST /api/public/denuncias/:numero/autorizar-contacto
 *
 * Permite al denunciante autorizar el revelado de su correo cuando la denuncia
 * está en estado "Requiere Contacto"
 */

// autorizarContacto fue eliminado - funcionalidad de revelación de identidad no es necesaria

// Estados permitidos para calificar: RESUELTO y CERRADO
const ESTADOS_CALIFICABLES = ['RESUELTO', 'CERRADO'];

/**
 * Guardar nota de satisfacción (1-5) de denunciante
 * POST /api/denuncias/public/satisfaccion
 * 
 * Solo permitido cuando el estado es RESUELTO o CERRADO
 * Solo se puede calificar una vez
 */
export const guardarNotaSatisfaccion = async (req: Request, res: Response) => {
    const { numero, clave, nota } = req.body as { 
        numero?: string; 
        clave?: string; 
        nota?: number 
    };

    // Validar campos requeridos
    if (!numero || !clave) {
        return res.status(400).json({ error: 'numero and clave required' });
    }

    // Validar nota (1-5)
    const notaNum = Number(nota);
    if (!nota || isNaN(notaNum) || notaNum < 1 || notaNum > 5) {
        return res.status(400).json({ error: 'nota must be between 1 and 5' });
    }

    // Buscar denuncia
    const denuncia = await models.Denuncia.findOne({ where: { numero } });
    if (!denuncia) {
        return res.status(404).json({ error: 'not found' });
    }

    // Verificar clave
    const ok = verifyClaveWithSalt(
        String(clave),
        denuncia.get('clave_salt') as Buffer,
        denuncia.get('clave_hash') as Buffer
    );
    if (!ok) {
        return res.status(401).json({ error: 'clave invalida' });
    }

    // Verificar que no haya sido calificada ya
    const notaExistente = denuncia.get('nota_satisfaccion');
    if (notaExistente !== null && notaExistente !== undefined) {
        return res.status(400).json({ 
            error: 'already rated',
            nota_satisfaccion: notaExistente 
        });
    }

    // Verificar estado (debe ser RESUELTO o CERRADO)
    const estado = await models.EstadoDenuncia.findByPk(
        Number(denuncia.get('estado_id'))
    );
    const estadoCodigo = estado?.get('codigo') as string | undefined;

    if (!estadoCodigo || !ESTADOS_CALIFICABLES.includes(estadoCodigo.toUpperCase())) {
        return res.status(400).json({ 
            error: 'cannot rate - claim must be resolved or closed',
            estado: estado?.get('nombre') || 'Desconocido'
        });
    }

    // Guardar la nota
    try {
        await denuncia.update({ nota_satisfaccion: notaNum });
        return res.json({ 
            ok: true, 
            nota_satisfaccion: notaNum,
            message: 'Gracias por tu calificación' 
        });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
};


export const asignarDenuncia = async (
    req: Request & { user?: any },
    res: Response
) => {
    const { denuncia_id, usuario_id } = req.body;
    if (!denuncia_id || !usuario_id) {
        return res.status(400).json({ error: 'missing fields' });
    }
    const asignado_por = req.user?.get?.('id');
    if (!asignado_por) return res.status(401).json({ error: 'unauthorized' });
    try {
        await models.DenunciaAsignacion.create({
            denuncia_id,
            usuario_id,
            asignado_por,
            activo: 1,
        });
        await models.Reasignacion.create({
            denuncia_id,
            de_usuario_id: null,
            a_usuario_id: usuario_id,
            reasignado_por: asignado_por,
        });

        // Enviar correo de notificación al denunciante si tiene email registrado
        const denuncia = await models.Denuncia.findByPk(denuncia_id);
        if (denuncia) {
            const denuncianteEmail = denuncia.get('denunciante_email') as string | null;
            if (denuncianteEmail) {
                // Enviar notificación de asignación
                emailService.sendAssignmentNotification(denuncianteEmail, {
                    numero: denuncia.get('numero') as string,
                    asunto: denuncia.get('asunto') as string,
                }).catch(err => {
                    console.error('Error sending assignment notification email:', err);
                });
            }
        }

        return res.status(201).json({ ok: true });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

export const actualizarPrioridad = async (
    req: Request & { user?: any },
    res: Response
) => {
    const { id } = req.params;
    const { prioridad } = req.body;

    if (!id || !prioridad) {
        return res.status(400).json({ error: 'missing fields' });
    }

    const validPriorities = ['baja', 'media', 'alta', 'critica'];
    if (!validPriorities.includes(prioridad.toLowerCase())) {
        return res.status(400).json({ error: 'invalid priority' });
    }

    try {
        const denuncia = await models.Denuncia.findByPk(id);
        if (!denuncia) {
            return res.status(404).json({ error: 'denuncia not found' });
        }

        await denuncia.update({ prioridad_id: prioridad.toUpperCase() });

        return res.json({ ok: true, message: 'priority updated' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

export const actualizarEstado = async (
    req: Request & { user?: any },
    res: Response
) => {
    const { id } = req.params;
    const { estado_id, motivo } = req.body;

    if (!id || !estado_id) {
        return res.status(400).json({ error: 'missing fields: id and estado_id are required' });
    }

    try {
        const denuncia = await models.Denuncia.findByPk(id);
        if (!denuncia) {
            return res.status(404).json({ error: 'denuncia not found' });
        }

        // Verificar que el nuevo estado existe
        const nuevoEstado = await models.EstadoDenuncia.findByPk(estado_id);
        if (!nuevoEstado) {
            return res.status(400).json({ error: 'estado not found' });
        }

        const estadoAnteriorId = denuncia.get('estado_id');
        const userId = req.user?.get?.('id');

        // Obtener el estado anterior para el email
        const estadoAnterior = estadoAnteriorId 
            ? await models.EstadoDenuncia.findByPk(Number(estadoAnteriorId))
            : null;

        // Crear registro en historial de estados
        await models.DenunciaHistorialEstado.create({
            denuncia_id: id,
            de_estado_id: estadoAnteriorId,
            a_estado_id: estado_id,
            motivo: motivo || null,
            cambiado_por: userId,
        });

        // Actualizar el estado de la denuncia
        await denuncia.update({ estado_id });

        // Obtener el reclamo actualizado con toda la información
        const denunciaActualizada = await models.Denuncia.findByPk(id);
        const estado = await models.EstadoDenuncia.findByPk(estado_id);
        const empresa = await models.Empresa.findByPk(Number(denunciaActualizada?.get('empresa_id')));
        const tipo = await models.TipoDenuncia.findByPk(Number(denunciaActualizada?.get('tipo_id')));

        // Obtener asignación activa
        const asignacion = await models.DenunciaAsignacion.findOne({
            where: {
                denuncia_id: id,
                activo: 1,
            },
            include: [
                {
                    model: models.Usuario,
                    as: 'asignado',
                },
            ],
        });

        // Enviar notificación por correo al denunciante si tiene email
        const denuncianteEmail = denunciaActualizada?.get('denunciante_email') as string | null;
        if (denuncianteEmail) {
            try {
                await emailService.sendStatusChangeNotification(
                    denuncianteEmail,
                    {
                        numero: denunciaActualizada?.get('numero') as string,
                        asunto: denunciaActualizada?.get('asunto') as string,
                        nombreDenunciante: denunciaActualizada?.get('denunciante_nombre') as string || undefined,
                        estadoAnterior: estadoAnterior?.get('nombre') as string || 'Sin estado',
                        estadoNuevo: nuevoEstado.get('nombre') as string,
                        motivo: motivo || undefined,
                        fechaCambio: new Date(),
                    }
                );
            } catch (emailError) {
                console.error('Error sending status change notification email:', emailError);
                // No fallar el cambio de estado si falla el email
            }
        }

        return res.json({
            id: denunciaActualizada?.get('id'),
            numero: denunciaActualizada?.get('numero'),
            asunto: denunciaActualizada?.get('asunto'),
            descripcion: denunciaActualizada?.get('descripcion'),
            pais: denunciaActualizada?.get('pais'),
            fecha_creacion: denunciaActualizada?.get('created_at'),
            estado: {
                id: estado?.get('id'),
                nombre: estado?.get('nombre'),
                codigo: estado?.get('codigo'),
            },
            prioridad: (denunciaActualizada?.get('prioridad_id') as string)?.toLowerCase(),
            empresa: {
                id: empresa?.get('id'),
                nombre: empresa?.get('nombre'),
            },
            tipo: {
                id: tipo?.get('id'),
                nombre: tipo?.get('nombre'),
            },
            denunciante: {
                nombre: denunciaActualizada?.get('denunciante_nombre'),
                email: denunciaActualizada?.get('denunciante_email'),
                telefono: denunciaActualizada?.get('denunciante_fono'),
                anonimo: denunciaActualizada?.get('es_anonima') === 1,
            },
            supervisor: asignacion?.get('asignado')
                ? {
                      id: (asignacion.get('asignado') as any).id,
                      nombre: (asignacion.get('asignado') as any).nombre_completo,
                      email: (asignacion.get('asignado') as any).email,
                  }
                : null,
        });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

export const obtenerTodosLosReclamos = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        const userId = req.user?.get('id');
        const userRoles = req.user?.get('roles') || [];
        const rolesCodigos = userRoles.map((r: any) => r.get('codigo'));

        const isAdminOrAnalyst = rolesCodigos.some((role: string) =>
            ['ADMIN', 'ANALISTA'].includes(role)
        );

        let whereClause = {};

        // Si es supervisor y no es admin/analista, filtrar solo sus asignaciones
        if (!isAdminOrAnalyst && rolesCodigos.includes('SUPERVISOR')) {
            // Buscar IDs de denuncias asignadas
            const asignaciones = await models.DenunciaAsignacion.findAll({
                where: {
                    usuario_id: userId,
                    activo: 1,
                },
                attributes: ['denuncia_id'],
            });

            const denunciaIds = asignaciones.map((a) => a.get('denuncia_id'));
            whereClause = {
                id: denunciaIds,
            };
        }

        // Obtener todos los reclamos
        const denuncias = await models.Denuncia.findAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
        });

        // Enriquecer cada reclamo con información relacionada
        const reclamosEnriquecidos = await Promise.all(
            denuncias.map(async (denuncia) => {
                const denunciaId = denuncia.get('id') as number;

                // Obtener estado
                const estado = await models.EstadoDenuncia.findByPk(
                    Number(denuncia.get('estado_id'))
                );

                // Obtener empresa
                const empresa = await models.Empresa.findByPk(
                    Number(denuncia.get('empresa_id'))
                );

                // Obtener tipo de denuncia
                const tipo = await models.TipoDenuncia.findByPk(
                    Number(denuncia.get('tipo_id'))
                );

                // Obtener historial de estados
                const statusHistory =
                    await models.DenunciaHistorialEstado.findAll({
                        where: { denuncia_id: denunciaId },
                        order: [['created_at', 'ASC']],
                    });

                const historialEstado = await Promise.all(
                    statusHistory.map(async (sh) => {
                        const deEstado = sh.get('de_estado_id')
                            ? await models.EstadoDenuncia.findByPk(
                                  Number(sh.get('de_estado_id'))
                              )
                            : null;
                        const aEstado = await models.EstadoDenuncia.findByPk(
                            Number(sh.get('a_estado_id'))
                        );

                        let cambiadoPorNombre = null;
                        if (sh.get('cambiado_por')) {
                            const usuarioCambio = await models.Usuario.findByPk(
                                Number(sh.get('cambiado_por'))
                            );
                            if (usuarioCambio) {
                                cambiadoPorNombre = `${usuarioCambio.get(
                                    'nombre_completo'
                                )}`.trim();
                            }
                        }

                        return {
                            id: sh.get('id'),
                            de_estado_id: sh.get('de_estado_id'),
                            de_estado_nombre: deEstado?.get('nombre') || null,
                            a_estado_id: sh.get('a_estado_id'),
                            a_estado_nombre:
                                aEstado?.get('nombre') || 'Desconocido',
                            motivo: sh.get('motivo') || null,
                            cambiado_por: sh.get('cambiado_por'),
                            cambiado_por_nombre: cambiadoPorNombre,
                            fecha_cambio: sh.get('created_at'),
                        };
                    })
                );

                // Obtener comentarios con información del autor
                // Los usuarios autenticados ven comentarios internos y privados
                const comentarios = await models.Comentario.findAll({
                    where: { denuncia_id: denunciaId },
                    order: [['created_at', 'ASC']],
                });

                const comentariosEnriquecidos = await Promise.all(
                    comentarios.map(async (c) => {
                        let autorNombre = 'Equipo de Soporte';
                        let autorEmail = null;

                        if (c.get('usuario_id')) {
                            const usuario = await models.Usuario.findByPk(
                                Number(c.get('usuario_id'))
                            );
                            if (usuario) {
                                autorNombre = `${usuario.get(
                                    'nombre_completo'
                                )}`.trim();
                                autorEmail = usuario.get('email') as string;
                            }
                        }

                        // Si no hay usuario_id, usar el autor_nombre del comentario
                        if (!c.get('usuario_id') && c.get('autor_nombre')) {
                            autorNombre = c.get('autor_nombre') as string;
                        }

                        if (!autorEmail && c.get('autor_email')) {
                            autorEmail = c.get('autor_email') as string;
                        }

                        return {
                            id: c.get('id'),
                            contenido: c.get('contenido'),
                            autor_nombre: autorNombre,
                            autor_email: autorEmail,
                            autor_rol: c.get('autor_rol') as string | null,
                            visibility: c.get('visibility') as string,
                            es_interno: c.get('es_interno') as boolean,
                            fecha_creacion: c.get('created_at'),
                        };
                    })
                );

                // Obtener archivos adjuntos
                const adjuntos = await models.Adjunto.findAll({
                    where: { denuncia_id: denunciaId },
                    order: [['created_at', 'ASC']],
                });

                const adjuntosEnriquecidos = adjuntos.map((adj) => ({
                    id: adj.get('id'),
                    nombre_archivo: adj.get('nombre_archivo'),
                    ruta: adj.get('ruta'),
                    mime_type: adj.get('mime_type'),
                    tamano_bytes: adj.get('tamano_bytes'),
                    tipo_vinculo: adj.get('tipo_vinculo'),
                    subido_por: adj.get('subido_por'),
                    fecha_carga: adj.get('created_at'),
                }));

                // Obtener información del denunciante
                const denunciante = {
                    nombre: denuncia.get('denunciante_nombre'),
                    email: denuncia.get('denunciante_email'),
                    fono: denuncia.get('denunciante_fono'),
                    es_anonimo: denuncia.get('es_anonima') === 1,
                };

                // Obtener resolución si existe
                const resolucion = await models.Resolucion.findOne({
                    where: { denuncia_id: denunciaId },
                });

                let resolucionInfo = null;
                if (resolucion) {
                    const resuelto_por_usuario = await models.Usuario.findByPk(
                        Number(resolucion.get('resuelto_por'))
                    );
                    resolucionInfo = {
                        id: resolucion.get('id'),
                        contenido: resolucion.get('contenido'),
                        resuelto_por: resolucion.get('resuelto_por'),
                        resuelto_por_nombre: resuelto_por_usuario
                            ? `${resuelto_por_usuario.get(
                                  'nombre_completo'
                              )}`.trim()
                            : 'Desconocido',
                        resuelto_at: resolucion.get('resuelto_at'),
                        pdf_path: resolucion.get('pdf_path'),
                    };
                }

                // Obtener asignación activa de supervisor
                const asignacion = await models.DenunciaAsignacion.findOne({
                    where: {
                        denuncia_id: denunciaId,
                        activo: 1,
                    },
                    include: [
                        {
                            model: models.Usuario,
                            as: 'asignado',
                        },
                    ],
                });

                return {
                    id: denuncia.get('id'),
                    numero: denuncia.get('numero'),
                    asunto: denuncia.get('asunto'),
                    pais: denuncia.get('pais'),
                    descripcion: denuncia.get('descripcion'),
                    canal_origen: denuncia.get('canal_origen'),
                    fecha_creacion: denuncia.get('created_at'),
                    fecha_actualizacion: denuncia.get('updated_at'),
                    estado: {
                        id: estado?.get('id'),
                        nombre: estado?.get('nombre') || 'Desconocido',
                        codigo: estado?.get('codigo'),
                    },
                    prioridad: (denuncia.get('prioridad_id') as string)?.toLowerCase(),
                    empresa: {
                        id: empresa?.get('id'),
                        nombre: empresa?.get('nombre') || 'Empresa Desconocida',
                        rut: empresa?.get('rut'),
                        email: empresa?.get('email'),
                        telefono: empresa?.get('telefono'),
                        direccion: empresa?.get('direccion'),
                    },
                    tipo: {
                        id: tipo?.get('id'),
                        nombre: tipo?.get('nombre') || 'Tipo desconocido',
                        codigo: tipo?.get('codigo'),
                    },
                    denunciante: {
                        nombre: denuncia.get('denunciante_nombre'),
                        email: denuncia.get('denunciante_email'),
                        telefono: denuncia.get('denunciante_fono'),
                        anonimo: denuncia.get('es_anonima') === 1,
                    },
                    supervisor: asignacion?.get('asignado')
                        ? {
                              id: (asignacion.get('asignado') as any).id,
                              nombre: (asignacion.get('asignado') as any).nombre_completo,
                              email: (asignacion.get('asignado') as any).email,
                          }
                        : null,
                    comentarios: comentariosEnriquecidos.map((c) => ({
                        id: c.id,
                        contenido: c.contenido,
                        autor: {
                            nombre: c.autor_nombre,
                            email: c.autor_email,
                            rol: c.autor_rol,
                        },
                        visibility: c.visibility,
                        es_interno: c.es_interno,
                        fecha_creacion: c.fecha_creacion,
                    })),
                    adjuntos: adjuntosEnriquecidos.map((adj) => ({
                        id: adj.id,
                        nombre: adj.nombre_archivo,
                        ruta: adj.ruta,
                        mime_type: adj.mime_type,
                        tamano: adj.tamano_bytes,
                        tipo_vinculo: adj.tipo_vinculo,
                        fecha_subida: adj.fecha_carga,
                    })),
                    historial_estado: historialEstado.map((h) => ({
                        id: h.id,
                        estado_anterior: h.de_estado_id
                            ? {
                                  id: h.de_estado_id,
                                  nombre: h.de_estado_nombre,
                              }
                            : null,
                        estado_nuevo: {
                            id: h.a_estado_id,
                            nombre: h.a_estado_nombre,
                        },
                        motivo: h.motivo,
                        usuario: h.cambiado_por_nombre
                            ? {
                                  nombre: h.cambiado_por_nombre,
                              }
                            : null,
                        fecha_cambio: h.fecha_cambio,
                    })),
                    resolucion: resolucionInfo
                        ? {
                              id: resolucionInfo.id,
                              contenido: resolucionInfo.contenido,
                              usuario_resolvio: {
                                  nombre: resolucionInfo.resuelto_por_nombre,
                              },
                              fecha_resolucion: resolucionInfo.resuelto_at,
                              ruta_pdf: resolucionInfo.pdf_path,
                          }
                        : null,
                };
            })
        );

        return res.json({
            total: reclamosEnriquecidos.length,
            reclamos: reclamosEnriquecidos,
        });
    } catch (e: any) {
        console.error('Error fetching denuncias:', e);
        return res.status(500).json({ error: e.message });
    }
};

export const obtenerReclamosAsignados = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        const userId = req.user?.get('id');

        // Buscar IDs de denuncias asignadas activas
        const asignaciones = await models.DenunciaAsignacion.findAll({
            where: {
                usuario_id: userId,
                activo: 1,
            },
            attributes: ['denuncia_id'],
        });

        const denunciaIds = asignaciones.map((a) => a.get('denuncia_id'));

        // Obtener denuncias
        const denuncias = await models.Denuncia.findAll({
            where: { id: denunciaIds },
            order: [['created_at', 'DESC']],
        });

        // Enriquecer cada reclamo con información relacionada
        const reclamosEnriquecidos = await Promise.all(
            denuncias.map(async (denuncia) => {
                const denunciaId = denuncia.get('id') as number;

                // Obtener estado directamente por ID
                const estadoId = denuncia.get('estado_id');
                const estado = estadoId 
                    ? await models.EstadoDenuncia.findByPk(Number(estadoId))
                    : null;

                // Obtener empresa
                const empresa = await models.Empresa.findByPk(
                    Number(denuncia.get('empresa_id'))
                );

                // Obtener tipo de denuncia
                const tipo = await models.TipoDenuncia.findByPk(
                    Number(denuncia.get('tipo_id'))
                );

                // Obtener historial de estados
                const statusHistory =
                    await models.DenunciaHistorialEstado.findAll({
                        where: { denuncia_id: denunciaId },
                        order: [['created_at', 'ASC']],
                    });

                const historialEstado = await Promise.all(
                    statusHistory.map(async (sh) => {
                        const deEstado = sh.get('de_estado_id')
                            ? await models.EstadoDenuncia.findByPk(
                                  Number(sh.get('de_estado_id'))
                              )
                            : null;
                        const aEstado = await models.EstadoDenuncia.findByPk(
                            Number(sh.get('a_estado_id'))
                        );

                        let cambiadoPorNombre = null;
                        if (sh.get('cambiado_por')) {
                            const usuarioCambio = await models.Usuario.findByPk(
                                Number(sh.get('cambiado_por'))
                            );
                            if (usuarioCambio) {
                                cambiadoPorNombre = `${usuarioCambio.get(
                                    'nombre_completo'
                                )}`.trim();
                            }
                        }

                        return {
                            id: sh.get('id'),
                            de_estado_id: sh.get('de_estado_id'),
                            de_estado_nombre: deEstado?.get('nombre') || null,
                            a_estado_id: sh.get('a_estado_id'),
                            a_estado_nombre:
                                aEstado?.get('nombre') || 'Desconocido',
                            motivo: sh.get('motivo') || null,
                            cambiado_por: sh.get('cambiado_por'),
                            cambiado_por_nombre: cambiadoPorNombre,
                            fecha_cambio: sh.get('created_at'),
                        };
                    })
                );

                // Obtener comentarios
                const comentarios = await models.Comentario.findAll({
                    where: { denuncia_id: denunciaId },
                    order: [['created_at', 'ASC']],
                });

                const comentariosEnriquecidos = await Promise.all(
                    comentarios.map(async (c) => {
                        let autorNombre = 'Equipo de Soporte';
                        let autorEmail = null;

                        if (c.get('usuario_id')) {
                            const usuario = await models.Usuario.findByPk(
                                Number(c.get('usuario_id'))
                            );
                            if (usuario) {
                                autorNombre = `${usuario.get(
                                    'nombre_completo'
                                )}`.trim();
                                autorEmail = usuario.get('email') as string;
                            }
                        }

                        if (!c.get('usuario_id') && c.get('autor_nombre')) {
                            autorNombre = c.get('autor_nombre') as string;
                        }

                        if (!autorEmail && c.get('autor_email')) {
                            autorEmail = c.get('autor_email') as string;
                        }

                        return {
                            id: c.get('id'),
                            contenido: c.get('contenido'),
                            autor_nombre: autorNombre,
                            autor_email: autorEmail,
                            autor_rol: c.get('autor_rol') as string | null,
                            visibility: c.get('visibility') as string,
                            es_interno: c.get('es_interno') as boolean,
                            fecha_creacion: c.get('created_at'),
                        };
                    })
                );

                // Obtener archivos adjuntos
                const adjuntos = await models.Adjunto.findAll({
                    where: { denuncia_id: denunciaId },
                    order: [['created_at', 'ASC']],
                });

                const adjuntosEnriquecidos = adjuntos.map((adj) => ({
                    id: adj.get('id'),
                    nombre_archivo: adj.get('nombre_archivo'),
                    ruta: adj.get('ruta'),
                    mime_type: adj.get('mime_type'),
                    tamano_bytes: adj.get('tamano_bytes'),
                    tipo_vinculo: adj.get('tipo_vinculo'),
                    subido_por: adj.get('subido_por'),
                    fecha_carga: adj.get('created_at'),
                }));

                // Obtener resolución
                const resolucion = await models.Resolucion.findOne({
                    where: { denuncia_id: denunciaId },
                });

                let resolucionInfo = null;
                if (resolucion) {
                    const resuelto_por_usuario = await models.Usuario.findByPk(
                        Number(resolucion.get('resuelto_por'))
                    );
                    resolucionInfo = {
                        id: resolucion.get('id'),
                        contenido: resolucion.get('contenido'),
                        resuelto_por: resolucion.get('resuelto_por'),
                        resuelto_por_nombre: resuelto_por_usuario
                            ? `${resuelto_por_usuario.get(
                                  'nombre_completo'
                              )}`.trim()
                            : 'Desconocido',
                        resuelto_at: resolucion.get('resuelto_at'),
                        pdf_path: resolucion.get('pdf_path'),
                    };
                }

                // Obtener asignación activa de supervisor
                const asignacion = await models.DenunciaAsignacion.findOne({
                    where: {
                        denuncia_id: denunciaId,
                        activo: 1,
                    },
                    include: [
                        {
                            model: models.Usuario,
                            as: 'asignado',
                        },
                    ],
                });

                return {
                    id: denuncia.get('id'),
                    numero: denuncia.get('numero'),
                    asunto: denuncia.get('asunto'),
                    pais: denuncia.get('pais'),
                    descripcion: denuncia.get('descripcion'),
                    canal_origen: denuncia.get('canal_origen'),
                    fecha_creacion: denuncia.get('created_at'),
                    fecha_actualizacion: denuncia.get('updated_at'),
                    estado: {
                        id: estado?.get('id'),
                        nombre: estado?.get('nombre') || 'Desconocido',
                        codigo: estado?.get('codigo'),
                    },
                    prioridad: (denuncia.get('prioridad_id') as string)?.toLowerCase(),
                    empresa: {
                        id: empresa?.get('id'),
                        nombre: empresa?.get('nombre') || 'Empresa Desconocida',
                        rut: empresa?.get('rut'),
                        email: empresa?.get('email'),
                        telefono: empresa?.get('telefono'),
                        direccion: empresa?.get('direccion'),
                    },
                    tipo: {
                        id: tipo?.get('id'),
                        nombre: tipo?.get('nombre') || 'Tipo desconocido',
                        codigo: tipo?.get('codigo'),
                    },
                    denunciante: {
                        nombre: denuncia.get('denunciante_nombre'),
                        email: denuncia.get('denunciante_email'),
                        telefono: denuncia.get('denunciante_fono'),
                        anonimo: denuncia.get('es_anonima') === 1,
                    },
                    supervisor: asignacion?.get('asignado')
                        ? {
                              id: (asignacion.get('asignado') as any).id,
                              nombre: (asignacion.get('asignado') as any).nombre_completo,
                              email: (asignacion.get('asignado') as any).email,
                          }
                        : null,
                    comentarios: comentariosEnriquecidos.map((c) => ({
                        id: c.id,
                        contenido: c.contenido,
                        autor: {
                            nombre: c.autor_nombre,
                            email: c.autor_email,
                            rol: c.autor_rol,
                        },
                        visibility: c.visibility,
                        es_interno: c.es_interno,
                        fecha_creacion: c.fecha_creacion,
                    })),
                    adjuntos: adjuntosEnriquecidos.map((adj) => ({
                        id: adj.id,
                        nombre: adj.nombre_archivo,
                        ruta: adj.ruta,
                        mime_type: adj.mime_type,
                        tamano: adj.tamano_bytes,
                        tipo_vinculo: adj.tipo_vinculo,
                        fecha_subida: adj.fecha_carga,
                    })),
                    historial_estado: historialEstado.map((h) => ({
                        id: h.id,
                        estado_anterior: h.de_estado_id
                            ? {
                                  id: h.de_estado_id,
                                  nombre: h.de_estado_nombre,
                              }
                            : null,
                        estado_nuevo: {
                            id: h.a_estado_id,
                            nombre: h.a_estado_nombre,
                        },
                        motivo: h.motivo,
                        usuario: h.cambiado_por_nombre
                            ? {
                                  nombre: h.cambiado_por_nombre,
                              }
                            : null,
                        fecha_cambio: h.fecha_cambio,
                    })),
                    resolucion: resolucionInfo
                        ? {
                              id: resolucionInfo.id,
                              contenido: resolucionInfo.contenido,
                              usuario_resolvio: {
                                  nombre: resolucionInfo.resuelto_por_nombre,
                              },
                              fecha_resolucion: resolucionInfo.resuelto_at,
                              ruta_pdf: resolucionInfo.pdf_path,
                          }
                        : null,
                };
            })
        );

        return res.json({
            total: reclamosEnriquecidos.length,
            reclamos: reclamosEnriquecidos,
        });
    } catch (e: any) {
        console.error('Error fetching assigned claims:', e);
        return res.status(500).json({ error: e.message });
    }
};

/**
 * Revelar correo encriptado de una denuncia
 * POST /api/denuncias/:id/reveal-email
 *
 * Dos vías de revelado:
 * 1. Con recovery_code proporcionado por el denunciante (consentimiento)
 * 2. Override forzado por usuario con permiso FORCE_REVEAL_EMAIL
 */
// revealEmail fue eliminado - funcionalidad de revelación de identidad no es necesaria
