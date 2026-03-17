"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Spinner } from "@heroui/react";
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  fetchDashboardReports,
  type DashboardReportResponse,
} from "@/lib/api/dashboard";

const COLORS = ["#7928CA", "#0070F3", "#17C964", "#F5A524", "#F31260"];

export default function ReportsPage() {
  const [reportPeriod, setReportPeriod] = useState("monthly");
  const [activeTab, setActiveTab] = useState("executive");
  const [reportData, setReportData] = useState<DashboardReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReportData = async (period: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardReports(period);
      setReportData(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar los datos del reporte");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData(reportPeriod);
  }, [reportPeriod]);

  if (loading && !reportData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner label="Cargando reportes..." size="lg" />
      </div>
    );
  }

  if (error && !reportData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardBody className="text-center p-6">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error al cargar datos</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const summary = reportData?.summary;
  const claimsByMonth = reportData?.claimsByMonth || [];
  const claimsByType = reportData?.claimsByType || [];
  const claimsByCompany = reportData?.claimsByCompany || [];
  const resolutionTime = reportData?.resolutionTime || [];

  const variacionTotal = summary ? (summary.variacionTotalReclamos * 100) : 0;
  const variacionTasa = summary ? (summary.variacionTasaResolucion * 100) : 0;
  const variacionTiempo = summary ? (summary.variacionTiempoPromedioDias * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes y Análisis</h1>
          <p className="text-muted-foreground mt-1">
            Visualiza estadísticas y métricas del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col gap-1">
            <label
              className="text-xs text-muted-foreground"
              htmlFor="period-select"
            >
              Período
            </label>
            <select
              className="w-48 px-3 py-2 rounded-lg border border-default-200 bg-default-50 dark:bg-default-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              id="period-select"
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
            >
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
          <Button
            color="primary"
            isLoading={loading}
            startContent={<Download className="h-4 w-4" />}
          >
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reclamos</p>
                <p className="text-2xl font-bold mt-1">{summary?.totalReclamos ?? 0}</p>
                <p className={`text-xs mt-1 ${variacionTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {variacionTotal >= 0 ? "+" : ""}{variacionTotal.toFixed(1)}% vs período anterior
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Tasa de Resolución
                </p>
                <p className="text-2xl font-bold mt-1">
                  {summary ? (summary.tasaResolucion * 100).toFixed(0) : 0}%
                </p>
                <p className={`text-xs mt-1 ${variacionTasa >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {variacionTasa >= 0 ? "+" : ""}{variacionTasa.toFixed(1)}% vs período anterior
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                {variacionTasa >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                <p className="text-2xl font-bold mt-1">
                  {summary?.tiempoPromedioDias ?? 0} días
                </p>
                <p className={`text-xs mt-1 ${variacionTiempo <= 0 ? "text-green-600" : "text-red-600"}`}>
                  {variacionTiempo >= 0 ? "+" : ""}{variacionTiempo.toFixed(1)}% vs período anterior
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Empresas Activas
                </p>
                <p className="text-2xl font-bold mt-1">{summary?.empresasActivas ?? 0}</p>
                <p className="text-xs text-green-600 mt-1">
                  +{summary?.nuevasEmpresas ?? 0} nuevas este período
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claims by Month */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Reclamos por Mes</h2>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer height={300} width="100%">
              <BarChart data={claimsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="resueltos" fill="#17C964" name="Resueltos" />
                <Bar dataKey="pendientes" fill="#F5A524" name="Pendientes" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Claims by Type */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Distribución por Tipo</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {claimsByType.map((item, index) => (
                <div
                  key={item.tipo}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{item.tipo}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{item.cantidad}</span>
                    <span className="text-sm font-medium">
                      {(item.porcentaje * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Claims by Company */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Reclamos por Empresa</h2>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer height={300} width="100%">
              <BarChart data={claimsByCompany} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="empresa" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#7928CA" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Resolution Time */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Tiempo de Resolución</h2>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer height={300} width="100%">
              <BarChart data={resolutionTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rango" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#0070F3" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Card>
        <CardBody className="p-0">
          <div className="w-full">
            <div className="flex border-b border-default-200">
              <button
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "executive"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("executive")}
              >
                Reporte Ejecutivo
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "detailed"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("detailed")}
              >
                Reporte Detallado
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "custom"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("custom")}
              >
                Reporte Personalizado
              </button>
            </div>

            {activeTab === "executive" && summary && (
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Resumen Ejecutivo</h3>
                <p className="text-sm text-muted-foreground">
                  Durante el período seleccionado, se registraron {summary.totalReclamos} reclamos
                  en total, con una tasa de resolución del {(summary.tasaResolucion * 100).toFixed(0)}%. El tiempo
                  promedio de resolución fue de {summary.tiempoPromedioDias} días
                  {variacionTiempo > 0
                    ? ", ligeramente superior al período anterior."
                    : variacionTiempo < 0
                    ? ", mejorando respecto al período anterior."
                    : "."}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Reclamos Críticos
                    </p>
                    <p className="text-2xl font-bold mt-1">{summary.reclamosCriticos}</p>
                  </div>
                  <div className="p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Satisfacción Promedio
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {summary.satisfaccionPromedio}/5
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "detailed" && (
              <div className="p-6">
                <p className="text-sm text-muted-foreground">
                  Análisis detallado de todos los reclamos, incluyendo
                  tendencias, patrones y recomendaciones.
                </p>
              </div>
            )}

            {activeTab === "custom" && (
              <div className="p-6">
                <p className="text-sm text-muted-foreground">
                  Crea reportes personalizados seleccionando las métricas y
                  filtros que necesites.
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
