// components/login-drawer.tsx
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
} from "@heroui/react";
import { Mail, Lock, AlertCircle, Shield } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import { FormInput } from "@/components/form-input";

interface LoginDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginDrawer({
  isOpen,
  onOpenChange,
}: LoginDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { login, isLoading, getPrimaryRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [targetRoute, setTargetRoute] = useState<string | null>(null);

  // Efecto para cerrar el drawer cuando la ruta cambie a la ruta objetivo
  useEffect(() => {
    if (targetRoute && pathname === targetRoute) {
      onOpenChange(false);
      setTargetRoute(null);
    }
  }, [pathname, targetRoute, onOpenChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor complete todos los campos");

      return;
    }

    try {
      await login(email, password);

      const role = getPrimaryRole();

      // Determinar la ruta correspondiente según el rol
      let route = "/";

      switch (role) {
        case "admin":
          route = "/admin";
          break;
        case "analista":
          route = "/analyst";
          break;
        case "supervisor":
          route = "/supervisor";
          break;
        default:
          route = "/";
      }

      // Guardar la ruta objetivo para monitorearla
      setTargetRoute(route);

      // Realizar la navegación
      router.push(route);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al iniciar sesión";

      if (errorMessage.includes("Failed to fetch")) {
        setError(
          "No se pudo conectar con el servidor. Verifique que el backend esté ejecutándose.",
        );
      } else if (errorMessage.includes("invalid credentials")) {
        setError("Credenciales inválidas. Verifique su email y contraseña.");
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Drawer
      isOpen={isOpen}
      motionProps={{
        variants: {
          enter: {
            opacity: 1,
            x: 0,
          },
          exit: {
            x: 100,
            opacity: 0,
          },
        },
        transition: {
          duration: 0.3,
        },
      }}
      onOpenChange={onOpenChange}
    >
      <DrawerContent>
        {(_onClose) => (
          <>
            <DrawerHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold">Sistema de Reclamos</h1>
                  <p className="text-sm text-muted-foreground">
                    Acceso al Sistema
                  </p>
                </div>
              </div>
            </DrawerHeader>
            <DrawerBody>
              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                <FormInput
                  isRequired
                  autoComplete="email"
                  id="email"
                  label="Correo Electrónico"
                  placeholder="Ingresa tu correo"
                  startContent={<Mail className="h-4 w-4 text-default-400" />}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <FormInput
                  isRequired
                  autoComplete="current-password"
                  id="password"
                  label="Contraseña"
                  placeholder="Ingresa tu contraseña"
                  startContent={<Lock className="h-4 w-4 text-default-400" />}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                  className="w-full"
                  color="primary"
                  isLoading={isLoading}
                  size="lg"
                  type="submit"
                >
                  Iniciar Sesión
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Credenciales de prueba:
                </p>
                <div className="space-y-1 text-xs">
                  <p className="font-mono bg-default-100 p-2 rounded">
                    <strong>Admin:</strong> admin@example.com
                  </p>
                  <p className="font-mono bg-default-100 p-2 rounded">
                    <strong>Analista:</strong> analista@example.com
                  </p>
                  <p className="font-mono bg-default-100 p-2 rounded">
                    <strong>Supervisor:</strong> supervisor@example.com
                  </p>
                  <p className="text-default-400 mt-2">
                    Contraseña: cualquiera
                  </p>
                </div>
              </div>
            </DrawerBody>
            <DrawerFooter>
              <Button color="danger" variant="light" onPress={handleClose}>
                Cerrar
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
