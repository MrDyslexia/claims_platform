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
  if (!primaryRole) return "/auditor"; // fallback
  const normalizedRole = primaryRole.toLowerCase().trim();

  return roleBaseRoutes[normalizedRole] || "/auditor";
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
      href: `${baseRoute}/claims`,
      icon: FileText,
      permission: "denuncias:ver",
    },
    {
      label: "Usuarios",
      href: `${baseRoute}/users`,
      icon: Users,
      permission: "usuarios:ver",
      submenu: [
        {
          label: "Lista de Usuarios",
          href: `${baseRoute}/users`,
          permission: "usuarios:ver",
        },
        {
          label: "Roles y Permisos",
          href: `${baseRoute}/users/roles`,
          permission: "roles:ver",
        },
      ],
    },
    {
      label: "Empresas",
      href: `${baseRoute}/companies`,
      icon: Building2,
      permission: "empresas:ver",
    },
    {
      label: "Reportes",
      href: `${baseRoute}/reports`,
      icon: BarChart3,
      permission: "reportes:ver",
    },
    {
      label: "Auditoría",
      href: `${baseRoute}/audit`,
      icon: Shield,
      permission: "auditoria:ver",
    },
    {
      label: "Configuración",
      href: `${baseRoute}/settings`,
      icon: Settings,
      permission: "configuracion:ver",
    },
  ];
}

// Export por defecto para compatibilidad (usa auditor como fallback)
const menuItems = getMenuItemsForRole("auditor");

export default menuItems;
