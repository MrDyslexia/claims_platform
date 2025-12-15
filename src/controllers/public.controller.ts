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

        const categoriesDb = await models.CategoriaDenuncia.findAll({
            where: { activo: 1 },
            include: [
                {
                    model: models.TipoDenuncia,
                    as: 'tipos',
                },
            ],
        });

        const categories = categoriesDb.map((cat: any) => ({
            id: cat.nombre === 'Respeto y seguridad en el trabajo' ? 'RESPETO_SEGURIDAD' :
                cat.nombre === 'Integridad en los negocios' ? 'INTEGRIDAD_NEGOCIOS' :
                cat.nombre === 'Sostenibilidad, medio ambiente y vecinos' ? 'SOSTENIBILIDAD' :
                cat.nombre.toUpperCase().replace(/\s+/g, '_'), // Fallback ID generation
            name: cat.nombre,
            description: cat.descripcion,
            icon: cat.icono,
            subcategories: cat.tipos.map((tipo: any) => ({
                code: tipo.codigo,
                name: tipo.nombre,
            })),
        }));

        return res.json({
            countries:FORM_METADATA.countries,
            categories,
        });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
};
