"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button, Divider, Avatar, Chip, Image } from "@heroui/react";
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  Clock,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";

export function SupervisorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
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

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="flex flex-col h-full bg-[#202E5E] text-white border-r border-[#2a3a6e]">
      {/* Header */}
      <div className="p-4 border-b border-[#2a3a6e]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Image
              alt="Logo Belator"
              className="h-10 w-auto object-contain filter brightness-0 invert"
              src="/icon.svg"
            />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">Supervisor</h2>
            <p className="text-xs text-white/60">Sistema de Reclamos</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-[#2a3a6e]">
        <div className="flex items-center gap-3">
          <Avatar
            className="bg-white/20 text-white"
            name={`${user?.nombre} ${user?.apellido}`}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-white">
              {user?.nombre} {user?.apellido}
            </p>
            <p className="text-xs text-white/60 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <Chip
            classNames={{
              base: "bg-white/10 border-white/20",
              content: "text-white text-xs",
            }}
            size="sm"
            variant="flat"
          >
            Supervisor
          </Chip>
          {user?.empresa?.nombre && (
            <Chip
              classNames={{
                base: "bg-white/10 border-white/20",
                content: "text-white text-xs",
              }}
              size="sm"
              variant="flat"
            >
              {user.empresa.nombre}
            </Chip>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Button
                key={item.href}
                className={`w-full justify-start ${
                  isActive
                    ? "bg-white/20 text-white font-semibold"
                    : "bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
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
            );
          })}
        </div>
      </nav>

      <Divider className="bg-[#2a3a6e]" />

      {/* Logout */}
      <div className="p-2">
        <Button
          className="w-full justify-start text-white hover:text-red-200 hover:bg-red-500/20"
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
