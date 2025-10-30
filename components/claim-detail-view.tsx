/* eslint-disable no-console */
"use client";

import type { Denuncia } from "@/lib/types/database";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Divider,
  Textarea,
  Avatar,
} from "@heroui/react";
import {
  X,
  FileText,
  User,
  Building2,
  Calendar,
  MapPin,
  AlertCircle,
  MessageSquare,
  Paperclip,
  Clock,
  CheckCircle2,
  Send,
} from "lucide-react";

interface ClaimDetailViewProps {
  claim: Denuncia & { empresa: string; tipo: string; estado: string };
  onClose: () => void;
}

const mockClaimDetail = {
  descripcion_completa:
    "Situación de acoso laboral por parte de supervisor directo. El comportamiento incluye comentarios inapropiados, asignación de tareas imposibles de cumplir y exclusión de reuniones importantes.",
  telefono_denunciante: "+56912345678",
  ciudad: "Santiago",
  asignado_a: "María González",
  comentarios: [
    {
      id: 1,
      usuario: "María González",
      comentario: "Caso asignado para revisión inicial",
      fecha: new Date("2024-10-07T10:30:00"),
      interno: true,
    },
    {
      id: 2,
      usuario: "Carlos Ruiz",
      comentario: "Se requiere entrevista con el denunciante",
      fecha: new Date("2024-10-07T14:15:00"),
      interno: true,
    },
  ],
  adjuntos: [
    {
      id: 1,
      nombre: "evidencia_1.pdf",
      tipo: "application/pdf",
      tamano: 245000,
    },
    {
      id: 2,
      nombre: "captura_pantalla.png",
      tipo: "image/png",
      tamano: 128000,
    },
  ],
  historial: [
    {
      id: 1,
      estado: "Nuevo",
      fecha: new Date("2024-10-07T09:00:00"),
      usuario: "Sistema",
    },
    {
      id: 2,
      estado: "En Proceso",
      fecha: new Date("2024-10-07T10:30:00"),
      usuario: "María González",
    },
  ],
};

