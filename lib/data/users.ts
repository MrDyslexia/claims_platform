import type { Usuario, Rol, Permiso } from "@/lib/types/database";

export const mockRoles: Rol[] = [
  {
    id_rol: 1,
    nombre: "Administrador",
    descripcion: "Acceso completo al sistema",
    activo: true,
  },
  {
    id_rol: 2,
    nombre: "Analista",
    descripcion: "Gestión de reclamos y análisis",
    activo: true,
  },
  {
    id_rol: 3,
    nombre: "Supervisor",
    descripcion: "Supervisión de equipos y reclamos",
    activo: true,
  },
  {
    id_rol: 4,
    nombre: "Auditor",
    descripcion: "Revisión y auditoría de procesos",
    activo: true,
  },
];

export const mockPermisos: Permiso[] = [
  // Permisos de Reclamos
  {
    id_permiso: 1,
    nombre: "reclamos:ver",
    modulo: "reclamos",
    descripcion: "Ver reclamos",
  },
  {
    id_permiso: 2,
    nombre: "reclamos:crear",
    modulo: "reclamos",
    descripcion: "Crear reclamos",
  },
  {
    id_permiso: 3,
    nombre: "reclamos:editar",
    modulo: "reclamos",
    descripcion: "Editar reclamos",
  },
  {
    id_permiso: 4,
    nombre: "reclamos:eliminar",
    modulo: "reclamos",
    descripcion: "Eliminar reclamos",
  },
  {
    id_permiso: 5,
    nombre: "reclamos:asignar",
    modulo: "reclamos",
    descripcion: "Asignar reclamos",
  },
  {
    id_permiso: 6,
    nombre: "reclamos:cambiar_estado",
    modulo: "reclamos",
    descripcion: "Cambiar estado de reclamos",
  },

  // Permisos de Usuarios
  {
    id_permiso: 7,
    nombre: "usuarios:ver",
    modulo: "usuarios",
    descripcion: "Ver usuarios",
  },
  {
    id_permiso: 8,
    nombre: "usuarios:crear",
    modulo: "usuarios",
    descripcion: "Crear usuarios",
  },
  {
    id_permiso: 9,
    nombre: "usuarios:editar",
    modulo: "usuarios",
    descripcion: "Editar usuarios",
  },
  {
    id_permiso: 10,
    nombre: "usuarios:eliminar",
    modulo: "usuarios",
    descripcion: "Eliminar usuarios",
  },

  // Permisos de Empresas
  {
    id_permiso: 11,
    nombre: "empresas:ver",
    modulo: "empresas",
    descripcion: "Ver empresas",
  },
  {
    id_permiso: 12,
    nombre: "empresas:crear",
    modulo: "empresas",
    descripcion: "Crear empresas",
  },
  {
    id_permiso: 13,
    nombre: "empresas:editar",
    modulo: "empresas",
    descripcion: "Editar empresas",
  },
  {
    id_permiso: 14,
    nombre: "empresas:eliminar",
    modulo: "empresas",
    descripcion: "Eliminar empresas",
  },

  // Permisos de Configuración
  {
    id_permiso: 15,
    nombre: "configuracion:ver",
    modulo: "configuracion",
    descripcion: "Ver configuración",
  },
  {
    id_permiso: 16,
    nombre: "configuracion:editar",
    modulo: "configuracion",
    descripcion: "Editar configuración",
  },

  // Permisos de Auditoría
  {
    id_permiso: 17,
    nombre: "auditoria:ver",
    modulo: "auditoria",
    descripcion: "Ver auditoría",
  },
  {
    id_permiso: 18,
    nombre: "auditoria:exportar",
    modulo: "auditoria",
    descripcion: "Exportar auditoría",
  },

  // Permisos de Reportes
  {
    id_permiso: 19,
    nombre: "reportes:ver",
    modulo: "reportes",
    descripcion: "Ver reportes",
  },
  {
    id_permiso: 20,
    nombre: "reportes:exportar",
    modulo: "reportes",
    descripcion: "Exportar reportes",
  },
];

export const mockUsers: Usuario[] = [
  {
    id_usuario: 1,
    nombre: "Juan",
    apellido: "Pérez",
    email: "admin@example.com",
    password_hash: "hashed_password",
    activo: true,
    ultimo_acceso: new Date("2024-10-07"),
    fecha_creacion: new Date("2024-01-01"),
    empresa_id: 1,
  },
  {
    id_usuario: 2,
    nombre: "María",
    apellido: "González",
    email: "maria.gonzalez@example.com",
    password_hash: "hashed_password",
    activo: true,
    ultimo_acceso: new Date("2024-10-06"),
    fecha_creacion: new Date("2024-01-15"),
    empresa_id: 2,
  },
  {
    id_usuario: 3,
    nombre: "Carlos",
    apellido: "Rodríguez",
    email: "carlos.rodriguez@example.com",
    password_hash: "hashed_password",
    activo: true,
    ultimo_acceso: new Date("2024-10-05"),
    fecha_creacion: new Date("2024-02-01"),
    empresa_id: 1,
  },
  {
    id_usuario: 4,
    nombre: "Ana",
    apellido: "Martínez",
    email: "ana.martinez@example.com",
    password_hash: "hashed_password",
    activo: true,
    ultimo_acceso: new Date("2024-10-07"),
    fecha_creacion: new Date("2024-02-15"),
    empresa_id: 3,
  },
  {
    id_usuario: 5,
    nombre: "Luis",
    apellido: "Fernández",
    email: "luis.fernandez@example.com",
    password_hash: "hashed_password",
    activo: false,
    ultimo_acceso: new Date("2024-09-20"),
    fecha_creacion: new Date("2024-03-01"),
    empresa_id: 2,
  },
];

export const mockUserRoles = [
  { usuario_id: 1, rol_id: 1 }, // Juan - Admin
  { usuario_id: 2, rol_id: 2 }, // María - Analista
  { usuario_id: 2, rol_id: 3 }, // María - Supervisor
  { usuario_id: 3, rol_id: 3 }, // Carlos - Supervisor
  { usuario_id: 4, rol_id: 4 }, // Ana - Auditor
  { usuario_id: 5, rol_id: 2 }, // Luis - Analista
];

export const mockRolePermisos = [
  ...Array.from({ length: 20 }, (_, i) => ({ rol_id: 1, permiso_id: i + 1 })),
  { rol_id: 2, permiso_id: 1 },
  { rol_id: 2, permiso_id: 2 },
  { rol_id: 2, permiso_id: 3 },
  { rol_id: 2, permiso_id: 6 },
  { rol_id: 2, permiso_id: 19 },
  { rol_id: 3, permiso_id: 1 },
  { rol_id: 3, permiso_id: 3 },
  { rol_id: 3, permiso_id: 5 },
  { rol_id: 3, permiso_id: 6 },
  { rol_id: 3, permiso_id: 7 },
  { rol_id: 3, permiso_id: 19 },
  { rol_id: 3, permiso_id: 20 },
  { rol_id: 4, permiso_id: 1 },
  { rol_id: 4, permiso_id: 17 },
  { rol_id: 4, permiso_id: 18 },
  { rol_id: 4, permiso_id: 19 },
  { rol_id: 4, permiso_id: 20 },
];
