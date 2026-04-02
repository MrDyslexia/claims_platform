import type {
  DashboardResponse,
  AdminDashboardCompleteResponse,
} from "@/lib/types/dashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003/api";

/**
 * Obtiene todas las estadísticas del dashboard
 * @returns Datos completos del dashboard
 */
export async function fetchDashboardData(): Promise<DashboardResponse> {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(`${API_URL}/dashboard/stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    switch (response.status) {
      case 401:
        throw new Error(
          "Su sesión ha expirado. Por favor inicie sesión nuevamente.",
        );
      case 403:
        throw new Error("No tiene permisos para ver el dashboard.");
      case 500:
        throw new Error(
          "Error interno del servidor. Por favor intente más tarde.",
        );
      default:
        throw new Error(
          errorData.error || `Error ${response.status}: ${response.statusText}`,
        );
    }
  }

  return response.json();
}

/**
 * Obtiene el dashboard completo para administradores
 * @returns Datos completos del dashboard de administrador
 */
export async function fetchAdminDashboardComplete(): Promise<AdminDashboardCompleteResponse> {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(`${API_URL}/dashboard/admin/complete`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    switch (response.status) {
      case 401:
        throw new Error(
          "Su sesión ha expirado. Por favor inicie sesión nuevamente.",
        );
      case 403:
        throw new Error(
          "No tiene permisos para ver el dashboard de administrador.",
        );
      case 500:
        throw new Error(
          "Error interno del servidor. Por favor intente más tarde.",
        );
      default:
        throw new Error(
          errorData.error || `Error ${response.status}: ${response.statusText}`,
        );
    }
  }

  return response.json();
}

export interface AnalystAnalyticsResponse {
  dailyPerformance: { fecha: string; recibidos: number; resueltos: number }[];
  claimsByCategory: { categoria: string; cantidad: number }[];
  claimsByType: { tipo: string; cantidad: number }[];
  satisfactionTrend: { fecha: string; satisfaccion: number }[];
}

// ==========================================
// DASHBOARD REPORTS (POST /dashboard/reports)
// ==========================================

export interface ReportSummary {
  totalReclamos: number;
  tasaResolucion: number;
  tiempoPromedioDias: number;
  empresasActivas: number;
  variacionTotalReclamos: number;
  variacionTasaResolucion: number;
  variacionTiempoPromedioDias: number;
  nuevasEmpresas: number;
  reclamosCriticos: number;
  satisfaccionPromedio: number;
}

export interface ClaimsByMonth {
  mes: string;
  total: number;
  resueltos: number;
  pendientes: number;
}

export interface ClaimsByType {
  tipo: string;
  cantidad: number;
  porcentaje: number;
}

export interface ClaimsByCompany {
  empresa: string;
  cantidad: number;
}

export interface ResolutionTime {
  rango: string;
  cantidad: number;
}

export interface DashboardReportResponse {
  reportPeriod: string;
  summary: ReportSummary;
  claimsByMonth: ClaimsByMonth[];
  claimsByType: ClaimsByType[];
  claimsByCompany: ClaimsByCompany[];
  resolutionTime: ResolutionTime[];
}

export async function fetchDashboardReports(
  period: string = "monthly",
): Promise<DashboardReportResponse> {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(`${API_URL}/dashboard/reports?period=${period}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export async function exportDashboardReportPdf(
  period: string = "monthly",
): Promise<void> {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(
    `${API_URL}/dashboard/reports?period=${period}&format=pdf`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Error ${response.status}: ${response.statusText}`,
    );
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  const filename =
    response.headers
      .get("content-disposition")
      ?.match(/filename=\"?([^"]+)\"?/)?.[1] ||
    `reporte_${period}.pdf`;

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// ==========================================
// DASHBOARD ANALISTA (GET /dashboard/analista)
// ==========================================

export interface TrendData {
  value: number;
  change: string;
  trend: "up" | "down" | "neutral";
}

export interface GlobalKPIs {
  total_claims: TrendData;
  pending_claims: TrendData;
  resolved_claims: TrendData;
  resolution_rate: TrendData;
}

export interface KeyMetrics {
  avg_resolution_time: TrendData;
  customer_satisfaction: TrendData;
  critical_claims: { value: number; description: string };
  recurrence_rate: TrendData;
}

export interface CompanySummary {
  empresa_id: number;
  empresa_nombre: string;
  total_claims: number;
  pending_claims: number;
  resolved_claims: number;
  resolution_rate: number;
}

export interface DashboardAnalistaResponse {
  global_kpis: GlobalKPIs;
  monthly_data: { mes: string; reclamos: number; resueltos: number }[];
  claims_by_type: { tipo: string; cantidad: number }[];
  claims_by_status: { estado: string; cantidad: number }[];
  key_metrics: KeyMetrics;
  companies_summary: CompanySummary[];
}

export async function fetchDashboardAnalista(): Promise<DashboardAnalistaResponse> {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(`${API_URL}/dashboard/analista`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtiene métricas detalladas para analista
 * @param startDate Fecha de inicio (YYYY-MM-DD)
 * @param endDate Fecha de fin (YYYY-MM-DD)
 */
export async function fetchAnalystAnalytics(
  startDate: string,
  endDate: string,
): Promise<AnalystAnalyticsResponse> {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(`${API_URL}/dashboard/analyst/analytics`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ startDate, endDate }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    switch (response.status) {
      case 400:
        throw new Error(
          errorData.error ||
            "Fechas inválidas. Verifique el rango seleccionado.",
        );
      case 401:
        throw new Error(
          "Su sesión ha expirado. Por favor inicie sesión nuevamente.",
        );
      case 403:
        throw new Error("No tiene permisos para ver las analíticas.");
      case 500:
        throw new Error(
          "Error interno del servidor. Por favor intente más tarde.",
        );
      default:
        throw new Error(
          errorData.error || `Error ${response.status}: ${response.statusText}`,
        );
    }
  }

  return response.json();
}

export interface Report {
  name: string;
  size: string;
  createdAt: string;
}

export async function generateReport(
  startDate: string,
  endDate: string,
): Promise<{ message: string; filename: string }> {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(
    `${API_URL}/dashboard/analyst/reports/generate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startDate, endDate }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(errorData.error || "Error generando reporte");
  }

  return response.json();
}

export async function getReports(): Promise<Report[]> {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(`${API_URL}/dashboard/analyst/reports`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Error obteniendo reportes");
  }

  return response.json();
}

export async function downloadReport(filename: string): Promise<void> {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(
    `${API_URL}/dashboard/analyst/reports/${filename}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    throw new Error("Error descargando reporte");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
