import { Router } from 'express';
import {
    crearCategoriaDenuncia,
    obtenerCategoriaDenuncia,
    listarCategoriasDenuncia,
    actualizarCategoriaDenuncia,
    eliminarCategoriaDenuncia,
} from '../controllers/categoria-denuncia.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Listar categorias (cualquier usuario autenticado puede verlas, o restringir si es necesario)
router.get('/', listarCategoriasDenuncia);

// Obtener categoria por ID
router.get('/:id', obtenerCategoriaDenuncia);

// Crear categoria (solo admin)
router.post('/', requireRoles('ADMIN'), crearCategoriaDenuncia);

// Actualizar categoria (solo admin)
router.put('/:id', requireRoles('ADMIN'), actualizarCategoriaDenuncia);

// Eliminar categoria (solo admin)
router.delete('/:id', requireRoles('ADMIN'), eliminarCategoriaDenuncia);

export default router;
