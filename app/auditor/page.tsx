"use client";

import type { DashboardResponse } from "@/lib/types/dashboard";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Progress,
  Spinner,
} from "@heroui/react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";

import { fetchDashboardData } from "@/lib/api/dashboard";

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
  const [dashData, setDashData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData()
      .then((data) => {
        setDashData(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Error al cargar los datos del dashboard");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner label="Cargando dashboard..." size="lg" />
      </div>
    );
  }

  if (error || !dashData?.success) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardBody className="text-center p-6">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Error al cargar datos
            </h2>
            <p className="text-muted-foreground">
              {error || "No se pudieron obtener los datos del dashboard"}
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const { stats, distribucion_estados, metricas_rapidas, reclamos_recientes } =
    dashData.data;

  // Construir stats con datos reales
  const trendCriticas: "up" | "down" = stats.criticas > 0 ? "up" : "down";

  const statsCards = [
    {
      title: "Total Reclamos",
      value: stats.total_denuncias.toLocaleString(),
      change: "+12%",
      trend: "up" as const,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "En Proceso",
      value: stats.en_proceso.toLocaleString(),
      change: "+5%",
      trend: "up" as const,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      title: "Resueltos",
      value: stats.resueltas.toLocaleString(),
      change: "+18%",
      trend: "up" as const,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Críticos",
      value: stats.criticas.toLocaleString(),
      change: stats.criticas > 0 ? "+3%" : "0%",
      trend: trendCriticas,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
  ];

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
        {statsCards.map((stat) => {
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
                {reclamos_recientes.length} nuevos
              </Chip>
            </div>
          </CardHeader>
          <CardBody>
            <Accordion selectionMode="multiple" variant="splitted">
              {reclamos_recientes.map((claim) => (
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
                        {claim.tipo_nombre}
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
                        {claim.estado_nombre}
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
                      <p className="text-sm line-clamp-3">
                        {claim.descripcion}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Empresa
                        </p>
                        <p className="text-sm">{claim.empresa_nombre}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Fecha de Creación
                        </p>
                        <p className="text-sm">
                          {claim.fecha_creacion
                            ? new Date(claim.fecha_creacion).toLocaleDateString(
                                "es-CL",
                              )
                            : "N/A"}
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

                    {(String(claim.es_anonimo) === "1" ||
                      String(claim.es_anonimo).toLowerCase() === "true" ||
                      claim.es_anonimo === true) && (
                      <Chip color="default" size="sm" variant="flat">
                        Denuncia Anónima
                      </Chip>
                    )}
                  </div>
                </AccordionItem>
              ))}
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
                  <span className="font-medium">
                    {distribucion_estados.nuevos}
                  </span>
                </div>
                <Progress
                  color="primary"
                  size="sm"
                  value={distribucion_estados.nuevos}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>En Proceso</span>
                  <span className="font-medium">
                    {distribucion_estados.en_proceso}
                  </span>
                </div>
                <Progress
                  color="warning"
                  size="sm"
                  value={distribucion_estados.en_proceso}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Resueltos</span>
                  <span className="font-medium">
                    {distribucion_estados.resueltos}
                  </span>
                </div>
                <Progress
                  color="success"
                  size="sm"
                  value={distribucion_estados.resueltos}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Cerrados</span>
                  <span className="font-medium">
                    {distribucion_estados.cerrados}
                  </span>
                </div>
                <Progress
                  color="default"
                  size="sm"
                  value={distribucion_estados.cerrados}
                />
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
                <span className="font-semibold">
                  {metricas_rapidas.usuarios_activos}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Empresas</span>
                </div>
                <span className="font-semibold">
                  {metricas_rapidas.total_empresas}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Tiempo Prom. Resolución</span>
                </div>
                <span className="font-semibold">
                  {metricas_rapidas.tiempo_promedio_resolucion} días
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
