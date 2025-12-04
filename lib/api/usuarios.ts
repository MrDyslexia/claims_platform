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

export interface Rol {
  id_rol: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fecha_creacion: string;
  permisos?: Permiso[];
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
 * Crear un nuevo rol
 */
export async function crearRol(
  token: string,
  nombre: string,
  descripcion: string,
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
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(errorData.error || "Error al crear el rol");
  }

  const nuevoRol = await response.json();

  // Si hay permisos, asignarlos
  if (permisos.length > 0) {
    await asignarPermisosARol(token, nuevoRol.id, permisos);
  }

  return nuevoRol;
}

/**
 * Actualizar un rol existente
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
  const codigo = nombre.toUpperCase().replace(/\s+/g, "_");

  const response = await fetch(`${API_BASE_URL}/roles/${id_rol}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      codigo,
      nombre,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(errorData.error || "Error al actualizar el rol");
  }

  // Actualizar permisos
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
