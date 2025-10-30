"use client";

import { useState } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Download, FileText, Calendar } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";

export default function AnalystReports() {
  const { user } = useAuth();
  const [reportPeriod, setReportPeriod] = useState("monthly");

  const reports = [
    {
      id: 1,
      title: "Reporte Mensual de Reclamos",
      description: "Resumen completo de todos los reclamos del mes",
      date: "2025-10-01",
      type: "PDF",
      size: "2.4 MB",
    },
    {
      id: 2,
      title: "Análisis de Tendencias",
      description: "Análisis de patrones y tendencias en reclamos",
      date: "2025-09-28",
      type: "Excel",
      size: "1.8 MB",
    },
    {
      id: 3,
      title: "Reporte de Satisfacción",
      description: "Métricas de satisfacción del cliente",
      date: "2025-09-25",
      type: "PDF",
      size: "1.2 MB",
    },
    {
      id: 4,
      title: "Reporte Trimestral Q3",
      description: "Resumen ejecutivo del tercer trimestre",
      date: "2025-09-30",
      type: "PDF",
      size: "3.1 MB",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reportes</h1>
          <p className="text-default-500">
            Reportes y análisis de {user?.empresa?.nombre}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="px-4 py-2 rounded-lg border border-divider bg-content1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
          >
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
            <option value="quarterly">Trimestral</option>
            <option value="yearly">Anual</option>
          </select>
          <Button
            color="primary"
            startContent={<Download className="w-4 h-4" />}
          >
            Generar Reporte
          </Button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="border-none shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {report.title}
                  </h3>
                  <p className="text-sm text-default-500 mb-3">
                    {report.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-default-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{report.date}</span>
                    </div>
                    <span>•</span>
                    <span>{report.type}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                  </div>
                  <Button
                    color="primary"
                    size="sm"
                    startContent={<Download className="w-4 h-4" />}
                    variant="flat"
                  >
                    Descargar
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
