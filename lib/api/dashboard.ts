import type { DashboardResponse } from "@/lib/types/dashboard";

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

    throw new Error(
      errorData.error || `Error ${response.status}: ${response.statusText}`,
    );
  }

  return response.json();
}

export interface AnalystAnalyticsResponse {
  dailyPerformance: { fecha: string; recibidos: number; resueltos: number }[];
  claimsByCategory: { categoria: string; cantidad: number }[];
  claimsByType: { tipo: string; cantidad: number }[];
  satisfactionTrend: { fecha: string; satisfaccion: number }[];
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

    throw new Error(
      errorData.error || `Error ${response.status}: ${response.statusText}`,
    );
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
