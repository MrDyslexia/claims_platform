"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button, Divider, Avatar, Chip } from "@heroui/react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Settings,
  BarChart3,
  Shield,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    permission: "view_dashboard",
  },
  {
    label: "Reclamos",
    href: "/admin/claims",
    icon: FileText,
    permission: "view_claims",
  },
  {
    label: "Usuarios",
    href: "/admin/users",
    icon: Users,
    permission: "manage_users",
    submenu: [
      { label: "Lista de Usuarios", href: "/admin/users" },
      { label: "Roles y Permisos", href: "/admin/users/roles" },
    ],
  },
  {
    label: "Empresas",
    href: "/admin/companies",
    icon: Building2,
    permission: "manage_companies",
  },
  {
    label: "Reportes",
    href: "/admin/reports",
    icon: BarChart3,
    permission: "view_reports",
  },
  {
    label: "Auditoría",
    href: "/admin/audit",
    icon: Shield,
    permission: "view_audit",
  },
  {
    label: "Configuración",
    href: "/admin/settings",
    icon: Settings,
    permission: "manage_settings",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hasPermission } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-full bg-default-50 dark:bg-default-100/50 border-r border-divider">
      {/* Header */}
      <div className="p-4 border-b border-divider">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">Sistema de Reclamos</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-divider">
        <div className="flex items-center gap-3">
          <Avatar
            className="bg-purple-600 text-white"
            name={`${user?.nombre} ${user?.apellido}`}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.nombre} {user?.apellido}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        {user?.roles && user.roles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {user.roles.map((role) => (
              <Chip
                key={role.id_rol}
                color="secondary"
                size="sm"
                variant="flat"
              >
                {role.nombre}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.submenu &&
                item.submenu.some((sub) => pathname === sub.href));
            const hasAccess =
              !item.permission || hasPermission(item.permission);

            if (!hasAccess) return null;

            return (
              <div key={item.href}>
                <Button
                  className={`w-full justify-start ${
                    isActive
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold"
                      : "bg-transparent hover:bg-default-100"
                  }`}
                  endContent={
                    isActive ? <ChevronRight className="h-4 w-4" /> : null
                  }
                  startContent={<Icon className="h-4 w-4" />}
                  variant="light"
                  onPress={() => router.push(item.href)}
                >
                  {item.label}
                </Button>
                {item.submenu && isActive && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Button
                        key={subItem.href}
                        className={`w-full justify-start text-sm ${
                          pathname === subItem.href
                            ? "text-purple-700 dark:text-purple-300 font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        size="sm"
                        variant="light"
                        onPress={() => router.push(subItem.href)}
                      >
                        {subItem.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <Divider />

      {/* Logout */}
      <div className="p-2">
        <Button
          className="w-full justify-start text-red-600 dark:text-red-400"
          startContent={<LogOut className="h-4 w-4" />}
          variant="light"
          onPress={handleLogout}
        >
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
