import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  BarChart3,
  Shield,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/auditor",
    icon: LayoutDashboard,
    permission: "denuncias:ver", // Cualquier usuario con acceso a denuncias puede ver el dashboard
  },
  {
    label: "Reclamos",
    href: "/auditor/claims",
    icon: FileText,
    permission: "denuncias:ver",
  },
  {
    label: "Usuarios",
    href: "/auditor/users",
    icon: Users,
    permission: "usuarios:ver",
    submenu: [
      { label: "Lista de Usuarios", href: "/auditor/users", permission: "usuarios:ver" },
      { label: "Roles y Permisos", href: "/auditor/users/roles", permission: "roles:ver" },
    ],
  },
  {
    label: "Empresas",
    href: "/auditor/companies",
    icon: Building2,
    permission: "empresas:ver",
  },
  {
    label: "Reportes",
    href: "/auditor/reports",
    icon: BarChart3,
    permission: "reportes:ver",
  },
  {
    label: "Auditoría",
    href: "/auditor/audit",
    icon: Shield,
    permission: "auditoria:ver",
  },
  {
    label: "Configuración",
    href: "/auditor/settings",
    icon: Settings,
    permission: "configuracion:ver",
  },
];

export default menuItems;
