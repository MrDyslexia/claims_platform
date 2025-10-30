"use client";

import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Progress,
  Accordion,
  AccordionItem,
  Avatar,
} from "@heroui/react";
import {
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Users,
  Building2,
} from "lucide-react";

import {
  mockClaims,
  getClaimTypeById,
  getClaimStatusById,
  getCompanyById,
} from "@/lib/data";

// Mock data for dashboard
const stats = [
  {
    title: "Total Reclamos",
    value: "1,234",
    change: "+12%",
    trend: "up",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "En Proceso",
    value: "45",
    change: "+5%",
    trend: "up",
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    title: "Resueltos",
    value: "1,089",
    change: "+18%",
    trend: "up",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    title: "Críticos",
    value: "8",
    change: "-3%",
    trend: "down",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
];

const priorityColors = {
  baja: "default",
  media: "warning",
  alta: "danger",
  critica: "danger",
} as const;

const priorityIconColors = {
  baja: "success",
  media: "warning",
  alta: "danger",
  critica: "danger",
} as const;

export default function AdminDashboard() {
  const recentClaims = mockClaims
    .sort((a, b) => b.fecha_creacion.getTime() - a.fecha_creacion.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Resumen general del sistema de reclamos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title}>
              <CardBody className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp
                        className={`h-3 w-3 ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}
                      />
                      <span
                        className={`text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}
                      >
                        {stat.change} vs mes anterior
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Claims */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <h2 className="text-xl font-semibold">Reclamos Recientes</h2>
                <p className="text-sm text-muted-foreground">
                  Últimos reclamos ingresados al sistema
                </p>
              </div>
              <Chip color="primary" variant="flat">
                {recentClaims.length} nuevos
              </Chip>
            </div>
          </CardHeader>
          <CardBody>
            <Accordion selectionMode="multiple" variant="splitted">
              {recentClaims.map((claim) => {
                const tipo = getClaimTypeById(claim.id_tipo);
                const estado = getClaimStatusById(claim.id_estado);
                const empresa = getCompanyById(claim.id_empresa);

                return (
                  <AccordionItem
                    key={claim.id_denuncia}
                    aria-label={`Reclamo ${claim.codigo_acceso}`}
                    startContent={
                      <Avatar
                        isBordered
                        classNames={{
                          base: "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30",
                          icon: "text-purple-600 dark:text-purple-400",
                        }}
                        color={priorityIconColors[claim.prioridad]}
                        icon={<FileText className="h-5 w-5" />}
                        radius="lg"
                      />
                    }
                    subtitle={
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {tipo?.nombre || "Sin tipo"}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <Chip
                          color={priorityColors[claim.prioridad]}
                          size="sm"
                          variant="flat"
                        >
                          {claim.prioridad}
                        </Chip>
                        <Chip size="sm" variant="bordered">
                          {estado?.nombre || "Sin estado"}
                        </Chip>
                      </div>
                    }
                    title={
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {claim.codigo_acceso}
                        </span>
                      </div>
                    }
                  >
                    <div className="space-y-3 px-1 pb-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Descripción
                        </p>
                        <p className="text-sm">{claim.descripcion}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Empresa
                          </p>
                          <p className="text-sm">
                            {empresa?.nombre || "Sin empresa"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Fecha de Creación
                          </p>
                          <p className="text-sm">
                            {claim.fecha_creacion.toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {claim.nombre_denunciante && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Denunciante
                          </p>
                          <p className="text-sm">{claim.nombre_denunciante}</p>
                          {claim.email_denunciante && (
                            <p className="text-xs text-muted-foreground">
                              {claim.email_denunciante}
                            </p>
                          )}
                        </div>
                      )}

                      {claim.es_anonimo && (
                        <Chip color="default" size="sm" variant="flat">
                          Denuncia Anónima
                        </Chip>
                      )}
                    </div>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Distribución por Estado</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Nuevos</span>
                  <span className="font-medium">15%</span>
                </div>
                <Progress color="primary" size="sm" value={15} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>En Proceso</span>
                  <span className="font-medium">35%</span>
                </div>
                <Progress color="warning" size="sm" value={35} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Resueltos</span>
                  <span className="font-medium">45%</span>
                </div>
                <Progress color="success" size="sm" value={45} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Cerrados</span>
                  <span className="font-medium">5%</span>
                </div>
                <Progress color="default" size="sm" value={5} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Métricas Rápidas</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Usuarios Activos</span>
                </div>
                <span className="font-semibold">24</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Empresas</span>
                </div>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Tiempo Prom. Resolución</span>
                </div>
                <span className="font-semibold">5.2 días</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
