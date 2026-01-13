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
    isAnonymous?: boolean | string;  // FormData sends strings
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
    denuncianteRut?: string | null;
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
                denunciante_rut: normalizeNullableString(input.denuncianteRut),
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

/**
 * Notifica a los administradores que tienen permiso para ver la categoría de la denuncia
 * Un admin sin categorías asignadas puede ver todas las denuncias
 */
async function notifyAdminsOfNewClaim(
    tipoId: number,
    numero: string,
    asunto: string
): Promise<void> {
    try {
        // Obtener el nombre de la categoría
        const tipo = await models.TipoDenuncia.findByPk(tipoId);
        const categoriaNombre = tipo?.get('nombre') as string || 'Sin categoría';

        // Buscar todos los usuarios con arquetipo ADMIN
        // JOIN: usuario -> usuario_rol -> rol -> arquetipo
        const admins = await models.Usuario.findAll({
            where: { activo: 1 },
            include: [
                {
                    model: models.Rol,
                    as: 'roles',
                    required: true,
                    include: [
                        {
                            model: models.Arquetipo,
                            as: 'arquetipo',
                            where: { codigo: 'ADMIN' },
                            required: true,
                        },
                    ],
                },
            ],
        });

        if (!admins || admins.length === 0) {
            console.log('No admin users found to notify');
            return;
        }

        // Para cada admin, verificar si tiene la categoría permitida
        for (const admin of admins) {
            const adminId = admin.get('id') as number;
            const adminEmail = admin.get('email') as string;
            const adminNombre = admin.get('nombre_completo') as string;

            // Buscar categorías asignadas al admin
            const categoriasAsignadas = await models.UsuarioCategoria.findAll({
                where: { usuario_id: adminId },
            });

            // Si el admin no tiene categorías asignadas, puede ver todas
            // Si tiene categorías, verificar que incluya la de la denuncia
            const tieneAcceso = 
                categoriasAsignadas.length === 0 || 
                categoriasAsignadas.some(
                    (uc: any) => Number(uc.get('categoria_id')) === tipoId
                );

            if (tieneAcceso && adminEmail) {
                try {
                    await emailService.sendNewClaimNotificationToAdmin(adminEmail, {
                        adminNombre,
                        numero,
                        asunto,
                        categoria: categoriaNombre,
                        fechaCreacion: new Date(),
                    });
                    console.log(`Admin notification sent to ${adminEmail} for claim ${numero}`);
                } catch (emailError) {
                    console.error(`Error sending notification to ${adminEmail}:`, emailError);
                }
            }
        }
    } catch (error) {
        console.error('Error in notifyAdminsOfNewClaim:', error);
        // No fallar el proceso principal si falla la notificación
    }
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

        // Notificar a administradores
        await notifyAdminsOfNewClaim(
            tipoId,
            denuncia.get('numero') as string,
            asunto
        );

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

        // Parse isAnonymous correctly - it comes as a string from FormData
        const esAnonima = payload.isAnonymous === true || payload.isAnonymous === 'true';

        const denuncianteNombre = esAnonima
            ? null
            : sanitizeString(payload.fullName);
        const denuncianteRut = esAnonima
            ? null
            : sanitizeString(payload.rut);
        const denuncianteFono = esAnonima
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
            denuncianteRut,
            denuncianteEmail: emailDenunciante,
            denuncianteFono,
            esAnonima,
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

        // Notificar a administradores
        await notifyAdminsOfNewClaim(
            Number(tipoFinal!.get('id')),
            denuncia.get('numero') as string,
            asunto
        );

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
        comentario_satisfaccion: denuncia.get('comentario_satisfaccion') || null,
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
    const { numero, clave, nota, comentario } = req.body as { 
        numero?: string; 
        clave?: string; 
        nota?: number;
        comentario?: string;
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

    // Validar comentario (máximo 500 caracteres)
    const comentarioLimpio = comentario?.trim().slice(0, 500) || null;

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

    // Guardar la nota y comentario
    try {
        await denuncia.update({ 
            nota_satisfaccion: notaNum,
            comentario_satisfaccion: comentarioLimpio
        });
        return res.json({ 
            ok: true, 
            nota_satisfaccion: notaNum,
            comentario_satisfaccion: comentarioLimpio,
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
    const file = req.file as Express.Multer.File | undefined;

    if (!id || !estado_id) {
        // Si hay archivo, eliminarlo
        if (file?.path) {
            const fsPromises = require('node:fs/promises');
            await fsPromises.unlink(file.path).catch(() => {});
        }
        return res.status(400).json({ error: 'missing fields: id and estado_id are required' });
    }

    try {
        const denuncia = await models.Denuncia.findByPk(id);
        if (!denuncia) {
            if (file?.path) {
                const fsPromises = require('node:fs/promises');
                await fsPromises.unlink(file.path).catch(() => {});
            }
            return res.status(404).json({ error: 'denuncia not found' });
        }

        // Verificar que el nuevo estado existe
        const nuevoEstado = await models.EstadoDenuncia.findByPk(estado_id);
        if (!nuevoEstado) {
            if (file?.path) {
                const fsPromises = require('node:fs/promises');
                await fsPromises.unlink(file.path).catch(() => {});
            }
            return res.status(400).json({ error: 'estado not found' });
        }

        const estadoAnteriorId = denuncia.get('estado_id');
        const userId = req.user?.get?.('id');

        // Obtener el estado anterior para el email
        const estadoAnterior = estadoAnteriorId 
            ? await models.EstadoDenuncia.findByPk(Number(estadoAnteriorId))
            : null;

        // Validar transición de estados
        const oldStateId = Number(estadoAnteriorId);
        const newStateId = Number(estado_id);

        if (newStateId < oldStateId) {
            // Regla general: no se puede volver atrás
            // Excepción: Del estado 3 (Requiere info) se puede volver al 2 (En proceso)
            const esExcepcionPermitida = oldStateId === 3 && newStateId === 2;

            if (!esExcepcionPermitida) {
                if (file?.path) {
                    const fsPromises = require('node:fs/promises');
                    await fsPromises.unlink(file.path).catch(() => {});
                }
                return res.status(400).json({ 
                    error: 'No se puede volver a un estado anterior (secuencia: 1->2->3->4/5)' 
                });
            }
        }

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

        // Si el nuevo estado es RESUELTO o CERRADO y hay archivo PDF, guardar informe de resolución
        const nuevoEstadoCodigo = (nuevoEstado.get('codigo') as string)?.toUpperCase();
        let resolucionInfo = null;

        if (['RESUELTO', 'CERRADO'].includes(nuevoEstadoCodigo) && file) {
            const pathModule = require('node:path');
            const fsPromises = require('node:fs/promises');
            const uploadDir = process.env.UPLOAD_DIR || pathModule.resolve(process.cwd(), 'uploads');
            const relativePath = pathModule.relative(uploadDir, file.path);

            // Buscar o crear registro de resolución
            let resolucion = await models.Resolucion.findOne({
                where: { denuncia_id: id },
            });

            if (resolucion) {
                // Si ya existe una resolución con PDF, eliminar el archivo anterior
                const oldPdfPath = resolucion.get('pdf_path') as string;
                if (oldPdfPath) {
                    const oldFullPath = pathModule.join(uploadDir, oldPdfPath);
                    await fsPromises.unlink(oldFullPath).catch(() => {});
                }

                // Actualizar el registro existente
                await resolucion.update({
                    pdf_path: relativePath,
                    resuelto_por: userId,
                    resuelto_at: new Date(),
                });
            } else {
                // Crear nuevo registro de resolución
                resolucion = await models.Resolucion.create({
                    denuncia_id: id,
                    contenido: motivo || 'Informe de resolución adjunto',
                    resuelto_por: userId,
                    resuelto_at: new Date(),
                    pdf_path: relativePath,
                });
            }

            resolucionInfo = {
                id: resolucion.get('id'),
                pdf_path: relativePath,
                filename: file.filename,
                size: file.size,
            };
        } else if (file?.path) {
            // Si hay archivo pero el estado no es RESUELTO/CERRADO, eliminarlo
            const fsPromises = require('node:fs/promises');
            await fsPromises.unlink(file.path).catch(() => {});
        }

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
            resolucion: resolucionInfo,
        });
    } catch (e: any) {
        // Intentar eliminar el archivo si hubo error
        if (file?.path) {
            const fsPromises = require('node:fs/promises');
            await fsPromises.unlink(file.path).catch(() => {});
        }
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
        
        // Usar código del arquetipo, no del rol
        const arquetiposCodigos = userRoles
            .map((r: any) => r.get('arquetipo')?.get('codigo'))
            .filter(Boolean);

        const isAdminOrAnalyst = arquetiposCodigos.some((code: string) =>
            ['ADMIN', 'ANALISTA'].includes(code)
        );

        let whereClause: any = {};
        let requiredIncludes: any[] = [];

        // Primero: Verificar categorías del rol para TODOS los usuarios
        const roleIds = userRoles.map((r: any) => r.get('id'));
        
        // Obtener categorías de todos los roles del usuario
        const rolCategorias = await models.RolCategoria.findAll({
            where: { rol_id: roleIds },
            attributes: ['categoria_id'],
        });

        let tipoIdsPermitidos: number[] = [];
        let tieneRestriccionCategorias = false;

        if (rolCategorias.length > 0) {
            // Roles tienen categorías asignadas
            tieneRestriccionCategorias = true;
            const categoryIds = [...new Set(rolCategorias.map((rc) => rc.get('categoria_id')))];

            // Obtener tipos de denuncia que pertenecen a esas categorías
            const tiposDenuncia = await models.TipoDenuncia.findAll({
                where: {
                    categoria_id: categoryIds,
                },
                attributes: ['id'],
            });

            tipoIdsPermitidos = tiposDenuncia.map((t) => t.get('id') as number);
        }

        // Segundo: Aplicar filtros según el tipo de usuario
        if (!isAdminOrAnalyst && arquetiposCodigos.includes('SUPERVISOR')) {
            // Para supervisores: Solo sus asignaciones Y dentro de sus categorías
            const asignaciones = await models.DenunciaAsignacion.findAll({
                where: {
                    usuario_id: userId,
                    activo: 1,
                },
                attributes: ['denuncia_id'],
            });

            const denunciaIds = asignaciones.map((a) => a.get('denuncia_id'));
            
            if (tieneRestriccionCategorias) {
                // Tiene restricción de categorías - combinar ambos filtros
                whereClause = {
                    id: denunciaIds,
                    tipo_id: tipoIdsPermitidos,
                };
            } else {
                // Sin restricción de categorías - solo por asignaciones
                whereClause = {
                    id: denunciaIds,
                };
            }
        } else if (isAdminOrAnalyst) {
            // Para admin/analista: Solo aplicar restricción de categorías si existe
            if (tieneRestriccionCategorias) {
                whereClause = {
                    tipo_id: tipoIdsPermitidos,
                };
            }
            // Si no tiene categorías asignadas, whereClause queda vacío = ve todas las denuncias
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
                    dias: Math.floor((new Date().getTime() - new Date(denuncia.get('created_at') as string).getTime()) / (1000 * 60 * 60 * 24)),
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
                        rut: denuncia.get('denunciante_rut'),
                    },
                    nota_satisfaccion: denuncia.get('nota_satisfaccion'),
                    comentario_satisfaccion: denuncia.get('comentario_satisfaccion'),
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
                    dias: Math.floor((new Date().getTime() - new Date(denuncia.get('created_at') as string).getTime()) / (1000 * 60 * 60 * 24)),
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

import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';

// Configurar multer para informe de resolución (solo PDF, sin límite de tamaño)
const resolutionReportStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');
        const resolutionDir = path.join(uploadDir, 'resoluciones');
        try {
            await fs.mkdir(resolutionDir, { recursive: true });
            cb(null, resolutionDir);
        } catch (error) {
            cb(error as Error, resolutionDir);
        }
    },
    filename: (req, file, cb) => {
        const denunciaId = req.params.id;
        const timestamp = Date.now();
        const filename = `resolucion_${denunciaId}_${timestamp}.pdf`;
        cb(null, filename);
    },
});

const resolutionReportUpload = multer({
    storage: resolutionReportStorage,
    fileFilter: (req, file, cb) => {
        // Solo permitir PDF
        if (file.mimetype !== 'application/pdf') {
            cb(new Error('Solo se permiten archivos PDF'));
            return;
        }
        cb(null, true);
    },
    // Sin límite de tamaño
});

export const uploadResolutionReportMiddleware = resolutionReportUpload.single('pdf');

/**
 * Subir informe de resolución para una denuncia resuelta/cerrada
 * POST /api/denuncias/:id/informe-resolucion
 * Content-Type: multipart/form-data
 * 
 * Solo supervisores asignados o admins pueden subir
 * Solo cuando el estado es RESUELTO o CERRADO
 * Solo 1 archivo PDF (reemplaza el anterior si existe)
 */
export const subirInformeResolucion = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        const { id } = req.params;
        const file = req.file as Express.Multer.File;
        const userId = req.user?.get?.('id');

        if (!file) {
            return res.status(400).json({
                error: 'No se proporcionó ningún archivo PDF',
            });
        }

        // Verificar que la denuncia existe
        const denuncia = await models.Denuncia.findByPk(id);
        if (!denuncia) {
            // Eliminar archivo subido si la denuncia no existe
            await fs.unlink(file.path).catch(() => {});
            return res.status(404).json({ error: 'Denuncia no encontrada' });
        }

        // Verificar que el estado es RESUELTO o CERRADO
        const estadoId = denuncia.get('estado_id');
        const estado = await models.EstadoDenuncia.findByPk(Number(estadoId));
        const estadoCodigo = (estado?.get('codigo') as string)?.toUpperCase();

        // if (!['RESUELTO', 'CERRADO'].includes(estadoCodigo)) {
        //     // Eliminar archivo subido si el estado no es válido
        //     await fs.unlink(file.path).catch(() => {});
        //     return res.status(400).json({
        //         error: 'Solo se puede subir informe de resolución cuando la denuncia está en estado RESUELTO o CERRADO',
        //     });
        // }

        // Verificar permisos: supervisor asignado o admin
        const userRoles = req.user?.get('roles') || [];
        const arquetiposCodigos = userRoles
            .map((r: any) => r.get('arquetipo')?.get('codigo'))
            .filter(Boolean);

        const isAdmin = arquetiposCodigos.includes('ADMIN');
        
        if (!isAdmin) {
            // Verificar si es supervisor asignado
            const asignacion = await models.DenunciaAsignacion.findOne({
                where: {
                    denuncia_id: id,
                    usuario_id: userId,
                    activo: 1,
                },
            });

            if (!asignacion) {
                await fs.unlink(file.path).catch(() => {});
                return res.status(403).json({
                    error: 'Solo el supervisor asignado o un administrador puede subir el informe de resolución',
                });
            }
        }

        // Calcular ruta relativa para guardar en BD
        const uploadDir = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');
        const relativePath = path.relative(uploadDir, file.path);

        // Buscar o crear registro de resolución
        let resolucion = await models.Resolucion.findOne({
            where: { denuncia_id: id },
        });

        if (resolucion) {
            // Si ya existe una resolución con PDF, eliminar el archivo anterior
            const oldPdfPath = resolucion.get('pdf_path') as string;
            if (oldPdfPath) {
                const oldFullPath = path.join(uploadDir, oldPdfPath);
                await fs.unlink(oldFullPath).catch(() => {});
            }

            // Actualizar el registro existente
            await resolucion.update({
                pdf_path: relativePath,
                resuelto_por: userId,
                resuelto_at: new Date(),
            });
        } else {
            // Crear nuevo registro de resolución
            resolucion = await models.Resolucion.create({
                denuncia_id: id,
                contenido: 'Informe de resolución adjunto',
                resuelto_por: userId,
                resuelto_at: new Date(),
                pdf_path: relativePath,
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Informe de resolución subido correctamente',
            data: {
                id: resolucion.get('id'),
                denuncia_id: id,
                pdf_path: relativePath,
                filename: file.filename,
                size: file.size,
                uploaded_at: new Date().toISOString(),
            },
        });
    } catch (e: any) {
        // Intentar eliminar el archivo si hubo error
        if (req.file?.path) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        console.error('[Upload Resolution Report Error]:', e);
        return res.status(500).json({ error: e.message });
    }
};

/**
 * Descargar informe de resolución
 * GET /api/denuncias/:id/informe-resolucion
 */
export const descargarInformeResolucion = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        const { id } = req.params;

        // Verificar que la denuncia existe
        const denuncia = await models.Denuncia.findByPk(id);
        if (!denuncia) {
            return res.status(404).json({ error: 'Denuncia no encontrada' });
        }

        // Buscar resolución
        const resolucion = await models.Resolucion.findOne({
            where: { denuncia_id: id },
        });

        if (!resolucion || !resolucion.get('pdf_path')) {
            return res.status(404).json({ error: 'No hay informe de resolución para esta denuncia' });
        }

        const uploadDir = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');
        const filePath = path.join(uploadDir, resolucion.get('pdf_path') as string);

        // Verificar que el archivo existe
        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).json({ error: 'Archivo de informe no encontrado en el sistema' });
        }

        // Configurar headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="informe_resolucion_${denuncia.get('numero')}.pdf"`
        );

        // Enviar archivo
        const fileBuffer = await fs.readFile(filePath);
        return res.send(fileBuffer);
    } catch (e: any) {
        console.error('[Download Resolution Report Error]:', e);
        return res.status(500).json({ error: e.message });
    }
};
