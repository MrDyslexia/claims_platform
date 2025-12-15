"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { Card, CardBody, CardHeader, Input, Button } from "@heroui/react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useAuth } from "@/lib/auth/auth-context";
import {
  fetchAnalystAnalytics,
  generateReport,
  type AnalystAnalyticsResponse,
} from "@/lib/api/dashboard";

export default function AnalystAnalytics() {
  const { user } = useAuth();

  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const chileTime = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Santiago" }),
    );
    const year = chileTime.getFullYear();
    const month = String(chileTime.getMonth() + 1).padStart(2, "0");
    const day = String(chileTime.getDate()).padStart(2, "0");

    return {
      start: `${year}-01-01`,
      end: `${year}-${month}-${day}`,
    };
  });
  const [stats, setStats] = useState<AnalystAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!dateRange.start || !dateRange.end) return;

    setLoading(true);
    setError(null);
    try {
      const result = await fetchAnalystAnalytics(
        dateRange.start,
        dateRange.end,
      );

      setStats(result);
    } catch (err: any) {
      // console.error("Error fetching analytics:", err);
      setError(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      setSuccessMessage(null);
      setError(null);

      const result = await generateReport(dateRange.start, dateRange.end);

      setSuccessMessage(`Reporte generado: ${result.filename}`);

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGeneratingReport(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  // Datos para gráficos (usar datos reales o vacíos si no hay)
  const weeklyData =
    stats?.dailyPerformance.map((d) => ({
      dia: d.fecha,
      reclamos: d.recibidos,
      resueltos: d.resueltos,
    })) || [];

  const categoryPerformance =
    stats?.claimsByCategory.map((c) => ({
      categoria: c.categoria,
      cantidad: c.cantidad,
    })) || [];

  const claimsByType =
    stats?.claimsByType.map((t) => ({
      tipo: t.tipo,
      cantidad: t.cantidad,
    })) || [];

  const satisfactionTrend =
    stats?.satisfactionTrend.map((s) => ({
      mes: s.fecha,
      satisfaccion: s.satisfaccion,
    })) || [];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Análisis Detallado
          </h1>
          <p className="text-default-500">
            Análisis profundo de métricas de {user?.empresa?.nombre}
          </p>
        </div>

        <div className="flex items-end gap-4">
          <Input
            className="w-48"
            label="Fecha Inicio"
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
          />
          <Input
            className="w-48"
            label="Fecha Fin"
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
          />
          <Button color="primary" isLoading={loading} onPress={handleSearch}>
            Actualizar
          </Button>
          <Button
            color="secondary"
            isLoading={generatingReport}
            startContent={!generatingReport && <Download className="w-4 h-4" />}
            onPress={handleGenerateReport}
          >
            Generar Reporte
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-danger-50 text-danger-600 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-success-50 text-success-600 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Weekly Performance */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-0">
          <h3 className="text-lg font-semibold">Rendimiento Semanal</h3>
          <p className="text-sm text-default-500">
            Reclamos recibidos y resueltos por día
          </p>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer height={350} width="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorReclamos" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResueltos" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#333" strokeDasharray="3 3" />
              <XAxis dataKey="dia" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Area
                dataKey="reclamos"
                fill="url(#colorReclamos)"
                fillOpacity={1}
                name="Recibidos"
                stroke="#3b82f6"
                type="monotone"
              />
              <Area
                dataKey="resueltos"
                fill="url(#colorResueltos)"
                fillOpacity={1}
                name="Resueltos"
                stroke="#10b981"
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Category Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold">Reclamos por Categoría</h3>
            <p className="text-sm text-default-500">
              Distribución de reclamos según categoría
            </p>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer height={350} width="100%">
              <BarChart data={categoryPerformance}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="categoria" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="cantidad" fill="#3b82f6" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold">Reclamos por Tipo</h3>
            <p className="text-sm text-default-500">
              Distribución de reclamos según tipo
            </p>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer height={350} width="100%">
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
                <Legend />
                <Bar dataKey="cantidad" fill="#10b981" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Satisfaction Trend */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-0">
          <h3 className="text-lg font-semibold">Tendencia de Satisfacción</h3>
          <p className="text-sm text-default-500">
            Evolución de la satisfacción del cliente
          </p>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer height={350} width="100%">
            <LineChart data={satisfactionTrend}>
              <CartesianGrid stroke="#333" strokeDasharray="3 3" />
              <XAxis dataKey="mes" stroke="#888" />
              <YAxis domain={[0, 5]} stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                dataKey="satisfaccion"
                dot={{ fill: "#8b5cf6", r: 6 }}
                name="Satisfacción"
                stroke="#8b5cf6"
                strokeWidth={3}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  );
}
