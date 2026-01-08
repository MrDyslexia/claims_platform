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

// ==========================================
// ADMIN DASHBOARD COMPLETE - TYPES
// ==========================================

export interface TrendComparison {
  actual: number;
  mesAnterior: number;
  variacion: number;
  tendencia: "up" | "down" | "neutral";
}

export interface AdminSummary {
  totalReclamos: number;
  tasaResolucion: TrendComparison;
  tiempoPromedioResolucion: TrendComparison;
  empresasActivas: number;
  reclamosCriticos: number;
  satisfaccionPromedio: number;
}

export interface MonthlyDistribution {
  mes: string;
  resueltos: number;
  pendientes: number;
}

export interface TypeDistribution {
  tipo: string;
  cantidad: number;
  porcentaje: number;
}

export interface CompanyClaims {
  empresa: string;
  cantidad: number;
}

export interface ResolutionTimeRange {
  rango: string;
  cantidad: number;
}

export interface AdminDashboardCompleteData {
  summary: AdminSummary;
  distribucionUltimos12Meses: MonthlyDistribution[];
  distribucionPorTipo: TypeDistribution[];
  reclamosPorEmpresa: CompanyClaims[];
  distribucionTiemposResolucion: ResolutionTimeRange[];
}

export interface AdminDashboardCompleteResponse {
  success: boolean;
  data: AdminDashboardCompleteData;
  error?: string;
}
