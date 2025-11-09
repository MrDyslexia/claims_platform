import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import { Op } from 'sequelize';

/**
 * Obtener asignaciones de una denuncia
 * GET /api/asignaciones?denuncia_id=1&page=1&limit=10
 */
export const listarAsignaciones = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const denuncia_id = req.query.denuncia_id as string;
        const usuario_id = req.query.usuario_id as string;
        const activo = req.query.activo
            ? parseInt(req.query.activo as string)
            : undefined;

        const where: any = {};
        if (denuncia_id) where.denuncia_id = denuncia_id;
        if (usuario_id) where.usuario_id = usuario_id;
        if (activo !== undefined) where.activo = activo;

        const offset = (page - 1) * limit;

        const { count, rows } = await models.DenunciaAsignacion.findAndCountAll(
            {
                where,
                offset,
                limit,
                order: [['asignado_at', 'DESC']],
                include: [
                    { association: 'asignado' },
                    { association: 'asignador' },
                ],
            }
        );

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
 * Obtener asignación específica
 * GET /api/asignaciones/:denuncia_id/:usuario_id
 */
export const obtenerAsignacion = async (req: Request, res: Response) => {
    try {
        const { denuncia_id, usuario_id } = req.params;

        const asignacion = await models.DenunciaAsignacion.findOne({
            where: { denuncia_id, usuario_id },
            include: [
                { association: 'asignado' },
                { association: 'asignador' },
            ],
        });

        if (!asignacion) {
            return res.status(404).json({ error: 'asignacion not found' });
        }

        return res.json(asignacion.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Actualizar estado de asignación
 * PUT /api/asignaciones/:denuncia_id/:usuario_id
 */
export const actualizarAsignacion = async (req: Request, res: Response) => {
    try {
        const { denuncia_id, usuario_id } = req.params;
        const { activo } = req.body;

        const asignacion = await models.DenunciaAsignacion.findOne({
            where: { denuncia_id, usuario_id },
        });

        if (!asignacion) {
            return res.status(404).json({ error: 'asignacion not found' });
        }

        await asignacion.update({
            activo: activo !== undefined ? activo : asignacion.get('activo'),
        });

        return res.json(asignacion.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Eliminar asignación
 * DELETE /api/asignaciones/:denuncia_id/:usuario_id
 */
export const eliminarAsignacion = async (req: Request, res: Response) => {
    try {
        const { denuncia_id, usuario_id } = req.params;

        const asignacion = await models.DenunciaAsignacion.findOne({
            where: { denuncia_id, usuario_id },
        });

        if (!asignacion) {
            return res.status(404).json({ error: 'asignacion not found' });
        }

        await asignacion.destroy();

        return res.json({ ok: true, message: 'asignacion deleted' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener todas las asignaciones de un usuario
 * GET /api/asignaciones/usuario/:usuario_id
 */
export const obtenerAsignacionesUsuario = async (
    req: Request,
    res: Response
) => {
    try {
        const { usuario_id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const offset = (page - 1) * limit;

        const { count, rows } = await models.DenunciaAsignacion.findAndCountAll(
            {
                where: { usuario_id, activo: 1 },
                offset,
                limit,
                order: [['asignado_at', 'DESC']],
                include: [{ association: 'asignador' }],
            }
        );

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
