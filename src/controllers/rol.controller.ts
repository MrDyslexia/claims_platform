import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import { Op } from 'sequelize';

/**
 * Crear nuevo rol
 * POST /api/roles
 */
export const crearRol = async (req: Request, res: Response) => {
    try {
        const { codigo, nombre } = req.body;

        if (!codigo || !nombre) {
            return res
                .status(400)
                .json({ error: 'missing fields: codigo, nombre' });
        }

        const rol = await models.Rol.create({
            codigo: codigo.toUpperCase(),
            nombre,
        });

        return res.status(201).json(rol.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener rol por ID
 * GET /api/roles/:id
 */
export const obtenerRol = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const rol = await models.Rol.findByPk(id, {
            include: [{ association: 'Permiso' }],
        });

        if (!rol) {
            return res.status(404).json({ error: 'rol not found' });
        }

        return res.json(rol.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Listar todos los roles con paginación
 * GET /api/roles?page=1&limit=10&nombre=admin
 */
export const listarRoles = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const nombre = req.query.nombre as string;
        const codigo = req.query.codigo as string;

        const where: any = {};
        if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };
        if (codigo) where.codigo = { [Op.like]: `%${codigo.toUpperCase()}%` };

        const offset = (page - 1) * limit;

        const { count, rows } = await models.Rol.findAndCountAll({
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
 * Actualizar rol
 * PUT /api/roles/:id
 */
export const actualizarRol = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { codigo, nombre } = req.body;

        const rol = await models.Rol.findByPk(id);
        if (!rol) {
            return res.status(404).json({ error: 'rol not found' });
        }

        await rol.update({
            codigo: codigo ? codigo.toUpperCase() : rol.get('codigo'),
            nombre: nombre ?? rol.get('nombre'),
        });

        return res.json(rol.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Eliminar rol
 * DELETE /api/roles/:id
 */
export const eliminarRol = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const rol = await models.Rol.findByPk(id);
        if (!rol) {
            return res.status(404).json({ error: 'rol not found' });
        }

        await rol.destroy();

        return res.json({ ok: true, message: 'rol deleted' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Asignar permisos a un rol
 * POST /api/roles/:id/permisos
 */
export const asignarPermisosRol = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { permiso_ids } = req.body;

        if (!Array.isArray(permiso_ids)) {
            return res
                .status(400)
                .json({ error: 'permiso_ids must be an array' });
        }

        const rol = await models.Rol.findByPk(id);
        if (!rol) {
            return res.status(404).json({ error: 'rol not found' });
        }

        await (rol as any).setPermisos(permiso_ids);

        return res.json({ ok: true, message: 'permisos assigned' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener permisos de un rol
 * GET /api/roles/:id/permisos
 */
export const obtenerPermisosRol = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const rol = await models.Rol.findByPk(id, {
            include: [{ association: 'Permiso', through: { attributes: [] } }],
        });

        if (!rol) {
            return res.status(404).json({ error: 'rol not found' });
        }

        return res.json(rol.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};
