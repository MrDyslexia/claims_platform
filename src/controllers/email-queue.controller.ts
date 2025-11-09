import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import { Op } from 'sequelize';

/**
 * Obtener colas de email pendientes
 * GET /api/email-queue?page=1&limit=10&status=PENDIENTE
 */
export const listarEmailQueue = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as string;
        const to_email = req.query.to_email as string;

        const where: any = {};
        if (status) where.status = status;
        if (to_email) where.to_email = { [Op.like]: `%${to_email}%` };

        const offset = (page - 1) * limit;

        const { count, rows } = await models.EmailQueue.findAndCountAll({
            where,
            offset,
            limit,
            order: [['created_at', 'DESC']],
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
 * Obtener email en cola por ID
 * GET /api/email-queue/:id
 */
export const obtenerEmailQueue = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const emailQueue = await models.EmailQueue.findByPk(id);

        if (!emailQueue) {
            return res.status(404).json({ error: 'email queue not found' });
        }

        return res.json(emailQueue.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Crear email en cola
 * POST /api/email-queue
 */
export const crearEmailQueue = async (req: Request, res: Response) => {
    try {
        const { to_email, subject, template_code, payload_json } = req.body;

        if (!to_email || !subject || !template_code) {
            return res.status(400).json({
                error: 'missing fields: to_email, subject, template_code',
            });
        }

        const emailQueue = await models.EmailQueue.create({
            to_email,
            subject,
            template_code,
            payload_json: payload_json ?? null,
        });

        return res.status(201).json(emailQueue.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Actualizar estado de email
 * PUT /api/email-queue/:id
 */
export const actualizarEmailQueue = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, intento_count, ultimo_error } = req.body;

        const emailQueue = await models.EmailQueue.findByPk(id);
        if (!emailQueue) {
            return res.status(404).json({ error: 'email queue not found' });
        }

        await emailQueue.update({
            status: status ?? emailQueue.get('status'),
            intento_count:
                intento_count !== undefined
                    ? intento_count
                    : emailQueue.get('intento_count'),
            ultimo_error:
                ultimo_error !== undefined
                    ? ultimo_error
                    : emailQueue.get('ultimo_error'),
            sent_at:
                status === 'ENVIADO' && !emailQueue.get('sent_at')
                    ? new Date()
                    : emailQueue.get('sent_at'),
        });

        return res.json(emailQueue.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Marcar email como enviado
 * POST /api/email-queue/:id/enviar
 */
export const marcarComoEnviado = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const emailQueue = await models.EmailQueue.findByPk(id);
        if (!emailQueue) {
            return res.status(404).json({ error: 'email queue not found' });
        }

        await emailQueue.update({
            status: 'ENVIADO',
            sent_at: new Date(),
            intento_count: (emailQueue.get('intento_count') as number) + 1,
        });

        return res.json(emailQueue.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Marcar email como error
 * POST /api/email-queue/:id/error
 */
export const marcarComoError = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { error } = req.body;

        const emailQueue = await models.EmailQueue.findByPk(id);
        if (!emailQueue) {
            return res.status(404).json({ error: 'email queue not found' });
        }

        await emailQueue.update({
            status: 'ERROR',
            ultimo_error: error ?? 'Unknown error',
            intento_count: (emailQueue.get('intento_count') as number) + 1,
        });

        return res.json(emailQueue.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener emails pendientes de enviar
 * GET /api/email-queue/pendientes/listar
 */
export const obtenerEmailsPendientes = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;

        const emails = await models.EmailQueue.findAll({
            where: { status: 'PENDIENTE' },
            order: [['created_at', 'ASC']],
            limit,
        });

        return res.json(emails.map((e) => e.toJSON()));
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Eliminar email en cola
 * DELETE /api/email-queue/:id
 */
export const eliminarEmailQueue = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const emailQueue = await models.EmailQueue.findByPk(id);
        if (!emailQueue) {
            return res.status(404).json({ error: 'email queue not found' });
        }

        await emailQueue.destroy();

        return res.json({ ok: true, message: 'email queue deleted' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};
