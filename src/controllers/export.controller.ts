import type { Request, Response } from 'express';
import { models } from '../db/sequelize';

export const registrarExport = async (
    req: Request & { user?: any },
    res: Response
) => {
    const { tipo, formato, filtros_json, denuncia_id } = req.body;
    const usuario_id = req.user?.get?.('id');
    if (!usuario_id) return res.status(401).json({ error: 'unauthorized' });
    if (!tipo || !formato)
        return res.status(400).json({ error: 'missing fields' });
    try {
        const exp = await models.ExportAuditoria.create({
            usuario_id,
            tipo,
            formato,
            filtros_json: filtros_json ?? null,
            denuncia_id: denuncia_id ?? null,
        });
        // Trigger ai_export_auditoria creates an auditoria record
        return res.status(201).json({ id: exp.get('id') });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};
