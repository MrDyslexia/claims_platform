import { Request, Response } from 'express';
import { models } from '../db/sequelize';

/**
 * Listar todos los canales de denuncia activos
 * Endpoint público - necesario para el formulario de creación de denuncias
 */
export const listarCanales = async (req: Request, res: Response) => {
    try {
        const canales = await models.CanalDenuncia.findAll({
            where: { activo: true },
            attributes: [
                'id',
                'codigo',
                'nombre',
                'descripcion',
                'permite_anonimo',
                'requiere_identificacion',
            ],
            order: [['nombre', 'ASC']],
        });

        return res.json({
            ok: true,
            canales,
        });
    } catch (error: any) {
        console.error('Error al listar canales:', error);
        return res.status(500).json({
            ok: false,
            error: 'Error al obtener los canales de denuncia',
        });
    }
};

/**
 * Obtener un canal específico por ID o código
 */
export const obtenerCanal = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Buscar por ID numérico o por código
        const whereClause = isNaN(Number(id))
            ? { codigo: id.toUpperCase() }
            : { id: Number(id) };

        const canal = await models.CanalDenuncia.findOne({
            where: whereClause,
            attributes: [
                'id',
                'codigo',
                'nombre',
                'descripcion',
                'permite_anonimo',
                'requiere_identificacion',
                'activo',
            ],
        });

        if (!canal) {
            return res.status(404).json({
                ok: false,
                error: 'Canal no encontrado',
            });
        }

        return res.json({
            ok: true,
            canal,
        });
    } catch (error: any) {
        console.error('Error al obtener canal:', error);
        return res.status(500).json({
            ok: false,
            error: 'Error al obtener el canal',
        });
    }
};

/**
 * Crear un nuevo canal de denuncia
 * Requiere permiso GESTIONAR_CANALES
 */
export const crearCanal = async (req: Request, res: Response) => {
    try {
        const {
            codigo,
            nombre,
            descripcion,
            permite_anonimo,
            requiere_identificacion,
        } = req.body;

        // Validaciones
        if (!codigo || !nombre) {
            return res.status(400).json({
                ok: false,
                error: 'Código y nombre son obligatorios',
            });
        }

        // Verificar que no exista un canal con el mismo código
        const canalExistente = await models.CanalDenuncia.findOne({
            where: { codigo: codigo.toUpperCase() },
        });

        if (canalExistente) {
            return res.status(409).json({
                ok: false,
                error: 'Ya existe un canal con ese código',
            });
        }

        const canal = await models.CanalDenuncia.create({
            codigo: codigo.toUpperCase(),
            nombre,
            descripcion: descripcion || null,
            permite_anonimo:
                permite_anonimo !== undefined ? permite_anonimo : true,
            requiere_identificacion:
                requiere_identificacion !== undefined
                    ? requiere_identificacion
                    : false,
            activo: true,
        });

        return res.status(201).json({
            ok: true,
            canal,
            message: 'Canal creado exitosamente',
        });
    } catch (error: any) {
        console.error('Error al crear canal:', error);
        return res.status(500).json({
            ok: false,
            error: 'Error al crear el canal',
        });
    }
};

/**
 * Actualizar un canal existente
 * Requiere permiso GESTIONAR_CANALES
 */
export const actualizarCanal = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            descripcion,
            permite_anonimo,
            requiere_identificacion,
            activo,
        } = req.body;

        const canal = await models.CanalDenuncia.findByPk(id);

        if (!canal) {
            return res.status(404).json({
                ok: false,
                error: 'Canal no encontrado',
            });
        }

        // Actualizar solo los campos proporcionados
        if (nombre !== undefined) canal.set('nombre', nombre);
        if (descripcion !== undefined) canal.set('descripcion', descripcion);
        if (permite_anonimo !== undefined)
            canal.set('permite_anonimo', permite_anonimo);
        if (requiere_identificacion !== undefined)
            canal.set('requiere_identificacion', requiere_identificacion);
        if (activo !== undefined) canal.set('activo', activo);

        await canal.save();

        return res.json({
            ok: true,
            canal,
            message: 'Canal actualizado exitosamente',
        });
    } catch (error: any) {
        console.error('Error al actualizar canal:', error);
        return res.status(500).json({
            ok: false,
            error: 'Error al actualizar el canal',
        });
    }
};

/**
 * Desactivar un canal (soft delete)
 * Requiere permiso GESTIONAR_CANALES
 */
export const desactivarCanal = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const canal = await models.CanalDenuncia.findByPk(id);

        if (!canal) {
            return res.status(404).json({
                ok: false,
                error: 'Canal no encontrado',
            });
        }

        // Verificar si hay denuncias asociadas
        const cantidadDenuncias = await models.Denuncia.count({
            where: { canal_id: id },
        });

        canal.set('activo', false);
        await canal.save();

        return res.json({
            ok: true,
            message: 'Canal desactivado exitosamente',
            denuncias_asociadas: cantidadDenuncias,
        });
    } catch (error: any) {
        console.error('Error al desactivar canal:', error);
        return res.status(500).json({
            ok: false,
            error: 'Error al desactivar el canal',
        });
    }
};
