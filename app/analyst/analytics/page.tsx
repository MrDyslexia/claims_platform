"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
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

export default function AnalystAnalytics() {
  const { user } = useAuth();

  const weeklyData = [
    { dia: "Lun", reclamos: 8, resueltos: 6 },
    { dia: "Mar", reclamos: 12, resueltos: 10 },
    { dia: "Mié", reclamos: 10, resueltos: 9 },
    { dia: "Jue", reclamos: 15, resueltos: 11 },
    { dia: "Vie", reclamos: 9, resueltos: 8 },
    { dia: "Sáb", reclamos: 5, resueltos: 5 },
    { dia: "Dom", reclamos: 3, resueltos: 3 },
  ];

  const categoryPerformance = [
    { categoria: "Producto", promedio: 3.2, objetivo: 4.0 },
    { categoria: "Servicio", promedio: 4.5, objetivo: 4.0 },
    { categoria: "Facturación", promedio: 2.8, objetivo: 4.0 },
    { categoria: "Entrega", promedio: 5.1, objetivo: 4.0 },
  ];

  const satisfactionTrend = [
    { mes: "Ene", satisfaccion: 4.2 },
    { mes: "Feb", satisfaccion: 4.3 },
    { mes: "Mar", satisfaccion: 4.1 },
    { mes: "Abr", satisfaccion: 4.4 },
    { mes: "May", satisfaccion: 4.5 },
    { mes: "Jun", satisfaccion: 4.6 },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Análisis Detallado
        </h1>
        <p className="text-default-500">
          Análisis profundo de métricas de {user?.empresa?.nombre}
        </p>
      </div>

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
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-0">
          <h3 className="text-lg font-semibold">Rendimiento por Categoría</h3>
          <p className="text-sm text-default-500">
            Tiempo promedio de resolución vs objetivo (días)
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
              <Bar dataKey="promedio" fill="#3b82f6" name="Promedio Actual" />
              <Bar dataKey="objetivo" fill="#10b981" name="Objetivo" />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

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
