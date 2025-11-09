import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import { Op, fn, col, literal } from 'sequelize';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // 1. STATS PRINCIPALES usando Sequelize count
        const totalDenuncias = await models.Denuncia.count();

        // Obtener todos los estados disponibles
        const estados = await models.EstadoDenuncia.findAll({
            attributes: ['id', 'codigo', 'nombre'],
        });

        // Mapear estados por código para facilitar el acceso
        const estadosMap = new Map();
        estados.forEach((estado: any) => {
            estadosMap.set(estado.codigo, estado.id);
        });

        // Contar denuncias "En Proceso" - buscar estados que no sean PENDIENTE ni finalizados
        const estadoProcesoId = estadosMap.get('PENDIENTE') || 1;
        const enProceso = await models.Denuncia.count({
            where: {
                estado_id: { [Op.ne]: estadoProcesoId },
            },
        });

        // Para "resueltas" usaremos las que tengan un estado específico (ajustar según tu lógica)
        // Por ahora, asumimos que son las que no están pendientes
        const resueltas = await models.Denuncia.count({
            where: {
                estado_id: estadosMap.get('RESUELTO') || 2,
            },
        }); // Ajustar cuando tengas más estados

        // Denuncias críticas - como no hay campo prioridad, usamos 0
        const criticas = 0;

        // 2. DISTRIBUCIÓN POR ESTADO
        // Obtener conteos por cada estado
        const estadosCount = await Promise.all(
            Array.from(estadosMap.values()).map((estadoId: any) =>
                models.Denuncia.count({ where: { estado_id: estadoId } })
            )
        );


        // Crear distribución (ajustar según tus estados reales)
        const distribucion_estados = {
            nuevos: estadosCount[0],
            en_proceso: estadosCount[1],
            resueltos: estadosCount[2],
            cerrados: estadosCount[3],
        };

        // 3. MÉTRICAS RÁPIDAS
        const usuariosActivos = await models.Usuario.count({
            where: { activo: 1 },
            distinct: true,
        });

        const totalEmpresas = await models.Empresa.count({
            where: { estado: 1 },
        });

        // Tiempo promedio de resolución usando created_at y updated_at
        const denunciasConFechas = await models.Denuncia.findAll({
            where: {
                updated_at: { [Op.ne]: null },
                created_at: { [Op.ne]: null },
            },
            attributes: ['created_at', 'updated_at'],
            raw: true,
        });

        // Calcular promedio de días
        let promedioDias = 0;
        if (denunciasConFechas.length > 0) {
            const totalDias = denunciasConFechas.reduce(
                (sum: number, denuncia: any) => {
                    const inicio = new Date(denuncia.created_at).getTime();
                    const fin = new Date(denuncia.updated_at).getTime();
                    const dias = (fin - inicio) / (1000 * 60 * 60 * 24);
                    return sum + dias;
                },
                0
            );
            promedioDias = totalDias / denunciasConFechas.length;
        }

        const metricas_rapidas = {
            usuarios_activos: usuariosActivos,
            total_empresas: totalEmpresas,
            tiempo_promedio_resolucion: promedioDias.toFixed(1),
        };

        // 4. RECLAMOS RECIENTES usando Sequelize include
        const reclamosRecientes = await models.Denuncia.findAll({
            attributes: [
                'id',
                'numero',
                'estado_id',
                'tipo_id',
                'empresa_id',
                'denunciante_nombre',
                'denunciante_email',
                'es_anonima',
                'created_at',
                'asunto',
                'descripcion',
            ],
            include: [
                {
                    model: models.EstadoDenuncia,
                    as: 'estado_denuncia',
                    attributes: ['nombre'],
                    required: false,
                },
                {
                    model: models.TipoDenuncia,
                    as: 'tipo_denuncia',
                    attributes: ['nombre'],
                    required: false,
                },
                {
                    model: models.Empresa,
                    as: 'empresa',
                    attributes: ['nombre'],
                    required: false,
                },
            ],
            order: [['created_at', 'DESC']],
            limit: 5,
        });

        // Transformar los reclamos al formato requerido
        const reclamos_recientes = reclamosRecientes.map((claim: any) => {
            const claimData = claim.get({ plain: true });

            return {
                id_denuncia: claimData.id,
                codigo_acceso: claimData.numero,
                descripcion: claimData.descripcion,
                prioridad: 'media', // Default ya que no existe en BD
                id_estado: claimData.estado_id,
                id_tipo: claimData.tipo_id,
                id_empresa: claimData.empresa_id,
                nombre_denunciante: claimData.denunciante_nombre,
                email_denunciante: claimData.denunciante_email,
                es_anonimo: claimData.es_anonima,
                fecha_creacion: claimData.created_at
                    ? new Date(claimData.created_at).toISOString().split('T')[0]
                    : null,
                tipo_nombre: claimData.tipo_denuncia?.nombre || 'Sin tipo',
                estado_nombre:
                    claimData.estado_denuncia?.nombre || 'Sin estado',
                empresa_nombre: claimData.empresa?.nombre || 'Sin empresa',
            };
        });

        // 5. RESPUESTA FINAL
        res.json({
            success: true,
            data: {
                stats: {
                    total_denuncias: totalDenuncias,
                    en_proceso: enProceso,
                    resueltas: resueltas,
                    criticas: criticas,
                },
                distribucion_estados,
                metricas_rapidas,
                reclamos_recientes,
            },
        });
    } catch (error) {
        console.error('❌ Error en getDashboardStats:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
            stack:
                process.env.NODE_ENV === 'development'
                    ? (error as Error).stack
                    : undefined,
        });
    }
};
