/**
 * API para gestión de usuarios
 */

import React from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

export interface Permiso {
  id_permiso: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
}

export interface Arquetipo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  permisos?: Permiso[];
}

export interface Rol {
  id_rol: number;
  codigo?: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fecha_creacion?: string;
  arquetipo_id?: number;
  arquetipo?: Arquetipo;
  permisos?: Permiso[];
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  roles: Rol[];
  permisos: Permiso[];
  categorias?: Categoria[];
  estadisticas: {
    denuncias_creadas: number;
    denuncias_resueltas: number;
    comentarios_realizados: number;
    ultimo_acceso: string | null;
  };
}

export interface UsuariosResponse {
  total: number;
  usuarios: Usuario[];
  roles_disponibles: Rol[];
  permisos_disponibles: Permiso[];
  arquetipos_disponibles?: Arquetipo[];
  metadata: {
    pagina_actual: number;
    total_paginas: number;
    registros_por_pagina: number;
    total_registros: number;
    ordenado_por: string;
    orden: string;
  };
}

/**
 * Obtiene la lista completa de usuarios con roles y permisos
 * Requiere autenticación
 */
export async function getListaCompletaUsuarios(
  token: string,
  page: number = 1,
  limit: number = 10,
): Promise<UsuariosResponse> {
  if (!token) {
    throw new Error("Token de autenticación requerido");
  }

  const response = await fetch(
    `${API_BASE_URL}/usuarios/admin/lista-completa?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("No autenticado. Por favor inicie sesión.");
    }
    if (response.status === 403) {
      throw new Error("No tiene permisos para acceder a esta información.");
    }
    throw new Error("Error al obtener la lista de usuarios");
  }

  return response.json();
}

/**
 * Interfaz para crear un nuevo usuario
 */
export interface CrearUsuarioRequest {
  rut: string;
  nombre_completo: string;
  email: string;
  password: string;
  telefono?: string;
  activo?: number | boolean;
  rol_ids?: number[];
}

/**
 * Interfaz para actualizar un usuario existente
 */
export interface ActualizarUsuarioRequest {
  nombre_completo?: string;
  email?: string;
  telefono?: string;
  activo?: number | boolean;
  rol_ids?: number[];
}

/**
 * Crear un nuevo usuario
 * Requiere autenticación y permisos de administrador
 */
export async function crearUsuario(
  token: string,
  data: CrearUsuarioRequest,
): Promise<{
  id: number;
  rut: string;
  email: string;
  nombre_completo: string;
  activo: number;
}> {
  if (!token) {
    throw new Error("Token de autenticación requerido");
  }

  const response = await fetch(`${API_BASE_URL}/usuarios`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw new Error("No autenticado. Por favor inicie sesión.");
    }
    if (response.status === 403) {
      throw new Error("No tiene permisos para crear usuarios.");
    }
    throw new Error(errorData.error || "Error al crear el usuario");
  }

  return response.json();
}

/**
 * Actualizar un usuario existente
 * Requiere autenticación y permisos de administrador
 */
export async function actualizarUsuario(
  token: string,
  id: number,
  data: ActualizarUsuarioRequest,
): Promise<{
  id: number;
  rut: string;
  email: string;
  nombre_completo: string;
  activo: number;
}> {
  if (!token) {
    throw new Error("Token de autenticación requerido");
  }

  const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw new Error("No autenticado. Por favor inicie sesión.");
    }
    if (response.status === 403) {
      throw new Error("No tiene permisos para actualizar usuarios.");
    }
    if (response.status === 404) {
      throw new Error("Usuario no encontrado.");
    }
    throw new Error(errorData.error || "Error al actualizar el usuario");
  }

  return response.json();
}

/**
 * Asignar roles a un usuario
 * Requiere autenticación y permisos de administrador
 */
export async function asignarRolesUsuario(
  token: string,
  id: number,
  rol_ids: number[],
): Promise<{ ok: boolean; message: string }> {
  if (!token) {
    throw new Error("Token de autenticación requerido");
  }

  const response = await fetch(`${API_BASE_URL}/usuarios/${id}/roles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rol_ids }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw new Error("No autenticado. Por favor inicie sesión.");
    }
    if (response.status === 403) {
      throw new Error("No tiene permisos para asignar roles.");
    }
    if (response.status === 404) {
      throw new Error("Usuario no encontrado.");
    }
    throw new Error(errorData.error || "Error al asignar roles");
  }

  return response.json();
}

/**
 * Eliminar un usuario
 * Requiere autenticación y permisos de administrador
 */
export async function eliminarUsuario(
  token: string,
  id: number,
): Promise<{ ok: boolean; message: string }> {
  if (!token) {
    throw new Error("Token de autenticación requerido");
  }

  const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw new Error("No autenticado. Por favor inicie sesión.");
    }
    if (response.status === 403) {
      throw new Error("No tiene permisos para eliminar usuarios.");
    }
    if (response.status === 404) {
      throw new Error("Usuario no encontrado.");
    }
    throw new Error(errorData.error || "Error al eliminar el usuario");
  }

  return response.json();
}

/**
 * Eliminar un rol
 * Requiere autenticación y permisos de administrador
 */
export async function eliminarRol(
  token: string,
  id: number,
): Promise<{ ok: boolean; message: string }> {
  if (!token) {
    throw new Error("Token de autenticación requerido");
  }

  const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw new Error("No autenticado. Por favor inicie sesión.");
    }
    if (response.status === 403) {
      throw new Error("No tiene permisos para eliminar roles.");
    }
    if (response.status === 404) {
      throw new Error("Rol no encontrado.");
    }
    throw new Error(errorData.error || "Error al eliminar el rol");
  }

  return response.json();
}

