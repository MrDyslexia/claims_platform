import { Router } from 'express';
import {
    crearAuditoria,
    obtenerAuditoria,
    listarAuditoria,
    obtenerAuditoriaUsuario,
    obtenerAuditoriaEntidad,
    eliminarAuditoria,
    obtenerLogsAuditoria,
} from '../controllers/auditoria.controller';
import { authMiddleware, requirePermission } from '../middlewares/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route POST /api/auditoria
 * @desc Crear registro de auditoría
 * @access Privado
 */
router.post('/', crearAuditoria);

/**
 * @route GET /api/auditoria/logs-completos
 * @desc Obtener logs completos de auditoría desde api_request_log
 * @query page - Número de página (default: 1)
 * @query limit - Registros por página (default: 10)
 * @query modulo - Filtrar por módulo (auth, users, claims, etc.)
 * @query usuario_id - Filtrar por ID de usuario
 * @query fecha_inicio - Fecha inicio (ISO 8601)
 * @query fecha_fin - Fecha fin (ISO 8601)
 * @query accion - Filtrar por tipo de acción
 * @query resultado - Filtrar por resultado (SUCCESS, FAILED, INFO)
 * @access Privado
 */
router.get('/logs-completos', obtenerLogsAuditoria);

/**
 * @route GET /api/auditoria/usuario/:usuario_id
 * @desc Obtener auditoría de un usuario
 * @access Privado
 */
router.get('/usuario/:usuario_id', obtenerAuditoriaUsuario);

/**
 * @route GET /api/auditoria/entidad/:entidad/:entidad_id
 * @desc Obtener auditoría de una entidad
 * @access Privado
 */
router.get('/entidad/:entidad/:entidad_id', obtenerAuditoriaEntidad);

/**
 * @route GET /api/auditoria
 * @desc Listar registros de auditoría
 * @access Privado
 */
router.get('/', listarAuditoria);

/**
 * @route GET /api/auditoria/:id
 * @desc Obtener auditoría por ID
 * @access Privado
 */
router.get('/:id', obtenerAuditoria);

/**
 * @route DELETE /api/auditoria/:id
 * @desc Eliminar registro de auditoría (solo admin)
 * @access Privado - Requiere permiso DELETE_AUDITORIA
 */
router.delete('/:id', requirePermission('auditoria:eliminar'), eliminarAuditoria);

export default router;
