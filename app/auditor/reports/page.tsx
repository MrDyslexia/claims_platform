"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import {
  Download,
  FileText,
  TrendingUp,
  Building2,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
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

// Mock data for charts
const claimsByMonth = [
  { mes: "Ene", total: 45, resueltos: 38, pendientes: 7 },
  { mes: "Feb", total: 52, resueltos: 45, pendientes: 7 },
  { mes: "Mar", total: 48, resueltos: 42, pendientes: 6 },
  { mes: "Abr", total: 61, resueltos: 53, pendientes: 8 },
  { mes: "May", total: 55, resueltos: 48, pendientes: 7 },
  { mes: "Jun", total: 58, resueltos: 51, pendientes: 7 },
];

const claimsByType = [
  { tipo: "Acoso Laboral", cantidad: 89, porcentaje: 35 },
  { tipo: "Discriminación", cantidad: 67, porcentaje: 26 },
  { tipo: "Fraude", cantidad: 45, porcentaje: 18 },
  { tipo: "Conflicto de Interés", cantidad: 34, porcentaje: 13 },
  { tipo: "Otros", cantidad: 20, porcentaje: 8 },
];

const claimsByCompany = [
  { empresa: "Empresa ABC", cantidad: 78 },
  { empresa: "Corporación XYZ", cantidad: 65 },
  { empresa: "Industrias DEF", cantidad: 52 },
  { empresa: "Grupo GHI", cantidad: 38 },
  { empresa: "Otros", cantidad: 22 },
];

const resolutionTime = [
  { rango: "0-3 días", cantidad: 45 },
  { rango: "4-7 días", cantidad: 89 },
  { rango: "8-14 días", cantidad: 67 },
  { rango: "15-30 días", cantidad: 34 },
  { rango: "+30 días", cantidad: 20 },
];

const COLORS = ["#7928CA", "#0070F3", "#17C964", "#F5A524", "#F31260"];

export default function ReportsPage() {
  const [reportPeriod, setReportPeriod] = useState("monthly");
  const [activeTab, setActiveTab] = useState("executive");

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
                <p className="text-2xl font-bold mt-1">255</p>
                <p className="text-xs text-green-600 mt-1">
                  +12% vs período anterior
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
                <p className="text-2xl font-bold mt-1">87%</p>
                <p className="text-xs text-green-600 mt-1">
                  +5% vs período anterior
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                <p className="text-2xl font-bold mt-1">5.2 días</p>
                <p className="text-xs text-red-600 mt-1">
                  +0.3 días vs período anterior
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
                <p className="text-2xl font-bold mt-1">12</p>
                <p className="text-xs text-green-600 mt-1">
                  +2 nuevas este mes
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
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm">{item.tipo}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{item.cantidad}</span>
                    <span className="text-sm font-medium">
                      {item.porcentaje}%
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

            {activeTab === "executive" && (
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Resumen Ejecutivo</h3>
                <p className="text-sm text-muted-foreground">
                  Durante el período seleccionado, se registraron 255 reclamos
                  en total, con una tasa de resolución del 87%. El tiempo
                  promedio de resolución fue de 5.2 días, ligeramente superior
                  al período anterior.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Reclamos Críticos
                    </p>
                    <p className="text-2xl font-bold mt-1">8</p>
                  </div>
                  <div className="p-4 bg-default-50 dark:bg-default-100/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Satisfacción Promedio
                    </p>
                    <p className="text-2xl font-bold mt-1">4.2/5</p>
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
