// components/login-drawer.tsx
"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const { login, isLoading, getRoleRoute } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor complete todos los campos");

      return;
    }

    try {
      const authenticatedUser = await login(email, password);
      const route = getRoleRoute(authenticatedUser.roles);

      onOpenChange(false);

      // Limpiar el formulario
      setEmail("");
      setPassword("");
      setError("");

      // Navegar a la ruta correspondiente
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
      } else if (errorMessage.includes("User is inactive")) {
        setError(
          "Su cuenta está inactiva. Contacte al administrador para restaurar el acceso.",
        );
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