export function ClaimDetailView({ claim, onClose }: ClaimDetailViewProps) {
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState<
    "comments" | "attachments" | "history"
  >("comments");
  const [selectedStatus, setSelectedStatus] = useState(claim.estado);
  const [selectedPriority, setSelectedPriority] = useState(
    claim.prioridad || "media",
  );
  const [selectedAssignee, setSelectedAssignee] = useState(
    mockClaimDetail.asignado_a,
  );

  const handleAddComment = () => {
    if (newComment.trim()) {
      console.log("[v0] Adding comment:", newComment);
      setNewComment("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{claim.codigo_acceso}</h1>
          <Chip color="warning" size="lg" variant="flat">
            {claim.estado}
          </Chip>
          <Chip color="danger" size="lg" variant="flat">
            {claim.prioridad}
          </Chip>
        </div>
        <Button isIconOnly variant="light" onPress={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <h2 className="text-xl font-semibold">
                  Descripción del Reclamo
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-foreground leading-relaxed">
                {mockClaimDetail.descripcion_completa}
              </p>
            </CardBody>
          </Card>

          {/* Tabs */}
          <Card>
            <CardBody className="p-0">
              {/* Custom Tabs */}
              <div className="border-b border-divider">
                <div className="flex gap-4 px-4">
                  <button
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                      activeTab === "comments"
                        ? "border-primary text-primary font-medium"
                        : "border-transparent text-default-500 hover:text-default-700"
                    }`}
                    onClick={() => setActiveTab("comments")}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>
                      Comentarios ({mockClaimDetail.comentarios.length})
                    </span>
                  </button>
                  <button
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                      activeTab === "attachments"
                        ? "border-primary text-primary font-medium"
                        : "border-transparent text-default-500 hover:text-default-700"
                    }`}
                    onClick={() => setActiveTab("attachments")}
                  >
                    <Paperclip className="h-4 w-4" />
                    <span>Adjuntos ({mockClaimDetail.adjuntos.length})</span>
                  </button>
                  <button
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                      activeTab === "history"
                        ? "border-primary text-primary font-medium"
                        : "border-transparent text-default-500 hover:text-default-700"
                    }`}
                    onClick={() => setActiveTab("history")}
                  >
                    <Clock className="h-4 w-4" />
                    <span>Historial</span>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {activeTab === "comments" && (
                  <div className="space-y-4">
                    {/* Comments List */}
                    <div className="space-y-3">
                      {mockClaimDetail.comentarios.map((comment) => (
                        <div
                          key={comment.id}
                          className="flex gap-3 p-3 bg-default-50 dark:bg-default-100/50 rounded-lg"
                        >
                          <Avatar
                            className="flex-shrink-0"
                            name={comment.usuario}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {comment.usuario}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {comment.fecha.toLocaleString()}
                              </span>
                              {comment.interno && (
                                <Chip color="warning" size="sm" variant="flat">
                                  Interno
                                </Chip>
                              )}
                            </div>
                            <p className="text-sm text-foreground">
                              {comment.comentario}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Divider />

                    {/* Add Comment */}
                    <div className="space-y-2">
                      <Textarea
                        minRows={3}
                        placeholder="Agregar un comentario..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="bordered">
                          Comentario Interno
                        </Button>
                        <Button
                          color="primary"
                          size="sm"
                          startContent={<Send className="h-4 w-4" />}
                          onPress={handleAddComment}
                        >
                          Enviar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "attachments" && (
                  <div className="space-y-3">
                    {mockClaimDetail.adjuntos.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-default-50 dark:bg-default-100/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
                            <Paperclip className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{file.nombre}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.tamano / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="bordered">
                          Descargar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="space-y-4">
                    {mockClaimDetail.historial.map((item, index) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                            <CheckCircle2 className="h-4 w-4 text-purple-600" />
                          </div>
                          {index < mockClaimDetail.historial.length - 1 && (
                            <div className="w-0.5 h-full bg-default-200 dark:bg-default-100 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-sm">{item.estado}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.fecha.toLocaleString()} - {item.usuario}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Gestión de Estado</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <label
                  className="text-sm font-medium mb-1.5 block"
                  htmlFor="status-select"
                >
                  Estado
                </label>
                <select
                  className="w-full px-3 py-2 bg-default-100 border border-default-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="Nuevo">Nuevo</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="En Revisión">En Revisión</option>
                  <option value="Resuelto">Resuelto</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              </div>
              <div>
                <label
                  className="text-sm font-medium mb-1.5 block"
                  htmlFor="priority-select"
                >
                  Prioridad
                </label>
                <select
                  className="w-full px-3 py-2 bg-default-100 border border-default-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedPriority}
                  onChange={(e) =>
                    setSelectedPriority(
                      e.target.value as "baja" | "media" | "alta" | "critica",
                    )
                  }
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
              <div>
                <label
                  className="text-sm font-medium mb-1.5 block"
                  htmlFor="assignee-select"
                >
                  Asignar a
                </label>
                <select
                  className="w-full px-3 py-2 bg-default-100 border border-default-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                >
                  <option value="María González">María González</option>
                  <option value="Carlos Ruiz">Carlos Ruiz</option>
                  <option value="Ana Torres">Ana Torres</option>
                </select>
              </div>
            </CardBody>
          </Card>

          {/* Claim Info */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Información del Reclamo</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Empresa</p>
                  <p className="text-sm font-medium">{claim.empresa}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    Fecha de Creación
                  </p>
                  <p className="text-sm font-medium">
                    {claim.fecha_creacion.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Ubicación</p>
                  <p className="text-sm font-medium">
                    {mockClaimDetail.ciudad}, {claim.pais}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Complainant Info */}
          {!claim.anonimo && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Información del Denunciante</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Nombre</p>
                    <p className="text-sm font-medium">
                      {claim.nombre_denunciante}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">
                      {claim.email_denunciante}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="text-sm font-medium">
                      {mockClaimDetail.telefono_denunciante}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
