"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Card } from "@heroui/react";
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  Clock,
  Building2,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";

export function SupervisorSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      label: "Dashboard",
      href: "/supervisor",
      icon: LayoutDashboard,
    },
    {
      label: "Mis Reclamos",
      href: "/supervisor/claims",
      icon: FileText,
    },
    {
      label: "Pendientes",
      href: "/supervisor/pending",
      icon: Clock,
    },
    {
      label: "Resueltos",
      href: "/supervisor/resolved",
      icon: CheckCircle2,
    },
  ];

  return (
    <aside className="w-64 border-r border-divider bg-content1 flex flex-col">
      <div className="p-6 border-b border-divider">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary" />
          <div>
            <h2 className="font-semibold text-foreground">Panel Supervisor</h2>
            <p className="text-xs text-default-500">{user?.empresa?.nombre}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-default-700 hover:bg-default-100"
              }`}
              href={item.href}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-divider">
        <Card className="p-4 bg-default-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold">
                {user?.nombre?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.nombre}</p>
              <p className="text-xs text-default-500">Supervisor</p>
            </div>
          </div>
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </Card>
      </div>
    </aside>
  );
}
