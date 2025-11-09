import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import { Op } from 'sequelize';

/**
 * Crear nuevo permiso
 * POST /api/permisos
 */
export const crearPermiso = async (req: Request, res: Response) => {
    try {
        const { codigo, nombre } = req.body;

        if (!codigo || !nombre) {
            return res
                .status(400)
                .json({ error: 'missing fields: codigo, nombre' });
        }

        const permiso = await models.Permiso.create({
            codigo,
            nombre,
        });

        return res.status(201).json(permiso.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener permiso por ID
 * GET /api/permisos/:id
 */
export const obtenerPermiso = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const permiso = await models.Permiso.findByPk(id);

        if (!permiso) {
            return res.status(404).json({ error: 'permiso not found' });
        }

        return res.json(permiso.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Listar todos los permisos con paginación
 * GET /api/permisos?page=1&limit=10&codigo=READ_DENUNCIA
 */
export const listarPermisos = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const codigo = req.query.codigo as string;
        const nombre = req.query.nombre as string;

        const where: any = {};
        if (codigo) where.codigo = { [Op.like]: `%${codigo}%` };
        if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };

        const offset = (page - 1) * limit;

        const { count, rows } = await models.Permiso.findAndCountAll({
            where,
            offset,
            limit,
            order: [['codigo', 'ASC']],
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
 * Actualizar permiso
 * PUT /api/permisos/:id
 */
export const actualizarPermiso = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { codigo, nombre } = req.body;

        const permiso = await models.Permiso.findByPk(id);
        if (!permiso) {
            return res.status(404).json({ error: 'permiso not found' });
        }

        await permiso.update({
            codigo: codigo ?? permiso.get('codigo'),
            nombre: nombre ?? permiso.get('nombre'),
        });

        return res.json(permiso.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Eliminar permiso
 * DELETE /api/permisos/:id
 */
export const eliminarPermiso = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const permiso = await models.Permiso.findByPk(id);
        if (!permiso) {
            return res.status(404).json({ error: 'permiso not found' });
        }

        await permiso.destroy();

        return res.json({ ok: true, message: 'permiso deleted' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener permisos de un usuario
 * GET /api/permisos/usuario/:usuario_id
 */
export const obtenerPermisosUsuario = async (req: Request, res: Response) => {
    try {
        const { usuario_id } = req.params;

        const usuario = await models.Usuario.findByPk(usuario_id, {
            include: [
                {
                    association: 'Rol',
                    through: { attributes: [] },
                    include: [
                        {
                            association: 'Permiso',
                            through: { attributes: [] },
                        },
                    ],
                },
            ],
        });

        if (!usuario) {
            return res.status(404).json({ error: 'usuario not found' });
        }

        // Extract unique permisos
        const permisos =
            (usuario as any).Roles?.flatMap((r: any) => r.Permisos ?? []) ?? [];
        const permisosUnicos = Array.from(
            new Map(permisos.map((p: any) => [p.id, p])).values()
        );

        return res.json({
            usuario_id,
            permisos: permisosUnicos.map((p: any) => p.toJSON?.() ?? p),
        });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};
