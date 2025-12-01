import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import { Op } from 'sequelize';

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
