// Tipos para el Dashboard del Frontend

export interface DashboardStats {
  total_denuncias: number;
  en_proceso: number;
  resueltas: number;
  criticas: number;
}

export interface DistribucionEstados {
  nuevos: number; // Porcentaje
  en_proceso: number; // Porcentaje
  resueltos: number; // Porcentaje
  cerrados: number; // Porcentaje
}

export interface MetricasRapidas {
  usuarios_activos: number;
  total_empresas: number;
  tiempo_promedio_resolucion: string; // Días en formato "5.2"
}

export interface ReclamoReciente {
  id_denuncia: number;
  codigo_acceso: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta" | "critica";
  id_estado: number;
  id_tipo: number;
  id_empresa: number;
  nombre_denunciante: string | null;
  email_denunciante: string | null;
  es_anonimo: boolean;
  fecha_creacion: string | null;
  tipo_nombre: string;
  estado_nombre: string;
  empresa_nombre: string;
}

export interface DashboardData {
  stats: DashboardStats;
  distribucion_estados: DistribucionEstados;
  metricas_rapidas: MetricasRapidas;
  reclamos_recientes: ReclamoReciente[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  error?: string;
}
