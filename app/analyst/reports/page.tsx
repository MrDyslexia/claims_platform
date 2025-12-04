"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Download, FileText, Calendar } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import { getReports, downloadReport, type Report } from "@/lib/api/dashboard";

export default function AnalystReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await getReports();

      setReports(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      await downloadReport(filename);
    } catch {
      // Manejar error silenciosamente o mostrar toast
      setError("Error al descargar el reporte");
    }
  };

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
        <Button color="primary" isLoading={loading} onPress={loadReports}>
          Actualizar Lista
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-danger-50 text-danger-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.length === 0 && !loading && (
          <p className="text-default-500 col-span-2 text-center py-8">
            No hay reportes generados. Ve a la sección de Analíticas para
            generar uno.
          </p>
        )}
        
        {reports.map((report) => (
          <Card key={report.name} className="border-none shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {report.name}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-default-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span>•</span>
                    <span>CSV</span>
                    <span>•</span>
                    <span>{report.size}</span>
                  </div>
                  <Button
                    color="primary"
                    onPress={() => handleDownload(report.name)}
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
