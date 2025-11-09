import type { Request, Response } from 'express';
import { models, sequelize } from '../db/sequelize';
import { Op } from 'sequelize';

/**
 * Crear nueva empresa
 * POST /api/empresas
 */
export const crearEmpresa = async (req: Request, res: Response) => {
    try {
        const { rut, nombre, estado, direccion, email, telefono } = req.body;

        if (!rut || !nombre) {
            return res
                .status(400)
                .json({ error: 'missing fields: rut, nombre' });
        }

        const empresa = await models.Empresa.create({
            rut,
            nombre,
            estado: estado ?? 1,
            direccion,
            email,
            telefono,
        });

        return res.status(201).json({
            id: empresa.get('id'),
            rut: empresa.get('rut'),
            nombre: empresa.get('nombre'),
            estado: empresa.get('estado'),
        });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener empresa por ID
 * GET /api/empresas/:id
 */
export const obtenerEmpresa = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const empresa = await models.Empresa.findByPk(id);

        if (!empresa) {
            return res.status(404).json({ error: 'empresa not found' });
        }

        return res.json(empresa.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Listar todas las empresas con paginación
 * GET /api/empresas?page=1&limit=10&estado=1
 */
export const listarEmpresas = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const estado = req.query.estado
            ? parseInt(req.query.estado as string)
            : undefined;
        const nombre = req.query.nombre as string;

        const where: any = {};
        if (estado !== undefined) where.estado = estado;
        if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };

        const offset = (page - 1) * limit;

        const { count, rows } = await models.Empresa.findAndCountAll({
            where,
            offset,
            limit,
            order: [['id', 'DESC']],
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
 * Actualizar empresa
 * PUT /api/empresas/:id
 */
export const actualizarEmpresa = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { direccion, email, estado, nombre, rut, telefono } = req.body;
        const empresa = await models.Empresa.findByPk(id);
        if (!empresa) {
            return res.status(404).json({ error: 'empresa not found' });
        }

        await empresa.update({
            direccion: direccion ?? empresa.get('direccion'),
            email: email ?? empresa.get('email'),
            estado: estado ?? empresa.get('estado'),
            nombre: nombre ?? empresa.get('nombre'),
            rut: rut ?? empresa.get('rut'),
            telefono: telefono ?? empresa.get('telefono'),
            updated_at: new Date(),
        });

        return res.json(empresa.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Eliminar empresa (soft delete - cambiar estado a 0)
 * DELETE /api/empresas/:id
 */
export const eliminarEmpresa = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const empresa = await models.Empresa.findByPk(id);
        if (!empresa) {
            return res.status(404).json({ error: 'empresa not found' });
        }

        await empresa.destroy();

        return res.json({ ok: true, message: 'empresa deleted' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener lista completa de empresas con información detallada
 * GET /api/empresas/admin/lista-completa
 * Incluye: datos de empresa, estadísticas, contactos, filtros disponibles, estadísticas globales
 */
export const obtenerListaCompletaEmpresas = async (
    req: Request,
    res: Response
) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const estado = req.query.estado
            ? parseInt(req.query.estado as string)
            : undefined;
        const nombre = req.query.nombre as string;

        const where: any = {};
        if (estado !== undefined) where.estado = estado;
        if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };

        const offset = (page - 1) * limit;

        // Obtener empresas
        const { count, rows } = await models.Empresa.findAndCountAll({
            where,
            offset,
            limit,
            order: [['created_at', 'DESC']],
        });

        // Obtener denuncias por empresa para estadísticas
        const denunciasStats = await models.Denuncia.findAll({
            attributes: [
                'empresa_id',
                [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.where(sequelize.col('estado_id'), Op.eq, 1)
                    ),
                    'activas',
                ],
            ],
            group: ['empresa_id'],
            raw: true,
        } as any);

        // Formatear empresas con estadísticas
        const empresasFormateadas = rows.map((empresa: any) => {
            const empresaJSON = empresa.toJSON() as any;
            const stats = denunciasStats.find(
                (s: any) => s.empresa_id === empresaJSON.id
            ) as any;

            return {
                id_empresa: empresaJSON.id,
                nombre: empresaJSON.nombre,
                rut: empresaJSON.rut,
                direccion: empresaJSON.direccion || '',
                telefono: empresaJSON.telefono || '',
                email: empresaJSON.email || '',
                activo: empresaJSON.estado === 1,
                fecha_creacion: empresaJSON.created_at,
                fecha_actualizacion: empresaJSON.updated_at,
                estadisticas: {
                    denuncias_totales: parseInt(stats?.total || 0),
                    denuncias_activas: parseInt(stats?.activas || 0),
                    denuncias_resueltas:
                        parseInt(stats?.total || 0) -
                        parseInt(stats?.activas || 0),
                    ultima_denuncia: null, // Se puede obtener de otra query si es necesario
                },
                contactos: [], // Placeholder para contactos si existen
            };
        });

        // Obtener todas las empresas para estadísticas globales
        const todasLasEmpresas = await models.Empresa.findAll({
            attributes: ['id', 'estado'],
        });

        // Calcular totales globales
        const empresasActivas = todasLasEmpresas.filter(
            (e: any) => e.get('estado') === 1
        ).length;
        const empresasInactivas = todasLasEmpresas.filter(
            (e: any) => e.get('estado') === 0
        ).length;

        // Obtener totales de denuncias
        const denunciasTotal: any = await models.Denuncia.findOne({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.where(sequelize.col('estado_id'), Op.eq, 1)
                    ),
                    'activas',
                ],
            ],
            raw: true,
        });

        const denunciasActivas = denunciasTotal?.activas || 0;
        const denunciasTotales = denunciasTotal?.total || 0;

        // Obtener regiones únicas de las direcciones
        const regionesRaw = await sequelize.query(
            `
            SELECT DISTINCT 
                TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(direccion, ',', -1), ',', 1)) as region
            FROM empresa 
            WHERE direccion IS NOT NULL AND direccion != ''
        `,
            { type: 'SELECT' }
        );

        const regiones = regionesRaw
            .map((r: any) => r.region)
            .filter((r: any) => r && r.trim() !== '');

        return res.json({
            total: count,
            empresas: empresasFormateadas,
            metadata: {
                pagina_actual: page,
                total_paginas: Math.ceil(count / limit),
                registros_por_pagina: limit,
                total_registros: count,
                ordenado_por: 'fecha_creacion',
                orden: 'desc',
            },
            filtros_disponibles: {
                regiones: Array.from(new Set(regiones)),
                estados: [
                    { valor: true, etiqueta: 'Activa' },
                    { valor: false, etiqueta: 'Inactiva' },
                ],
            },
            estadisticas_globales: {
                empresas_totales: todasLasEmpresas.length,
                empresas_activas: empresasActivas,
                empresas_inactivas: empresasInactivas,
                denuncias_totales: denunciasTotales,
                denuncias_activas: denunciasActivas,
                denuncias_resueltas: denunciasTotales - denunciasActivas,
                promedio_denuncias_por_empresa:
                    todasLasEmpresas.length > 0
                        ? (denunciasTotales / todasLasEmpresas.length).toFixed(
                              1
                          )
                        : 0,
            },
        });
    } catch (e: any) {
        console.error('Error en obtenerListaCompletaEmpresas:', e);
        return res.status(500).json({
            error: 'Error al obtener lista de empresas',
            detalles: e.message,
        });
    }
};
