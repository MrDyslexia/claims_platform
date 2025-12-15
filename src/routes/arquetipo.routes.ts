import { Router } from 'express';
import {
    listarArquetipos,
    obtenerArquetipo,
    asignarPermisosArquetipo,
} from '../controllers/arquetipo.controller';
import { requirePermission } from '../middlewares/auth';

const router = Router();

/**
 * @route GET /api/arquetipos
 * @desc Listar todos los arquetipos con sus permisos base
 * @access Privado
 */
router.get('/', listarArquetipos);

/**
 * @route GET /api/arquetipos/:id
 * @desc Obtener arquetipo por ID
 * @access Privado
 */
router.get('/:id', obtenerArquetipo);

/**
 * @route POST /api/arquetipos/:id/permisos
 * @desc Asignar permisos a un arquetipo
 * @access Privado - Requiere permiso MANAGE_ARQUETIPOS
 */
router.post(
    '/:id/permisos',
    requirePermission('arquetipos:gestionar'),
    asignarPermisosArquetipo
);

export default router;
