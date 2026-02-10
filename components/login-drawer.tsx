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
import { Mail, Lock, AlertCircle, Shield, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import { authAPI } from "@/lib/auth/api";
import { FormInput } from "@/components/form-input";

type DrawerView = "login" | "forgot" | "reset";

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

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // View state
  const [view, setView] = useState<DrawerView>("login");

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");

  // Reset password state
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

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

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");

    if (!forgotEmail) {
      setForgotError("Por favor ingrese su correo electrónico.");
      return;
    }

    setForgotLoading(true);
    try {
      await authAPI.forgotPassword(forgotEmail);
      // Navigate to reset view
      setView("reset");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al solicitar código";
      setForgotError(errorMessage);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    if (!resetCode || !newPassword || !confirmPassword) {
      setResetError("Por favor complete todos los campos.");
      return;
    }

    if (newPassword.length < 6) {
      setResetError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Las contraseñas no coinciden.");
      return;
    }

    setResetLoading(true);
    try {
      await authAPI.resetPassword(forgotEmail, resetCode, newPassword);
      setResetSuccess(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al restablecer contraseña";
      setResetError(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setView("login");
    setForgotEmail("");
    setForgotError("");
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
    setResetSuccess(false);
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setError("");
    handleBackToLogin();
    onOpenChange(false);
  };

  const renderLoginView = () => (
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

      <div className="text-center">
        <button
          className="text-sm text-primary hover:underline cursor-pointer"
          type="button"
          onClick={() => {
            setError("");
            setView("forgot");
          }}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    </form>
  );

  const renderForgotView = () => (
    <form className="space-y-4" onSubmit={handleForgotSubmit}>
      <div className="text-center mb-2">
        <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
          <KeyRound className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-sm text-default-500">
          Ingrese su correo electrónico y le enviaremos un código de verificación para restablecer su contraseña.
        </p>
      </div>

      {forgotError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">
            {forgotError}
          </p>
        </div>
      )}

      <FormInput
        isRequired
        autoComplete="email"
        id="forgot-email"
        label="Correo Electrónico"
        placeholder="Ingresa tu correo"
        startContent={<Mail className="h-4 w-4 text-default-400" />}
        type="email"
        value={forgotEmail}
        onChange={(e) => setForgotEmail(e.target.value)}
      />

      <Button
        className="w-full"
        color="primary"
        isLoading={forgotLoading}
        size="lg"
        type="submit"
      >
        Enviar Código
      </Button>

      <div className="text-center">
        <button
          className="text-sm text-default-500 hover:text-primary flex items-center justify-center gap-1 mx-auto cursor-pointer"
          type="button"
          onClick={handleBackToLogin}
        >
          <ArrowLeft className="h-3 w-3" />
          Volver al inicio de sesión
        </button>
      </div>
    </form>
  );

  const renderResetView = () => {
    if (resetSuccess) {
      return (
        <div className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
            ¡Contraseña restablecida!
          </h3>
          <p className="text-sm text-default-500">
            Su contraseña ha sido restablecida exitosamente. Ya puede iniciar sesión con su nueva contraseña.
          </p>
          <Button
            className="w-full"
            color="primary"
            size="lg"
            onPress={handleBackToLogin}
          >
            Ir al Inicio de Sesión
          </Button>
        </div>
      );
    }

    return (
      <form className="space-y-4" onSubmit={handleResetSubmit}>
        <div className="text-center mb-2">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm text-default-500">
            Ingrese el código de 6 dígitos enviado a <strong>{forgotEmail}</strong> y su nueva contraseña.
          </p>
        </div>

        {resetError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">
              {resetError}
            </p>
          </div>
        )}

        <FormInput
          isRequired
          id="reset-code"
          label="Código de Verificación"
          placeholder="Ingresa el código de 6 dígitos"
          startContent={<KeyRound className="h-4 w-4 text-default-400" />}
          type="text"
          value={resetCode}
          maxLength={6}
          onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />

        <FormInput
          isRequired
          autoComplete="new-password"
          id="new-password"
          label="Nueva Contraseña"
          placeholder="Mínimo 6 caracteres"
          startContent={<Lock className="h-4 w-4 text-default-400" />}
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <FormInput
          isRequired
          autoComplete="new-password"
          id="confirm-password"
          label="Confirmar Contraseña"
          placeholder="Repita la contraseña"
          startContent={<Lock className="h-4 w-4 text-default-400" />}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button
          className="w-full"
          color="primary"
          isLoading={resetLoading}
          size="lg"
          type="submit"
        >
          Restablecer Contraseña
        </Button>

        <div className="text-center">
          <button
            className="text-sm text-default-500 hover:text-primary flex items-center justify-center gap-1 mx-auto cursor-pointer"
            type="button"
            onClick={handleBackToLogin}
          >
            <ArrowLeft className="h-3 w-3" />
            Volver al inicio de sesión
          </button>
        </div>
      </form>
    );
  };

  const getHeaderTitle = () => {
    switch (view) {
      case "forgot":
        return "Recuperar Contraseña";
      case "reset":
        return resetSuccess ? "¡Éxito!" : "Restablecer Contraseña";
      default:
        return "Sistema de Reclamos";
    }
  };

  const getHeaderSubtitle = () => {
    switch (view) {
      case "forgot":
        return "Solicitar código de verificación";
      case "reset":
        return resetSuccess ? "" : "Ingrese el código y nueva contraseña";
      default:
        return "Acceso al Sistema";
    }
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
                  <h1 className="text-xl font-bold">{getHeaderTitle()}</h1>
                  {getHeaderSubtitle() && (
                    <p className="text-sm text-muted-foreground">
                      {getHeaderSubtitle()}
                    </p>
                  )}
                </div>
              </div>
            </DrawerHeader>
            <DrawerBody>
              {view === "login" && renderLoginView()}
              {view === "forgot" && renderForgotView()}
              {view === "reset" && renderResetView()}
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
