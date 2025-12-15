import { Router } from 'express';
import {
    crearEmpresa,
    obtenerEmpresa,
    listarEmpresas,
    actualizarEmpresa,
    eliminarEmpresa,
    obtenerListaCompletaEmpresas,
} from '../controllers/empresa.controller';
import { authMiddleware, requirePermission } from '../middlewares/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route POST /api/empresas
 * @desc Crear nueva empresa
 * @access Privado - Requiere permiso CREATE_EMPRESA
 */
router.post('/', requirePermission('empresas:crear'), crearEmpresa);

/**
 * @route GET /api/empresas/admin/lista-completa
 * @desc Obtener lista completa de empresas con estadísticas y filtros
 * @access Privado
 */
router.get('/admin/lista-completa', obtenerListaCompletaEmpresas);

/**
 * @route GET /api/empresas/:id
 * @desc Obtener empresa por ID
 * @access Privado
 */
router.get('/:id', obtenerEmpresa);

/**
 * @route GET /api/empresas
 * @desc Listar todas las empresas
 * @access Privado
 */
router.get('/', listarEmpresas);

/**
 * @route PUT /api/empresas/:id
 * @desc Actualizar empresa
 * @access Privado - Requiere permiso UPDATE_EMPRESA
 */
router.put('/:id', requirePermission('empresas:editar'), actualizarEmpresa);

/**
 * @route DELETE /api/empresas/:id
 * @desc Eliminar empresa
 * @access Privado - Requiere permiso DELETE_EMPRESA
 */
router.delete('/:id', requirePermission('empresas:eliminar'), eliminarEmpresa);

export default router;
