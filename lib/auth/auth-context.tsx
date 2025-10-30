"use client";

import type { Usuario, Rol, Empresa } from "@/lib/types/database";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface AuthUser extends Usuario {
  roles: Rol[];
  permissions: string[];
  empresa?: Empresa;
  empresa_id?: number;
}

interface AuthContextType {
  user: AuthUser | null;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const userRole = localStorage.getItem("user_role");

      if (token && userRole) {
        const mockUser = getMockUserByRole(userRole);

        setUser(mockUser);
      }
    } catch (error) {
      console.error("[v0] Session check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMockUserByRole = (role: string): AuthUser => {
    const baseUser = {
      id_usuario: 1,
      password_hash: "",
      activo: true,
      fecha_creacion: new Date(),
    };

    switch (role) {
      case "admin":
        return {
          ...baseUser,
          nombre: "Admin",
          apellido: "Sistema",
          email: "admin@example.com",
          roles: [{ id_rol: 1, nombre: "Administrador", activo: true }],
          permissions: [
            "view_dashboard",
            "view_claims",
            "edit_claims",
            "manage_users",
            "view_reports",
            "manage_companies",
            "manage_settings",
            "view_audit",
          ],
        };
      case "analista":
        return {
          ...baseUser,
          id_usuario: 2,
          nombre: "María",
          apellido: "González",
          email: "analista@example.com",
          empresa_id: 1,
          empresa: {
            id_empresa: 1,
            nombre: "TechCorp Solutions",
            rut: "76.123.456-7",
            razon_social: "TechCorp Solutions SpA",
            activo: true,
            created_at: undefined,
            updated_at: undefined,
          },
          roles: [{ id_rol: 3, nombre: "Analista", activo: true }],
          permissions: [
            "view_dashboard",
            "view_claims",
            "view_reports",
            "view_analytics",
          ],
        };
      case "supervisor":
        return {
          ...baseUser,
          id_usuario: 3,
          nombre: "Carlos",
          apellido: "Rodríguez",
          email: "supervisor@example.com",
          empresa_id: 1,
          empresa: {
            id_empresa: 1,
            nombre: "TechCorp Solutions",
            rut: "76.123.456-7",
            razon_social: "TechCorp Solutions SpA",
            activo: true,
            created_at: undefined,
            updated_at: undefined,
          },
          roles: [{ id_rol: 2, nombre: "Supervisor", activo: true }],
          permissions: [
            "view_dashboard",
            "view_claims",
            "edit_claims",
            "resolve_claims",
            "add_comments",
          ],
        };
      default:
        return {
          ...baseUser,
          nombre: "Usuario",
          apellido: "Desconocido",
          email: "user@example.com",
          roles: [],
          permissions: [],
        };
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let role = "admin";

      if (email.includes("analista")) {
        role = "analista";
      } else if (email.includes("supervisor")) {
        role = "supervisor";
      }

      const mockUser = getMockUserByRole(role);

      mockUser.email = email;

      const mockToken = "mock_jwt_token_" + Date.now();

      localStorage.setItem("auth_token", mockToken);
      localStorage.setItem("user_role", role);
      setUser(mockUser);
    } catch (error) {
      console.error("[v0] Login failed:", error);
      throw new Error("Credenciales inválidas");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      setUser(null);
    } catch (error) {
      console.error("[v0] Logout failed:", error);
    }
  };

  const hasPermission = (permission: string): boolean => {
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
    const roleName = user.roles[0].nombre.toLowerCase();

    if (roleName.includes("admin")) return "admin";
    if (roleName.includes("analista")) return "analista";
    if (roleName.includes("supervisor")) return "supervisor";

    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
