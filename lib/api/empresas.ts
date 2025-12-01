const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003/api";

import React from "react";

export interface Empresa {
  id_empresa: number;
  nombre: string;
  rut: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  estadisticas?: {
    denuncias_totales: number;
    denuncias_activas: number;
    denuncias_resueltas: number;
    ultima_denuncia?: string | null;
  };
  contactos?: Array<{
    id_contacto: number;
    nombre: string;
    cargo: string;
    telefono: string;
    email: string;
    es_principal: boolean;
  }>;
}

export interface EmpresasResponse {
  total: number;
  empresas: Empresa[];
  metadata: {
    pagina_actual: number;
    total_paginas: number;
    registros_por_pagina: number;
    total_registros: number;
    ordenado_por: string;
    orden: string;
  };
  filtros_disponibles: {
    regiones: string[];
    estados: Array<{ valor: boolean; etiqueta: string }>;
  };
  estadisticas_globales: {
    empresas_totales: number;
    empresas_activas: number;
    empresas_inactivas: number;
    denuncias_totales: number;
    denuncias_activas: number;
    denuncias_resueltas: number;
    promedio_denuncias_por_empresa: number | string;
  };
}

class EmpresasAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  async obtenerListaCompleta(
    token: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<EmpresasResponse> {
    const response = await fetch(
      `${this.baseURL}/empresas/admin/lista-completa?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Error al obtener empresas" }));

      throw new Error(error.error || "No se pudieron obtener las empresas");
    }

    return response.json();
  }

  async crearEmpresa(
    token: string,
    data: {
      rut: string;
      nombre: string;
      direccion?: string;
      telefono?: string;
      email?: string;
    },
  ): Promise<Empresa> {
    const response = await fetch(`${this.baseURL}/empresas`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Error al crear empresa" }));

      throw new Error(error.error || "No se pudo crear la empresa");
    }

    return response.json();
  }

  async actualizarEmpresa(
    token: string,
    id: number,
    data: {
      rut?: string;
      nombre?: string;
      direccion?: string;
      telefono?: string;
      email?: string;
      estado?: 0 | 1;
    },
  ): Promise<Empresa> {
    const response = await fetch(`${this.baseURL}/empresas/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Error al actualizar empresa" }));

      throw new Error(error.error || "No se pudo actualizar la empresa");
    }

    return response.json();
  }

  async eliminarEmpresa(token: string, id: number): Promise<{ ok: boolean }> {
    const response = await fetch(`${this.baseURL}/empresas/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Error al eliminar empresa" }));

      throw new Error(error.error || "No se pudo eliminar la empresa");
    }

    return response.json();
  }
}

export const empresasAPI = new EmpresasAPI();

// Hook para obtener lista completa de empresas
export function useGetListaCompletaEmpresas(token: string | null) {
  const [data, setData] = React.useState<EmpresasResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) {
      setLoading(false);

      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await empresasAPI.obtenerListaCompleta(token);

        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return { data, loading, error };
}
