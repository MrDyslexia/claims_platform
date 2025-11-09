import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import { Op } from 'sequelize';

/**
 * Crear reasignación
 * POST /api/reasignaciones
 */
export const crearReasignacion = async (req: Request, res: Response) => {
    try {
        const { denuncia_id, de_usuario_id, a_usuario_id } = req.body;
        const reasignado_por = (req as any).user?.get?.('id');

        if (!denuncia_id || !a_usuario_id) {
            return res.status(400).json({
                error: 'missing fields: denuncia_id, a_usuario_id',
            });
        }

        if (!reasignado_por) {
            return res.status(401).json({ error: 'unauthorized' });
        }

        const reasignacion = await models.Reasignacion.create({
            denuncia_id,
            de_usuario_id: de_usuario_id ?? null,
            a_usuario_id,
            reasignado_por,
        });

        return res.status(201).json(reasignacion.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener reasignación por ID
 * GET /api/reasignaciones/:id
 */
export const obtenerReasignacion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const reasignacion = await models.Reasignacion.findByPk(id, {
            include: [
                { association: 'reasignado_de' },
                { association: 'reasignado_a' },
                { association: 'reasignador' },
            ],
        });

        if (!reasignacion) {
            return res.status(404).json({ error: 'reasignacion not found' });
        }

        return res.json(reasignacion.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Listar reasignaciones
 * GET /api/reasignaciones?denuncia_id=1&page=1&limit=10
 */
export const listarReasignaciones = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const denuncia_id = req.query.denuncia_id as string;
        const a_usuario_id = req.query.a_usuario_id as string;

        const where: any = {};
        if (denuncia_id) where.denuncia_id = denuncia_id;
        if (a_usuario_id) where.a_usuario_id = a_usuario_id;

        const offset = (page - 1) * limit;

        const { count, rows } = await models.Reasignacion.findAndCountAll({
            where,
            offset,
            limit,
            order: [['created_at', 'DESC']],
            include: [
                { association: 'reasignado_de' },
                { association: 'reasignado_a' },
                { association: 'reasignador' },
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
 * Obtener reasignaciones de una denuncia
 * GET /api/reasignaciones/denuncia/:denuncia_id
 */
export const obtenerReasignacionesDenuncia = async (
    req: Request,
    res: Response
) => {
    try {
        const { denuncia_id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const offset = (page - 1) * limit;

        const { count, rows } = await models.Reasignacion.findAndCountAll({
            where: { denuncia_id },
            offset,
            limit,
            order: [['created_at', 'DESC']],
            include: [
                { association: 'reasignado_de' },
                { association: 'reasignado_a' },
                { association: 'reasignador' },
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
 * Eliminar reasignación
 * DELETE /api/reasignaciones/:id
 */
export const eliminarReasignacion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const reasignacion = await models.Reasignacion.findByPk(id);
        if (!reasignacion) {
            return res.status(404).json({ error: 'reasignacion not found' });
        }

        await reasignacion.destroy();

        return res.json({ ok: true, message: 'reasignacion deleted' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};
