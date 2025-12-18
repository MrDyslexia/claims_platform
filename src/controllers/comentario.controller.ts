import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import { Op } from 'sequelize';
import { emailService } from '../utils/email.service';

/**
 * Helper: Obtener rol del usuario
 */
async function obtenerRolUsuario(usuario: any): Promise<string | null> {
    try {
        const usuarioCompleto = await models.Usuario.findByPk(
            usuario.get('id'),
            {
                include: [
                    {
                        model: models.Rol,
                        as: 'rol',
                        attributes: ['nombre'],
                    },
                ],
            }
        );

        const rol = (usuarioCompleto?.toJSON() as any)?.rol;
        return rol?.nombre || null;
    } catch {
        return null;
    }
}

/**
 * Crear nuevo comentario en una denuncia específica
 * POST /api/denuncias/:id/comentarios
 */
export const crearComentarioDenuncia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { contenido, es_interno, visibility } = req.body;
        const usuario = (req as any).user;
        const usuario_id = usuario?.get?.('id');

        // Validaciones
        if (!contenido || contenido.trim().length === 0) {
            return res.status(400).json({
                error: 'El contenido del comentario es requerido',
            });
        }

        if (contenido.length > 5000) {
            return res.status(400).json({
                error: 'El comentario no puede exceder 5000 caracteres',
            });
        }

        // Verificar que la denuncia existe
        const denuncia = await models.Denuncia.findByPk(id);
        if (!denuncia) {
            return res.status(404).json({
                error: 'Denuncia no encontrada',
            });
        }

        // Determinar visibilidad
        let visibilityValue: 'publico' | 'interno' | 'privado_analista' =
            'publico';

        if (
            visibility &&
            ['publico', 'interno', 'privado_analista'].includes(visibility)
        ) {
            visibilityValue = visibility;
        } else if (es_interno === true || es_interno === 'true') {
            // Retrocompatibilidad: es_interno=true -> interno
            visibilityValue = 'interno';
        }

        // Obtener rol del usuario
        const autorRol = usuario ? await obtenerRolUsuario(usuario) : null;

        // Crear el comentario
        const comentario = await models.Comentario.create({
            denuncia_id: id,
            usuario_id: usuario_id,
            contenido: contenido.trim(),
            es_interno: visibilityValue !== 'publico', // Mantener retrocompatibilidad
            visibility: visibilityValue,
            autor_rol: autorRol,
        });

        // Refrescar el comentario con las asociaciones
        await comentario.reload({
            include: [
                {
                    model: models.Usuario,
                    as: 'autor',
                    attributes: ['id', 'nombre_completo', 'email'],
                },
            ],
        });

        const comentarioJSON = comentario.toJSON() as any;

        // Enviar notificación por email si:
        // 1. El comentario es público (no interno)
        // 2. La denuncia tiene email del denunciante
        const denuncianteEmail = denuncia.get('denunciante_email') as string | null;
        if (visibilityValue === 'publico' && denuncianteEmail) {
            try {
                await emailService.sendCommentNotification(denuncianteEmail, {
                    numero: denuncia.get('numero') as string,
                    asunto: denuncia.get('asunto') as string,
                    nombreDenunciante: (denuncia.get('denunciante_nombre') as string) || undefined,
                    comentarioContenido: contenido.trim(),
                    autorNombre: comentarioJSON.autor?.nombre_completo || 'Equipo de Soporte',
                    fechaComentario: new Date(),
                });
                console.log(`[Email] Notificación de comentario enviada a ${denuncianteEmail}`);
            } catch (emailError) {
                console.error('[Email] Error enviando notificación de comentario:', emailError);
                // No fallar la creación del comentario si falla el email
            }
        }

        return res.status(201).json({
            mensaje: 'Comentario creado exitosamente',
            comentario: {
                id: comentarioJSON.id,
                contenido: comentarioJSON.contenido,
                autor: {
                    nombre: comentarioJSON.autor?.nombre_completo || 'Sistema',
                    email: comentarioJSON.autor?.email,
                    rol: autorRol,
                },
                visibility: comentarioJSON.visibility,
                es_interno: comentarioJSON.es_interno,
                created_at: comentarioJSON.created_at,
            },
        });
    } catch (e: any) {
        console.error('Error al crear comentario:', e);
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Crear nuevo comentario
 * POST /api/comentarios
 */
export const crearComentario = async (req: Request, res: Response) => {
    try {
        const {
            denuncia_id,
            contenido,
            autor_nombre,
            autor_email,
            visibility,
        } = req.body;
        const usuario = (req as any).user;
        const usuario_id = usuario?.get?.('id');

        if (!denuncia_id || !contenido) {
            return res.status(400).json({
                error: 'missing fields: denuncia_id, contenido',
            });
        }

        // Determinar visibilidad (default: publico)
        const visibilityValue: 'publico' | 'interno' | 'privado_analista' =
            visibility &&
            ['publico', 'interno', 'privado_analista'].includes(visibility)
                ? visibility
                : 'publico';

        // Obtener rol del usuario si está autenticado
        const autorRol = usuario ? await obtenerRolUsuario(usuario) : null;

        const comentario = await models.Comentario.create({
            denuncia_id,
            usuario_id: usuario_id ?? null,
            contenido,
            autor_nombre: autor_nombre ?? null,
            autor_email: autor_email ?? null,
            visibility: visibilityValue,
            es_interno: visibilityValue !== 'publico',
            autor_rol: autorRol,
        });

        return res.status(201).json(comentario.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener comentario por ID
 * GET /api/comentarios/:id
 */
export const obtenerComentario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const comentario = await models.Comentario.findByPk(id, {
            include: [{ association: 'autor' }],
        });

        if (!comentario) {
            return res.status(404).json({ error: 'comentario not found' });
        }

        return res.json(comentario.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Listar comentarios de una denuncia
 * GET /api/comentarios?denuncia_id=1&page=1&limit=10
 *
 * Los usuarios autenticados ven todos los comentarios.
 * Los usuarios no autenticados (públicos) solo ven comentarios públicos.
 */
export const listarComentarios = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const denuncia_id = req.query.denuncia_id as string;
        const isAuthenticated = !!(req as any).user;

        const where: any = {};
        if (denuncia_id) where.denuncia_id = denuncia_id;

        // Si no está autenticado, solo mostrar comentarios públicos
        if (!isAuthenticated) {
            where.visibility = 'publico';
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await models.Comentario.findAndCountAll({
            where,
            offset,
            limit,
            order: [['created_at', 'DESC']],
            include: [{ association: 'autor' }],
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
 * Actualizar comentario
 * PUT /api/comentarios/:id
 */
export const actualizarComentario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { contenido, autor_nombre, autor_email } = req.body;

        const comentario = await models.Comentario.findByPk(id);
        if (!comentario) {
            return res.status(404).json({ error: 'comentario not found' });
        }

        await comentario.update({
            contenido: contenido ?? comentario.get('contenido'),
            autor_nombre:
                autor_nombre !== undefined
                    ? autor_nombre
                    : comentario.get('autor_nombre'),
            autor_email:
                autor_email !== undefined
                    ? autor_email
                    : comentario.get('autor_email'),
        });

        return res.json(comentario.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Eliminar comentario
 * DELETE /api/comentarios/:id
 */
export const eliminarComentario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const comentario = await models.Comentario.findByPk(id);
        if (!comentario) {
            return res.status(404).json({ error: 'comentario not found' });
        }

        await comentario.destroy();

        return res.json({ ok: true, message: 'comentario deleted' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Crear comentario público del denunciante
 * POST /api/denuncias/public/comentario
 * Solo permitido cuando la denuncia está en estado INFO (5)
 */
export const crearComentarioPublico = async (req: Request, res: Response) => {
    try {
        const { numero, clave, contenido, autor_nombre } = req.body;

        // Validaciones básicas
        if (!numero || !clave) {
            return res.status(400).json({
                error: 'numero y clave son requeridos',
            });
        }

        if (!contenido || contenido.trim().length === 0) {
            return res.status(400).json({
                error: 'El contenido del comentario es requerido',
            });
        }

        if (contenido.length > 5000) {
            return res.status(400).json({
                error: 'El comentario no puede exceder 5000 caracteres',
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

        // Verificar que el estado sea INFO (5)
        const estadoId = denuncia.get('estado_id');
        if (Number(estadoId) !== 5) {
            return res.status(400).json({
                error: 'Solo puede agregar comentarios cuando la denuncia está en estado "Requiere información"',
            });
        }

        // Crear el comentario
        const comentario = await models.Comentario.create({
            denuncia_id: denuncia.get('id'),
            usuario_id: null,
            contenido: contenido.trim(),
            es_interno: false,
            visibility: 'publico',
            autor_nombre: autor_nombre || denuncia.get('denunciante_nombre') || 'Denunciante',
            autor_email: denuncia.get('denunciante_email') || null,
            autor_rol: 'Denunciante',
        });

        return res.status(201).json({
            mensaje: 'Comentario agregado exitosamente',
            comentario: {
                id: comentario.get('id'),
                contenido: comentario.get('contenido'),
                autor_nombre: comentario.get('autor_nombre'),
                created_at: comentario.get('created_at'),
            },
        });
    } catch (e: any) {
        console.error('Error al crear comentario público:', e);
        return res.status(400).json({ error: e.message });
    }
};
