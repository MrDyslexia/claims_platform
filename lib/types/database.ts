// Database types based on SQL schema

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  password_hash: string;
  telefono?: string;
  activo: boolean;
  fecha_creacion: Date;
  ultimo_acceso?: Date;
}

export interface Rol {
  id_rol: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Permiso {
  id_permiso: number;
  nombre: string;
  descripcion?: string;
  modulo: string;
}

export interface UsuarioRol {
  id_usuario_rol: number;
  id_usuario: number;
  id_rol: number;
  fecha_asignacion: Date;
}

export interface UsuarioSesion {
  id_sesion: number;
  id_usuario: number;
  token_jwt: string;
  ip_address: string;
  user_agent: string;
  fecha_inicio: Date;
  fecha_expiracion: Date;
  activo: boolean;
}

export interface Empresa {
  id_empresa: number;
  nombre: string;
  rut?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}

export interface TipoDenuncia {
  id_tipo: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface EstadoDenuncia {
  id_estado: number;
  nombre: string;
  descripcion?: string;
  color?: string;
  orden: number;
}

export interface Denuncia {
  [x: string]: string | number | Date | boolean | undefined;
  id_denuncia: number;
  codigo_acceso: string;
  id_empresa: number;
  id_tipo: number;
  id_estado: number;
  descripcion: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  anonimo: boolean;
  nombre_denunciante?: string;
  email_denunciante?: string;
  telefono_denunciante?: string;
  pais?: string;
  ciudad?: string;
  prioridad: "baja" | "media" | "alta" | "critica";
}

export interface DenunciaAsignacion {
  id_asignacion: number;
  id_denuncia: number;
  id_usuario: number;
  fecha_asignacion: Date;
  activo: boolean;
}

export interface Comentario {
  id_comentario: number;
  id_denuncia: number;
  id_usuario: number;
  comentario: string;
  fecha_creacion: Date;
  interno: boolean;
}

export interface Adjunto {
  id_adjunto: number;
  id_denuncia: number;
  nombre_archivo: string;
  ruta_archivo: string;
  tipo_archivo: string;
  tamano: number;
  fecha_subida: Date;
}

export interface Resolucion {
  id_resolucion: number;
  id_denuncia: number;
  id_usuario: number;
  descripcion: string;
  fecha_resolucion: Date;
  satisfactoria: boolean;
}

export interface KpiDenunciasDiario {
  id_kpi: number;
  fecha: Date;
  total_denuncias: number;
  denuncias_nuevas: number;
  denuncias_en_proceso: number;
  denuncias_resueltas: number;
  denuncias_cerradas: number;
  tiempo_promedio_resolucion?: number;
}
export interface Auditoria {
  id: number;
  usuario_id: number;
  modulo: string;
  accion: string;
  entidad_tipo: string;
  entidad_id: number | null;
  datos_anteriores: any;
  datos_nuevos: any;
  ip_address: string;
  user_agent: string;
  created_at: Date;
}
