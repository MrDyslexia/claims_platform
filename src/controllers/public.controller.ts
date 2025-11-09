import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import {
    FORM_METADATA,
    ensureFormMetadataSeeded,
} from '../data/form-metadata';

export const obtenerMetadataFormulario = async (
    _req: Request,
    res: Response
) => {
    try {
        await ensureFormMetadataSeeded(models);
        return res.json({
            ...FORM_METADATA,
            generatedAt: new Date().toISOString(),
        });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
};
