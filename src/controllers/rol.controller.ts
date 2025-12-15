import type { Request, Response } from 'express';
import { models, sequelize } from '../db/sequelize';
import { Op } from 'sequelize';

/**
 * Crear nuevo rol basado en un arquetipo
 * POST /api/roles
 * Body: { codigo, nombre, arquetipo_id, descripcion?, permiso_ids? }
 * Si no se envían permiso_ids, se copian todos los permisos del arquetipo
 */
export const crearRol = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();
    try {
        const { codigo, nombre, arquetipo_id, descripcion, permiso_ids } = req.body;

        if (!codigo || !nombre || !arquetipo_id) {
            await transaction.rollback();
            return res
                .status(400)
                .json({ error: 'missing fields: codigo, nombre, arquetipo_id' });
        }

        // Verificar que el arquetipo existe
        const arquetipo = await models.Arquetipo.findByPk(arquetipo_id, {
            include: [{ association: 'permisos', through: { attributes: [] } }],
            transaction,
        });

        if (!arquetipo) {
            await transaction.rollback();
            return res.status(404).json({ error: 'arquetipo not found' });
        }

        // Crear el rol
        const rol = await models.Rol.create(
            {
                codigo: codigo.toUpperCase(),
                nombre,
                descripcion,
                arquetipo_id,
            },
            { transaction }
        );

        // Determinar los permisos a asignar
        const arquetipoPermisos: any[] = (arquetipo as any).permisos || [];
        const arquetipoPermisoIds = arquetipoPermisos.map((p: any) => p.id);

        let permisosAAsignar: number[];

        if (permiso_ids && Array.isArray(permiso_ids)) {
            // Validar que los permisos solicitados sean subconjunto del arquetipo
            const permisosInvalidos = permiso_ids.filter(
                (id: number) => !arquetipoPermisoIds.includes(id)
            );
            if (permisosInvalidos.length > 0) {
                await transaction.rollback();
                return res.status(400).json({
                    error: 'Some permissions are not available in the archetype',
                    invalid_permissions: permisosInvalidos,
                    archetype_permissions: arquetipoPermisoIds,
                });
            }
            permisosAAsignar = permiso_ids;
        } else {
            // Copiar todos los permisos del arquetipo
            permisosAAsignar = arquetipoPermisoIds;
        }

        // Asignar permisos al rol
        await (rol as any).setPermisos(permisosAAsignar, { transaction });

        await transaction.commit();

        // Obtener rol con permisos para retornar
        const rolConPermisos = await models.Rol.findByPk(rol.get('id') as number, {
            include: [
                { association: 'arquetipo' },
                { association: 'permisos', through: { attributes: [] } },
            ],
        });

        return res.status(201).json(rolConPermisos?.toJSON());
    } catch (e: any) {
        await transaction.rollback();
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener rol por ID con arquetipo y permisos
 * GET /api/roles/:id
 */
export const obtenerRol = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const rol = await models.Rol.findByPk(id, {
            include: [
                { association: 'arquetipo', include: [{ association: 'permisos', through: { attributes: [] } }] },
                { association: 'permisos', through: { attributes: [] } },
            ],
        });

        if (!rol) {
            return res.status(404).json({ error: 'rol not found' });
        }

        return res.json(rol.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Listar todos los roles con paginación
 * GET /api/roles?page=1&limit=10&nombre=admin&arquetipo_id=1
 */
export const listarRoles = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const nombre = req.query.nombre as string;
        const codigo = req.query.codigo as string;
        const arquetipo_id = req.query.arquetipo_id as string;

        const where: any = {};
        if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };
        if (codigo) where.codigo = { [Op.like]: `%${codigo.toUpperCase()}%` };
        if (arquetipo_id) where.arquetipo_id = parseInt(arquetipo_id);

        const offset = (page - 1) * limit;

        const { count, rows } = await models.Rol.findAndCountAll({
            where,
            offset,
            limit,
            order: [['codigo', 'ASC']],
            include: [
                { association: 'arquetipo' },
                { association: 'permisos', through: { attributes: [] } },
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
 * Actualizar rol
 * PUT /api/roles/:id
 */
export const actualizarRol = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { codigo, nombre } = req.body;

        const rol = await models.Rol.findByPk(id);
        if (!rol) {
            return res.status(404).json({ error: 'rol not found' });
        }

        await rol.update({
            codigo: codigo ? codigo.toUpperCase() : rol.get('codigo'),
            nombre: nombre ?? rol.get('nombre'),
        });

        return res.json(rol.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Eliminar rol
 * DELETE /api/roles/:id
 */
export const eliminarRol = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const rol = await models.Rol.findByPk(id);
        if (!rol) {
            return res.status(404).json({ error: 'rol not found' });
        }

        await rol.destroy();

        return res.json({ ok: true, message: 'rol deleted' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Asignar permisos a un rol (validando contra arquetipo)
 * POST /api/roles/:id/permisos
 * Body: { permiso_ids: number[] }
 */
export const asignarPermisosRol = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { permiso_ids } = req.body;

        if (!Array.isArray(permiso_ids)) {
            return res
                .status(400)
                .json({ error: 'permiso_ids must be an array' });
        }

        // Obtener rol con su arquetipo y permisos del arquetipo
        const rol = await models.Rol.findByPk(id, {
            include: [
                {
                    association: 'arquetipo',
                    include: [{ association: 'permisos', through: { attributes: [] } }],
                },
            ],
        });

        if (!rol) {
            return res.status(404).json({ error: 'rol not found' });
        }

        // Validar que los permisos sean subconjunto del arquetipo
        const arquetipo: any = (rol as any).arquetipo;
        const arquetipoPermisoIds = (arquetipo?.permisos || []).map((p: any) => p.id);

        const permisosInvalidos = permiso_ids.filter(
            (id: number) => !arquetipoPermisoIds.includes(id)
        );

        if (permisosInvalidos.length > 0) {
            return res.status(400).json({
                error: 'Some permissions are not available in the archetype',
                invalid_permissions: permisosInvalidos,
                archetype_permissions: arquetipoPermisoIds,
            });
        }

        await (rol as any).setPermisos(permiso_ids);

        // Retornar rol actualizado
        const updated = await models.Rol.findByPk(id, {
            include: [
                { association: 'arquetipo' },
                { association: 'permisos', through: { attributes: [] } },
            ],
        });

        return res.json({
            ok: true,
            message: 'permisos assigned',
            data: updated?.toJSON(),
        });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener permisos de un rol
 * GET /api/roles/:id/permisos
 */
export const obtenerPermisosRol = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const rol = await models.Rol.findByPk(id, {
            include: [
                { association: 'arquetipo', include: [{ association: 'permisos', through: { attributes: [] } }] },
                { association: 'permisos', through: { attributes: [] } },
            ],
        });

        if (!rol) {
            return res.status(404).json({ error: 'rol not found' });
        }

        return res.json(rol.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};
