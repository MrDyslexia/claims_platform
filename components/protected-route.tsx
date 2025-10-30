"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/react";

import { useAuth } from "@/lib/auth/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  allowedRoles?: string[];
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="text-muted-foreground mt-2">
            No tienes permisos para acceder a esta página
          </p>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="text-muted-foreground mt-2">
            No tienes el rol necesario para acceder a esta página
          </p>
        </div>
      </div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some((role) => hasRole(role));

    if (!hasAllowedRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
            <p className="text-muted-foreground mt-2">
              No tienes el rol necesario para acceder a esta página
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
