"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
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
import { mockClaims } from "@/lib/data";

export default function AnalystDashboard() {
  const { user } = useAuth();

  const companyClaims = mockClaims.filter(
    (c) => c.empresa_id === user?.empresa_id,
  );

  const totalClaims = companyClaims.length;
  const pendingClaims = companyClaims.filter(
    (c) => c.estado === "pendiente",
  ).length;
  const resolvedClaims = companyClaims.filter(
    (c) => c.estado === "resuelto",
  ).length;
  const inProgressClaims = companyClaims.filter(
    (c) => c.estado === "en_revision",
  ).length;

  const avgResolutionTime = 4.2; // días promedio
  const resolutionRate = ((resolvedClaims / totalClaims) * 100).toFixed(1);

  const monthlyData = [
    { mes: "Ene", reclamos: 12, resueltos: 10 },
    { mes: "Feb", reclamos: 19, resueltos: 15 },
    { mes: "Mar", reclamos: 15, resueltos: 13 },
    { mes: "Abr", reclamos: 22, resueltos: 18 },
    { mes: "May", reclamos: 18, resueltos: 16 },
    { mes: "Jun", reclamos: 25, resueltos: 20 },
  ];

  const claimsByType = [
    { tipo: "Producto", cantidad: 45, color: "#3b82f6" },
    { tipo: "Servicio", cantidad: 32, color: "#8b5cf6" },
    { tipo: "Facturación", cantidad: 28, color: "#ec4899" },
    { tipo: "Entrega", cantidad: 20, color: "#f59e0b" },
  ];

  const claimsByStatus = [
    { estado: "Pendiente", cantidad: pendingClaims, color: "#f59e0b" },
    { estado: "En Revisión", cantidad: inProgressClaims, color: "#3b82f6" },
    { estado: "Resuelto", cantidad: resolvedClaims, color: "#10b981" },
  ];

  const kpiCards = [
    {
      title: "Total Reclamos",
      value: totalClaims,
      change: "+12%",
      trend: "up",
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Pendientes",
      value: pendingClaims,
      change: "-5%",
      trend: "down",
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Resueltos",
      value: resolvedClaims,
      change: "+18%",
      trend: "up",
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Tasa Resolución",
      value: `${resolutionRate}%`,
      change: "+3%",
      trend: "up",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

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
                    className={`flex items-center gap-1 text-sm ${kpi.trend === "up" ? "text-success" : "text-danger"}`}
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
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold">Tendencia Mensual</h3>
            <p className="text-sm text-default-500">
              Reclamos recibidos vs resueltos
            </p>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer height={300} width="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="mes" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  dataKey="reclamos"
                  name="Recibidos"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  type="monotone"
                />
                <Line
                  dataKey="resueltos"
                  name="Resueltos"
                  stroke="#10b981"
                  strokeWidth={2}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Claims by Type */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold">Reclamos por Tipo</h3>
            <p className="text-sm text-default-500">
              Distribución de categorías
            </p>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer height={300} width="100%">
              <BarChart data={claimsByType}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="tipo" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="cantidad" name="Cantidad">
                  {claimsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold">Estado de Reclamos</h3>
            <p className="text-sm text-default-500">Distribución actual</p>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer height={250} width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={claimsByStatus}
                  dataKey="cantidad"
                  fill="#8884d8"
                  label={({
                    estado,
                    percent,
                  }: {
                    estado: string;
                    percent: number;
                  }) => `${estado} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  outerRadius={80}
                >
                  {claimsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Key Metrics */}
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold">Métricas Clave</h3>
            <p className="text-sm text-default-500">
              Indicadores de rendimiento
            </p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-default-500 mb-1">
                    Tiempo Promedio de Resolución
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {avgResolutionTime} días
                  </p>
                  <div className="flex items-center gap-1 text-sm text-success mt-1">
                    <TrendingDown className="w-4 h-4" />
                    <span>-0.8 días vs mes anterior</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-default-500 mb-1">
                    Satisfacción del Cliente
                  </p>
                  <p className="text-2xl font-bold text-foreground">4.6/5.0</p>
                  <div className="flex items-center gap-1 text-sm text-success mt-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>+0.3 vs mes anterior</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-default-500 mb-1">
                    Reclamos Críticos
                  </p>
                  <p className="text-2xl font-bold text-danger">3</p>
                  <div className="flex items-center gap-1 text-sm text-default-500 mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Requieren atención inmediata</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-default-500 mb-1">
                    Tasa de Reincidencia
                  </p>
                  <p className="text-2xl font-bold text-foreground">8.2%</p>
                  <div className="flex items-center gap-1 text-sm text-success mt-1">
                    <TrendingDown className="w-4 h-4" />
                    <span>-2.1% vs mes anterior</span>
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
