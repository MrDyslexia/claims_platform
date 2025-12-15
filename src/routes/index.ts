import { Router } from 'express';
import authRoutes from './auth.routes';
import denunciaRoutes from './denuncia.routes';
import exportRoutes from './export.routes';
import empresaRoutes from './empresa.routes';
import arquetipoRoutes from './arquetipo.routes';
import rolRoutes from './rol.routes';
import permisoRoutes from './permiso.routes';
import usuarioRoutes from './usuario.routes';
import tipoDenunciaRoutes from './tipo-denuncia.routes';
import categoriaDenunciaRoutes from './categoria-denuncia.routes';
import estadoDenunciaRoutes from './estado-denuncia.routes';
import canalRoutes from './canal.routes';
import adjuntoRoutes from './adjunto.routes';
import comentarioRoutes from './comentario.routes';
import resolucionRoutes from './resolucion.routes';
import asignacionesRoutes from './denuncia-asignacion.routes';
import historialEstadoRoutes from './denuncia-historial-estado.routes';
import reasignacionRoutes from './reasignacion.routes';
import auditoriaRoutes from './auditoria.routes';
import emailQueueRoutes from './email-queue.routes';
import publicRoutes from './public.routes';
import emailTestRoutes from './email-test.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

// Auth routes (login, logout, etc.)
router.use('/auth', authRoutes);
router.use('/public', publicRoutes);

// Dashboard routes
router.use('/dashboard', dashboardRoutes);

// Core Admin API routes
router.use('/empresas', empresaRoutes);
router.use('/arquetipos', arquetipoRoutes);
router.use('/roles', rolRoutes);
router.use('/permisos', permisoRoutes);
router.use('/usuarios', usuarioRoutes);

// Denuncia configuration routes
router.use('/tipos-denuncia', tipoDenunciaRoutes);
router.use('/categorias-denuncia', categoriaDenunciaRoutes);
router.use('/estados-denuncia', estadoDenunciaRoutes);
router.use('/canales', canalRoutes);

// Denuncia related routes
router.use('/denuncias', denunciaRoutes);
router.use('/comentarios', comentarioRoutes);
router.use('/resoluciones', resolucionRoutes);
router.use('/asignaciones', asignacionesRoutes);
router.use('/historial-estado', historialEstadoRoutes);
router.use('/reasignaciones', reasignacionRoutes);
router.use('/adjuntos', adjuntoRoutes);

// Admin & Auditing routes
router.use('/auditoria', auditoriaRoutes);
router.use('/email-queue', emailQueueRoutes);
router.use('/export', exportRoutes);

// Testing routes (remove in production)
router.use('/email-test', emailTestRoutes);

export default router;
