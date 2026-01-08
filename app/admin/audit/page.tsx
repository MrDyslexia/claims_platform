"use client";

import type React from "react";
import type { FiltrosAuditoria, LogAuditoria } from "@/lib/api/auditoria";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Chip,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import {
  Search,
  Download,
  Shield,
  User,
  FileText,
  Settings,
  Eye,
  Filter,
  XCircle,
} from "lucide-react";
import { Pagination } from "@heroui/react";

import { DataTable } from "@/components/data-table";
import { useAuth } from "@/lib/auth/auth-context";
import { useLogsAuditoria } from "@/lib/api/auditoria";

// Mapeo de iconos por módulo
const moduleIcons: Record<string, any> = {
  auth: Shield,
  claims: FileText,
  users: User,
  companies: Settings,
  reports: FileText,
  roles: Shield,
  permissions: Shield,
  audit: Eye,
  comments: FileText,
  attachments: FileText,
  notifications: FileText,
  dashboard: FileText,
  settings: Settings,
  other: FileText,
};

const columns = [
  { key: "fecha", label: "FECHA Y HORA" },
  { key: "usuario", label: "USUARIO" },
  { key: "accion", label: "ACCIÓN" },
  { key: "modulo", label: "MÓDULO" },
  { key: "descripcion", label: "DESCRIPCIÓN" },
  { key: "ip", label: "IP" },
  { key: "resultado", label: "RESULTADO" },
];

export default function AuditPage() {
  useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState<FiltrosAuditoria>({
    page: 1,
    limit: 10,
  });

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");

    setToken(storedToken);
  }, []);

  useEffect(() => {
    setFiltros((prev) => ({ ...prev, page }));
  }, [page]);

  const { data, loading, error, refetch } = useLogsAuditoria(token, filtros);

  // Filtrado local por búsqueda
  const filteredLogs =
    data?.logs_auditoria.filter((log) => {
      const matchesSearch =
        log.usuario_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.accion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.modulo.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    }) || [];

  const pages = data?.metadata?.total_paginas || 1;

  const renderCell = (log: LogAuditoria, columnKey: React.Key) => {
    const Icon = moduleIcons[log.modulo] || FileText;

    switch (columnKey) {
      case "fecha":
        const fecha = new Date(log.fecha_creacion);

        return (
          <div className="text-sm">
            <p className="font-medium">{fecha.toLocaleDateString()}</p>
            <p className="text-xs text-muted-foreground">
              {fecha.toLocaleTimeString()}
            </p>
          </div>
        );
      case "usuario":
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{log.usuario_nombre}</span>
          </div>
        );
      case "accion":
        const accionInfo = data?.filtros_disponibles?.acciones.find(
          (a) => a.codigo === log.accion,
        );

        return (
          <Chip
            color={
              accionInfo?.tipo === "success"
                ? "success"
                : accionInfo?.tipo === "danger"
                  ? "danger"
                  : accionInfo?.tipo === "warning"
                    ? "warning"
                    : accionInfo?.tipo === "primary"
                      ? "primary"
                      : "default"
            }
            size="sm"
            variant="flat"
          >
            {accionInfo?.nombre || log.accion}
          </Chip>
        );
      case "modulo":
        const moduloInfo = data?.filtros_disponibles?.modulos.find(
          (m) => m.codigo === log.modulo,
        );

        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-purple-600" />
            <span className="text-sm capitalize">
              {moduloInfo?.nombre || log.modulo}
            </span>
          </div>
        );
      case "descripcion":
        return <span className="text-sm">{log.descripcion}</span>;
      case "ip":
        return (
          <span className="text-xs font-mono text-muted-foreground">
            {log.ip_origen}
          </span>
        );
      case "resultado":
        const resultadoInfo = data?.filtros_disponibles?.resultados.find(
          (r) => r.codigo === log.resultado,
        );

        return (
          <Chip
            color={
              resultadoInfo?.tipo === "success"
                ? "success"
                : resultadoInfo?.tipo === "danger"
                  ? "danger"
                  : "default"
            }
            size="sm"
            variant="flat"
          >
            {resultadoInfo?.nombre || log.resultado}
          </Chip>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardBody>
            <p className="text-danger">Error al cargar los logs: {error}</p>
            <Button className="mt-4" color="primary" onClick={refetch}>
              Reintentar
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auditoría del Sistema</h1>
          <p className="text-muted-foreground mt-1">
            Registro completo de todas las acciones en el sistema (
            {data?.metadata?.total_registros || 0} registros)
          </p>
        </div>
        <Button color="primary" startContent={<Download className="h-4 w-4" />}>
          Exportar Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              className="md:col-span-2"
              placeholder="Buscar por usuario, acción o descripción..."
              startContent={<Search className="h-4 w-4 text-default-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select
              label="Módulo"
              placeholder="Todos los módulos"
              startContent={<Filter className="h-4 w-4" />}
              onChange={(e) =>
                setFiltros((prev) => ({
                  ...prev,
                  modulo: e.target.value || undefined,
                  page: 1,
                }))
              }
            >
              {data?.filtros_disponibles?.modulos.map((modulo) => (
                <SelectItem key={modulo.codigo}>{modulo.nombre}</SelectItem>
              )) || []}
            </Select>
            <Select
              label="Resultado"
              placeholder="Todos los resultados"
              startContent={<Filter className="h-4 w-4" />}
              onChange={(e) =>
                setFiltros((prev) => ({
                  ...prev,
                  resultado: e.target.value || undefined,
                  page: 1,
                }))
              }
            >
              {data?.filtros_disponibles?.resultados.map((resultado) => (
                <SelectItem key={resultado.codigo}>
                  {resultado.nombre}
                </SelectItem>
              )) || []}
            </Select>
          </div>
          {(filtros.modulo || filtros.resultado) && (
            <div className="mt-4 flex items-center gap-2">
              <Button
                color="default"
                size="sm"
                startContent={<XCircle className="h-4 w-4" />}
                variant="flat"
                onPress={() => {
                  setFiltros({ page: 1, limit: 10 });
                  setPage(1);
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Audit Table */}
      <Card>
        <CardBody className="p-0">
          <DataTable
            bottomContent={
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={page}
                  total={pages}
                  onChange={setPage}
                />
              </div>
            }
            columns={columns}
            data={filteredLogs}
            renderCell={renderCell}
          />
        </CardBody>
      </Card>
    </div>
  );
}
