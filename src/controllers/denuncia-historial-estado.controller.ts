import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import { Op } from 'sequelize';

/**
 * Registrar cambio de estado
 * POST /api/historial-estado
 */
export const crearHistorialEstado = async (req: Request, res: Response) => {
    try {
        const { denuncia_id, de_estado_id, a_estado_id, motivo } = req.body;
        const cambiado_por = (req as any).user?.get?.('id');

        if (!denuncia_id || !a_estado_id) {
            return res.status(400).json({
                error: 'missing fields: denuncia_id, a_estado_id',
            });
        }

        const historial = await models.DenunciaHistorialEstado.create({
            denuncia_id,
            de_estado_id: de_estado_id ?? null,
            a_estado_id,
            cambiado_por: cambiado_por ?? null,
            motivo: motivo ?? null,
        });

        return res.status(201).json(historial.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener historial por ID
 * GET /api/historial-estado/:id
 */
export const obtenerHistorialEstado = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const historial = await models.DenunciaHistorialEstado.findByPk(id, {
            include: [
                { association: 'de_estado' },
                { association: 'a_estado' },
                { association: 'cambiador' },
            ],
        });

        if (!historial) {
            return res.status(404).json({ error: 'historial not found' });
        }

        return res.json(historial.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Listar historial de cambios de estado
 * GET /api/historial-estado?denuncia_id=1&page=1&limit=10
 */
export const listarHistorialEstado = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const denuncia_id = req.query.denuncia_id as string;
        const a_estado_id = req.query.a_estado_id as string;

        const where: any = {};
        if (denuncia_id) where.denuncia_id = denuncia_id;
        if (a_estado_id) where.a_estado_id = a_estado_id;

        const offset = (page - 1) * limit;

        const { count, rows } =
            await models.DenunciaHistorialEstado.findAndCountAll({
                where,
                offset,
                limit,
                order: [['created_at', 'DESC']],
                include: [
                    { association: 'de_estado' },
                    { association: 'a_estado' },
                    { association: 'cambiador' },
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
 * Obtener historial completo de una denuncia
 * GET /api/historial-estado/denuncia/:denuncia_id
 */
export const obtenerHistorialDenuncia = async (req: Request, res: Response) => {
    try {
        const { denuncia_id } = req.params;

        const historial = await models.DenunciaHistorialEstado.findAll({
            where: { denuncia_id },
            order: [['created_at', 'ASC']],
            include: [
                { association: 'de_estado' },
                { association: 'a_estado' },
                { association: 'cambiador' },
            ],
        });

        return res.json(historial.map((h) => h.toJSON()));
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Actualizar historial
 * PUT /api/historial-estado/:id
 */
export const actualizarHistorialEstado = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;

        const historial = await models.DenunciaHistorialEstado.findByPk(id);
        if (!historial) {
            return res.status(404).json({ error: 'historial not found' });
        }

        await historial.update({
            motivo: motivo !== undefined ? motivo : historial.get('motivo'),
        });

        return res.json(historial.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Eliminar registro de historial
 * DELETE /api/historial-estado/:id
 */
export const eliminarHistorialEstado = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const historial = await models.DenunciaHistorialEstado.findByPk(id);
        if (!historial) {
            return res.status(404).json({ error: 'historial not found' });
        }

        await historial.destroy();

        return res.json({ ok: true, message: 'historial deleted' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};
