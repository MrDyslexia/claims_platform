import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import { Op } from 'sequelize';

/**
 * Crear nueva categoria de denuncia
 * POST /api/categorias-denuncia
 */
export const crearCategoriaDenuncia = async (req: Request, res: Response) => {
    try {
        const { nombre, descripcion, activo, icono } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'missing field: nombre' });
        }

        const categoria = await models.CategoriaDenuncia.create({
            nombre,
            descripcion: descripcion ?? null,
            activo: activo !== undefined ? activo : 1,
            icono: icono !== undefined ? icono : 'Settings',
        });

        return res.status(201).json(categoria.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener categoria de denuncia por ID
 * GET /api/categorias-denuncia/:id
 */
export const obtenerCategoriaDenuncia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const categoria = await models.CategoriaDenuncia.findByPk(id);

        if (!categoria) {
            return res.status(404).json({ error: 'categoria denuncia not found' });
        }

        return res.json(categoria.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Listar todas las categorias de denuncia
 * GET /api/categorias-denuncia?page=1&limit=10&nombre=fraude&activo=1
 */
export const listarCategoriasDenuncia = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const nombre = req.query.nombre as string;
        const activo = req.query.activo;

        const where: any = {};
        if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };
        if (activo !== undefined) where.activo = activo;

        const offset = (page - 1) * limit;

        const { count, rows } = await models.CategoriaDenuncia.findAndCountAll({
            where,
            offset,
            limit,
            order: [['nombre', 'ASC']],
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
 * Actualizar categoria de denuncia
 * PUT /api/categorias-denuncia/:id
 */
export const actualizarCategoriaDenuncia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, activo } = req.body;

        const categoria = await models.CategoriaDenuncia.findByPk(id);
        if (!categoria) {
            return res.status(404).json({ error: 'categoria denuncia not found' });
        }

        await categoria.update({
            nombre: nombre ?? categoria.get('nombre'),
            descripcion:
                descripcion !== undefined
                    ? descripcion
                    : categoria.get('descripcion'),
            activo: activo !== undefined ? activo : categoria.get('activo'),
        });

        return res.json(categoria.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Eliminar categoria de denuncia
 * DELETE /api/categorias-denuncia/:id
 */
export const eliminarCategoriaDenuncia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const categoria = await models.CategoriaDenuncia.findByPk(id);
        if (!categoria) {
            return res.status(404).json({ error: 'categoria denuncia not found' });
        }

        // Check if there are types associated
        const typesCount = await models.TipoDenuncia.count({
            where: { categoria_id: id },
        });

        if (typesCount > 0) {
            return res.status(400).json({
                error: 'cannot delete category with associated types',
            });
        }

        await categoria.destroy();

        return res.json({ ok: true, message: 'categoria denuncia deleted' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};
