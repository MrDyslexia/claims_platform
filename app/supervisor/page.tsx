"use client";

import { Card, CardBody, Button, Chip } from "@heroui/react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  User,
} from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/lib/auth/auth-context";
import { mockClaims, getClaimWithRelations } from "@/lib/data";

export default function SupervisorDashboard() {
  const { user } = useAuth();

  // Validar que el usuario esté cargado
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-default-500">Cargando...</p>
      </div>
    );
  }

  // Filter claims for supervisor's company
  const companyClaims = mockClaims.filter(
    (c) => c.id_empresa === user.empresa_id,
  );
  const assignedClaims = companyClaims.filter(
    (c) => c.asignado_a === user.id_usuario,
  );

  const pendingClaims = assignedClaims.filter((c) => c.id_estado === 1); // pendiente
  const inProgressClaims = assignedClaims.filter((c) => c.id_estado === 2); // en_revision
  const resolvedClaims = assignedClaims.filter((c) => c.id_estado === 4); // resuelto
  const criticalClaims = assignedClaims.filter((c) => c.prioridad === "alta");

  const recentClaims = assignedClaims
    .slice(0, 5)
    .map((claim) => getClaimWithRelations(claim.id_denuncia))
    .filter((claim) => claim !== null); // Filtrar nulls

  const getStatusColor = (estadoId: number) => {
    switch (estadoId) {
      case 1: // pendiente
        return "warning";
      case 2: // en_revision
        return "primary";
      case 4: // resuelto
        return "success";
      case 5: // cerrado
        return "default";
      default:
        return "default";
    }
  };

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
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Dashboard Supervisor
        </h1>
        <p className="text-default-500">
          Gestión de reclamos
          {user.empresa?.nombre ? ` de ${user.empresa.nombre}` : ""}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-orange-500/10">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <div>
              <p className="text-default-500 text-sm mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-foreground">
                {pendingClaims.length}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div>
              <p className="text-default-500 text-sm mb-1">En Revisión</p>
              <p className="text-3xl font-bold text-foreground">
                {inProgressClaims.length}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div>
              <p className="text-default-500 text-sm mb-1">Resueltos</p>
              <p className="text-3xl font-bold text-foreground">
                {resolvedClaims.length}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-red-500/10">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <div>
              <p className="text-default-500 text-sm mb-1">Críticos</p>
              <p className="text-3xl font-bold text-foreground">
                {criticalClaims.length}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Claims */}
      <Card className="border-none shadow-sm">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Reclamos Recientes
              </h3>
              <p className="text-sm text-default-500">
                Últimos reclamos asignados a ti
              </p>
            </div>
            <Button
              as={Link}
              color="primary"
              href="/supervisor/claims"
              variant="flat"
            >
              Ver Todos
            </Button>
          </div>

          <div className="space-y-4">
            {recentClaims.length === 0 ? (
              <p className="text-center text-default-500 py-8">
                No hay reclamos asignados
              </p>
            ) : (
              recentClaims.map((claim) => (
                <Link
                  key={claim.id_denuncia}
                  className="block p-4 rounded-lg border border-divider hover:border-primary transition-colors"
                  href={`/supervisor/claims/${claim.id_denuncia}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-default-500">
                          {claim.codigo_acceso}
                        </span>
                        <Chip
                          color={getStatusColor(claim.id_estado)}
                          size="sm"
                          variant="flat"
                        >
                          {claim.estadoObj?.nombre || "Pendiente"}
                        </Chip>
                        <Chip
                          color={getPriorityColor(claim.prioridad)}
                          size="sm"
                          variant="flat"
                        >
                          {claim.prioridad}
                        </Chip>
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {claim.tipo?.nombre || "Sin tipo"}
                      </h4>
                      <p className="text-sm text-default-500 line-clamp-2">
                        {claim.descripcion}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-default-400">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>
                            {claim.anonimo
                              ? "Anónimo"
                              : claim.nombre_denunciante || "Sin nombre"}
                          </span>
                        </div>
                        <span>•</span>
                        <span>
                          {new Date(claim.fecha_creacion).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <FileText className="w-5 h-5 text-default-400" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <CardBody className="p-6">
            <Clock className="w-8 h-8 text-orange-500 mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              Reclamos Pendientes
            </h3>
            <p className="text-sm text-default-500 mb-4">
              Revisa y comienza a trabajar en reclamos pendientes
            </p>
            <Button
              fullWidth
              as={Link}
              color="warning"
              href="/supervisor/pending"
              variant="flat"
            >
              Ver Pendientes
            </Button>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardBody className="p-6">
            <FileText className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              Todos los Reclamos
            </h3>
            <p className="text-sm text-default-500 mb-4">
              Accede a todos tus reclamos asignados
            </p>
            <Button
              fullWidth
              as={Link}
              color="primary"
              href="/supervisor/claims"
              variant="flat"
            >
              Ver Todos
            </Button>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardBody className="p-6">
            <CheckCircle2 className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              Reclamos Resueltos
            </h3>
            <p className="text-sm text-default-500 mb-4">
              Revisa el historial de reclamos resueltos
            </p>
            <Button
              fullWidth
              as={Link}
              color="success"
              href="/supervisor/resolved"
              variant="flat"
            >
              Ver Resueltos
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
