"use client";

import type { Usuario, Rol, Empresa } from "@/lib/types/database";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Alert, Button } from "@heroui/react";

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
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  getPrimaryRole: () => string | null;
  getRoleRoute: (roles: any[]) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Jerarquía de roles (mayor prioridad = índice menor)
const ROLE_HIERARCHY = ["admin", "administrador", "supervisor", "analista", "auditor"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExists, setSessionExists] = useState(false);
  const router = useRouter();

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
        setUser(null);

        return;
      }

      setToken(storedToken);

      // Cargar datos del usuario desde localStorage
      const userData = localStorage.getItem("user_data");

      if (userData) {
        const parsedUser = JSON.parse(userData);

        //Sesión restaurada:
        setUser(parsedUser);
        setSessionExists(true);
      }
    } catch {
      // Limpiar en caso de error
      localStorage.removeItem("auth_token");
      localStorage.removeItem("token_exp");
      localStorage.removeItem("user_data");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const convertUserData = (userData: any): AuthUser => {
    // Función unificada para convertir datos de usuario
    const nombreCompleto = userData.nombre_completo || "";
    const [nombre, ...apellidoParts] = nombreCompleto.split(" ");
    const apellido = apellidoParts.join(" ") || "";

    const authUser: AuthUser = {
      id_usuario: userData.id || userData.id_usuario,
      nombre: nombre || "Usuario",
      apellido: apellido || "",
      email: userData.email,
      password_hash: "",
      activo: userData.activo !== false,
      fecha_creacion: userData.fecha_creacion
        ? new Date(userData.fecha_creacion)
        : new Date(),
      empresa_id: userData.empresa_id || userData.empresa?.id,
      empresa: userData.empresa
        ? {
            id_empresa: userData.empresa.id || userData.empresa.id_empresa,
            nombre: userData.empresa.nombre,
            rut: userData.empresa.rut,
            razon_social: userData.empresa.razon_social,
            activo: userData.empresa.activo !== false,
            created_at: userData.empresa.created_at,
            updated_at: userData.empresa.updated_at,
          }
        : undefined,
      roles: (userData.roles || []).map((rol: any) => ({
        id_rol: rol.id || rol.id_rol,
        nombre: rol.nombre,
        activo: rol.activo !== false,
      })),
      permissions: userData.permisos || userData.permissions || [],
    };

    return authUser;
  };
  const getRoleRoute = (roles: any[]): string => {
    if (!roles || roles.length === 0) {
      return "/";
    }

    const roleRoutes: Record<string, string> = {
      administrador: "/admin",
      admin: "/admin",
      analista: "/analyst",
      supervisor: "/supervisor",
      auditor: "/auditor",
    };

    // Buscar el rol de mayor prioridad
    for (const priorityRole of ROLE_HIERARCHY) {
      const foundRole = roles.find(
        (r) => r.nombre.toLowerCase().trim() === priorityRole,
      );

      if (foundRole) {
        const route = roleRoutes[priorityRole];

        return route;
      }
    }

    // Si no se encuentra ningún rol en la jerarquía, usar el primero
    const firstRole = roles[0].nombre.toLowerCase().trim();
    const route = roleRoutes[firstRole] || "/";

    return route;
  };
  const login = async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);

    // Primero limpiar cualquier sesión anterior

    localStorage.removeItem("auth_token");
    localStorage.removeItem("token_exp");
    localStorage.removeItem("user_data");
    setUser(null);
    setToken(null);

    try {
      const response = await authAPI.login(email, password);

      // Guardar el token
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("token_exp", response.exp.toString());
      setToken(response.token);

      let authUser: AuthUser;

      // Si el login retorna información del usuario, usarla directamente
      if (response.user) {
        authUser = convertUserData(response.user);
      } else {
        // Fallback: Obtener información del usuario desde el backend

        const userData = await authAPI.getCurrentUser(response.token);

        authUser = convertUserData(userData);
      }

      // Validar que el usuario tenga al menos un rol
      if (!authUser.roles || authUser.roles.length === 0) {
        throw new Error("El usuario no tiene roles asignados");
      }

      // Guardar en localStorage y estado ANTES de retornar
      localStorage.setItem("user_data", JSON.stringify(authUser));
      setUser(authUser);

      // Retornar el usuario autenticado
      return authUser;
    } catch {
      // Limpiar datos en caso de error
      localStorage.removeItem("auth_token");
      localStorage.removeItem("token_exp");
      localStorage.removeItem("user_data");
      setToken(null);
      setUser(null);
      throw new Error("Error al iniciar sesión. Verifique sus credenciales.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const currentToken = localStorage.getItem("auth_token");

    try {
      if (currentToken) {
        // Llamar al backend para revocar la sesión
        await authAPI.logout(currentToken);
      }
    } catch {
      // Ignorar errores en el logout
      return;
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
    if (!user || !user.permissions) return false;

    return user.permissions.includes(permission);
  };

  const hasRole = (roleName: string): boolean => {
    if (!user || !user.roles) return false;

    const normalizedRoleName = roleName.toLowerCase().trim();

    return user.roles.some(
      (role) => role.nombre.toLowerCase().trim() === normalizedRoleName,
    );
  };

  const getPrimaryRole = (): string | null => {
    if (!user || !user.roles || user.roles.length === 0) {
      return null;
    }

    // Si solo hay un rol, retornarlo
    if (user.roles.length === 1) {
      return user.roles[0].nombre.toLowerCase();
    }

    // Si hay múltiples roles, retornar el de mayor prioridad según la jerarquía
    let highestPriorityRole = user.roles[0];
    let highestPriorityIndex = ROLE_HIERARCHY.length;

    for (const role of user.roles) {
      const normalizedRoleName = role.nombre.toLowerCase().trim();
      const priorityIndex = ROLE_HIERARCHY.indexOf(normalizedRoleName);

      // Si el rol está en la jerarquía y tiene mayor prioridad
      if (priorityIndex !== -1 && priorityIndex < highestPriorityIndex) {
        highestPriorityIndex = priorityIndex;
        highestPriorityRole = role;
      }
    }

    return highestPriorityRole.nombre.toLowerCase();
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
        getRoleRoute,
      }}
    >
      {sessionExists && (
        <Alert
          className="absolute top-4 right-4 z-50 w-md"
          color="primary"
          description="Se ha detectado una sesión activa. Puedes continuar donde lo dejaste."
          endContent={
            <Button
              color="primary"
              size="md"
              variant="flat"
              onPress={() => {
                setSessionExists(false);
                router.push(getRoleRoute(user?.roles || []));
              }}
            >
              Ingresar
            </Button>
          }
          title="Sesión restaurada"
          variant="flat"
        />
      )}
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
