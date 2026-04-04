import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  BarChart3,
  Shield,
  Settings,
} from "lucide-react";

// Rutas base según el arquetipo del rol
export const roleBaseRoutes: Record<string, string> = {
  administrador: "/admin",
  admin: "/admin",
  analista: "/analyst",
  supervisor: "/supervisor",
  auditor: "/auditor",
};

// Helper para obtener la ruta base según el rol principal del usuario
export function getBaseRouteForRole(primaryRole: string | null): string {
  if (!primaryRole) return "/";
  const normalizedRole = primaryRole.toLowerCase().trim();

  return roleBaseRoutes[normalizedRole] || "/";
}

function buildModuleRoute(baseRoute: string, path = ""): string {
  if (!path) {
    return baseRoute;
  }

  return baseRoute === "/" ? `/${path}` : `${baseRoute}/${path}`;
}

// Helper para generar menú con rutas dinámicas
export function getMenuItemsForRole(primaryRole: string | null) {
  const baseRoute = getBaseRouteForRole(primaryRole);

  return [
    {
      label: "Dashboard",
      href: baseRoute,
      icon: LayoutDashboard,
      permission: "denuncias:ver",
    },
    {
      label: "Reclamos",
      href: buildModuleRoute(baseRoute, "claims"),
      icon: FileText,
      permission: "denuncias:ver",
    },
    {
      label: "Usuarios",
      href: buildModuleRoute(baseRoute, "users"),
      icon: Users,
      permission: "usuarios:ver",
      submenu: [
        {
          label: "Lista de Usuarios",
          href: buildModuleRoute(baseRoute, "users"),
          permission: "usuarios:ver",
        },
        {
          label: "Roles y Permisos",
          href: buildModuleRoute(baseRoute, "users/roles"),
          permission: "roles:ver",
        },
      ],
    },
    {
      label: "Empresas",
      href: buildModuleRoute(baseRoute, "companies"),
      icon: Building2,
      permission: "empresas:ver",
    },
    {
      label: "Reportes",
      href: buildModuleRoute(baseRoute, "reports"),
      icon: BarChart3,
      permission: "reportes:ver",
    },
    {
      label: "Auditoría",
      href: buildModuleRoute(baseRoute, "audit"),
      icon: Shield,
      permission: "auditoria:ver",
    },
    {
      label: "Configuración",
      href: buildModuleRoute(baseRoute, "settings"),
      icon: Settings,
      permission: "configuracion:ver",
    },
  ];
}

// Export por defecto para compatibilidad sin asumir un módulo incorrecto
const menuItems = getMenuItemsForRole(null);

export default menuItems;
