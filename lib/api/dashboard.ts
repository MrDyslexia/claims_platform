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
