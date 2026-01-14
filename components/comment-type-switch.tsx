"use client";

import { Switch } from "@heroui/react";
import { Lock, Globe } from "lucide-react";

interface CommentTypeSwitchProps {
  isInternal: boolean;
  onValueChange: (value: boolean) => void;
  isDisabled?: boolean;
}

/**
 * Componente estandarizado para el switch de tipo de comentario (Interno/Público)
 * Usado en las vistas de admin, supervisor y auditor
 *
 * - Interno (amarillo/warning): Comentarios visibles solo para el equipo interno
 * - Público (azul/primary): Comentarios visibles para el denunciante
 */
export function CommentTypeSwitch({
  isInternal,
  onValueChange,
  isDisabled = false,
}: CommentTypeSwitchProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-sm transition-colors ${
          !isInternal ? "text-primary" : "text-default-500"
        }`}
      >
        <Globe className="inline-block h-3 w-3 mr-1" />
        Público
      </span>
      <Switch
        classNames={{
          wrapper: isInternal ? "bg-warning" : "bg-primary",
        }}
        color={isInternal ? "warning" : "primary"}
        endContent={<Lock className="h-3 w-3" />}
        isDisabled={isDisabled}
        isSelected={isInternal}
        size="sm"
        startContent={<Globe className="h-3 w-3" />}
        onValueChange={onValueChange}
      />
      <span
        className={`text-sm transition-colors ${
          isInternal ? "text-warning " : "text-default-500"
        }`}
      >
        <Lock className="inline-block h-3 w-3 mr-1" />
        Interno
      </span>
    </div>
  );
}
