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
    permission: "view_dashboard",
  },
  {
    label: "Reclamos",
    href: "/auditor/claims",
    icon: FileText,
    permission: "view_claims",
  },
  {
    label: "Usuarios",
    href: "/auditor/users",
    icon: Users,
    permission: "manage_users",
    submenu: [
      { label: "Lista de Usuarios", href: "/auditor/users" },
      { label: "Roles y Permisos", href: "/auditor/users/roles" },
    ],
  },
  {
    label: "Empresas",
    href: "/auditor/companies",
    icon: Building2,
    permission: "manage_companies",
  },
  {
    label: "Reportes",
    href: "/auditor/reports",
    icon: BarChart3,
    permission: "view_reports",
  },
  {
    label: "Auditororía",
    href: "/auditor/audit",
    icon: Shield,
    permission: "view_audit",
  },
  {
    label: "Configuración",
    href: "/auditor/settings",
    icon: Settings,
    permission: "manage_settings",
  },

];

export default menuItems;