/**
 * Asignar permisos a un rol
 */
export async function asignarPermisosARol(
  token: string,
  id_rol: number,
  permiso_ids: number[],
): Promise<{ ok: boolean; message: string }> {
  if (!token) {
    throw new Error("Token de autenticación requerido");
  }

  const response = await fetch(`${API_BASE_URL}/roles/${id_rol}/permisos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      permiso_ids,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(errorData.error || "Error al asignar permisos");
  }

  return response.json();
}

/**
 * Crear un nuevo rol basado en un arquetipo
 */
export async function crearRol(
  token: string,
  nombre: string,
  descripcion: string,
  arquetipo_id: number,
  permisos: number[],
): Promise<{ id: number; codigo: string; nombre: string }> {
  if (!token) {
    throw new Error("Token de autenticación requerido");
  }

  // Generar código a partir del nombre (ej: "Administrador" -> "ADMINISTRADOR")
  const codigo = nombre.toUpperCase().replace(/\s+/g, "_");

  const response = await fetch(`${API_BASE_URL}/roles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      codigo,
      nombre,
      descripcion,
      arquetipo_id,
      permiso_ids: permisos, // Permisos personalizados (subconjunto del arquetipo)
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(errorData.error || "Error al crear el rol");
  }

  return response.json();
}

/**
 * Listar todos los arquetipos disponibles
 */
export async function listarArquetipos(
  token: string,
): Promise<{ data: Arquetipo[] }> {
  if (!token) {
    throw new Error("Token de autenticación requerido");
  }

  const response = await fetch(`${API_BASE_URL}/arquetipos`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(errorData.error || "Error al obtener arquetipos");
  }

  return response.json();
}

/**
 * Actualizar un rol existente (nombre y permisos)
 * NOTA: Los permisos deben ser subconjunto del arquetipo
 */
export async function actualizarRol(
  token: string,
  id_rol: number,
  nombre: string,
  descripcion: string,
  permisos: number[],
): Promise<{ mensaje: string }> {
  if (!token) {
    throw new Error("Token de autenticación requerido");
  }

  // Generar código a partir del nombre
  const codigo = nombre.toUpperCase().replace(/\\s+/g, "_");

  const response = await fetch(`${API_BASE_URL}/roles/${id_rol}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      codigo,
      nombre,
      descripcion,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(errorData.error || "Error al actualizar el rol");
  }

  // Actualizar permisos (valida contra arquetipo en backend)
  await asignarPermisosARol(token, id_rol, permisos);

  return { mensaje: "Rol actualizado exitosamente" };
}

/**
 * Hook personalizado para obtener la lista de usuarios
 */
export function useGetListaCompletaUsuarios(token: string | null) {
  const [data, setData] = React.useState<UsuariosResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("No hay token de autenticación");

      return;
    }

    setLoading(true);
    setError(null);

    getListaCompletaUsuarios(token, page)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, page]);

  return {
    data,
    loading,
    error,
    page,
    setPage,
    refetch: () => {
      if (token) {
        setLoading(true);
        setError(null);
        getListaCompletaUsuarios(token, page)
          .then(setData)
          .catch((err) => setError(err.message))
          .finally(() => setLoading(false));
      }
    },
  };
}

/**
 * Alternar estado activo de un usuario
 * Requiere autenticación y permisos de administrador
 */
export async function toggleUsuarioActivo(
  token: string,
  id: number,
): Promise<{ ok: boolean; message: string; activo: number }> {
  if (!token) {
    throw new Error("Token de autenticación requerido");
  }

  const response = await fetch(`${API_BASE_URL}/usuarios/${id}/toggle-activo`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw new Error("No autenticado. Por favor inicie sesión.");
    }
    if (response.status === 403) {
      throw new Error("No tiene permisos para realizar esta acción.");
    }
    if (response.status === 404) {
      throw new Error("Usuario no encontrado.");
    }
    throw new Error(errorData.error || "Error al cambiar estado del usuario");
  }

  return response.json();
}

/**
 * Asignar categorías a un usuario (para filtrado de denuncias)
 * Requiere autenticación y permisos de administrador
 */
export async function asignarCategoriasUsuario(
  token: string,
  id: number,
  categoria_ids: number[],
): Promise<{ ok: boolean; message: string; categoria_ids: number[] }> {
  if (!token) {
    throw new Error("Token de autenticación requerido");
  }

  const response = await fetch(`${API_BASE_URL}/usuarios/${id}/categorias`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ categoria_ids }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw new Error("No autenticado. Por favor inicie sesión.");
    }
    if (response.status === 403) {
      throw new Error("No tiene permisos para asignar categorías.");
    }
    if (response.status === 404) {
      throw new Error("Usuario no encontrado.");
    }
    throw new Error(errorData.error || "Error al asignar categorías");
  }

  return response.json();
}

/**
 * Obtener lista de categorías disponibles
 */
export async function obtenerCategoriasDisponibles(
  token: string,
): Promise<{ categorias: Categoria[] }> {
  if (!token) {
    throw new Error("Token de autenticación requerido");
  }

  const response = await fetch(`${API_BASE_URL}/categorias-denuncia`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Error al obtener categorías");
  }

  const data = await response.json();
  return { categorias: data.data || data };
}
