"use client"

import { useState } from "react"
import { Card, CardBody, Button, Input, Chip } from "@heroui/react"
import { Search } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth/auth-context"
import { mockClaims, getClaimWithRelations } from "@/lib/data"
import { DataTable } from "@/components/data-table"

export default function SupervisorClaims() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const companyClaims = mockClaims.filter((c) => c.empresa_id === user?.empresa_id && c.asignado_a === user?.id)

  const filteredClaims = companyClaims.filter((claim) => {
    const matchesSearch =
      claim.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || claim.estado === statusFilter
    const matchesPriority = priorityFilter === "all" || claim.prioridad === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const columns = [
    { key: "codigo", label: "CÓDIGO" },
    { key: "tipo", label: "TIPO" },
    { key: "descripcion", label: "DESCRIPCIÓN" },
    { key: "estado", label: "ESTADO" },
    { key: "prioridad", label: "PRIORIDAD" },
    { key: "fecha", label: "FECHA" },
    { key: "actions", label: "ACCIONES" },
  ]

  const renderCell = (claim: any, columnKey: string) => {
    const claimData = getClaimWithRelations(claim.id)

    switch (columnKey) {
      case "codigo":
        return <span className="font-mono text-sm">{claim.codigo}</span>
      case "tipo":
        return <span className="text-sm">{claimData.tipo?.nombre}</span>
      case "descripcion":
        return <span className="text-sm line-clamp-2">{claim.descripcion}</span>
      case "estado":
        const statusColors: any = {
          pendiente: "warning",
          en_revision: "primary",
          resuelto: "success",
          cerrado: "default",
        }
        return (
          <Chip size="sm" color={statusColors[claim.estado]} variant="flat">
            {claim.estado}
          </Chip>
        )
      case "prioridad":
        const priorityColors: any = {
          alta: "danger",
          media: "warning",
          baja: "success",
        }
        return (
          <Chip size="sm" color={priorityColors[claim.prioridad]} variant="flat">
            {claim.prioridad}
          </Chip>
        )
      case "fecha":
        return <span className="text-sm">{new Date(claim.fecha_creacion).toLocaleDateString()}</span>
      case "actions":
        return (
          <Button as={Link} href={`/supervisor/claims/${claim.id}`} size="sm" color="primary" variant="flat">
            Ver Detalle
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Mis Reclamos</h1>
        <p className="text-default-500">Gestiona todos los reclamos asignados a ti</p>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Buscar por código o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search className="w-4 h-4 text-default-400" />}
              className="flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-divider bg-content1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_revision">En Revisión</option>
              <option value="resuelto">Resuelto</option>
              <option value="cerrado">Cerrado</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-divider bg-content1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Claims Table */}
      <Card className="border-none shadow-sm">
        <CardBody className="p-0">
          <DataTable data={filteredClaims} columns={columns} renderCell={renderCell} />
        </CardBody>
      </Card>
    </div>
  )
}
