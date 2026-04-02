"use client";

import { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  Download,
  FileText,
  PieChart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  fetchDashboardReports,
  type DashboardReportResponse,
} from "@/lib/api/dashboard";
import { exportElementToPdf } from "@/lib/export-element-to-pdf";

const COLORS = ["#7928CA", "#0070F3", "#17C964", "#F5A524", "#F31260"];
const PERIOD_LABELS: Record<string, string> = {
  weekly: "semanal",
  monthly: "mensual",
  quarterly: "trimestral",
  yearly: "anual",
};
const REPORT_DATE_FORMATTER = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatReportDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : REPORT_DATE_FORMATTER.format(date);
}

export default function ReportsPage() {
  const exportRef = useRef<HTMLDivElement>(null);
  const [reportPeriod, setReportPeriod] = useState("monthly");
  const [reportData, setReportData] = useState<DashboardReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
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

  const handleExport = async () => {
    try {
      if (!exportRef.current) {
        throw new Error("No se pudo preparar el reporte para exportar");
      }

      setExporting(true);
      const dateLabel = new Date().toISOString().slice(0, 10);

      await exportElementToPdf(exportRef.current, {
        filename: `reporte_${PERIOD_LABELS[reportPeriod] || reportPeriod}_${dateLabel}.pdf`,
      });
    } catch (err: any) {
      setError(err.message || "Error al exportar el reporte");
    } finally {
      setExporting(false);
    }
  };

  if (loading && !reportData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner label="Cargando reportes..." size="lg" />
      </div>
    );
  }

  if (error && !reportData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="p-6 text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold">Error al cargar datos</h2>
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
  const claimsSummary = reportData?.claimsSummary || [];

  const variacionTotal = summary ? summary.variacionTotalReclamos * 100 : 0;
  const variacionTasa = summary ? summary.variacionTasaResolucion * 100 : 0;
  const variacionTiempo = summary ? summary.variacionTiempoPromedioDias * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes y Análisis</h1>
          <p className="mt-1 text-muted-foreground">
            Visualiza estadísticas y métricas del sistema
          </p>
        </div>
        <div className="flex items-end gap-3">
          <Select
            className="w-[200px]"
            classNames={{
              trigger: "h-10",
            }}
            id="period-select"
            label="Período"
            selectedKeys={[reportPeriod]}
            size="sm"
            variant="bordered"
            onSelectionChange={(keys) =>
              setReportPeriod(Array.from(keys)[0] as string)
            }
          >
            <SelectItem key="weekly">Semanal</SelectItem>
            <SelectItem key="monthly">Mensual</SelectItem>
            <SelectItem key="quarterly">Trimestral</SelectItem>
            <SelectItem key="yearly">Anual</SelectItem>
          </Select>
          <Button
            className="bg-blue-900 text-white hover:bg-blue-800"
            isLoading={exporting}
            size="lg"
            startContent={<Download size={20} />}
            onPress={handleExport}
          >
            Exportar
          </Button>
        </div>
      </div>

      <div
        ref={exportRef}
        className="space-y-6 rounded-2xl bg-white p-6 text-black"
      >
        <div>
          <h2 className="text-2xl font-bold">Reporte de Denuncias</h2>
          <p className="mt-1 text-sm text-slate-600">
            Reporte visual del período {PERIOD_LABELS[reportPeriod] || reportPeriod}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reclamos</p>
                  <p className="mt-1 text-2xl font-bold">{summary?.totalReclamos ?? 0}</p>
                  <p
                    className={`mt-1 text-xs ${variacionTotal >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {variacionTotal >= 0 ? "+" : ""}
                    {variacionTotal.toFixed(1)}% vs período anterior
                  </p>
                </div>
                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tasa de Resolución</p>
                  <p className="mt-1 text-2xl font-bold">
                    {summary ? (summary.tasaResolucion * 100).toFixed(0) : 0}%
                  </p>
                  <p
                    className={`mt-1 text-xs ${variacionTasa >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {variacionTasa >= 0 ? "+" : ""}
                    {variacionTasa.toFixed(1)}% vs período anterior
                  </p>
                </div>
                <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
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
                  <p className="mt-1 text-2xl font-bold">
                    {summary?.tiempoPromedioDias ?? 0} días
                  </p>
                  <p
                    className={`mt-1 text-xs ${variacionTiempo <= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {variacionTiempo >= 0 ? "+" : ""}
                    {variacionTiempo.toFixed(1)}% vs período anterior
                  </p>
                </div>
                <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/30">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Empresas Activas</p>
                  <p className="mt-1 text-2xl font-bold">{summary?.empresasActivas ?? 0}</p>
                  <p className="mt-1 text-xs text-green-600">
                    +{summary?.nuevasEmpresas ?? 0} nuevas este período
                  </p>
                </div>
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                    <div className="flex flex-1 items-center gap-3">
                      <div
                        className="h-4 w-4 rounded"
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

        <Card>
          <CardBody className="space-y-4 p-6">
            <h3 className="text-lg font-semibold">Resumen Ejecutivo</h3>
            <p className="text-sm text-muted-foreground">
              Durante el período seleccionado, se registraron {summary?.totalReclamos ?? 0} reclamos
              en total, con una tasa de resolución del{" "}
              {summary ? (summary.tasaResolucion * 100).toFixed(0) : 0}%. El tiempo promedio
              de resolución fue de {summary?.tiempoPromedioDias ?? 0} días
              {variacionTiempo > 0
                ? ", ligeramente superior al período anterior."
                : variacionTiempo < 0
                  ? ", mejorando respecto al período anterior."
                  : "."}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-default-50 p-4 dark:bg-default-100/50">
                <p className="text-sm text-muted-foreground">Reclamos Críticos</p>
                <p className="mt-1 text-2xl font-bold">{summary?.reclamosCriticos ?? 0}</p>
              </div>
              <div className="rounded-lg bg-default-50 p-4 dark:bg-default-100/50">
                <p className="text-sm text-muted-foreground">Satisfacción Promedio</p>
                <p className="mt-1 text-2xl font-bold">
                  {summary?.satisfaccionPromedio ?? 0}/5
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Resumen de denuncias del período</h3>
                <p className="text-sm text-slate-600">
                  Detalle completo de las denuncias incluidas en este reporte.
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {claimsSummary.length} registro{claimsSummary.length === 1 ? "" : "s"}
              </div>
            </div>

            {claimsSummary.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                No hay denuncias registradas en el período seleccionado.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full table-fixed border-collapse text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="w-28 px-3 py-3 font-semibold">Número</th>
                      <th className="w-28 px-3 py-3 font-semibold">Fecha</th>
                      <th className="w-[28%] px-3 py-3 font-semibold">Asunto</th>
                      <th className="w-36 px-3 py-3 font-semibold">Estado</th>
                      <th className="w-40 px-3 py-3 font-semibold">Tipo</th>
                      <th className="w-[32%] px-3 py-3 font-semibold">Empresa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claimsSummary.map((claim, index) => (
                      <tr
                        key={`${claim.numero}-${claim.fechaCreacion}-${index}`}
                        className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                      >
                        <td className="px-3 py-3 align-top font-medium text-slate-900">
                          {claim.numero}
                        </td>
                        <td className="px-3 py-3 align-top text-slate-700">
                          {formatReportDate(claim.fechaCreacion)}
                        </td>
                        <td className="break-words px-3 py-3 align-top whitespace-normal text-slate-700">
                          {claim.asunto}
                        </td>
                        <td className="px-3 py-3 align-top text-slate-700">
                          {claim.estado}
                        </td>
                        <td className="break-words px-3 py-3 align-top whitespace-normal text-slate-700">
                          {claim.tipo}
                        </td>
                        <td className="break-words px-3 py-3 align-top whitespace-normal text-slate-700">
                          {claim.empresa}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
