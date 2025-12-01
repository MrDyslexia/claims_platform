"use client";

import React, { useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Spinner,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Filter,
  MapPin,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  Send,
  User,
} from "lucide-react";

import { useGetAllClaims, createComment, type Reclamo } from "@/lib/api/claims";

const priorityColors = {
  baja: "default",
  media: "warning",
  alta: "danger",
  critica: "danger",
} as const;

const statusColors: Record<string, any> = {
  Pendiente: "primary",
  "En Proceso": "warning",
  "En Revisión": "secondary",
  Resuelto: "success",
  Cerrado: "default",
};

export default function ClaimsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  // Obtener token de localStorage
  const [token, setToken] = useState<string | null>(null);
  const { data, loading, error, refetch } = useGetAllClaims(token);
  const [selectedClaim, setSelectedClaim] = useState<Reclamo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [isCommentInternal, setIsCommentInternal] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const rowsPerPage = 10;

  // Helper para formatear fechas de forma segura
  const formatDate = (dateString: string | Date | null | undefined): string => {
    try {
      // Si no hay fecha, usar la fecha actual
      const date = dateString ? new Date(dateString) : new Date();

      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        // Si la fecha es inválida, usar la fecha actual
        return new Date().toLocaleString("es-CL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      return date.toLocaleString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      // En caso de error, retornar la fecha actual
      return new Date().toLocaleString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // Helper para formatear solo fecha (sin hora)
  const formatDateOnly = (
    dateString: string | Date | null | undefined,
  ): string => {
    try {
      // Si no hay fecha, usar la fecha actual
      const date = dateString ? new Date(dateString) : new Date();

      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        // Si la fecha es inválida, usar la fecha actual
        return new Date().toLocaleDateString("es-CL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      }

      return date.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      // En caso de error, retornar la fecha actual
      return new Date().toLocaleDateString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }
  };

  // Cargar token de localStorage al montar
  React.useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");

    setToken(storedToken);
  }, []);

  const handleSendComment = async () => {
    if (!newComment.trim()) {
      setCommentError("El comentario no puede estar vacío");

      return;
    }

    if (!selectedClaim) {
      setCommentError("No hay reclamo seleccionado");

      return;
    }

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      const result = await createComment(
        selectedClaim.id,
        token || "",
        newComment.trim(),
        isCommentInternal,
      );

      // Agregar el nuevo comentario a la lista
      if (selectedClaim.comentarios) {
        selectedClaim.comentarios.push(result.comentario);
      }

      // Limpiar el formulario
      setNewComment("");
      setIsCommentInternal(false);
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : "Error al enviar comentario",
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const filteredClaims = (data?.reclamos || []).filter((claim) => {
    const matchesSearch =
      claim.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.tipo.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.empresa.nombre.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || claim.estado.nombre === filterStatus;
    const matchesPriority =
      filterPriority === "all" || claim.prioridad === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pages = Math.ceil(filteredClaims.length / rowsPerPage);
  const items = filteredClaims.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const handleViewClaim = (claim: Reclamo) => {
    setSelectedClaim(claim);
    onOpen();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Reclamos</h1>
          <p className="text-muted-foreground mt-1">
            Administra y da seguimiento a todos los reclamos
          </p>
        </div>
        <Button color="primary" startContent={<Plus className="h-4 w-4" />}>
          Nuevo Reclamo
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border border-red-200">
          <CardBody className="flex flex-row items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">{error}</p>
              {error.includes("token") && (
                <p className="text-red-600 text-sm mt-1">
                  Por favor, inicie sesión para acceder a esta página.
                </p>
              )}
            </div>
            {!error.includes("token") && (
              <Button
                className="bg-red-100 text-red-700 hover:bg-red-200"
                size="sm"
                variant="flat"
                onClick={() => refetch()}
              >
                Reintentar
              </Button>
            )}
          </CardBody>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              className="flex-1"
              placeholder="Buscar por código, tipo o empresa..."
              startContent={<Search className="h-4 w-4 text-default-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Dropdown>
              <DropdownTrigger>
                <Button
                  startContent={<Filter className="h-4 w-4" />}
                  variant="bordered"
                >
                  Estado: {filterStatus === "all" ? "Todos" : filterStatus}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filter by status"
                selectedKeys={[filterStatus]}
                onAction={(key) => setFilterStatus(key as string)}
              >
                <DropdownItem key="all">Todos</DropdownItem>
                <DropdownItem key="Pendiente">Pendiente</DropdownItem>
                <DropdownItem key="En Proceso">En Proceso</DropdownItem>
                <DropdownItem key="En Revisión">En Revisión</DropdownItem>
                <DropdownItem key="Resuelto">Resuelto</DropdownItem>
                <DropdownItem key="Cerrado">Cerrado</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  startContent={<Filter className="h-4 w-4" />}
                  variant="bordered"
                >
                  Prioridad:{" "}
                  {filterPriority === "all" ? "Todas" : filterPriority}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filter by priority"
                selectedKeys={[filterPriority]}
                onAction={(key) => setFilterPriority(key as string)}
              >
                <DropdownItem key="all">Todas</DropdownItem>
                <DropdownItem key="baja">Baja</DropdownItem>
                <DropdownItem key="media">Media</DropdownItem>
                <DropdownItem key="alta">Alta</DropdownItem>
                <DropdownItem key="critica">Crítica</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button
              startContent={<Download className="h-4 w-4" />}
              variant="bordered"
              onClick={() => refetch()}
            >
              Actualizar
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardBody className="flex flex-row items-center justify-center gap-3 py-8">
            <Spinner size="lg" />
            <span className="text-lg text-muted-foreground">
              Cargando reclamos...
            </span>
          </CardBody>
        </Card>
      )}

      {/* Claims Table */}
      {!loading && (
        <Card>
          <CardBody className="p-0">
            <Table
              aria-label="Claims table"
              bottomContent={
                <div className="flex w-full justify-center py-2">
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
            >
              <TableHeader>
                <TableColumn>CÓDIGO</TableColumn>
                <TableColumn>TIPO</TableColumn>
                <TableColumn>EMPRESA</TableColumn>
                <TableColumn>ESTADO</TableColumn>
                <TableColumn>PRIORIDAD</TableColumn>
                <TableColumn>FECHA</TableColumn>
              </TableHeader>
              <TableBody>
                {items.map((claim) => (
                  <TableRow
                    key={claim.id}
                    className="cursor-pointer hover:bg-default-100"
                    onClick={() => handleViewClaim(claim)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">{claim.numero}</span>
                      </div>
                    </TableCell>
                    <TableCell>{claim.tipo.nombre}</TableCell>
                    <TableCell>{claim.empresa.nombre}</TableCell>
                    <TableCell>
                      <Chip
                        color={statusColors[claim.estado.nombre] || "default"}
                        size="sm"
                        variant="flat"
                      >
                        {claim.estado.nombre}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={
                          priorityColors[
                            claim.prioridad as keyof typeof priorityColors
                          ]
                        }
                        size="sm"
                        variant="flat"
                      >
                        {claim.prioridad}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {formatDateOnly(claim.fecha_creacion)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      <Modal
        isOpen={isOpen}
        scrollBehavior="inside"
        size="5xl"
        onClose={onClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">
                    {selectedClaim?.numero}
                  </h2>
                  <Chip
                    color={
                      statusColors[selectedClaim?.estado.nombre || ""] ||
                      "default"
                    }
                    size="lg"
                    variant="flat"
                  >
                    {selectedClaim?.estado.nombre}
                  </Chip>
                  <Chip
                    color={
                      priorityColors[
                        selectedClaim?.prioridad as keyof typeof priorityColors
                      ]
                    }
                    size="lg"
                    variant="flat"
                  >
                    {selectedClaim?.prioridad}
                  </Chip>
                </div>
                <p className="text-sm text-muted-foreground font-normal">
                  {selectedClaim?.tipo.nombre}
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <Card>
                      <CardBody>
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-5 w-5 text-purple-600" />
                          <h3 className="text-lg font-semibold">
                            Descripción del Reclamo
                          </h3>
                        </div>
                        <p className="text-foreground leading-relaxed">
                          {selectedClaim?.asunto}
                        </p>
                        <p className="text-foreground leading-relaxed mt-2">
                          {selectedClaim?.descripcion}
                        </p>
                      </CardBody>
                    </Card>

                    {/* Tabs */}
                    <Card>
                      <CardBody className="p-0">
                        <Tabs
                          aria-label="Claim details tabs"
                          className="w-full"
                        >
                          <Tab
                            key="comments"
                            title={
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                <span>
                                  Comentarios (
                                  {selectedClaim?.comentarios.length || 0})
                                </span>
                              </div>
                            }
                          >
                            <div className="p-4 space-y-4">
                              <div className="space-y-3">
                                {selectedClaim?.comentarios.map((comment) => (
                                  <div
                                    key={comment.id}
                                    className="flex gap-3 p-3 bg-default-50 dark:bg-default-100/50 rounded-lg"
                                  >
                                    <Avatar
                                      className="flex-shrink-0"
                                      name={comment.autor.nombre}
                                      size="sm"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">
                                          {comment.autor.nombre}
                                        </span>
                                        {comment.es_interno && (
                                          <Chip
                                            color="warning"
                                            size="sm"
                                            variant="flat"
                                          >
                                            Interno
                                          </Chip>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                          {formatDate(comment.fecha_creacion)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-foreground">
                                        {comment.contenido}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <Divider />
                              <div className="space-y-2">
                                {commentError && (
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                                    <p className="text-sm text-red-700">
                                      {commentError}
                                    </p>
                                  </div>
                                )}
                                <Textarea
                                  disabled={isSubmittingComment}
                                  minRows={3}
                                  placeholder="Agregar un comentario..."
                                  value={newComment}
                                  onChange={(e) =>
                                    setNewComment(e.target.value)
                                  }
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    disabled={isSubmittingComment}
                                    size="sm"
                                    variant="bordered"
                                    onClick={() =>
                                      setIsCommentInternal(!isCommentInternal)
                                    }
                                  >
                                    {isCommentInternal ? "Interno" : "Público"}
                                  </Button>
                                  <Button
                                    color="primary"
                                    disabled={
                                      isSubmittingComment || !newComment.trim()
                                    }
                                    isLoading={isSubmittingComment}
                                    size="sm"
                                    startContent={<Send className="h-4 w-4" />}
                                    onClick={handleSendComment}
                                  >
                                    {isSubmittingComment
                                      ? "Enviando..."
                                      : "Enviar"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Tab>
                          <Tab
                            key="attachments"
                            title={
                              <div className="flex items-center gap-2">
                                <Paperclip className="h-4 w-4" />
                                <span>
                                  Adjuntos (
                                  {selectedClaim?.adjuntos.length || 0})
                                </span>
                              </div>
                            }
                          >
                            <div className="p-4 space-y-3">
                              {(selectedClaim?.adjuntos.length || 0) > 0 ? (
                                selectedClaim?.adjuntos.map((adjunto) => (
                                  <Card
                                    key={adjunto.id}
                                    className="bg-default-50"
                                  >
                                    <CardBody className="flex flex-row items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">
                                            {adjunto.nombre}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {(adjunto.tamano / 1024).toFixed(2)}{" "}
                                            KB • {adjunto.mime_type}
                                          </p>
                                        </div>
                                      </div>
                                      <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </CardBody>
                                  </Card>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  No hay adjuntos disponibles
                                </p>
                              )}
                            </div>
                          </Tab>
                          <Tab
                            key="history"
                            title={
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                  Historial (
                                  {selectedClaim?.historial_estado.length || 0})
                                </span>
                              </div>
                            }
                          >
                            <div className="p-4">
                              <div className="space-y-4">
                                {selectedClaim?.historial_estado.map((item) => (
                                  <div key={item.id} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                        <CheckCircle2 className="h-4 w-4 text-purple-600" />
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">
                                        {item.estado_anterior?.nombre} →{" "}
                                        {item.estado_nuevo.nombre}
                                      </p>
                                      {item.motivo && (
                                        <p className="text-xs text-muted-foreground">
                                          Motivo: {item.motivo}
                                        </p>
                                      )}
                                      <p className="text-xs text-muted-foreground">
                                        {formatDate(item.fecha_cambio)}{" "}
                                        {item.usuario &&
                                          `- ${item.usuario.nombre}`}
                                      </p>
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
                  <div className="space-y-4">
                    {/* Claim Info */}
                    <Card>
                      <CardBody className="space-y-3">
                        <h3 className="font-semibold mb-2">
                          Información del Reclamo
                        </h3>
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">
                              Empresa
                            </p>
                            <p className="text-sm font-medium">
                              {selectedClaim?.empresa.nombre}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">
                              Fecha de Creación
                            </p>
                            <p className="text-sm font-medium">
                              {formatDateOnly(selectedClaim?.fecha_creacion)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">
                              País
                            </p>
                            <p className="text-sm font-medium">
                              {selectedClaim?.denunciante.pais || "N/A"}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Complainant Info */}
                    {!selectedClaim?.denunciante.anonimo && (
                      <Card>
                        <CardBody className="space-y-3">
                          <h3 className="font-semibold mb-2">
                            Información del Denunciante
                          </h3>
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">
                                Nombre
                              </p>
                              <p className="text-sm font-medium">
                                {selectedClaim?.denunciante.nombre || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">
                                Email
                              </p>
                              <p className="text-sm font-medium">
                                {selectedClaim?.denunciante.email || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">
                                Teléfono
                              </p>
                              <p className="text-sm font-medium">
                                {selectedClaim?.denunciante.telefono || "N/A"}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    )}
                    {selectedClaim?.denunciante.anonimo && (
                      <Card className="bg-blue-50 border border-blue-200">
                        <CardBody>
                          <p className="text-sm text-blue-800">
                            ℹ️ Este reclamo fue presentado de manera anónima
                          </p>
                        </CardBody>
                      </Card>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button color="primary" onPress={onClose}>
                  Guardar Cambios
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
