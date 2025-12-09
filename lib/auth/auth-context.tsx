"use client";

import type { Usuario, Rol, Empresa } from "@/lib/types/database";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import { authAPI } from "./api";

interface AuthUser extends Usuario {
  roles: Rol[];
  permissions: string[];
  empresa?: Empresa;
  empresa_id?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  getPrimaryRole: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const storedToken = localStorage.getItem("auth_token");

      if (!storedToken) {
        setIsLoading(false);
        setToken(null);

        return;
      }

      // Verificar si el token está expirado
      const exp = localStorage.getItem("token_exp");

      if (exp && Date.now() / 1000 > parseInt(exp)) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("token_exp");
        localStorage.removeItem("user_data");
        setIsLoading(false);
        setToken(null);

        return;
      }

      setToken(storedToken);

      // Cargar datos del usuario desde localStorage
      const userData = localStorage.getItem("user_data");

      if (userData) {
        const parsedUser = JSON.parse(userData);

        setUser(parsedUser);
      }
    } catch {
      // Error al verificar la sesión - silenciosamente continuar
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Llamar a la API de login del backend
      const response = await authAPI.login(email, password);

      // Guardar el token
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("token_exp", response.exp.toString());
      setToken(response.token);

      // Si el login retorna información del usuario, usarla directamente
      if (response.user) {
        const authUser = convertLoginUserToAuthUser(response.user);

        localStorage.setItem("user_data", JSON.stringify(authUser));
        setUser(authUser);
      } else {
        // Fallback: Obtener información del usuario desde el backend
        try {
          const userData = await authAPI.getCurrentUser(response.token);
          const authUser = convertToAuthUser(userData);

          localStorage.setItem("user_data", JSON.stringify(authUser));
          setUser(authUser);
        } catch {
          // Si falla obtener el usuario, crear uno temporal basado en el email
          alert(
            "No se pudo obtener la información del usuario. Por favor, contacte al administrador.",
          );
        }
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const convertLoginUserToAuthUser = (loginUser: any): AuthUser => {
    // Convertir los datos del login al formato AuthUser
    const [nombre, ...apellidoParts] = (loginUser.nombre_completo || "").split(
      " ",
    );
    const apellido = apellidoParts.join(" ") || "";

    return {
      id_usuario: loginUser.id,
      nombre: nombre || "Usuario",
      apellido: apellido || "",
      email: loginUser.email,
      password_hash: "",
      activo: true,
      fecha_creacion: new Date(),
      empresa_id: loginUser.empresa_id || loginUser.empresa?.id,
      empresa: loginUser.empresa
        ? {
            id_empresa: loginUser.empresa.id,
            nombre: loginUser.empresa.nombre,
            rut: loginUser.empresa.rut,
            razon_social: loginUser.empresa.razon_social,
            activo: true,
            created_at: undefined,
            updated_at: undefined,
          }
        : undefined,
      roles: (loginUser.roles || []).map((rol: any) => ({
        id_rol: rol.id,
        nombre: rol.nombre,
        activo: true,
      })),
      permissions: loginUser.permisos || [],
    };
  };

  const convertToAuthUser = (userData: any): AuthUser => {
    // Convertir los datos del backend al formato AuthUser
    const [nombre, ...apellidoParts] = (userData.nombre_completo || "").split(
      " ",
    );
    const apellido = apellidoParts.join(" ") || "";

    return {
      id_usuario: userData.id,
      nombre: nombre || "Usuario",
      apellido: apellido || "",
      email: userData.email,
      password_hash: "",
      activo: userData.activo,
      fecha_creacion: new Date(),
      empresa_id: userData.empresa?.id,
      empresa: userData.empresa
        ? {
            id_empresa: userData.empresa.id,
            nombre: userData.empresa.nombre,
            rut: userData.empresa.rut,
            razon_social: userData.empresa.razon_social,
            activo: true,
            created_at: undefined,
            updated_at: undefined,
          }
        : undefined,
      roles: (userData.roles || []).map((rol: any) => ({
        id_rol: rol.id,
        nombre: rol.nombre,
        activo: true,
      })),
      permissions: userData.permisos || [],
    };
  };
  const logout = async () => {
    const token = localStorage.getItem("auth_token");

    try {
      if (token) {
        // Llamar al backend para revocar la sesión
        await authAPI.logout(token);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error during logout:", error);
      // Continuamos con el logout local incluso si hay error
    } finally {
      // Limpiar datos locales
      localStorage.removeItem("auth_token");
      localStorage.removeItem("token_exp");
      localStorage.removeItem("user_data");
      setUser(null);
      setToken(null);
    }
  };

  const hasPermission = (permission: string): boolean => {
    console.log("Checking permission:", permission, user?.permissions);
    return user?.permissions.includes(permission) ?? false;
  };

  const hasRole = (roleName: string): boolean => {
    return (
      user?.roles.some(
        (role) => role.nombre.toLowerCase() === roleName.toLowerCase(),
      ) ?? false
    );
  };

  const getPrimaryRole = (): string | null => {
    if (!user || user.roles.length === 0) return null;

    return user.roles[0].nombre.toLowerCase();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        hasRole,
        getPrimaryRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
