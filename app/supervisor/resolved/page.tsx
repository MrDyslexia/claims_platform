"use client";

import { Card, CardBody, Chip } from "@heroui/react";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/lib/auth/auth-context";
import { mockClaims, getClaimWithRelations } from "@/lib/data";

export default function SupervisorResolved() {
  const { user } = useAuth();

  // Validar que el usuario esté cargado
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-default-500">Cargando...</p>
      </div>
    );
  }

  const resolvedClaims = mockClaims
    .filter(
      (c) =>
        c.id_empresa === user.empresa_id &&
        c.asignado_a === user.id_usuario &&
        c.id_estado === 4, // resuelto
    )
    .map((claim) => getClaimWithRelations(claim.id_denuncia))
    .filter((claim) => claim !== null); // Filtrar nulls

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-green-500/10">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Reclamos Resueltos
          </h1>
          <p className="text-default-500">
            {resolvedClaims.length} reclamos completados
          </p>
        </div>
      </div>

      {/* Resolved Claims */}
      <div className="grid grid-cols-1 gap-4">
        {resolvedClaims.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardBody className="p-12 text-center">
              <p className="text-default-500">No hay reclamos resueltos</p>
            </CardBody>
          </Card>
        ) : (
          resolvedClaims.map((claim) => (
            <Link
              key={claim.id_denuncia}
              href={`/supervisor/claims/${claim.id_denuncia}`}
            >
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-green-500/10">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-default-500">
                          {claim.codigo_acceso}
                        </span>
                        <Chip color="success" size="sm" variant="flat">
                          Resuelto
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
                          Resuelto:{" "}
                          {new Date(
                            claim.fecha_actualizacion,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
