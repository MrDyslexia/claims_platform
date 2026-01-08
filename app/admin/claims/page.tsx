"use client";

import type { Reclamo } from "@/lib/api/claims";

import { CommentTypeSwitch } from "@/components/comment-type-switch";

import { useState, useEffect, useCallback } from "react";
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
  Select,
  SelectItem,
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
  Tooltip,
} from "@heroui/react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  Filter,
  Mail,
  MapPin,
  MessageSquare,
  Paperclip,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  User,
} from "lucide-react";
import { SatisfactionRatingCard } from "@/components/SatisfactionRatingCard";

const priorityColors = {
  baja: "default",
  media: "warning",
  alta: "danger",
  critica: "danger",
} as const;

const statusColors: Record<string, any> = {
  "Pendiente de revisión": "primary",
  "En Proceso": "warning",
  "Reclamo resuelto": "success",
  "Reclamo desestimado": "default",
  "Requiere informacion": "secondary",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

const ESTADOS_DISPONIBLES = [
  { id: 1, nombre: "Pendiente de revisión", codigo: "PENDIENTE" },
  { id: 2, nombre: "En Proceso", codigo: "PROCESO" },
  { id: 3, nombre: "Requiere informacion", codigo: "INFO" },
  { id: 4, nombre: "Reclamo resuelto", codigo: "RESUELTO" },
  { id: 5, nombre: "Reclamo desestimado", codigo: "CERRADO" },
];

export default function ClaimsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  // Obtener token de localStorage
  const [token, setToken] = useState<string | null>(null);
  const [claims, setClaims] = useState<Reclamo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedClaim, setSelectedClaim] = useState<Reclamo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [isCommentInternal, setIsCommentInternal] = useState(true); // Changed default to true
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
  const [isAssigningSupervisor, setIsAssigningSupervisor] = useState(false);

  const [selectedNewStatus, setSelectedNewStatus] = useState<string>("");
  const [statusChangeReason, setStatusChangeReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Pending changes state (only saved when clicking "Guardar Cambios")
  const [pendingPriority, setPendingPriority] = useState<string | null>(null);
  const [pendingSupervisor, setPendingSupervisor] = useState<string | null>(null);
  const [isSavingChanges, setIsSavingChanges] = useState(false);

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
          hour12: false,
        });
      }

      return date.toLocaleString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      // En caso de error, retornar la fecha actual
      return new Date().toLocaleString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
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
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");

    setToken(storedToken);
  }, []);

  const fetchClaims = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/denuncias/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        setClaims(data.reclamos || []);
      } else {
        // Handle error, e.g., set an error state
      }
    } catch {
      // console.error("Error fetching claims:", error);
      setError("Error al cargar reclamos");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchSupervisors = useCallback(async () => {
    if (!token) return;
    try {
      // Usamos el endpoint de lista completa y filtramos en el frontend por ahora
      // Idealmente deberíamos tener un endpoint específico o filtrar en el backend
      const response = await fetch(
        `${API_BASE_URL}/usuarios/admin/lista-completa?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const supervisorUsers = data.usuarios.filter((u: any) =>
          u.roles.some((r: any) => r.arquetipo?.codigo?.toUpperCase() === "SUPERVISOR"),
        );

        setSupervisors(supervisorUsers);
      }
    } catch {
      // console.error("Error fetching supervisors:", error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchClaims();
      fetchSupervisors();
    }
  }, [token, fetchClaims, fetchSupervisors]);

  const handleSendComment = async () => {
    if (!selectedClaim || !newComment.trim()) {
      setCommentError("El comentario no puede estar vacío");

      return;
    }

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/denuncias/${selectedClaim.id}/comentarios`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            contenido: newComment,
            es_interno: isCommentInternal,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Error al enviar comentario");
      }

      setNewComment("");
      // Recargar reclamos para ver el nuevo comentario
      await fetchClaims();
      // Actualizar el reclamo seleccionado también
      const claimsResponse = await fetch(`${API_BASE_URL}/denuncias/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (claimsResponse.ok) {
        const data = await claimsResponse.json();
        const allClaims = data.reclamos || [];
        const refreshedClaim = allClaims.find(
          (c: any) => c.id === selectedClaim.id,
        );

        if (refreshedClaim) {
          setSelectedClaim(refreshedClaim);
        }
        setClaims(allClaims); // Update the main claims list
      }
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : "Error al enviar comentario",
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!selectedClaim) return;
    setIsUpdatingPriority(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/denuncias/${selectedClaim.id}/prioridad`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prioridad: newPriority }),
        },
      );

      if (response.ok) {
        // Refresh claims
        await fetchClaims();
        // Update local state
        setSelectedClaim({ ...selectedClaim, prioridad: newPriority as any });
      } else {
        const errorData = await response.json();

        throw new Error(errorData.error || "Failed to update priority");
      }
    } catch {
      // console.error("Error updating priority:", error);
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  const handleAssignSupervisor = async (supervisorId: string) => {
    if (!selectedClaim) return;
    setIsAssigningSupervisor(true);
    try {
      const response = await fetch(`${API_BASE_URL}/denuncias/asignar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          denuncia_id: selectedClaim.id,
          usuario_id: Number(supervisorId),
        }),
      });

      if (response.ok) {
        await fetchClaims();
        // Update local state logic if needed (e.g. show assigned supervisor)
        // For now, refetching claims will update the selectedClaim if it's still open
        const claimsResponse = await fetch(`${API_BASE_URL}/denuncias/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (claimsResponse.ok) {
          const data = await claimsResponse.json();
          const allClaims = data.reclamos || [];
          const refreshedClaim = allClaims.find(
            (c: any) => c.id === selectedClaim.id,
          );

          if (refreshedClaim) {
            setSelectedClaim(refreshedClaim);
          }
          setClaims(allClaims);
        }
      } else {
        throw new Error("Failed to assign supervisor");
      }
    } catch {
      // console.error("Error assigning supervisor:", error);
    } finally {
      setIsAssigningSupervisor(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedClaim || !selectedNewStatus || !token) return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/denuncias/${selectedClaim.id}/estado`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            estado_id: Number.parseInt(selectedNewStatus),
            motivo: statusChangeReason || undefined,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el estado");
      }

      // Actualizar el reclamo en la lista
      await fetchClaims();

      // Actualizar el reclamo seleccionado
      const updatedClaim = claims.find((c) => c.id === selectedClaim.id);

      if (updatedClaim) {
        setSelectedClaim(updatedClaim);
      }

      // Resetear formulario
      setSelectedNewStatus("");
      setStatusChangeReason("");
    } catch {
      alert("Error al actualizar el estado del reclamo");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save all pending changes when clicking "Guardar Cambios"
  const handleSaveAllChanges = async () => {
    if (!selectedClaim || !token) return;

    setIsSavingChanges(true);
    const errors: string[] = [];

    try {
      // 1. Save status change if different
      const originalStatusId = selectedClaim.estado?.id ? String(selectedClaim.estado.id) : "";
      if (selectedNewStatus && selectedNewStatus !== originalStatusId) {
        const response = await fetch(
          `${API_BASE_URL}/denuncias/${selectedClaim.id}/estado`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              estado_id: Number.parseInt(selectedNewStatus),
              motivo: statusChangeReason || undefined,
            }),
          },
        );
        if (!response.ok) {
          errors.push("Error al actualizar el estado");
        }
      }

      // 2. Save priority change if different
      if (pendingPriority && pendingPriority !== selectedClaim.prioridad) {
        const response = await fetch(
          `${API_BASE_URL}/denuncias/${selectedClaim.id}/prioridad`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ prioridad: pendingPriority }),
          },
        );
        if (!response.ok) {
          errors.push("Error al actualizar la prioridad");
        }
      }

      // 3. Save supervisor change if different
      const originalSupervisorId = selectedClaim.supervisor?.id ? String(selectedClaim.supervisor.id) : null;
      if (pendingSupervisor !== originalSupervisorId && pendingSupervisor) {
        const response = await fetch(`${API_BASE_URL}/denuncias/asignar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            denuncia_id: selectedClaim.id,
            usuario_id: Number(pendingSupervisor),
          }),
        });
        if (!response.ok) {
          errors.push("Error al asignar supervisor");
        }
      }

      if (errors.length > 0) {
        alert(errors.join("\n"));
      }

      // Refresh claims list
      await fetchClaims();
      
      // Close modal after saving
      onClose();
    } catch {
      alert("Error al guardar los cambios");
    } finally {
      setIsSavingChanges(false);
    }
  };

  const handleDownloadAttachment = async (
    adjuntoId: number,
    fileName: string,
  ) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/adjuntos/${adjuntoId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Error al descargar el archivo");
      }

      // Crear un blob desde la respuesta
      const blob = await response.blob();

      // Crear una URL para el blob
      const url = window.URL.createObjectURL(blob);

      // Crear un elemento <a> temporal para forzar la descarga
      const a = document.createElement("a");

      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert("Error al descargar el archivo adjunto");
    }
  };

  const filteredClaims = (claims || []).filter((claim) => {
    // Use local claims state
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
    // Initialize pending values to current values
    setPendingPriority(claim.prioridad);
    setPendingSupervisor(claim.supervisor?.id ? String(claim.supervisor.id) : null);
    setSelectedNewStatus(claim.estado?.id ? String(claim.estado.id) : "");
    setStatusChangeReason("");
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
                onPress={() => fetchClaims()}
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
                <DropdownItem key="Pendiente de revisión">
                  Pendiente de revisión
                </DropdownItem>
                <DropdownItem key="En Proceso">En Proceso</DropdownItem>
                <DropdownItem key="Reclamo resuelto">
                  Reclamo resuelto
                </DropdownItem>
                <DropdownItem key="Reclamo desestimado">
                  Reclamo desestimado
                </DropdownItem>
                <DropdownItem key="Requiere informacion">
                  Requiere informacion
                </DropdownItem>
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
              startContent={<RefreshCw className="h-4 w-4" />}
              variant="bordered"
              onPress={() => fetchClaims()}
            >
              Actualizar
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Loading State */}
      {isLoading && (
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
      {!isLoading && (
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
                <TableColumn>RESPONSABLE</TableColumn>
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
                        {!claim.prioridad ? "N/A" : claim.prioridad}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <p className="text-bold text-small capitalize">
                          {claim.supervisor
                            ? `${claim.supervisor.nombre}`
                            : "Sin asignar"}
                        </p>
                        {claim.supervisor && (
                          <p className="text-bold text-tiny capitalize text-default-400">
                            {claim.supervisor.email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(claim.fecha_creacion)}</TableCell>
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
                    {!selectedClaim?.prioridad
                      ? "N/A"
                      : selectedClaim?.prioridad}
                  </Chip>
                  <Tooltip content="Días desde creación">
                    <Chip
                    color='warning'
                    size="lg"
                    variant="flat"
                  >
                    {selectedClaim?.dias}
                  </Chip>
                  </Tooltip>
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
                                  <CommentTypeSwitch
                                    isInternal={isCommentInternal}
                                    onValueChange={setIsCommentInternal}
                                    isDisabled={isSubmittingComment}
                                  />
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
                                        onPress={() =>
                                          handleDownloadAttachment(
                                            adjunto.id,
                                            adjunto.nombre,
                                          )
                                        }
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
                              {selectedClaim?.pais || "N/A"}
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
                             <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                             <div className="flex-1">
                               <p className="text-xs text-muted-foreground">
                                 RUT
                               </p>
                               <p className="text-sm font-medium">
                                 {selectedClaim?.denunciante.rut || "N/A"}
                               </p>
                             </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
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
                            <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
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

                    {/* Satisfaction Card */}
                    {selectedClaim?.nota_satisfaccion && (
                      <SatisfactionRatingCard rating={selectedClaim.nota_satisfaccion} comment={selectedClaim.comentario_satisfaccion ?? undefined} />
                    )}

                    {/* Actions Card */}
                    <Card>
                      <CardBody className="space-y-4">
                        <h3 className="font-semibold">Gestión</h3>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">
                            Estado
                            {selectedNewStatus && selectedNewStatus !== (selectedClaim?.estado?.id ? String(selectedClaim.estado.id) : "") && (
                              <span className="text-warning ml-1">●</span>
                            )}
                          </p>
                          <Select
                            aria-label="Seleccionar estado"
                            className="max-w-xs"
                            placeholder="Cambiar estado"
                            selectedKeys={
                              selectedNewStatus
                                ? [selectedNewStatus]
                                : selectedClaim?.estado?.id
                                  ? [String(selectedClaim.estado.id)]
                                  : []
                            }
                            onChange={(e) =>
                              setSelectedNewStatus(e.target.value)
                            }
                          >
                            {ESTADOS_DISPONIBLES.map((estado) => (
                              <SelectItem key={String(estado.id)}>
                                {estado.nombre}
                              </SelectItem>
                            ))}
                          </Select>

                          {selectedNewStatus &&
                            selectedNewStatus !==
                              String(selectedClaim?.estado.id) && (
                              <div className="mt-3 space-y-3">
                                <Textarea
                                  label="Motivo del cambio (opcional)"
                                  minRows={2}
                                  placeholder="Describe el motivo del cambio de estado..."
                                  value={statusChangeReason}
                                  onChange={(e) =>
                                    setStatusChangeReason(e.target.value)
                                  }
                                />
                              </div>
                            )}
                        </div>

                        {/* Priority Selector */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">
                            Prioridad
                            {pendingPriority !== selectedClaim?.prioridad && (
                              <span className="text-warning ml-1">●</span>
                            )}
                          </p>
                          <Select
                            aria-label="Seleccionar prioridad"
                            className="max-w-xs"
                            selectedKeys={pendingPriority ? [pendingPriority] : []}
                            onChange={(e) => setPendingPriority(e.target.value)}
                          >
                            <SelectItem key="baja">Baja</SelectItem>
                            <SelectItem key="media">Media</SelectItem>
                            <SelectItem key="alta">Alta</SelectItem>
                            <SelectItem key="critica">Crítica</SelectItem>
                          </Select>
                        </div>

                        {/* Supervisor Assignment */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">
                            Asignar Supervisor
                            {pendingSupervisor !== (selectedClaim?.supervisor?.id ? String(selectedClaim.supervisor.id) : null) && (
                              <span className="text-warning ml-1">●</span>
                            )}
                          </p>
                          <Select
                            aria-label="Asignar supervisor"
                            className="max-w-xs"
                            placeholder="Seleccionar supervisor"
                            selectedKeys={pendingSupervisor ? [pendingSupervisor] : []}
                            onChange={(e) => setPendingSupervisor(e.target.value)}
                          >
                            {supervisors.map((supervisor) => (
                              <SelectItem key={supervisor.id_usuario}>
                                {`${supervisor.nombre} ${supervisor.apellido}`}
                              </SelectItem>
                            ))}
                          </Select>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button 
                  color="primary" 
                  isLoading={isSavingChanges}
                  onPress={handleSaveAllChanges}
                >
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
