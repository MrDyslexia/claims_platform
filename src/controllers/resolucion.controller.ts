import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import { Op } from 'sequelize';

/**
 * Crear nueva resolución
 * POST /api/resoluciones
 */
export const crearResolucion = async (req: Request, res: Response) => {
    try {
        const { denuncia_id, contenido, pdf_path } = req.body;
        const resuelto_por = (req as any).user?.get?.('id');

        if (!denuncia_id || !contenido) {
            return res.status(400).json({
                error: 'missing fields: denuncia_id, contenido',
            });
        }

        if (!resuelto_por) {
            return res.status(401).json({ error: 'unauthorized' });
        }

        const resolucion = await models.Resolucion.create({
            denuncia_id,
            contenido,
            resuelto_por,
            pdf_path: pdf_path ?? null,
        });

        return res.status(201).json(resolucion.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener resolución por ID
 * GET /api/resoluciones/:id
 */
export const obtenerResolucion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const resolucion = await models.Resolucion.findByPk(id, {
            include: [{ association: 'resolutor' }],
        });

        if (!resolucion) {
            return res.status(404).json({ error: 'resolucion not found' });
        }

        return res.json(resolucion.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener resolución por denuncia
 * GET /api/resoluciones/denuncia/:denuncia_id
 */
export const obtenerResolucionDenuncia = async (
    req: Request,
    res: Response
) => {
    try {
        const { denuncia_id } = req.params;
        const resolucion = await models.Resolucion.findOne({
            where: { denuncia_id },
            include: [{ association: 'resolutor' }],
        });

        if (!resolucion) {
            return res.status(404).json({ error: 'resolucion not found' });
        }

        return res.json(resolucion.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Listar resoluciones
 * GET /api/resoluciones?page=1&limit=10&denuncia_id=1
 */
export const listarResoluciones = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const denuncia_id = req.query.denuncia_id as string;
        const resuelto_por = req.query.resuelto_por as string;

        const where: any = {};
        if (denuncia_id) where.denuncia_id = denuncia_id;
        if (resuelto_por) where.resuelto_por = resuelto_por;

        const offset = (page - 1) * limit;

        const { count, rows } = await models.Resolucion.findAndCountAll({
            where,
            offset,
            limit,
            order: [['resuelto_at', 'DESC']],
            include: [{ association: 'resolutor' }],
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
 * Actualizar resolución
 * PUT /api/resoluciones/:id
 */
export const actualizarResolucion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { contenido, pdf_path } = req.body;

        const resolucion = await models.Resolucion.findByPk(id);
        if (!resolucion) {
            return res.status(404).json({ error: 'resolucion not found' });
        }

        await resolucion.update({
            contenido: contenido ?? resolucion.get('contenido'),
            pdf_path:
                pdf_path !== undefined ? pdf_path : resolucion.get('pdf_path'),
        });

        return res.json(resolucion.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Eliminar resolución
 * DELETE /api/resoluciones/:id
 */
export const eliminarResolucion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const resolucion = await models.Resolucion.findByPk(id);
        if (!resolucion) {
            return res.status(404).json({ error: 'resolucion not found' });
        }

        await resolucion.destroy();

        return res.json({ ok: true, message: 'resolucion deleted' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};
