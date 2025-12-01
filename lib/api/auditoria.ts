/**
 * API Client para Auditoría
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

export interface LogAuditoria {
  id: number;
  usuario_id: number | null;
  usuario_nombre: string;
  metodo: string;
  ruta: string;
  modulo: string;
  accion: string;
  resultado: "SUCCESS" | "FAILED" | "INFO";
  descripcion: string;
  ip_origen: string | null;
  user_agent: string | null;
  status: number;
  duracion_ms: number | null;
  fecha_creacion: string;
}

export interface FiltrosDisponibles {
  modulos: Array<{
    codigo: string;
    nombre: string;
    icono: string;
  }>;
  acciones: Array<{
    codigo: string;
    nombre: string;
    tipo: string;
  }>;
  resultados: Array<{
    codigo: string;
    nombre: string;
    tipo: string;
  }>;
}

export interface EstadisticasAuditoria {
  total_logs: number;
  logs_hoy: number;
  logs_esta_semana: number;
  logs_este_mes: number;
  modulos_mas_activos: Array<{
    modulo: string;
    cantidad: number;
    porcentaje: number;
  }>;
  usuarios_mas_activos: Array<{
    usuario: string;
    cantidad: number;
    porcentaje: number;
  }>;
  tasa_exito: number;
  logs_fallidos: number;
}

export interface AuditoriaResponse {
  total: number;
  logs_auditoria: LogAuditoria[];
  metadata: {
    pagina_actual: number;
    total_paginas: number;
    registros_por_pagina: number;
    total_registros: number;
    ordenado_por: string;
    orden: string;
  };
  filtros_disponibles: FiltrosDisponibles;
  estadisticas: EstadisticasAuditoria;
}

export interface FiltrosAuditoria {
  page?: number;
  limit?: number;
  modulo?: string;
  usuario_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  accion?: string;
  resultado?: string;
}

/**
 * Obtiene los logs de auditoría completos
 */
export async function obtenerLogsAuditoria(
  token: string,
  filtros?: FiltrosAuditoria,
): Promise<AuditoriaResponse> {
  const params = new URLSearchParams();

  if (filtros) {
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
  }

  const url = `${API_BASE_URL}/auditoria/logs-completos${params.toString() ? `?${params}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Error al obtener logs de auditoría" }));

    throw new Error(
      error.error || "No se pudieron obtener los logs de auditoría",
    );
  }

  return response.json();
}

/**
 * Hook de React para obtener logs de auditoría
 */
import { useState, useEffect } from "react";

export function useLogsAuditoria(
  token: string | null,
  filtros?: FiltrosAuditoria,
) {
  const [data, setData] = useState<AuditoriaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("No hay token de autenticación");

      return;
    }

    setLoading(true);
    setError(null);

    obtenerLogsAuditoria(token, filtros)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, JSON.stringify(filtros)]);

  const refetch = () => {
    if (token) {
      setLoading(true);
      setError(null);
      obtenerLogsAuditoria(token, filtros)
        .then(setData)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  };

  return { data, loading, error, refetch };
}
