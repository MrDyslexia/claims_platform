"use client";

import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/lib/auth/auth-context";
import { mockClaims, getClaimWithRelations } from "@/lib/data";

export default function SupervisorPending() {
  const { user } = useAuth();

  // Validar que el usuario esté cargado
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-default-500">Cargando...</p>
      </div>
    );
  }

  const pendingClaims = mockClaims
    .filter(
      (c) =>
        c.id_empresa === user.empresa_id &&
        c.asignado_a === user.id_usuario &&
        c.id_estado === 1, // pendiente
    )
    .map((claim) => getClaimWithRelations(claim.id_denuncia))
    .filter((claim) => claim !== null); // Filtrar nulls

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
      case "critica":
        return "danger";
      case "media":
        return "warning";
      case "baja":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-orange-500/10">
          <Clock className="w-8 h-8 text-orange-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Reclamos Pendientes
          </h1>
          <p className="text-default-500">
            {pendingClaims.length} reclamos esperando tu atención
          </p>
        </div>
      </div>

      {/* Pending Claims */}
      {pendingClaims.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardBody className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              ¡Todo al día!
            </h3>
            <p className="text-default-500">
              No tienes reclamos pendientes en este momento.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingClaims.map((claim) => (
            <Card
              key={claim.id_denuncia}
              className="border-none shadow-sm hover:shadow-md transition-shadow"
            >
              <CardBody className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-orange-500/10">
                    <AlertCircle className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm text-default-500">
                        {claim.codigo_acceso}
                      </span>
                      <Chip
                        color={getPriorityColor(claim.prioridad)}
                        size="sm"
                        variant="flat"
                      >
                        {claim.prioridad}
                      </Chip>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {claim.tipo?.nombre || "Sin tipo"}
                    </h3>
                    <p className="text-sm text-default-500 mb-3 line-clamp-2">
                      {claim.descripcion}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-default-400">
                      <span>
                        Denunciante:{" "}
                        {claim.anonimo
                          ? "Anónimo"
                          : claim.nombre_denunciante || "Sin nombre"}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(claim.fecha_creacion).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    as={Link}
                    color="primary"
                    href={`/supervisor/claims/${claim.id_denuncia}`}
                  >
                    Atender
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
