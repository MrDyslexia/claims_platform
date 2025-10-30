import type { Usuario, Rol, Permiso } from "@/lib/types/database"

export const mockRoles: Rol[] = [
  {
    id: 1,
    nombre: "Administrador",
    descripcion: "Acceso completo al sistema",
    activo: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
  {
    id: 2,
    nombre: "Analista",
    descripcion: "Gestión de reclamos y análisis",
    activo: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
  {
    id: 3,
    nombre: "Supervisor",
    descripcion: "Supervisión de equipos y reclamos",
    activo: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
  {
    id: 4,
    nombre: "Auditor",
    descripcion: "Revisión y auditoría de procesos",
    activo: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
]

export const mockPermisos: Permiso[] = [
  // Permisos de Reclamos
  { id: 1, modulo: "reclamos", accion: "ver", descripcion: "Ver reclamos", created_at: new Date() },
  { id: 2, modulo: "reclamos", accion: "crear", descripcion: "Crear reclamos", created_at: new Date() },
  { id: 3, modulo: "reclamos", accion: "editar", descripcion: "Editar reclamos", created_at: new Date() },
  { id: 4, modulo: "reclamos", accion: "eliminar", descripcion: "Eliminar reclamos", created_at: new Date() },
  { id: 5, modulo: "reclamos", accion: "asignar", descripcion: "Asignar reclamos", created_at: new Date() },
  {
    id: 6,
    modulo: "reclamos",
    accion: "cambiar_estado",
    descripcion: "Cambiar estado de reclamos",
    created_at: new Date(),
  },

  // Permisos de Usuarios
  { id: 7, modulo: "usuarios", accion: "ver", descripcion: "Ver usuarios", created_at: new Date() },
  { id: 8, modulo: "usuarios", accion: "crear", descripcion: "Crear usuarios", created_at: new Date() },
  { id: 9, modulo: "usuarios", accion: "editar", descripcion: "Editar usuarios", created_at: new Date() },
  { id: 10, modulo: "usuarios", accion: "eliminar", descripcion: "Eliminar usuarios", created_at: new Date() },

  // Permisos de Empresas
  { id: 11, modulo: "empresas", accion: "ver", descripcion: "Ver empresas", created_at: new Date() },
  { id: 12, modulo: "empresas", accion: "crear", descripcion: "Crear empresas", created_at: new Date() },
  { id: 13, modulo: "empresas", accion: "editar", descripcion: "Editar empresas", created_at: new Date() },
  { id: 14, modulo: "empresas", accion: "eliminar", descripcion: "Eliminar empresas", created_at: new Date() },

  // Permisos de Configuración
  { id: 15, modulo: "configuracion", accion: "ver", descripcion: "Ver configuración", created_at: new Date() },
  { id: 16, modulo: "configuracion", accion: "editar", descripcion: "Editar configuración", created_at: new Date() },

  // Permisos de Auditoría
  { id: 17, modulo: "auditoria", accion: "ver", descripcion: "Ver auditoría", created_at: new Date() },
  { id: 18, modulo: "auditoria", accion: "exportar", descripcion: "Exportar auditoría", created_at: new Date() },

  // Permisos de Reportes
  { id: 19, modulo: "reportes", accion: "ver", descripcion: "Ver reportes", created_at: new Date() },
  { id: 20, modulo: "reportes", accion: "exportar", descripcion: "Exportar reportes", created_at: new Date() },
]

export const mockUsers: Usuario[] = [
  {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    email: "admin@example.com",
    password_hash: "hashed_password",
    activo: true,
    ultimo_acceso: new Date("2024-10-07"),
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-10-07"),
  },
  {
    id: 2,
    nombre: "María",
    apellido: "González",
    email: "maria.gonzalez@example.com",
    password_hash: "hashed_password",
    activo: true,
    ultimo_acceso: new Date("2024-10-06"),
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-10-06"),
  },
  {
    id: 3,
    nombre: "Carlos",
    apellido: "Rodríguez",
    email: "carlos.rodriguez@example.com",
    password_hash: "hashed_password",
    activo: true,
    ultimo_acceso: new Date("2024-10-05"),
    created_at: new Date("2024-02-01"),
    updated_at: new Date("2024-10-05"),
  },
  {
    id: 4,
    nombre: "Ana",
    apellido: "Martínez",
    email: "ana.martinez@example.com",
    password_hash: "hashed_password",
    activo: true,
    ultimo_acceso: new Date("2024-10-07"),
    created_at: new Date("2024-02-15"),
    updated_at: new Date("2024-10-07"),
  },
  {
    id: 5,
    nombre: "Luis",
    apellido: "Fernández",
    email: "luis.fernandez@example.com",
    password_hash: "hashed_password",
    activo: false,
    ultimo_acceso: new Date("2024-09-20"),
    created_at: new Date("2024-03-01"),
    updated_at: new Date("2024-09-25"),
  },
]

export const mockUserRoles = [
  { usuario_id: 1, rol_id: 1 },
  { usuario_id: 2, rol_id: 2 },
  { usuario_id: 2, rol_id: 3 },
  { usuario_id: 3, rol_id: 2 },
  { usuario_id: 4, rol_id: 4 },
  { usuario_id: 5, rol_id: 2 },
]

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
]
