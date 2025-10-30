"use client"

import { useState } from "react"
import { Card, CardBody, CardHeader, Button, Textarea, Chip, Tabs, Tab } from "@heroui/react"
import { ArrowLeft, Building2, Calendar, Clock, Send, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { getClaimWithRelations } from "@/lib/data"

export default function SupervisorClaimDetail() {
  const params = useParams()
  const claimId = Number.parseInt(params.id as string)
  const claim = getClaimWithRelations(claimId)

  const [newComment, setNewComment] = useState("")
  const [resolution, setResolution] = useState("")

  if (!claim) {
    return <div className="p-8">Reclamo no encontrado</div>
  }

  const handleStatusChange = (newStatus: string) => {
    console.log("[v0] Changing status to:", newStatus)
    // API call would go here
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return
    console.log("[v0] Adding comment:", newComment)
    setNewComment("")
    // API call would go here
  }

  const handleResolve = () => {
    if (!resolution.trim()) return
    console.log("[v0] Resolving claim with:", resolution)
    // API call would go here
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "warning"
      case "en_revision":
        return "primary"
      case "resuelto":
        return "success"
      case "cerrado":
        return "default"
      default:
        return "default"
    }
  }

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "danger"
      case "media":
        return "warning"
      case "baja":
        return "success"
      default:
        return "default"
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button as={Link} href="/supervisor/claims" isIconOnly variant="flat">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-foreground">{claim.codigo}</h1>
            <Chip color={getStatusColor(claim.estado)} variant="flat">
              {claim.estado}
            </Chip>
            <Chip color={getPriorityColor(claim.prioridad)} variant="flat">
              {claim.prioridad}
            </Chip>
          </div>
          <p className="text-default-500">{claim.tipo?.nombre}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claim Details */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-0">
              <h3 className="text-lg font-semibold">Detalles del Reclamo</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-sm text-default-500 mb-1">Descripción</p>
                <p className="text-foreground">{claim.descripcion}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-default-500 mb-1">Denunciante</p>
                  <p className="text-foreground">{claim.denunciante_nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500 mb-1">Email</p>
                  <p className="text-foreground">{claim.denunciante_email}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Tabs */}
          <Card className="border-none shadow-sm">
            <CardBody className="p-0">
              <Tabs aria-label="Claim tabs" fullWidth>
                <Tab key="comments" title="Comentarios">
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      {claim.comentarios?.map((comment) => (
                        <div key={comment.id} className="p-4 rounded-lg bg-default-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-semibold text-primary">
                                  {comment.usuario?.nombre?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium">{comment.usuario?.nombre}</p>
                                <p className="text-xs text-default-400">
                                  {new Date(comment.fecha_creacion).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Chip size="sm" variant="flat" color={comment.es_interno ? "warning" : "default"}>
                              {comment.es_interno ? "Interno" : "Público"}
                            </Chip>
                          </div>
                          <p className="text-sm text-default-700">{comment.comentario}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <Textarea
                        label="Agregar Comentario"
                        placeholder="Escribe tu comentario aquí..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        minRows={3}
                      />
                      <Button color="primary" startContent={<Send className="w-4 h-4" />} onClick={handleAddComment}>
                        Enviar Comentario
                      </Button>
                    </div>
                  </div>
                </Tab>

                <Tab key="resolution" title="Resolución">
                  <div className="p-6 space-y-4">
                    {claim.estado === "resuelto" ? (
                      <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                          <div>
                            <p className="font-semibold text-success mb-1">Reclamo Resuelto</p>
                            <p className="text-sm text-default-700">
                              Este reclamo ha sido marcado como resuelto. La resolución ha sido enviada al cliente.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Textarea
                          label="Resolución"
                          placeholder="Describe cómo se resolvió el reclamo..."
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          minRows={5}
                        />
                        <Button
                          color="success"
                          startContent={<CheckCircle2 className="w-4 h-4" />}
                          onClick={handleResolve}
                        >
                          Marcar como Resuelto
                        </Button>
                      </div>
                    )}
                  </div>
                </Tab>

                <Tab key="history" title="Historial">
                  <div className="p-6">
                    <div className="space-y-3">
                      {claim.historial?.map((entry) => (
                        <div key={entry.id} className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              Estado cambiado a: {entry.estado_nuevo}
                            </p>
                            <p className="text-xs text-default-400">{new Date(entry.fecha_cambio).toLocaleString()}</p>
                            {entry.comentario && <p className="text-sm text-default-500 mt-1">{entry.comentario}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-0">
              <h3 className="text-lg font-semibold">Acciones</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              {claim.estado === "pendiente" && (
                <Button color="primary" fullWidth onClick={() => handleStatusChange("en_revision")}>
                  Comenzar Revisión
                </Button>
              )}
              {claim.estado === "en_revision" && (
                <Button color="success" fullWidth onClick={() => handleStatusChange("resuelto")}>
                  Marcar como Resuelto
                </Button>
              )}
              <select
                className="w-full px-4 py-2 rounded-lg border border-divider bg-content1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue={claim.prioridad}
                onChange={(e) => console.log("[v0] Changing priority to:", e.target.value)}
              >
                <option value="baja">Prioridad Baja</option>
                <option value="media">Prioridad Media</option>
                <option value="alta">Prioridad Alta</option>
              </select>
            </CardBody>
          </Card>

          {/* Info */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-0">
              <h3 className="text-lg font-semibold">Información</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-default-400 mt-0.5" />
                <div>
                  <p className="text-sm text-default-500">Empresa</p>
                  <p className="text-sm font-medium">{claim.empresa?.nombre}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-default-400 mt-0.5" />
                <div>
                  <p className="text-sm text-default-500">Fecha de Creación</p>
                  <p className="text-sm font-medium">{new Date(claim.fecha_creacion).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-default-400 mt-0.5" />
                <div>
                  <p className="text-sm text-default-500">Última Actualización</p>
                  <p className="text-sm font-medium">{new Date(claim.fecha_actualizacion).toLocaleDateString()}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
