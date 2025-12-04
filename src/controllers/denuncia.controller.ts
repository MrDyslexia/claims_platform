import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import type { Transaction } from 'sequelize';
import { sequelize, models } from '../db/sequelize';
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
    encryptText,
    decryptText,
    hashText,
    generateRecoveryCode,
} from '../utils/crypto';

import {
    uploadFile,
} from '../services/upload.service';
import { getUploadErrorMessage } from '../config/upload';
import { emailService } from '../utils/email.service';

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
    recoveryCode?: string; // Solo si hay email
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

        // Preparar datos de correo encriptado
        let correoEncrypted: string | null = null;
        let correoIv: string | null = null;
        let correoTag: string | null = null;
        let correoHash: string | null = null;
        let recoveryCodeHash: string | null = null;
        let recoveryCode: string | undefined;

        const email = normalizeNullableString(input.denuncianteEmail);
        if (email) {
            // Encriptar el correo
            const encrypted = encryptText(email);
            correoEncrypted = encrypted.ciphertext;
            correoIv = encrypted.iv;
            correoTag = encrypted.tag;
            correoHash = hashText(email);

            // Generar recovery code
            recoveryCode = generateRecoveryCode(10);
            recoveryCodeHash = hashText(recoveryCode);
        }

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
                // Campos de encriptación
                correo_encrypted: correoEncrypted,
                correo_iv: correoIv,
                correo_tag: correoTag,
                correo_hash: correoHash,
                recovery_code_hash: recoveryCodeHash,
                pais: normalizeNullableString(input.pais),
            },
            { transaction }
        );

        return { denuncia, clave, recoveryCode };
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
        if (!tipo) {
            return res.status(400).json({ error: 'tipo denuncia not found' });
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
            (tipo?.get('nombre') as string);

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

        // Email SIEMPRE se encripta (tanto para anónimos como identificados)
        const emailParaEncriptar = sanitizeString(payload.email) || null;

        const { denuncia, clave, recoveryCode } = await createDenunciaRecord({
            empresaId: Number(empresa!.get('id')),
            tipoId: Number(tipo!.get('id')),
            estadoId: Number(estado!.get('id')),
            asunto,
            descripcion: descripcionFinal,
            canalOrigen: 'WEB',
            canalId,
            denuncianteNombre,
            denuncianteEmail: emailParaEncriptar, // Se encripta con AES-256-GCM
            denuncianteFono,
            esAnonima: payload.isAnonymous ?? false,
            createdBy: null,
            pais: payload.country,
        });

        // Enviar correos si hay email
        if (emailParaEncriptar) {
            try {
                // 1. Enviar confirmación de denuncia con clave de seguimiento
                await emailService.sendDenunciaConfirmation(
                    emailParaEncriptar,
                    {
                        numero: denuncia.get('numero') as string,
                        clave,
                        asunto,
                        nombreDenunciante: denuncianteNombre || undefined,
                    }
                );

                // 2. Enviar recovery code para revelar identidad
                if (recoveryCode) {
                    await emailService.sendRecoveryCode(emailParaEncriptar, {
                        numero: denuncia.get('numero') as string,
                        recoveryCode,
                        asunto,
                        isAnonymous: payload.isAnonymous ?? false,
                    });
                }
            } catch (emailError) {
                console.error('Error sending emails:', emailError);
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
export const autorizarContacto = async (req: Request, res: Response) => {
    try {
        const { numero } = req.params;
        const { clave, recovery_code } = req.body as {
            clave?: string;
            recovery_code?: string;
        };

        // Validar campos requeridos
        if (!numero || !clave || !recovery_code) {
            return res.status(400).json({
                error: 'Se requieren número, clave de seguimiento y código de recuperación',
            });
        }

        // Buscar la denuncia
        const denuncia = await models.Denuncia.findOne({ where: { numero } });
        if (!denuncia) {
            return res.status(404).json({ error: 'Denuncia no encontrada' });
        }

        // Verificar clave de seguimiento
        const claveValida = verifyClaveWithSalt(
            String(clave),
            denuncia.get('clave_salt') as Buffer,
            denuncia.get('clave_hash') as Buffer
        );

        if (!claveValida) {
            return res.status(401).json({
                error: 'Clave de seguimiento inválida',
            });
        }

        // Verificar que tenga correo encriptado
        const correoEncrypted = denuncia.get('correo_encrypted') as
            | string
            | null;
        const correoIv = denuncia.get('correo_iv') as string | null;
        const correoTag = denuncia.get('correo_tag') as string | null;
        const recoveryCodeHash = denuncia.get('recovery_code_hash') as
            | string
            | null;

        if (!correoEncrypted || !correoIv || !correoTag || !recoveryCodeHash) {
            return res.status(400).json({
                error: 'Esta denuncia no tiene correo encriptado o ya fue revelado',
            });
        }

        // Verificar recovery code
        const providedHash = hashText(recovery_code.trim());
        if (providedHash !== recoveryCodeHash) {
            return res.status(403).json({
                error: 'Código de recuperación inválido',
            });
        }

        // Desencriptar el correo
        const correoRevelado = decryptText(
            correoEncrypted,
            correoIv,
            correoTag
        );

        // Registrar en auditoría
        const clientIp =
            req.headers['x-forwarded-for'] ||
            req.socket.remoteAddress ||
            'unknown';

        await models.DenunciaRevealAudit.create({
            denuncia_id: denuncia.get('id') as number,
            requested_by: null, // Denunciante autorizó (no es un usuario del sistema)
            method: 'recovery_code',
            reason: 'Denunciante autorizó contacto desde tracking público',
            remote_ip: String(clientIp).split(',')[0].trim(),
        });

        // Invalidar recovery code para que no se pueda reusar
        await denuncia.update({
            recovery_code_hash: hashText(`USED_${Date.now()}_${Math.random()}`),
        });

        return res.json({
            ok: true,
            message:
                'Correo revelado exitosamente. El equipo podrá contactarte.',
            correo: correoRevelado,
            revealed_at: new Date().toISOString(),
        });
    } catch (e: any) {
        console.error('Error en autorizarContacto:', e);
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
            include: [
                {
                    model: models.EstadoDenuncia,
                    as: 'estado_denuncia',
                },
            ],
        });

        // Enriquecer cada reclamo con información relacionada
        const reclamosEnriquecidos = await Promise.all(
            denuncias.map(async (denuncia) => {
                const denunciaId = denuncia.get('id') as number;

                // Obtener estado desde la inclusión
                const estado = denuncia.get('estado_denuncia') as any;

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
export const revealEmail = async (
    req: Request & { user?: any },
    res: Response
) => {
    try {
        const denunciaId = req.params.id;
        const { recovery_code, reason } = req.body as {
            recovery_code?: string;
            reason?: string;
        };

        // Buscar la denuncia
        const denuncia = await models.Denuncia.findByPk(denunciaId);
        if (!denuncia) {
            return res.status(404).json({ error: 'Denuncia no encontrada' });
        }

        // Verificar que tenga correo encriptado
        const correoEncrypted = denuncia.get('correo_encrypted') as
            | string
            | null;
        const correoIv = denuncia.get('correo_iv') as string | null;
        const correoTag = denuncia.get('correo_tag') as string | null;
        const recoveryCodeHash = denuncia.get('recovery_code_hash') as
            | string
            | null;

        if (!correoEncrypted || !correoIv || !correoTag) {
            return res.status(400).json({
                error: 'Esta denuncia no tiene correo encriptado',
            });
        }

        let revealMethod: 'recovery_code' | 'forced_override';
        let userId: number | null = null;

        // VÍA 1: Revelado con recovery code (consentimiento del denunciante)
        if (recovery_code) {
            if (!recoveryCodeHash) {
                return res.status(400).json({
                    error: 'Esta denuncia no tiene recovery code configurado',
                });
            }

            const providedHash = hashText(recovery_code.trim());
            if (providedHash !== recoveryCodeHash) {
                return res.status(403).json({
                    error: 'Código de recuperación inválido',
                });
            }

            revealMethod = 'recovery_code';
        }
        // VÍA 2: Override forzado (requiere permiso)
        else {
            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            // Verificar permiso FORCE_REVEAL_EMAIL
            const hasPermission = await models.Permiso.findOne({
                where: { codigo: 'FORCE_REVEAL_EMAIL' },
                include: [
                    {
                        association: 'roles',
                        through: { attributes: [] },
                        include: [
                            {
                                association: 'usuarios',
                                where: { id: req.user.get('id') },
                                through: { attributes: [] },
                            },
                        ],
                    },
                ],
            });

            if (!hasPermission) {
                return res.status(403).json({
                    error: 'No tiene permisos para forzar revelado de correos',
                });
            }

            if (!reason || reason.trim().length < 10) {
                return res.status(400).json({
                    error: 'Se requiere una justificación de al menos 10 caracteres para override',
                });
            }

            revealMethod = 'forced_override';
            userId = Number(req.user.get('id'));
        }

        // Desencriptar el correo
        const correoRevelado = decryptText(
            correoEncrypted,
            correoIv,
            correoTag
        );

        // Registrar en auditoría
        const clientIp =
            req.headers['x-forwarded-for'] ||
            req.socket.remoteAddress ||
            'unknown';
        const userAgent = req.headers['user-agent'] || null;

        await models.DenunciaRevealAudit.create({
            denuncia_id: denunciaId,
            requested_by: userId,
            method: revealMethod,
            reason: reason || null,
            remote_ip: String(clientIp).split(',')[0].trim(),
        });

        // Si fue forzado, notificar al denunciante
        if (revealMethod === 'forced_override' && correoRevelado && userId) {
            try {
                const usuario = await models.Usuario.findByPk(userId);
                await emailService.sendEmailRevealedNotification(
                    correoRevelado,
                    {
                        numero: denuncia.get('numero') as string,
                        revealedBy: usuario
                            ? (usuario.get('nombre_completo') as string)
                            : 'Administrador',
                        reason,
                        revealedAt: new Date(),
                    }
                );
            } catch (emailError) {
                console.error('Error sending reveal notification:', emailError);
                // No fallar el reveal si falla la notificación
            }
        }

        // Si fue con recovery code, invalidarlo (cambiar hash para que no se pueda reusar)
        if (revealMethod === 'recovery_code') {
            await denuncia.update({
                recovery_code_hash: hashText(
                    `USED_${Date.now()}_${Math.random()}`
                ),
            });
        }

        return res.json({
            ok: true,
            correo: correoRevelado,
            reveal_method: revealMethod,
            revealed_at: new Date().toISOString(),
        });
    } catch (e: any) {
        console.error('Error revealing email:', e);
        return res.status(500).json({ error: e.message });
    }
};
