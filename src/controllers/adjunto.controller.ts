import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import { Op } from 'sequelize';
import multer from 'multer';
import { UPLOAD_CONFIG, getUploadErrorMessage } from '../config/upload';
import {
    uploadFile,
    deleteFile,
    getFilesByDenuncia,
} from '../services/upload.service';
import path from 'node:path';
import fs from 'node:fs/promises';

// Configurar multer para memoria (guardaremos manualmente)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
        files: UPLOAD_CONFIG.MAX_FILES_PER_DENUNCIA,
    },
});

export const uploadMiddleware = upload.array(
    'archivos',
    UPLOAD_CONFIG.MAX_FILES_PER_DENUNCIA
);

// Middleware para subir archivos desde el frontend público (usa 'files' como campo)
export const uploadMiddlewarePublic = upload.array(
    'files',
    UPLOAD_CONFIG.MAX_FILES_PER_DENUNCIA
);

/**
 * Subir archivos adjuntos a una denuncia
 * POST /api/adjuntos/upload
 * Content-Type: multipart/form-data
 */
export const subirAdjuntos = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];
        const { denuncia_id, tipo_vinculo } = req.body;
        const userId = (req as any).user?.get?.('id') || null;

        if (!denuncia_id) {
            return res.status(400).json({
                error: 'denuncia_id es requerido',
            });
        }

        if (!files || files.length === 0) {
            return res.status(400).json({
                error: 'No se proporcionaron archivos',
            });
        }

        // Verificar que la denuncia existe
        const denuncia = await models.Denuncia.findByPk(denuncia_id);
        if (!denuncia) {
            return res.status(404).json({
                error: 'Denuncia no encontrada',
            });
        }

        // Subir cada archivo
        const results = await Promise.all(
            files.map((file) =>
                uploadFile(
                    file,
                    Number(denuncia_id),
                    userId,
                    tipo_vinculo || 'DENUNCIA'
                )
            )
        );

        // Separar éxitos y errores
        const successful = results.filter((r) => r.success);
        const failed = results.filter((r) => !r.success);

        return res.status(successful.length > 0 ? 201 : 400).json({
            uploaded: successful.length,
            failed: failed.length,
            files: successful.map((r) => ({
                id: r.fileId,
                filename: r.filename,
                size: r.size,
                path: r.path,
            })),
            errors: failed.map((r) => ({
                filename: r.filename,
                error: getUploadErrorMessage(r.errorCode || 'UPLOAD_ERROR'),
                code: r.errorCode,
            })),
        });
    } catch (e: any) {
        console.error('[Upload Error]:', e);
        return res.status(500).json({ error: e.message });
    }
};

/**
 * Descargar archivo adjunto
 * GET /api/adjuntos/:id/download
 */
export const descargarAdjunto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const adjunto = await models.Adjunto.findByPk(id);
        if (!adjunto) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        const filePath = path.join(
            UPLOAD_CONFIG.UPLOAD_DIR,
            adjunto.get('ruta') as string
        );

        // Verificar que el archivo existe
        try {
            await fs.access(filePath);
        } catch {
            return res
                .status(404)
                .json({ error: 'Archivo no encontrado en el sistema' });
        }

        // Configurar headers
        res.setHeader('Content-Type', adjunto.get('mime_type') as string);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${adjunto.get('nombre_archivo')}"`
        );
        res.setHeader('Content-Length', adjunto.get('tamano_bytes') as number);

        // Enviar archivo
        const fileBuffer = await fs.readFile(filePath);
        return res.send(fileBuffer);
    } catch (e: any) {
        console.error('[Download Error]:', e);
        return res.status(500).json({ error: e.message });
    }
};

/**
 * Obtener archivos de una denuncia
 * GET /api/adjuntos/denuncia/:denunciaId
 */
export const obtenerAdjuntosDenuncia = async (req: Request, res: Response) => {
    try {
        const { denunciaId } = req.params;

        const archivos = await getFilesByDenuncia(Number(denunciaId));

        return res.json({
            total: archivos.length,
            archivos,
        });
    } catch (e: any) {
        console.error('[Get Files Error]:', e);
        return res.status(500).json({ error: e.message });
    }
};

/**
 * Crear nuevo adjunto
 * POST /api/adjuntos
 */
