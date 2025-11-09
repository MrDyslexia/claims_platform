import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import { Op } from 'sequelize';

/**
 * Crear nuevo estado de denuncia
 * POST /api/estados-denuncia
 */
export const crearEstadoDenuncia = async (req: Request, res: Response) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'missing field: nombre' });
        }

        const estado = await models.EstadoDenuncia.create({
            nombre,
            descripcion: descripcion ?? null,
        });

        return res.status(201).json(estado.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener estado de denuncia por ID
 * GET /api/estados-denuncia/:id
 */
export const obtenerEstadoDenuncia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const estado = await models.EstadoDenuncia.findByPk(id);

        if (!estado) {
            return res.status(404).json({ error: 'estado denuncia not found' });
        }

        return res.json(estado.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Listar todos los estados de denuncia
 * GET /api/estados-denuncia?page=1&limit=10&nombre=pendiente
 */
export const listarEstadosDenuncia = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const nombre = req.query.nombre as string;

        const where: any = {};
        if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };

        const offset = (page - 1) * limit;

        const { count, rows } = await models.EstadoDenuncia.findAndCountAll({
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
 * Actualizar estado de denuncia
 * PUT /api/estados-denuncia/:id
 */
export const actualizarEstadoDenuncia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        const estado = await models.EstadoDenuncia.findByPk(id);
        if (!estado) {
            return res.status(404).json({ error: 'estado denuncia not found' });
        }

        await estado.update({
            nombre: nombre ?? estado.get('nombre'),
            descripcion:
                descripcion !== undefined
                    ? descripcion
                    : estado.get('descripcion'),
        });

        return res.json(estado.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Eliminar estado de denuncia
 * DELETE /api/estados-denuncia/:id
 */
export const eliminarEstadoDenuncia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const estado = await models.EstadoDenuncia.findByPk(id);
        if (!estado) {
            return res.status(404).json({ error: 'estado denuncia not found' });
        }

        await estado.destroy();

        return res.json({ ok: true, message: 'estado denuncia deleted' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};
