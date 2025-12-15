import type { Request, Response } from 'express';
import { models } from '../db/sequelize';

/**
 * Listar todos los arquetipos con sus permisos base
 * GET /api/arquetipos
 */
export const listarArquetipos = async (_req: Request, res: Response) => {
    try {
        const arquetipos = await models.Arquetipo.findAll({
            include: [
                {
                    association: 'permisos',
                    through: { attributes: [] },
                },
            ],
            order: [['id', 'ASC']],
        });

        return res.json({
            data: arquetipos.map((a) => a.toJSON()),
        });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
};

/**
 * Obtener arquetipo por ID con sus permisos
 * GET /api/arquetipos/:id
 */
export const obtenerArquetipo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const arquetipo = await models.Arquetipo.findByPk(id, {
            include: [
                {
                    association: 'permisos',
                    through: { attributes: [] },
                },
            ],
        });

        if (!arquetipo) {
            return res.status(404).json({ error: 'arquetipo not found' });
        }

        return res.json(arquetipo.toJSON());
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
};

/**
 * Asignar permisos a un arquetipo
 * POST /api/arquetipos/:id/permisos
 * Body: { permiso_ids: number[] }
 */
export const asignarPermisosArquetipo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { permiso_ids } = req.body;

        if (!Array.isArray(permiso_ids)) {
            return res
                .status(400)
                .json({ error: 'permiso_ids must be an array' });
        }

        const arquetipo = await models.Arquetipo.findByPk(id);
        if (!arquetipo) {
            return res.status(404).json({ error: 'arquetipo not found' });
        }

        // Asignar permisos al arquetipo
        await (arquetipo as any).setPermisos(permiso_ids);

        // Retornar arquetipo actualizado con permisos
        const updated = await models.Arquetipo.findByPk(id, {
            include: [
                {
                    association: 'permisos',
                    through: { attributes: [] },
                },
            ],
        });

        return res.json({
            ok: true,
            message: 'permisos assigned to arquetipo',
            data: updated?.toJSON(),
        });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
};
