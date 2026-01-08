// Importar React para el hook
import React from "react";

/**
 * API para gestión de reclamos (denuncias)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

export interface Estado {
  id: number;
  nombre: string;
  codigo: string;
}

export interface Empresa {
  id: number;
  nombre: string;
  rut: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
}

export interface TipoDenuncia {
  id: number;
  nombre: string;
  codigo: string;
}

export interface Denunciante {
  nombre?: string | null;
  rut?: string | null;
  email?: string | null;
  telefono?: string | null;
  pais?: string | null;
  ciudad?: string | null;
  anonimo: boolean;
}

export interface Autor {
  nombre: string;
  email?: string | null;
}

export interface Comentario {
  id: number;
  contenido: string;
  autor: Autor;
  es_interno: boolean;
  fecha_creacion: string;
}

export interface Adjunto {
  id: number;
  nombre: string;
  ruta: string;
  mime_type: string;
  tamano: number;
  tipo_vinculo: string;
  fecha_subida: string;
}

export interface HistorialEstado {
  id: number;
  estado_anterior: {
    id: number;
    nombre: string;
  } | null;
  estado_nuevo: {
    id: number;
    nombre: string;
  };
  motivo: string | null;
  usuario: {
    nombre: string;
  } | null;
  fecha_cambio: string;
}

export interface Resolucion {
  id: number;
  contenido: string;
  usuario_resolvio: {
    nombre: string;
  };
  fecha_resolucion: string;
  ruta_pdf: string | null;
}

export interface Reclamo {
  id: number;
  numero: string;
  asunto: string;
  pais?: string;
  descripcion: string;
  canal_origen: string;
  dias: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado: Estado;
  prioridad: "baja" | "media" | "alta" | "critica";
  empresa: Empresa;
  tipo: TipoDenuncia;
  denunciante: Denunciante;
  supervisor: {
    nombre_completo: any;
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  } | null;
  comentarios: Comentario[];
  adjuntos: Adjunto[];
  historial_estado: HistorialEstado[];
  resolucion: Resolucion | null;
  nota_satisfaccion?: number | null;
  comentario_satisfaccion?: string | null;
}

export interface ReclamosResponse {
  total: number;
  reclamos: Reclamo[];
}

/**
 * Obtiene todos los reclamos del sistema
 * Requiere autenticación y rol ADMIN o ANALISTA
 */
export async function getAllClaims(token: string): Promise<ReclamosResponse> {
  const response = await fetch(`${API_BASE_URL}/denuncias/all`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("No autenticado. Por favor inicie sesión.");
    }
    if (response.status === 403) {
      throw new Error(
        "No tiene permisos para ver los reclamos. Requiere rol ADMIN o ANALISTA.",
      );
    }
    throw new Error("Error al obtener los reclamos");
  }

  return response.json();
}

/**
 * Crea un nuevo comentario en un reclamo
 * Requiere autenticación
 */
export async function createComment(
  reclamoId: number,
  token: string,
  contenido: string,
  es_interno: boolean = false,
): Promise<{ comentario: Comentario }> {
  if (!token) {
    throw new Error("Token de autenticación requerido");
  }

  const response = await fetch(
    `${API_BASE_URL}/denuncias/${reclamoId}/comentarios`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        contenido,
        es_interno,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(errorData.error || "Error al crear comentario");
  }

  return response.json();
}

/**
 * Hook personalizado para usar en componentes de React
 */
export function useGetAllClaims(token: string | null) {
  const [data, setData] = React.useState<ReclamosResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("No hay token de autenticación");

      return;
    }

    setLoading(true);
    setError(null);

    getAllClaims(token)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return {
    data,
    loading,
    error,
    refetch: () => {
      if (token) {
        setLoading(true);
        setError(null);
        getAllClaims(token)
          .then(setData)
          .catch((err) => setError(err.message))
          .finally(() => setLoading(false));
      }
    },
  };
}
