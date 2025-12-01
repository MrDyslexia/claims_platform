// lib/auth/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  exp: number;
  user?: {
    id: number;
    email: string;
    nombre_completo: string;
    roles: Array<{
      id: number;
      codigo: string;
      nombre: string;
    }>;
    permisos: string[];
  };
}
export interface UserResponse {
  id: number;
  rut: string;
  nombre_completo: string;
  email: string;
  activo: boolean;
  last_login_at?: string;
  roles?: Array<{
    id: number;
    nombre: string;
    descripcion?: string;
  }>;
  empresa?: {
    id: number;
    nombre: string;
    rut: string;
    razon_social: string;
  };
  permisos?: string[];
}

class AuthAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Error al iniciar sesión" }));

      throw new Error(error.error || "Credenciales inválidas");
    }

    return response.json();
  }

  async logout(token: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Error al cerrar sesión" }));

      // No lanzamos error aquí porque el logout debe proceder incluso si hay un problema con el backend
      // eslint-disable-next-line no-console
      console.warn("Backend logout warning:", error);
    }
  }

  async getCurrentUser(token: string): Promise<UserResponse> {
    const response = await fetch(`${this.baseURL}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("No se pudo obtener la información del usuario");
    }

    return response.json();
  }

  async register(data: {
    rut: string;
    nombre_completo: string;
    email: string;
    password: string;
  }): Promise<{ id: number; email: string }> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Error al registrar usuario" }));

      throw new Error(error.error || "Error al registrar usuario");
    }

    return response.json();
  }
}

export const authAPI = new AuthAPI();
