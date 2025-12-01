"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Textarea,
  Chip,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getClaimWithRelations } from "@/lib/data";

export default function SupervisorClaimDetail() {
  const params = useParams();
  const claimId = Number.parseInt(params.id as string);
  const claim = getClaimWithRelations(claimId);

  const [newComment, setNewComment] = useState("");
  const [resolution, setResolution] = useState("");

  if (!claim) {
    return <div className="p-8">Reclamo no encontrado</div>;
  }

  const handleStatusChange = (_newStatus: string) => {
    // API call would go here
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setNewComment("");
    // API call would go here
  };

  const handleResolve = () => {
    if (!resolution.trim()) return;
    // API call would go here
  };

  const getStatusColor = (estadoId: number) => {
    switch (estadoId) {
      case 1: // pendiente
        return "warning";
      case 2: // en_revision
        return "primary";
      case 3: // en_investigacion
        return "primary";
      case 4: // resuelto
        return "success";
      case 5: // cerrado
        return "default";
      default:
        return "default";
    }
  };

  const getStatusName = (estadoId: number) => {
    switch (estadoId) {
      case 1:
        return "Pendiente";
      case 2:
        return "En Revisión";
      case 3:
        return "En Investigación";
      case 4:
        return "Resuelto";
      case 5:
        return "Cerrado";
      default:
        return "Desconocido";
    }
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
      case "critica":
        return "danger";
      case "media":
        return "warning";
      case "baja":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button isIconOnly as={Link} href="/supervisor/claims" variant="flat">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-foreground">
              {claim.codigo_acceso}
            </h1>
            <Chip color={getStatusColor(claim.id_estado)} variant="flat">
              {getStatusName(claim.id_estado)}
            </Chip>
            <Chip color={getPriorityColor(claim.prioridad)} variant="flat">
              {claim.prioridad}
            </Chip>
          </div>
          <p className="text-default-500">{claim.tipo?.nombre || "Sin tipo"}</p>
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
                  <p className="text-foreground">
                    {claim.anonimo
                      ? "Anónimo"
                      : claim.nombre_denunciante || "Sin nombre"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-default-500 mb-1">Email</p>
                  <p className="text-foreground">
                    {claim.anonimo
                      ? "Anónimo"
                      : claim.email_denunciante || "No especificado"}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Tabs */}
          <Card className="border-none shadow-sm">
            <CardBody className="p-0">
              <Tabs fullWidth aria-label="Claim tabs">
                <Tab key="comments" title="Comentarios">
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      {claim.comentarios && claim.comentarios.length > 0 ? (
                        claim.comentarios.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-4 rounded-lg bg-default-50"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-semibold text-primary">
                                    A
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    Supervisor
                                  </p>
                                  <p className="text-xs text-default-400">
                                    {new Date(
                                      comment.fecha_creacion,
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <Chip
                                color={
                                  comment.es_interno ? "warning" : "default"
                                }
                                size="sm"
                                variant="flat"
                              >
                                {comment.es_interno ? "Interno" : "Público"}
                              </Chip>
                            </div>
                            <p className="text-sm text-default-700">
                              {comment.comentario}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-default-500 py-4">
                          No hay comentarios aún
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Textarea
                        label="Agregar Comentario"
                        minRows={3}
                        placeholder="Escribe tu comentario aquí..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <Button
                        color="primary"
                        startContent={<Send className="w-4 h-4" />}
                        onClick={handleAddComment}
                      >
                        Enviar Comentario
                      </Button>
                    </div>
                  </div>
                </Tab>

                <Tab key="resolution" title="Resolución">
                  <div className="p-6 space-y-4">
                    {claim.id_estado === 4 ? (
                      <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                          <div>
                            <p className="font-semibold text-success mb-1">
                              Reclamo Resuelto
                            </p>
                            <p className="text-sm text-default-700">
                              Este reclamo ha sido marcado como resuelto. La
                              resolución ha sido enviada al cliente.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Textarea
                          label="Resolución"
                          minRows={5}
                          placeholder="Describe cómo se resolvió el reclamo..."
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
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
                      {claim.historial && claim.historial.length > 0 ? (
                        claim.historial.map((entry) => (
                          <div key={entry.id} className="flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                Estado cambiado a: {entry.estado_nuevo}
                              </p>
                              <p className="text-xs text-default-400">
                                {new Date(entry.fecha_cambio).toLocaleString()}
                              </p>
                              {entry.comentario && (
                                <p className="text-sm text-default-500 mt-1">
                                  {entry.comentario}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-default-500 py-4">
                          No hay historial disponible
                        </p>
                      )}
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
              {claim.id_estado === 1 && (
                <Button
                  fullWidth
                  color="primary"
                  onClick={() => handleStatusChange("en_revision")}
                >
                  Comenzar Revisión
                </Button>
              )}
              {claim.id_estado === 2 && (
                <Button
                  fullWidth
                  color="success"
                  onClick={() => handleStatusChange("resuelto")}
                >
                  Marcar como Resuelto
                </Button>
              )}
              <select
                className="w-full px-4 py-2 rounded-lg border border-divider bg-content1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue={claim.prioridad}
                onChange={(_e) => {
                  // API call would go here
                }}
              >
                <option value="baja">Prioridad Baja</option>
                <option value="media">Prioridad Media</option>
                <option value="alta">Prioridad Alta</option>
                <option value="critica">Prioridad Crítica</option>
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
                  <p className="text-sm font-medium">
                    {new Date(claim.fecha_creacion).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-default-400 mt-0.5" />
                <div>
                  <p className="text-sm text-default-500">
                    Última Actualización
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(claim.fecha_actualizacion).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
