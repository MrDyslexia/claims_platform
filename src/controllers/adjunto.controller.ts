import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import { Op } from 'sequelize';

/**
 * Crear nuevo adjunto
 * POST /api/adjuntos
 */
export const crearAdjunto = async (req: Request, res: Response) => {
    try {
        const { denuncia_id, nombre_archivo, ruta_archivo, tipo_mime } =
            req.body;
        const subido_por = (req as any).user?.get?.('id');

        if (!denuncia_id || !nombre_archivo || !ruta_archivo) {
            return res.status(400).json({
                error: 'missing fields: denuncia_id, nombre_archivo, ruta_archivo',
            });
        }

        if (!subido_por) {
            return res.status(401).json({ error: 'unauthorized' });
        }

        const adjunto = await models.Adjunto.create({
            denuncia_id,
            nombre_archivo,
            ruta_archivo,
            tipo_mime: tipo_mime ?? 'application/octet-stream',
            subido_por,
        });

        return res.status(201).json(adjunto.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener adjunto por ID
 * GET /api/adjuntos/:id
 */
export const obtenerAdjunto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const adjunto = await models.Adjunto.findByPk(id);

        if (!adjunto) {
            return res.status(404).json({ error: 'adjunto not found' });
        }

        return res.json(adjunto.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Listar adjuntos de una denuncia
 * GET /api/adjuntos?denuncia_id=1&page=1&limit=10
 */
export const listarAdjuntos = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const denuncia_id = req.query.denuncia_id as string;
        const nombre_archivo = req.query.nombre_archivo as string;

        const where: any = {};
        if (denuncia_id) where.denuncia_id = denuncia_id;
        if (nombre_archivo)
            where.nombre_archivo = { [Op.like]: `%${nombre_archivo}%` };

        const offset = (page - 1) * limit;

        const { count, rows } = await models.Adjunto.findAndCountAll({
            where,
            offset,
            limit,
            order: [['creado_at', 'DESC']],
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
 * Actualizar adjunto
 * PUT /api/adjuntos/:id
 */
export const actualizarAdjunto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre_archivo } = req.body;

        const adjunto = await models.Adjunto.findByPk(id);
        if (!adjunto) {
            return res.status(404).json({ error: 'adjunto not found' });
        }

        await adjunto.update({
            nombre_archivo: nombre_archivo ?? adjunto.get('nombre_archivo'),
        });

        return res.json(adjunto.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Eliminar adjunto
 * DELETE /api/adjuntos/:id
 */
export const eliminarAdjunto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const adjunto = await models.Adjunto.findByPk(id);
        if (!adjunto) {
            return res.status(404).json({ error: 'adjunto not found' });
        }

        await adjunto.destroy();

        return res.json({ ok: true, message: 'adjunto deleted' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};
