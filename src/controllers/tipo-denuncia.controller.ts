import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import { Op } from 'sequelize';

/**
 * Crear nuevo tipo de denuncia
 * POST /api/tipos-denuncia
 */
    export const crearTipoDenuncia = async (req: Request, res: Response) => {
    try {
        const { nombre, codigo, categoria_id, activo, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'missing field: nombre' });
        }

        const tipo = await models.TipoDenuncia.create({
            nombre,
            codigo: codigo ? codigo.toUpperCase() : null,
            categoria_id: categoria_id ?? null,
            descripcion: descripcion ?? null,
            activo: activo !== undefined ? activo : 1,
        });

        return res.status(201).json(tipo.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener tipo de denuncia por ID
 * GET /api/tipos-denuncia/:id
 */
export const obtenerTipoDenuncia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tipo = await models.TipoDenuncia.findByPk(id);

        if (!tipo) {
            return res.status(404).json({ error: 'tipo denuncia not found' });
        }

        return res.json(tipo.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Listar todos los tipos de denuncia
 * GET /api/tipos-denuncia?page=1&limit=10&nombre=fraude
 */
export const listarTiposDenuncia = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const nombre = req.query.nombre as string;

        const where: any = {};
        if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };

        const offset = (page - 1) * limit;

        const { count, rows } = await models.TipoDenuncia.findAndCountAll({
            where,
            offset,
            limit,
            order: [['nombre', 'ASC']],
            include: [
                {
                    model: models.CategoriaDenuncia,
                    as: 'categoria',
                },
            ],
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
 * Actualizar tipo de denuncia
 * PUT /api/tipos-denuncia/:id
 */
export const actualizarTipoDenuncia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, categoria_id, activo } = req.body;

        const tipo = await models.TipoDenuncia.findByPk(id);
        if (!tipo) {
            return res.status(404).json({ error: 'tipo denuncia not found' });
        }

        await tipo.update({
            nombre: nombre ?? tipo.get('nombre'),
            descripcion:
                descripcion !== undefined
                    ? descripcion
                    : tipo.get('descripcion'),
            categoria_id:
                categoria_id !== undefined
                    ? categoria_id
                    : tipo.get('categoria_id'),
            activo: activo !== undefined ? activo : tipo.get('activo'),
        });

        return res.json(tipo.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Eliminar tipo de denuncia
 * DELETE /api/tipos-denuncia/:id
 */
export const eliminarTipoDenuncia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const tipo = await models.TipoDenuncia.findByPk(id);
        if (!tipo) {
            return res.status(404).json({ error: 'tipo denuncia not found' });
        }

        await tipo.destroy();

        return res.json({ ok: true, message: 'tipo denuncia deleted' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};
