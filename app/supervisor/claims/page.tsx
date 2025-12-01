"use client";

import type { Key } from "react";

import { useState } from "react";
import { Card, CardBody, Button, Input, Chip } from "@heroui/react";
import { Search } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/lib/auth/auth-context";
import { mockClaims, getClaimWithRelations } from "@/lib/data";
import { DataTable } from "@/components/data-table";

export default function SupervisorClaims() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Validar que el usuario esté cargado
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-default-500">Cargando...</p>
      </div>
    );
  }

  const companyClaims = mockClaims.filter(
    (c) => c.id_empresa === user.empresa_id && c.asignado_a === user.id_usuario,
  );

  const filteredClaims = companyClaims.filter((claim) => {
    const matchesSearch =
      claim.codigo_acceso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || claim.id_estado === Number(statusFilter);
    const matchesPriority =
      priorityFilter === "all" || claim.prioridad === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const columns = [
    { key: "codigo", label: "CÓDIGO" },
    { key: "tipo", label: "TIPO" },
    { key: "descripcion", label: "DESCRIPCIÓN" },
    { key: "estado", label: "ESTADO" },
    { key: "prioridad", label: "PRIORIDAD" },
    { key: "fecha", label: "FECHA" },
    { key: "actions", label: "ACCIONES" },
  ];

  const renderCell = (claim: any, columnKey: Key) => {
    const claimData = getClaimWithRelations(claim.id_denuncia);

    switch (columnKey) {
      case "codigo":
        return <span className="font-mono text-sm">{claim.codigo_acceso}</span>;
      case "tipo":
        return (
          <span className="text-sm">
            {claimData?.tipo?.nombre || "Sin tipo"}
          </span>
        );
      case "descripcion":
        return (
          <span className="text-sm line-clamp-2">{claim.descripcion}</span>
        );
      case "estado":
        const statusColors: any = {
          1: "warning", // pendiente
          2: "primary", // en_revision
          3: "primary", // en_investigacion
          4: "success", // resuelto
          5: "default", // cerrado
        };

        const statusNames: any = {
          1: "Pendiente",
          2: "En Revisión",
          3: "En Investigación",
          4: "Resuelto",
          5: "Cerrado",
        };

        return (
          <Chip
            color={statusColors[claim.id_estado] || "default"}
            size="sm"
            variant="flat"
          >
            {statusNames[claim.id_estado] ||
              claimData?.estadoObj?.nombre ||
              "Desconocido"}
          </Chip>
        );
      case "prioridad":
        const priorityColors: any = {
          alta: "danger",
          critica: "danger",
          media: "warning",
          baja: "success",
        };

        return (
          <Chip
            color={priorityColors[claim.prioridad] || "default"}
            size="sm"
            variant="flat"
          >
            {claim.prioridad}
          </Chip>
        );
      case "fecha":
        return (
          <span className="text-sm">
            {new Date(claim.fecha_creacion).toLocaleDateString()}
          </span>
        );
      case "actions":
        return (
          <Button
            as={Link}
            color="primary"
            href={`/supervisor/claims/${claim.id_denuncia}`}
            size="sm"
            variant="flat"
          >
            Ver Detalle
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Mis Reclamos
        </h1>
        <p className="text-default-500">
          Gestiona todos los reclamos asignados a ti
        </p>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              className="flex-1"
              placeholder="Buscar por código o descripción..."
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-4 py-2 rounded-lg border border-divider bg-content1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="1">Pendiente</option>
              <option value="2">En Revisión</option>
              <option value="3">En Investigación</option>
              <option value="4">Resuelto</option>
              <option value="5">Cerrado</option>
            </select>
            <select
              className="px-4 py-2 rounded-lg border border-divider bg-content1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Claims Table */}
      <Card className="border-none shadow-sm">
        <CardBody className="p-0">
          <DataTable
            columns={columns}
            data={filteredClaims}
            renderCell={renderCell}
          />
        </CardBody>
      </Card>
    </div>
  );
}
