import type { CategoriaDenuncia, TipoDenuncia } from "@/lib/types/database";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003/api";

// Helper for authorized fetch with specific error handling
async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth_token");

  if (!token) throw new Error("No hay token de autenticación");

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Manejo específico por código de estado
    switch (response.status) {
      case 400:
        // Bad Request - datos inválidos o faltantes
        throw new Error(
          errorData.error ||
            "Datos inválidos. Por favor verifique la información ingresada.",
        );
      case 401:
        // Unauthorized - sesión expirada o token inválido
        throw new Error(
          "Su sesión ha expirado. Por favor inicie sesión nuevamente.",
        );
      case 403:
        // Forbidden - sin permisos
        throw new Error("No tiene permisos para realizar esta acción.");
      case 404:
        // Not Found - recurso no encontrado
        throw new Error(
          errorData.error || "El elemento solicitado no fue encontrado.",
        );
      case 409:
        // Conflict - tiene dependencias asociadas
        throw new Error(
          errorData.error ||
            "No se puede eliminar este elemento porque tiene dependencias asociadas.",
        );
      case 500:
        // Internal Server Error
        throw new Error(
          "Error interno del servidor. Por favor intente nuevamente más tarde.",
        );
      default:
        throw new Error(
          errorData.error || `Error ${response.status}: ${response.statusText}`,
        );
    }
  }

  return response.json();
}

// --- Categorias ---

export async function getCategorias(): Promise<CategoriaDenuncia[]> {
  const response = await authFetch("/categorias-denuncia?limit=100"); // Increase limit to get all for settings

  return response.data || response;
}

export async function getCategoria(id: number): Promise<CategoriaDenuncia> {
  return authFetch(`/categorias-denuncia/${id}`);
}

export async function crearCategoria(
  data: Partial<CategoriaDenuncia>,
): Promise<CategoriaDenuncia> {
  return authFetch("/categorias-denuncia", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function actualizarCategoria(
  id: number,
  data: Partial<CategoriaDenuncia>,
): Promise<CategoriaDenuncia> {
  return authFetch(`/categorias-denuncia/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function eliminarCategoria(id: number): Promise<void> {
  return authFetch(`/categorias-denuncia/${id}`, {
    method: "DELETE",
  });
}

// --- Tipos ---

export async function getTipos(): Promise<TipoDenuncia[]> {
  const response = await authFetch("/tipos-denuncia?limit=100"); // Increase limit to get all for settings

  return response.data || response;
}

export async function getTipo(id: number): Promise<TipoDenuncia> {
  return authFetch(`/tipos-denuncia/${id}`);
}

export async function crearTipo(
  data: Partial<TipoDenuncia>,
): Promise<TipoDenuncia> {
  return authFetch("/tipos-denuncia", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function actualizarTipo(
  id: number,
  data: Partial<TipoDenuncia>,
): Promise<TipoDenuncia> {
  return authFetch(`/tipos-denuncia/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function eliminarTipo(id: number): Promise<void> {
  return authFetch(`/tipos-denuncia/${id}`, {
    method: "DELETE",
  });
}