export const crearAdjunto = async (req: Request, res: Response) => {
    try {
        const { denuncia_id, nombre_archivo, ruta_archivo, tipo_mime } =
            req.body;
        const subido_por = (req as any).user?.get?.('id');

        if (!denuncia_id || !nombre_archivo || !ruta_archivo) {
            return res.status(400).json({
                error: 'missing fields: denuncia_id, nombre_archivo, ruta_archivo',
            });
        }

        if (!subido_por) {
            return res.status(401).json({ error: 'unauthorized' });
        }

        const adjunto = await models.Adjunto.create({
            denuncia_id,
            nombre_archivo,
            ruta_archivo,
            tipo_mime: tipo_mime ?? 'application/octet-stream',
            subido_por,
        });

        return res.status(201).json(adjunto.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener adjunto por ID
 * GET /api/adjuntos/:id
 */
export const obtenerAdjunto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const adjunto = await models.Adjunto.findByPk(id);

        if (!adjunto) {
            return res.status(404).json({ error: 'adjunto not found' });
        }

        return res.json(adjunto.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Listar adjuntos de una denuncia
 * GET /api/adjuntos?denuncia_id=1&page=1&limit=10
 */
export const listarAdjuntos = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const denuncia_id = req.query.denuncia_id as string;
        const nombre_archivo = req.query.nombre_archivo as string;

        const where: any = {};
        if (denuncia_id) where.denuncia_id = denuncia_id;
        if (nombre_archivo)
            where.nombre_archivo = { [Op.like]: `%${nombre_archivo}%` };

        const offset = (page - 1) * limit;

        const { count, rows } = await models.Adjunto.findAndCountAll({
            where,
            offset,
            limit,
            order: [['creado_at', 'DESC']],
        });

        return res.json({
            total: count,
            page,
            limit,
            pages: Math.ceil(count / limit),
            data: rows.map((r) => r.toJSON()),
        });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Actualizar adjunto
 * PUT /api/adjuntos/:id
 */
export const actualizarAdjunto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre_archivo } = req.body;

        const adjunto = await models.Adjunto.findByPk(id);
        if (!adjunto) {
            return res.status(404).json({ error: 'adjunto not found' });
        }

        await adjunto.update({
            nombre_archivo: nombre_archivo ?? adjunto.get('nombre_archivo'),
        });

        return res.json(adjunto.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Eliminar adjunto
 * DELETE /api/adjuntos/:id
 */
export const eliminarAdjunto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Usar el servicio deleteFile que elimina archivo físico + metadata
        const result = await deleteFile(Number(id));

        if (!result.success) {
            return res.status(404).json({
                error: result.error || 'No se pudo eliminar el adjunto',
            });
        }

        return res.json({
            ok: true,
            message: 'Archivo eliminado correctamente',
        });
    } catch (e: any) {
        console.error('[Delete Adjunto Error]:', e);
        return res.status(500).json({ error: e.message });
    }
};

/**
 * Subir adjuntos públicos del denunciante
 * POST /api/denuncias/public/adjuntos
 * Solo permitido cuando la denuncia está en estado INFO (5)
 */
export const subirAdjuntoPublico = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];
        const { numero, clave } = req.body;

        // Validaciones básicas
        if (!numero || !clave) {
            return res.status(400).json({
                error: 'numero y clave son requeridos',
            });
        }

        if (!files || files.length === 0) {
            return res.status(400).json({
                error: 'No se proporcionaron archivos',
            });
        }

        // Buscar la denuncia
        const denuncia = await models.Denuncia.findOne({ where: { numero } });
        if (!denuncia) {
            return res.status(404).json({ error: 'Denuncia no encontrada' });
        }

        // Verificar la clave
        const { verifyClaveWithSalt } = await import('../utils/crypto');
        const ok = verifyClaveWithSalt(
            String(clave),
            denuncia.get('clave_salt') as Buffer,
            denuncia.get('clave_hash') as Buffer
        );
        if (!ok) {
            return res.status(401).json({ error: 'Clave de acceso inválida' });
        }

        // Verificar que el estado sea INFO (3) o EN PROCESO (2)
        // Se acepta estado 2 porque el comentario podría haberse procesado primero y cambiado el estado
        const estadoId = denuncia.get('estado_id');
        if (Number(estadoId) !== 3 && Number(estadoId) !== 2) {
            return res.status(400).json({
                error: 'Solo puede agregar archivos cuando la denuncia está en estado "Requiere información" o "En Proceso"',
            });
        }

        const denunciaId = denuncia.get('id') as number;

        // Subir cada archivo
        const results = await Promise.all(
            files.map((file) =>
                uploadFile(
                    file,
                    denunciaId,
                    null, // No hay userId para públicos
                    'DENUNCIA'
                )
            )
        );

        // Separar éxitos y errores
        const successful = results.filter((r) => r.success);
        const failed = results.filter((r) => !r.success);

        // Si se subieron archivos exitosamente, cambiar el estado a 2 (En Proceso)
        // Solo si el estado sigue siendo 3 (evita duplicación si se envían comentarios y archivos juntos)
        if (successful.length > 0) {
            // Recargar la denuncia para obtener el estado actual
            await denuncia.reload();
            const estadoActual = denuncia.get('estado_id');
            
            if (Number(estadoActual) === 3) {
                await denuncia.update({ estado_id: 2 });

                // Registrar el cambio de estado en el historial
                await models.DenunciaHistorialEstado.create({
                    denuncia_id: denunciaId,
                    de_estado_id: estadoActual,
                    a_estado_id: 2,
                    cambiado_por: null,
                    motivo: 'Archivos adicionales recibidos del denunciante',
                });
            }
        }

        return res.status(successful.length > 0 ? 201 : 400).json({
            mensaje:
                successful.length > 0
                    ? 'Archivos subidos exitosamente'
                    : 'No se pudo subir ningún archivo',
            uploaded: successful.length,
            failed: failed.length,
            files: successful.map((r) => ({
                id: r.fileId,
                filename: r.filename,
                size: r.size,
            })),
            errors: failed.map((r) => ({
                filename: r.filename,
                error: getUploadErrorMessage(r.errorCode || 'UPLOAD_ERROR'),
            })),
        });
    } catch (e: any) {
        console.error('[Upload Público Error]:', e);
        return res.status(500).json({ error: e.message });
    }
};
