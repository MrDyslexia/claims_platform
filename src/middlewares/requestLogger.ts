import onFinished from 'on-finished';
import type { Request, Response, NextFunction } from 'express';
import { models } from '../db/sequelize';

// Cola de logs para inserciones en batch y reducir carga a la DB
let logQueue: Array<{
    metodo: string;
    ruta: string;
    modulo: string | null;
    status: number;
    duracion_ms: number | null;
    ip: string | null;
    user_agent: string | null;
    usuario_id: number | null;
}> = [];
let flushTimeout: NodeJS.Timeout | null = null;

/**
 * Determina el módulo basado en la ruta de la petición
 */
function determinarModulo(ruta: string): string | null {
    // Normalizar la ruta eliminando parámetros de query
    const rutaLimpia = ruta.split('?')[0].toLowerCase();

    // Mapeo de rutas a módulos
    if (
        rutaLimpia.includes('/auth') ||
        rutaLimpia.includes('/login') ||
        rutaLimpia.includes('/logout')
    ) {
        return 'auth';
    }
    if (rutaLimpia.includes('/usuario') || rutaLimpia.includes('/user')) {
        return 'users';
    }
    if (rutaLimpia.includes('/denuncia') || rutaLimpia.includes('/claim')) {
        return 'claims';
    }
    if (rutaLimpia.includes('/empresa') || rutaLimpia.includes('/compan')) {
        return 'companies';
    }
    if (rutaLimpia.includes('/rol') || rutaLimpia.includes('/role')) {
        return 'roles';
    }
    if (rutaLimpia.includes('/permiso') || rutaLimpia.includes('/permission')) {
        return 'permissions';
    }
    if (rutaLimpia.includes('/reporte') || rutaLimpia.includes('/report')) {
        return 'reports';
    }
    if (rutaLimpia.includes('/auditoria') || rutaLimpia.includes('/audit')) {
        return 'audit';
    }
    if (rutaLimpia.includes('/comentario') || rutaLimpia.includes('/comment')) {
        return 'comments';
    }
    if (rutaLimpia.includes('/adjunto') || rutaLimpia.includes('/attachment')) {
        return 'attachments';
    }
    if (
        rutaLimpia.includes('/notificacion') ||
        rutaLimpia.includes('/notification')
    ) {
        return 'notifications';
    }
    if (rutaLimpia.includes('/dashboard')) {
        return 'dashboard';
    }
    if (rutaLimpia.includes('/config') || rutaLimpia.includes('/setting')) {
        return 'settings';
    }

    // Si no coincide con ningún módulo conocido
    return 'other';
}

async function flushLogs() {
    if (logQueue.length === 0) return;
    const batch = logQueue.splice(0, logQueue.length);
    try {
        // Inserción en batch para mejor rendimiento
        await models.APIRequestLog.bulkCreate(batch, {
            ignoreDuplicates: false,
        });
    } catch (e) {
        // No interrumpir la request por errores de logging
        console.error('Log flush error:', e);
    }
    flushTimeout = null;
}

function scheduleFlusher() {
    if (flushTimeout) clearTimeout(flushTimeout);
    flushTimeout = setTimeout(flushLogs, 5000); // Flush cada 5s
}

export function requestLogger() {
    return (
        req: Request & { user?: any },
        res: Response,
        next: NextFunction
    ) => {
        // Medir duración de la request
        const startMs = Date.now();

        onFinished(res, () => {
            try {
                const ruta = req.originalUrl.split('?')[0];
                const modulo = determinarModulo(ruta);
                const metodo = (req.method || 'GET').toUpperCase();
                const ip =
                    req.headers['x-forwarded-for']
                        ?.toString()
                        .split(',')[0]
                        ?.trim() ||
                    req.socket.remoteAddress ||
                    null;
                const status = res.statusCode;
                const duracion_ms = Math.max(0, Date.now() - startMs);
                const user_agent = (req.headers['user-agent'] || null) as
                    | string
                    | null;

                // Capturar usuario_id de diferentes posibles ubicaciones
                let usuario_id: number | null = null;
                if (req.user) {
                    // Intenta obtener el id de diferentes formas
                    if (typeof req.user.get === 'function') {
                        usuario_id =
                            req.user.get('id') ||
                            req.user.get('id_usuario') ||
                            null;
                    } else if (req.user.id) {
                        usuario_id = req.user.id;
                    } else if (req.user.id_usuario) {
                        usuario_id = req.user.id_usuario;
                    }
                }

                logQueue.push({
                    metodo,
                    ruta,
                    modulo,
                    status,
                    duracion_ms,
                    ip,
                    user_agent: user_agent ? user_agent.slice(0, 300) : null,
                    usuario_id,
                });

                if (logQueue.length >= 100) {
                    // Flush inmediato si el batch se llena
                    flushLogs();
                } else {
                    scheduleFlusher();
                }
            } catch (e) {
                // Ignorar errores de logging
            }
        });
        next();
    };
}
