import type { Request, Response } from 'express';
import { models } from '../db/sequelize';
import { Op } from 'sequelize';
import { sequelize } from '../db/sequelize';

/**
 * Crear registro de auditoría
 * POST /api/auditoria
 */
export const crearAuditoria = async (req: Request, res: Response) => {
    try {
        const { entidad, entidad_id, accion, valores_antes, valores_despues } =
            req.body;
        const actor_usuario_id = (req as any).user?.get?.('id');
        const actor_email = (req as any).user?.get?.('email');
        const ip =
            req.headers['x-forwarded-for']?.toString().split(',')[0] ||
            req.socket.remoteAddress ||
            '';
        const user_agent = req.headers['user-agent'] || '';

        if (!entidad || !accion) {
            return res.status(400).json({
                error: 'missing fields: entidad, accion',
            });
        }

        const auditoria = await models.Auditoria.create({
            actor_usuario_id: actor_usuario_id ?? null,
            actor_email: actor_email ?? null,
            entidad,
            entidad_id: entidad_id ?? null,
            accion,
            valores_antes: valores_antes ?? null,
            valores_despues: valores_despues ?? null,
            ip,
            user_agent,
        });

        return res.status(201).json(auditoria.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener registro de auditoría por ID
 * GET /api/auditoria/:id
 */
export const obtenerAuditoria = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const auditoria = await models.Auditoria.findByPk(id, {
            include: [{ association: 'actor' }],
        });

        if (!auditoria) {
            return res.status(404).json({ error: 'auditoria not found' });
        }

        return res.json(auditoria.toJSON());
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Listar registros de auditoría
 * GET /api/auditoria?page=1&limit=10&entidad=denuncia&accion=CREATE
 */
export const listarAuditoria = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const actor_usuario_id = req.query.actor_usuario_id as string;
        const entidad = req.query.entidad as string;
        const accion = req.query.accion as string;
        const entidad_id = req.query.entidad_id as string;

        const where: any = {};
        if (actor_usuario_id) where.actor_usuario_id = actor_usuario_id;
        if (entidad) where.entidad = { [Op.like]: `%${entidad}%` };
        if (accion) where.accion = { [Op.like]: `%${accion}%` };
        if (entidad_id) where.entidad_id = entidad_id;

        const offset = (page - 1) * limit;

        const { count, rows } = await models.Auditoria.findAndCountAll({
            where,
            offset,
            limit,
            order: [['created_at', 'DESC']],
            include: [{ association: 'actor' }],
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
 * Obtener auditoría de un usuario
 * GET /api/auditoria/usuario/:usuario_id?page=1&limit=10
 */
export const obtenerAuditoriaUsuario = async (req: Request, res: Response) => {
    try {
        const { usuario_id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const offset = (page - 1) * limit;

        const { count, rows } = await models.Auditoria.findAndCountAll({
            where: { actor_usuario_id: usuario_id },
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
 * Obtener auditoría de una entidad
 * GET /api/auditoria/entidad/:entidad/:entidad_id
 */
export const obtenerAuditoriaEntidad = async (req: Request, res: Response) => {
    try {
        const { entidad, entidad_id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const offset = (page - 1) * limit;

        const { count, rows } = await models.Auditoria.findAndCountAll({
            where: { entidad, entidad_id },
            offset,
            limit,
            order: [['created_at', 'DESC']],
            include: [{ association: 'actor' }],
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
 * Eliminar registro de auditoría (solo admin)
 * DELETE /api/auditoria/:id
 */
export const eliminarAuditoria = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const auditoria = await models.Auditoria.findByPk(id);
        if (!auditoria) {
            return res.status(404).json({ error: 'auditoria not found' });
        }

        await auditoria.destroy();

        return res.json({ ok: true, message: 'auditoria deleted' });
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Mapeo de métodos HTTP y rutas a acciones descriptivas
 */
function determinarAccion(
    metodo: string,
    ruta: string,
    modulo: string
): string {
    const rutaLower = ruta.toLowerCase();

    // Login/Logout
    if (rutaLower.includes('/login')) return 'LOGIN';
    if (rutaLower.includes('/logout')) return 'LOGOUT';
    if (rutaLower.includes('/password') && metodo === 'PUT')
        return 'PASSWORD_CHANGE';

    // Por método HTTP
    switch (metodo) {
        case 'POST':
            if (modulo === 'users') return 'CREATE_USER';
            if (modulo === 'claims') return 'CREATE_CLAIM';
            if (modulo === 'companies') return 'CREATE_COMPANY';
            if (modulo === 'roles') return 'CREATE_ROLE';
            return 'CREATE';

        case 'PUT':
        case 'PATCH':
            if (modulo === 'users') return 'UPDATE_USER';
            if (modulo === 'claims') return 'UPDATE_CLAIM';
            if (modulo === 'companies') return 'UPDATE_COMPANY';
            if (modulo === 'roles') return 'UPDATE_ROLE';
            if (rutaLower.includes('/bulk')) return 'BULK_UPDATE';
            return 'UPDATE';

        case 'DELETE':
            if (modulo === 'users') return 'DELETE_USER';
            if (modulo === 'claims') return 'DELETE_CLAIM';
            if (modulo === 'companies') return 'DELETE_COMPANY';
            if (modulo === 'roles') return 'DELETE_ROLE';
            return 'DELETE';

        case 'GET':
            if (
                rutaLower.includes('/export') ||
                rutaLower.includes('/download')
            ) {
                return 'EXPORT_DATA';
            }
            return 'VIEW';

        default:
            return metodo;
    }
}

/**
 * Determina el resultado basado en el status HTTP
 */
function determinarResultado(status: number): 'SUCCESS' | 'FAILED' | 'INFO' {
    if (status >= 200 && status < 300) return 'SUCCESS';
    if (status >= 400) return 'FAILED';
    return 'INFO';
}

/**
 * Genera descripción legible de la acción
 */
function generarDescripcion(
    accion: string,
    modulo: string,
    ruta: string
): string {
    const descripciones: Record<string, string> = {
        LOGIN: 'Inicio de sesión exitoso',
        LOGOUT: 'Cierre de sesión',
        CREATE_USER: 'Creación de nuevo usuario',
        UPDATE_USER: 'Actualización de datos de usuario',
        DELETE_USER: 'Eliminación de usuario',
        CREATE_CLAIM: 'Creación de nuevo reclamo',
        UPDATE_CLAIM: 'Actualización de reclamo',
        DELETE_CLAIM: 'Eliminación de reclamo',
        CREATE_COMPANY: 'Creación de nueva empresa',
        UPDATE_COMPANY: 'Actualización de empresa',
        DELETE_COMPANY: 'Eliminación de empresa',
        CREATE_ROLE: 'Creación de nuevo rol',
        UPDATE_ROLE: 'Actualización de rol',
        DELETE_ROLE: 'Eliminación de rol',
        EXPORT_DATA: 'Exportación de datos',
        BULK_UPDATE: 'Actualización masiva de registros',
        PASSWORD_CHANGE: 'Cambio de contraseña',
    };

    return descripciones[accion] || `Acción ${accion} en módulo ${modulo}`;
}

/**
 * Obtener logs de auditoría desde api_request_log
 * GET /api/auditoria/logs-completos
 */
export const obtenerLogsAuditoria = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const modulo = req.query.modulo as string;
        const usuario_id = req.query.usuario_id as string;
        const fecha_inicio = req.query.fecha_inicio as string;
        const fecha_fin = req.query.fecha_fin as string;
        const accion = req.query.accion as string;
        const resultado = req.query.resultado as string;

        const where: any = {};

        // Filtros
        if (modulo) where.modulo = modulo;
        if (usuario_id) where.usuario_id = usuario_id;
        if (fecha_inicio && fecha_fin) {
            where.created_at = {
                [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)],
            };
        } else if (fecha_inicio) {
            where.created_at = { [Op.gte]: new Date(fecha_inicio) };
        } else if (fecha_fin) {
            where.created_at = { [Op.lte]: new Date(fecha_fin) };
        }

        const offset = (page - 1) * limit;

        // Consultar logs con JOIN a usuario
        const { count, rows } = await models.APIRequestLog.findAndCountAll({
            where,
            offset,
            limit,
            order: [['created_at', 'DESC']],
            include: [
                {
                    association: 'usuario',
                    attributes: ['id', 'nombre_completo', 'email'],
                    required: false, // LEFT JOIN para incluir logs sin usuario
                },
            ],
        });

        // Transformar datos al formato requerido
        const logs_auditoria = rows
            .map((log: any) => {
                const logData = log.toJSON();
                const accionDeterminada = determinarAccion(
                    logData.metodo,
                    logData.ruta,
                    logData.modulo || ''
                );
                const resultadoDeterminado = determinarResultado(
                    logData.status
                );

                // Filtrar por acción si se especificó
                if (accion && accionDeterminada !== accion) {
                    return null;
                }

                // Filtrar por resultado si se especificó
                if (resultado && resultadoDeterminado !== resultado) {
                    return null;
                }

                return {
                    id: logData.id,
                    usuario_id: logData.usuario_id,
                    usuario_nombre:
                        logData.usuario?.nombre_completo ||
                        'Usuario desconocido',
                    metodo: logData.metodo,
                    ruta: logData.ruta,
                    modulo: logData.modulo || 'other',
                    accion: accionDeterminada,
                    resultado: resultadoDeterminado,
                    descripcion: generarDescripcion(
                        accionDeterminada,
                        logData.modulo || '',
                        logData.ruta
                    ),
                    ip_origen: logData.ip,
                    user_agent: logData.user_agent,
                    status: logData.status,
                    duracion_ms: logData.duracion_ms,
                    fecha_creacion: logData.created_at,
                };
            })
            .filter((log) => log !== null);

        // Obtener estadísticas
        const estadisticas = await obtenerEstadisticasAuditoria();

        // Metadatos de paginación
        const total = count;
        const total_paginas = Math.ceil(total / limit);

        return res.json({
            total,
            logs_auditoria,
            metadata: {
                pagina_actual: page,
                total_paginas,
                registros_por_pagina: limit,
                total_registros: total,
                ordenado_por: 'fecha_creacion',
                orden: 'desc',
            },
            filtros_disponibles: {
                modulos: [
                    {
                        codigo: 'auth',
                        nombre: 'Autenticación',
                        icono: 'Shield',
                    },
                    { codigo: 'users', nombre: 'Usuarios', icono: 'User' },
                    { codigo: 'claims', nombre: 'Reclamos', icono: 'FileText' },
                    {
                        codigo: 'companies',
                        nombre: 'Empresas',
                        icono: 'Settings',
                    },
                    { codigo: 'roles', nombre: 'Roles', icono: 'Shield' },
                    {
                        codigo: 'permissions',
                        nombre: 'Permisos',
                        icono: 'Lock',
                    },
                    {
                        codigo: 'reports',
                        nombre: 'Reportes',
                        icono: 'FileText',
                    },
                    { codigo: 'audit', nombre: 'Auditoría', icono: 'Eye' },
                    {
                        codigo: 'comments',
                        nombre: 'Comentarios',
                        icono: 'MessageSquare',
                    },
                    {
                        codigo: 'attachments',
                        nombre: 'Adjuntos',
                        icono: 'Paperclip',
                    },
                    {
                        codigo: 'notifications',
                        nombre: 'Notificaciones',
                        icono: 'Bell',
                    },
                    {
                        codigo: 'dashboard',
                        nombre: 'Dashboard',
                        icono: 'LayoutDashboard',
                    },
                    {
                        codigo: 'settings',
                        nombre: 'Configuración',
                        icono: 'Settings',
                    },
                    {
                        codigo: 'other',
                        nombre: 'Otros',
                        icono: 'MoreHorizontal',
                    },
                ],
                acciones: [
                    {
                        codigo: 'LOGIN',
                        nombre: 'Inicio de Sesión',
                        tipo: 'success',
                    },
                    {
                        codigo: 'LOGOUT',
                        nombre: 'Cierre de Sesión',
                        tipo: 'default',
                    },
                    {
                        codigo: 'CREATE_USER',
                        nombre: 'Crear Usuario',
                        tipo: 'primary',
                    },
                    {
                        codigo: 'UPDATE_USER',
                        nombre: 'Actualizar Usuario',
                        tipo: 'warning',
                    },
                    {
                        codigo: 'DELETE_USER',
                        nombre: 'Eliminar Usuario',
                        tipo: 'danger',
                    },
                    {
                        codigo: 'CREATE_CLAIM',
                        nombre: 'Crear Reclamo',
                        tipo: 'primary',
                    },
                    {
                        codigo: 'UPDATE_CLAIM',
                        nombre: 'Actualizar Reclamo',
                        tipo: 'warning',
                    },
                    {
                        codigo: 'DELETE_CLAIM',
                        nombre: 'Eliminar Reclamo',
                        tipo: 'danger',
                    },
                    {
                        codigo: 'CREATE_COMPANY',
                        nombre: 'Crear Empresa',
                        tipo: 'primary',
                    },
                    {
                        codigo: 'UPDATE_COMPANY',
                        nombre: 'Actualizar Empresa',
                        tipo: 'warning',
                    },
                    {
                        codigo: 'DELETE_COMPANY',
                        nombre: 'Eliminar Empresa',
                        tipo: 'danger',
                    },
                    {
                        codigo: 'EXPORT_DATA',
                        nombre: 'Exportar Datos',
                        tipo: 'secondary',
                    },
                    {
                        codigo: 'BULK_UPDATE',
                        nombre: 'Actualización Masiva',
                        tipo: 'warning',
                    },
                    {
                        codigo: 'PASSWORD_CHANGE',
                        nombre: 'Cambio de Contraseña',
                        tipo: 'info',
                    },
                ],
                resultados: [
                    { codigo: 'SUCCESS', nombre: 'Exitoso', tipo: 'success' },
                    { codigo: 'FAILED', nombre: 'Fallido', tipo: 'danger' },
                    { codigo: 'INFO', nombre: 'Información', tipo: 'default' },
                ],
            },
            estadisticas,
        });
    } catch (e: any) {
        console.error('Error en obtenerLogsAuditoria:', e);
        return res.status(400).json({ error: e.message });
    }
};

/**
 * Obtener estadísticas de auditoría
 */
async function obtenerEstadisticasAuditoria() {
    try {
        const ahora = new Date();
        const hoy = new Date(
            ahora.getFullYear(),
            ahora.getMonth(),
            ahora.getDate()
        );
        const hace7dias = new Date(hoy);
        hace7dias.setDate(hace7dias.getDate() - 7);
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

        // Total de logs
        const total_logs = await models.APIRequestLog.count();

        // Logs de hoy
        const logs_hoy = await models.APIRequestLog.count({
            where: { created_at: { [Op.gte]: hoy } },
        });

        // Logs de esta semana
        const logs_esta_semana = await models.APIRequestLog.count({
            where: { created_at: { [Op.gte]: hace7dias } },
        });

        // Logs de este mes
        const logs_este_mes = await models.APIRequestLog.count({
            where: { created_at: { [Op.gte]: inicioMes } },
        });

        // Módulos más activos
        const modulosActivos: any = await sequelize.query(
            `SELECT 
                modulo,
                COUNT(*) as cantidad
            FROM api_request_log
            WHERE modulo IS NOT NULL
            AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY modulo
            ORDER BY cantidad DESC
            LIMIT 5`,
            { type: 'SELECT' }
        );

        // Usuarios más activos
        const usuariosActivos: any = await sequelize.query(
            `SELECT 
                u.nombre_completo as usuario,
                COUNT(*) as cantidad
            FROM api_request_log arl
            JOIN usuario u ON u.id_usuario = arl.usuario_id
            WHERE arl.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND arl.usuario_id IS NOT NULL
            GROUP BY u.nombre_completo
            ORDER BY cantidad DESC
            LIMIT 5`,
            { type: 'SELECT' }
        );

        // Tasa de éxito
        const totalRequests = await models.APIRequestLog.count({
            where: { created_at: { [Op.gte]: hace7dias } },
        });
        const successRequests = await models.APIRequestLog.count({
            where: {
                created_at: { [Op.gte]: hace7dias },
                status: { [Op.between]: [200, 299] },
            },
        });
        const tasa_exito =
            totalRequests > 0
                ? Math.round((successRequests / totalRequests) * 100)
                : 0;

        // Logs fallidos
        const logs_fallidos = await models.APIRequestLog.count({
            where: {
                created_at: { [Op.gte]: hace7dias },
                status: { [Op.gte]: 400 },
            },
        });

        return {
            total_logs,
            logs_hoy,
            logs_esta_semana,
            logs_este_mes,
            modulos_mas_activos: modulosActivos.map((m: any) => ({
                modulo: m.modulo,
                cantidad: parseInt(m.cantidad),
                porcentaje:
                    totalRequests > 0
                        ? Math.round((m.cantidad / totalRequests) * 100)
                        : 0,
            })),
            usuarios_mas_activos: usuariosActivos.map((u: any) => ({
                usuario: u.usuario,
                cantidad: parseInt(u.cantidad),
                porcentaje:
                    totalRequests > 0
                        ? Math.round((u.cantidad / totalRequests) * 100)
                        : 0,
            })),
            tasa_exito,
            logs_fallidos,
        };
    } catch (e) {
        console.error('Error en obtenerEstadisticasAuditoria:', e);
        return {
            total_logs: 0,
            logs_hoy: 0,
            logs_esta_semana: 0,
            logs_este_mes: 0,
            modulos_mas_activos: [],
            usuarios_mas_activos: [],
            tasa_exito: 0,
            logs_fallidos: 0,
        };
    }
}
