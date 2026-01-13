import { Router } from 'express';
import {
    asignarDenuncia,
    crearDenuncia,
    crearDenunciaPublica,
    lookupDenuncia,
    obtenerTodosLosReclamos,
    obtenerReclamosAsignados,
    actualizarPrioridad,
    actualizarEstado,
    guardarNotaSatisfaccion,
    subirInformeResolucion,
    descargarInformeResolucion,
    uploadResolutionReportMiddleware  
} from '../controllers/denuncia.controller';
import {
    crearComentario,
    crearComentarioDenuncia,
    crearComentarioPublico,
} from '../controllers/comentario.controller';
import { uploadMiddlewarePublic, subirAdjuntoPublico } from '../controllers/adjunto.controller';
import { crearResolucion } from '../controllers/resolucion.controller';
import {
    authMiddleware,
    requirePermission,
    requireRoles,
} from '../middlewares/auth';

const router = Router();

// Public lookup by numero + clave
router.post('/lookup', lookupDenuncia);

// Crear denuncia autenticado (se setea created_by)
router.post(
    '/',
    authMiddleware,
    requirePermission('denuncias:crear'),
    crearDenuncia
);

// Crear denuncia pública (created_by = null)
router.post('/public', uploadMiddlewarePublic, crearDenunciaPublica);

// Comentario público del denunciante (solo en estado INFO/5)
router.post('/public/comentario', crearComentarioPublico);

// Adjuntos públicos del denunciante (solo en estado INFO/5)
router.post('/public/adjuntos', uploadMiddlewarePublic, subirAdjuntoPublico);

// Nota de satisfacción del denunciante (solo en estado RESUELTO o CERRADO)
router.post('/public/satisfaccion', guardarNotaSatisfaccion);

// Obtener reclamos asignados al usuario actual
router.get(
    '/assigned',
    authMiddleware,
    obtenerReclamosAsignados
);

// Obtener todos los reclamos - requiere rol Admin, Analista o Supervisor
router.get(
    '/all',
    authMiddleware,
    requireRoles('ADMIN', 'ANALISTA', 'SUPERVISOR', 'AUDITOR'),
    obtenerTodosLosReclamos
);

// Crear comentario en una denuncia específica - requiere autenticación
router.post('/:id/comentarios', authMiddleware, crearComentarioDenuncia);

// Comment (denunciante) - public endpoint
router.post('/comentario', crearComentario);

// Resolucion (requires auth + permission)
router.post(
    '/resolucion',
    authMiddleware,
    requireRoles('ADMIN', 'SUPERVISOR', 'ANALISTA'),
    crearResolucion
);

// Asignar (requires auth + permission)
router.post(
    '/asignar',
    authMiddleware,
    requireRoles('ADMIN', 'SUPERVISOR', 'ANALISTA'),
    asignarDenuncia
);

// Actualizar prioridad (requires auth + permission)
router.post(
    '/:id/prioridad',
    authMiddleware,
    requireRoles('ADMIN', 'SUPERVISOR', 'ANALISTA'),
    actualizarPrioridad
);

// Actualizar estado (requires auth + permission)
router.put(
    '/:id/estado',
    authMiddleware,
    requireRoles('ADMIN', 'SUPERVISOR', 'ANALISTA'),
    actualizarEstado
);

// Subir informe de resolucion (requires auth + permission)
router.post(
    '/:id/informe-resolucion',
    authMiddleware,
    requireRoles('ADMIN', 'SUPERVISOR'),
    uploadResolutionReportMiddleware,
    subirInformeResolucion
);

// Descargar informe de resolucion (requires auth)
router.get(
    '/:id/informe-resolucion',
    authMiddleware,
    descargarInformeResolucion
);

export default router;

