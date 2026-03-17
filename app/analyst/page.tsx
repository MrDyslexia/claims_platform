"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Divider, Spinner } from "@heroui/react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useAuth } from "@/lib/auth/auth-context";
import {
  fetchDashboardAnalista,
  type DashboardAnalistaResponse,
} from "@/lib/api/dashboard";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        <p className="text-popover-foreground font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p
            key={`item-${index}`}
            className="text-sm flex items-center gap-2"
            style={{ color: entry.color }}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-popover-foreground">
              {entry.name}: <strong>{entry.value}</strong>
            </span>
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const chartColors = {
  blue: "hsl(217, 91%, 60%)",
  green: "hsl(142, 71%, 45%)",
  purple: "hsl(262, 83%, 58%)",
  pink: "hsl(330, 81%, 60%)",
  orange: "hsl(38, 92%, 50%)",
  cyan: "hsl(189, 94%, 43%)",
  red: "hsl(0, 84%, 60%)",
  yellow: "hsl(48, 96%, 53%)",
};

const statusColors = [
  chartColors.orange,
  chartColors.blue,
  chartColors.green,
  chartColors.purple,
  chartColors.pink,
  chartColors.cyan,
];

export default function AnalystDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardAnalistaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardAnalista()
      .then((result) => {
        setData(result);
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

  if (error || !data) {
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

  const { global_kpis, monthly_data, claims_by_type, claims_by_status, key_metrics } = data;

  const kpiCards = [
    {
      title: "Total Reclamos",
      value: global_kpis.total_claims.value,
      change: global_kpis.total_claims.change,
      trend: global_kpis.total_claims.trend,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Pendientes",
      value: global_kpis.pending_claims.value,
      change: global_kpis.pending_claims.change,
      trend: global_kpis.pending_claims.trend,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Resueltos",
      value: global_kpis.resolved_claims.value,
      change: global_kpis.resolved_claims.change,
      trend: global_kpis.resolved_claims.trend,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Tasa Resolución",
      value: `${global_kpis.resolution_rate.value}%`,
      change: global_kpis.resolution_rate.change,
      trend: global_kpis.resolution_rate.trend,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  const claimsByStatusData = claims_by_status.map((item, index) => ({
    ...item,
    color: statusColors[index % statusColors.length],
  }));

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Dashboard de Análisis
        </h1>
        <p className="text-default-500">
          Métricas y KPIs de {user?.empresa?.nombre}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === "up" ? TrendingUp : TrendingDown;

          return (
            <Card key={kpi.title} className="border-none shadow-sm">
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${kpi.trend === "up" ? "text-success" : kpi.trend === "down" ? "text-danger" : "text-default-500"}`}
                  >
                    <TrendIcon className="w-4 h-4" />
                    <span>{kpi.change}</span>
                  </div>
                </div>
                <div>
                  <p className="text-default-500 text-sm mb-1">{kpi.title}</p>
                  <p className="text-3xl font-bold text-foreground">
                    {kpi.value}
                  </p>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-0 flex flex-col gap-1 items-start">
            <h3 className="text-lg font-semibold">Tendencia Mensual</h3>
            <p className="text-sm text-default-500">
              Reclamos recibidos vs resueltos
            </p>
            <Divider className="w-full mt-2" />
          </CardHeader>
          <CardBody>
            <ResponsiveContainer height={300} width="100%">
              <LineChart data={monthly_data}>
                <CartesianGrid
                  className="stroke-border"
                  opacity={0.3}
                  strokeDasharray="3 3"
                />
                <XAxis
                  className="text-muted-foreground"
                  dataKey="mes"
                  stroke="currentColor"
                />
                <YAxis
                  className="text-muted-foreground"
                  stroke="currentColor"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
                <Line
                  activeDot={{ r: 6 }}
                  dataKey="reclamos"
                  dot={{ fill: chartColors.blue, r: 4 }}
                  name="Recibidos"
                  stroke={chartColors.blue}
                  strokeWidth={3}
                  type="monotone"
                />
                <Line
                  activeDot={{ r: 6 }}
                  dataKey="resueltos"
                  dot={{ fill: chartColors.green, r: 4 }}
                  name="Resueltos"
                  stroke={chartColors.green}
                  strokeWidth={3}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Claims by Type */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-0 flex flex-col gap-1 items-start">
            <h3 className="text-lg font-semibold">Reclamos por Tipo</h3>
            <p className="text-sm text-default-500">
              Distribución de categorías
            </p>
            <Divider className="w-full mt-2" />
          </CardHeader>
          <CardBody>
            <ResponsiveContainer height={300} width="100%">
              <BarChart data={claims_by_type}>
                <CartesianGrid
                  className="stroke-border"
                  opacity={0.3}
                  strokeDasharray="3 3"
                />
                <XAxis
                  className="text-muted-foreground"
                  dataKey="tipo"
                  stroke="currentColor"
                />
                <YAxis
                  className="text-muted-foreground"
                  stroke="currentColor"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cantidad" name="Cantidad" radius={[8, 8, 0, 0]}>
                  {claims_by_type.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claims by Status Pie */}
        <Card className="border-none shadow-sm lg:col-span-1">
          <CardHeader className="pb-0 flex flex-col gap-1 items-start">
            <h3 className="text-lg font-semibold">Estado de Reclamos</h3>
            <p className="text-sm text-default-500">Distribución actual</p>
            <Divider className="w-full mt-2" />
          </CardHeader>
          <CardBody>
            <ResponsiveContainer height={250} width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={claimsByStatusData}
                  dataKey="cantidad"
                  fill="#8884d8"
                  label={(entry: any) => `${entry.estado}: ${entry.cantidad}`}
                  labelLine={true}
                  outerRadius={80}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                >
                  {claimsByStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Key Metrics */}
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader className="pb-0 flex flex-col gap-1 items-start">
            <h3 className="text-lg font-semibold">Métricas Clave</h3>
            <p className="text-sm text-default-500">
              Indicadores de rendimiento
            </p>
            <Divider className="w-full mt-2" />
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-default-500 mb-1">
                    Tiempo Promedio de Resolución
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {key_metrics.avg_resolution_time.value} días
                  </p>
                  <div className={`flex items-center gap-1 text-sm mt-1 ${key_metrics.avg_resolution_time.trend === "down" ? "text-success" : "text-danger"}`}>
                    {key_metrics.avg_resolution_time.trend === "down" ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : (
                      <TrendingUp className="w-4 h-4" />
                    )}
                    <span>{key_metrics.avg_resolution_time.change}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-default-500 mb-1">
                    Satisfacción del Cliente
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {key_metrics.customer_satisfaction.value}/5.0
                  </p>
                  <div className={`flex items-center gap-1 text-sm mt-1 ${key_metrics.customer_satisfaction.trend === "up" ? "text-success" : "text-danger"}`}>
                    {key_metrics.customer_satisfaction.trend === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{key_metrics.customer_satisfaction.change}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-default-500 mb-1">
                    Reclamos Críticos
                  </p>
                  <p className="text-2xl font-bold text-danger">
                    {key_metrics.critical_claims.value}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-default-500 mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{key_metrics.critical_claims.description}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-default-500 mb-1">
                    Tasa de Reincidencia
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {key_metrics.recurrence_rate.value}%
                  </p>
                  <div className={`flex items-center gap-1 text-sm mt-1 ${key_metrics.recurrence_rate.trend === "down" ? "text-success" : "text-danger"}`}>
                    {key_metrics.recurrence_rate.trend === "down" ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : (
                      <TrendingUp className="w-4 h-4" />
                    )}
                    <span>{key_metrics.recurrence_rate.change}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
