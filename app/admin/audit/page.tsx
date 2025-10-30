"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardBody, Input, Button, Chip } from "@heroui/react";
import {
  Search,
  Download,
  Shield,
  User,
  FileText,
  Settings,
  Eye,
} from "lucide-react";
import { Pagination } from "@heroui/react";

import { DataTable } from "@/components/data-table";

// Mock audit data
const mockAuditLogs = [
  {
    id: 1,
    usuario: "María González",
    accion: "LOGIN",
    modulo: "auth",
    descripcion: "Inicio de sesión exitoso",
    ip_address: "192.168.1.100",
    fecha: new Date("2024-10-07T09:15:00"),
    detalles: { email: "maria@example.com" },
  },
  {
    id: 2,
    usuario: "Carlos Ruiz",
    accion: "UPDATE_CLAIM",
    modulo: "claims",
    descripcion: "Actualizó el estado del reclamo RC-2024-001",
    ip_address: "192.168.1.101",
    fecha: new Date("2024-10-07T10:30:00"),
    detalles: {
      claim_id: "RC-2024-001",
      old_status: "Nuevo",
      new_status: "En Proceso",
    },
  },
  {
    id: 3,
    usuario: "Ana Torres",
    accion: "CREATE_USER",
    modulo: "users",
    descripcion: "Creó nuevo usuario: Pedro Sánchez",
    ip_address: "192.168.1.102",
    fecha: new Date("2024-10-07T11:45:00"),
    detalles: { user_email: "pedro@example.com", roles: ["Analista"] },
  },
  {
    id: 4,
    usuario: "María González",
    accion: "EXPORT_DATA",
    modulo: "reports",
    descripcion: "Exportó reporte de reclamos mensuales",
    ip_address: "192.168.1.100",
    fecha: new Date("2024-10-07T14:20:00"),
    detalles: { report_type: "monthly_claims", format: "xlsx" },
  },
  {
    id: 5,
    usuario: "Carlos Ruiz",
    accion: "DELETE_COMPANY",
    modulo: "companies",
    descripcion: "Eliminó empresa: Test Company",
    ip_address: "192.168.1.101",
    fecha: new Date("2024-10-07T15:10:00"),
    detalles: { company_id: 99, company_name: "Test Company" },
  },
];

const actionColors = {
  LOGIN: "success",
  LOGOUT: "default",
  CREATE_USER: "primary",
  UPDATE_CLAIM: "warning",
  DELETE_COMPANY: "danger",
  EXPORT_DATA: "secondary",
} as const;

const moduleIcons = {
  auth: Shield,
  claims: FileText,
  users: User,
  companies: Settings,
  reports: FileText,
};

const columns = [
  { key: "fecha", label: "FECHA Y HORA" },
  { key: "usuario", label: "USUARIO" },
  { key: "accion", label: "ACCIÓN" },
  { key: "modulo", label: "MÓDULO" },
  { key: "descripcion", label: "DESCRIPCIÓN" },
  { key: "ip", label: "IP" },
  { key: "detalles", label: "DETALLES" },
];

export default function AuditPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModule, setFilterModule] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [page, setPage] = useState(1);

  const rowsPerPage = 10;

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.usuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.accion.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModule = filterModule === "all" || log.modulo === filterModule;
    const matchesAction = filterAction === "all" || log.accion === filterAction;

    return matchesSearch && matchesModule && matchesAction;
  });

  const pages = Math.ceil(filteredLogs.length / rowsPerPage);
  const items = filteredLogs.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const renderCell = (log: (typeof mockAuditLogs)[0], columnKey: React.Key) => {
    const Icon = moduleIcons[log.modulo as keyof typeof moduleIcons] || Shield;

    switch (columnKey) {
      case "fecha":
        return (
          <div className="text-sm">
            <p className="font-medium">{log.fecha.toLocaleDateString()}</p>
            <p className="text-xs text-muted-foreground">
              {log.fecha.toLocaleTimeString()}
            </p>
          </div>
        );
      case "usuario":
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{log.usuario}</span>
          </div>
        );
      case "accion":
        return (
          <Chip
            color={
              actionColors[log.accion as keyof typeof actionColors] || "default"
            }
            size="sm"
            variant="flat"
          >
            {log.accion}
          </Chip>
        );
      case "modulo":
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-purple-600" />
            <span className="text-sm capitalize">{log.modulo}</span>
          </div>
        );
      case "descripcion":
        return <span className="text-sm">{log.descripcion}</span>;
      case "ip":
        return (
          <span className="text-xs font-mono text-muted-foreground">
            {log.ip_address}
          </span>
        );
      case "detalles":
        return (
          <Button isIconOnly size="sm" variant="light">
            <Eye className="h-4 w-4" />
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auditoría del Sistema</h1>
          <p className="text-muted-foreground mt-1">
            Registro completo de todas las acciones en el sistema
          </p>
        </div>
        <Button color="primary" startContent={<Download className="h-4 w-4" />}>
          Exportar Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              className="flex-1"
              placeholder="Buscar por usuario, acción o descripción..."
              startContent={<Search className="h-4 w-4 text-default-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              color="primary"
              startContent={<Download className="h-4 w-4" />}
            >
              Exportar Logs
            </Button>
          </div>
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
            data={items}
            renderCell={renderCell}
          />
        </CardBody>
      </Card>
    </div>
  );
}
