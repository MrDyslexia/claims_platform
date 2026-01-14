"use client";

import type { Reclamo } from "@/lib/api/claims";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  Download,
  FileText,
  Filter,
  MapPin,
  MessageSquare,
  Paperclip,
  Search,
  Send,
  User,
  Upload,
  FileDown,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

import { CommentTypeSwitch } from "@/components/comment-type-switch";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

const availableStates = [
  { id: 1, nombre: "Pendiente de revisión", codigo: "PENDIENTE" },
  { id: 2, nombre: "En Proceso", codigo: "PROCESO" },
  { id: 3, nombre: "Requiere informacion", codigo: "INFO" },
  { id: 4, nombre: "Reclamo resuelto", codigo: "RESUELTO" },
  { id: 5, nombre: "Reclamo desestimado", codigo: "CERRADO" },
];

export default function SupervisorClaims() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [claims, setClaims] = useState<Reclamo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedClaim, setSelectedClaim] = useState<Reclamo | null>(null);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [filterStatus, setFilterStatus] = useState<string>(
    searchParams.get("status") || "all",
  );
  const [filterPriority, setFilterPriority] = useState<string>(
    searchParams.get("priority") || "all",
  );
  const [page, setPage] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [isCommentInternal, setIsCommentInternal] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [statusChangeReason, setStatusChangeReason] = useState("");
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [statusChangeError, setStatusChangeError] = useState<string | null>(
    null,
  );
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  const [reportUploadError, setReportUploadError] = useState<string | null>(
    null,
  );
  const [reportUploadSuccess, setReportUploadSuccess] = useState(false);
  const rowsPerPage = 10;

  // Helper para formatear fechas de forma segura
  const formatDate = (dateString: string | Date | null | undefined): string => {
    try {
      const date = dateString ? new Date(dateString) : new Date();

      if (isNaN(date.getTime())) {
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
      const date = dateString ? new Date(dateString) : new Date();

      if (isNaN(date.getTime())) {
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
      return new Date().toLocaleDateString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }
  };

  // Cargar token de localStorage al<bos>montar
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");

    setToken(storedToken);
  }, []);

  useEffect(() => {
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    if (status) setFilterStatus(status);
    if (priority) setFilterPriority(priority);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  const fetchClaims = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/denuncias/assigned`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        setClaims(data.reclamos || []);
      } else {
        setError("Error al cargar reclamos");
      }
    } catch {
      setError("Error al cargar reclamos");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchClaims();
    }
  }, [token, fetchClaims]);

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
      const claimsResponse = await fetch(`${API_BASE_URL}/denuncias/assigned`, {
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
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : "Error al enviar comentario",
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDownloadAttachment = async (
    adjuntoId: number,
    nombre: string,
  ) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/denuncias/adjuntos/${adjuntoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Error al descargar el archivo");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = nombre;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // Error downloading attachment
    }
  };

  const handleStatusChange = async () => {
    if (!token || !selectedClaim || !selectedStatus) return;

    const selectedState = availableStates.find((s) => s.id === selectedStatus);

    if (selectedState?.codigo === "CERRADO" && !reportFile) {
      setStatusChangeError(
        "Debe adjuntar un informe PDF antes de cambiar el estado a 'Reclamo desestimado'",
      );

      return;
    }

    setIsChangingStatus(true);
    setStatusChangeError(null);

    try {
      if (reportFile && selectedState?.codigo === "CERRADO") {
        const formData = new FormData();

        formData.append("pdf", reportFile);

        const uploadResponse = await fetch(
          `${API_BASE_URL}/denuncias/${selectedClaim.id}/informe-resolucion`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();

          throw new Error(
            errorData.error ||
              "Error al subir el informe antes de cambiar el estado",
          );
        }
      }

      if (reportFile && selectedState?.codigo === "RESUELTO") {
        const formData = new FormData();

        formData.append("pdf", reportFile);

        const uploadResponse = await fetch(
          `${API_BASE_URL}/denuncias/${selectedClaim.id}/informe-resolucion`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();

          throw new Error(errorData.error || "Error al subir el informe");
        }
      }

      const response = await fetch(
        `${API_BASE_URL}/denuncias/${selectedClaim.id}/estado`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            estado_id: selectedStatus,
            motivo: statusChangeReason.trim() || undefined,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Error al cambiar el estado");
      }

      // Recargar todos los reclamos para obtener los datos completos
      const claimsResponse = await fetch(`${API_BASE_URL}/denuncias/assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (claimsResponse.ok) {
        const data = await claimsResponse.json();
        const allClaims = data.reclamos || [];

        // Actualizar la lista de reclamos
        setClaims(allClaims);

        // Buscar y actualizar el reclamo seleccionado con datos completos
        const refreshedClaim = allClaims.find(
          (c: any) => c.id === selectedClaim.id,
        );

        if (refreshedClaim) {
          setSelectedClaim(refreshedClaim);
          setSelectedStatus(refreshedClaim.estado?.id || null);
        }
      }

      alert(
        `Estado del reclamo cambiado exitosamente a: ${selectedState?.nombre || "nuevo estado"}`,
      );

      setStatusChangeReason("");
      setReportFile(null);
      const fileInput = document.getElementById(
        "report-file-upload",
      ) as HTMLInputElement;

      if (fileInput) fileInput.value = "";
    } catch (error) {
      setStatusChangeError(
        error instanceof Error ? error.message : "Error desconocido",
      );
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleUploadReport = async () => {
    if (!reportFile || !selectedClaim) return;

    setIsUploadingReport(true);
    setReportUploadError(null);

    try {
      const token = localStorage.getItem("auth_token");

      const formData = new FormData();

      formData.append("pdf", reportFile);

      const response = await fetch(
        `${API_BASE_URL}/denuncias/${selectedClaim.id}/informe-resolucion`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Error al subir el informe");
      }

      setReportUploadSuccess(true);
      setReportFile(null);

      // Reset file input
      const fileInput = document.getElementById(
        "file-resuelto",
      ) as HTMLInputElement;

      if (fileInput) fileInput.value = "";

      // Fetch claims first to ensure we have the latest list
      await fetchClaims();
      alert("Informe PDF subido correctamente");
      onClose();
      setTimeout(() => setReportUploadSuccess(false), 3000);
    } catch (error) {
      setReportUploadError(
        error instanceof Error ? error.message : "Error al subir el informe",
      );
    } finally {
      setIsUploadingReport(false);
    }
  };

  const filteredClaims = useMemo(() => {
    return (claims || []).filter((claim) => {
      const matchesSearch =
        claim.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.tipo.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.empresa.nombre.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || claim.estado.codigo === filterStatus;
      const matchesPriority =
        filterPriority === "all" || claim.prioridad === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [claims, searchQuery, filterStatus, filterPriority]);

  const pages = Math.ceil(filteredClaims.length / rowsPerPage);
  const items = filteredClaims.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const handleViewClaim = (claim: Reclamo) => {
    setSelectedClaim(claim);
    setSelectedStatus(claim.estado?.id || null);
    setStatusChangeReason("");
    setStatusChangeError(null);
    setReportFile(null); // Limpiar el archivo de reporte al abrir un nuevo reclamo
    setReportUploadError(null);
    setReportUploadSuccess(false);
    onOpen();
  };

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Reclamos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los reclamos asignados a ti
          </p>
        </div>
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
                <DropdownItem key="PENDIENTE">Pendiente</DropdownItem>
                <DropdownItem key="PROCESO">En Proceso</DropdownItem>
                <DropdownItem key="INFO">Requiere informacion</DropdownItem>
                <DropdownItem key="RESUELTO">Resuelto</DropdownItem>
                <DropdownItem key="CERRADO">Cerrado</DropdownItem>
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
          {(_onClose) => (
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
                  <Tooltip content="Días desde creación">
                    <Chip color="warning" size="lg" variant="flat">
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
                                  {selectedClaim?.comentarios?.length || 0})
                                </span>
                              </div>
                            }
                          >
                            <div className="p-4 space-y-4">
                              <div className="space-y-3">
                                {selectedClaim?.comentarios?.map((comment) => (
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
                                <div className="flex items-center justify-between gap-2">
                                  <CommentTypeSwitch
                                    isDisabled={isSubmittingComment}
                                    isInternal={isCommentInternal}
                                    onValueChange={setIsCommentInternal}
                                  />
                                  <Button
                                    color="primary"
                                    disabled={
                                      isSubmittingComment || !newComment.trim()
                                    }
                                    isLoading={isSubmittingComment}
                                    size="sm"
                                    startContent={<Send className="h-4 w-4" />}
                                    onPress={handleSendComment}
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
                                  {selectedClaim?.adjuntos?.length || 0})
                                </span>
                              </div>
                            }
                          >
                            <div className="p-4 space-y-3">
                              {(selectedClaim?.adjuntos?.length || 0) > 0 ? (
                                selectedClaim?.adjuntos?.map((adjunto) => (
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
                                        onPress={() => {
                                          handleDownloadAttachment(
                                            adjunto.id,
                                            adjunto.nombre,
                                          );
                                        }}
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
                                  {selectedClaim?.historial_estado?.length || 0}
                                  )
                                </span>
                              </div>
                            }
                          >
                            <div className="p-4">
                              <div className="space-y-4">
                                {selectedClaim?.historial_estado?.map(
                                  (item) => (
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
                                  ),
                                )}
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

                    {/* Actions Card */}
                    <Card>
                      <CardBody className="space-y-4">
                        <h3 className="font-semibold">Gestión</h3>

                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground mb-1.5">
                            Cambiar Estado
                          </p>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button
                                className="w-full justify-start"
                                size="sm"
                                variant="bordered"
                              >
                                {selectedStatus
                                  ? availableStates.find(
                                      (s) => s.id === selectedStatus,
                                    )?.nombre
                                  : "Seleccionar estado..."}
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                              aria-label="Estado del reclamo"
                              onAction={(key) => {
                                const newStateId = Number(key);

                                setSelectedStatus(newStateId);
                                // Si se selecciona un estado que no es CERRADO, limpiar el reporte
                                if (
                                  availableStates.find(
                                    (s) => s.id === newStateId,
                                  )?.codigo !== "CERRADO"
                                ) {
                                  setReportFile(null);
                                  setReportUploadError(null);
                                  setReportUploadSuccess(false);
                                  const fileInput = document.getElementById(
                                    "file",
                                  ) as HTMLInputElement; // Changed ID to 'file' for consistency with JSX

                                  if (fileInput) fileInput.value = "";
                                }
                                setStatusChangeReason(""); // Limpiar el motivo al cambiar de estado
                                setStatusChangeError(null); // Limpiar errores al cambiar de estado
                              }}
                            >
                              {availableStates.map((estado) => (
                                <DropdownItem
                                  key={estado.id}
                                  className={
                                    selectedClaim?.estado.id === estado.id
                                      ? "bg-default-100"
                                      : ""
                                  }
                                >
                                  {estado.nombre}
                                  {selectedClaim?.estado.id === estado.id &&
                                    " (actual)"}
                                </DropdownItem>
                              ))}
                            </DropdownMenu>
                          </Dropdown>

                          {selectedStatus &&
                            selectedStatus !== selectedClaim?.estado.id && (
                              <>
                                <Textarea
                                  label="Motivo del cambio (opcional)"
                                  minRows={2}
                                  placeholder="Ingrese el motivo del cambio de estado..."
                                  size="sm"
                                  value={statusChangeReason}
                                  onChange={(e) =>
                                    setStatusChangeReason(e.target.value)
                                  }
                                />
                                {statusChangeError && (
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
                                    <p className="text-sm text-red-700">
                                      {statusChangeError}
                                    </p>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <Button
                                    className="flex-1"
                                    color="primary"
                                    isLoading={isChangingStatus}
                                    size="sm"
                                    onPress={handleStatusChange}
                                  >
                                    Confirmar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    onPress={() => {
                                      setSelectedStatus(null);
                                      setStatusChangeReason("");
                                      setStatusChangeError(null);
                                      // Reset report file if cancellation occurs
                                      setReportFile(null);
                                      const fileInput = document.getElementById(
                                        "file",
                                      ) as HTMLInputElement; // Changed ID to 'file' for consistency with JSX

                                      if (fileInput) fileInput.value = "";
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </>
                            )}

                          {/* CHANGE: Modified condition to show download card if claim has resolution */}
                          {selectedStatus === 5 &&
                            selectedStatus !== selectedClaim?.estado.id &&
                            !selectedClaim?.resolucion && (
                              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg mt-3">
                                <CardBody className="space-y-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                                      <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-amber-900">
                                        Informe Final Requerido
                                      </h3>
                                      <p className="text-xs text-amber-700">
                                        Debe adjuntar un informe PDF para cerrar
                                        el reclamo
                                      </p>
                                    </div>
                                  </div>

                                  <div className="bg-white rounded-lg p-4 border-2 border-amber-200">
                                    <input
                                      accept=".pdf,application/pdf"
                                      className="hidden"
                                      disabled={isUploadingReport}
                                      id="file" // Changed ID to 'file' for consistency with JSX
                                      type="file"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];

                                        if (
                                          file &&
                                          file.type === "application/pdf"
                                        ) {
                                          setReportFile(file);
                                          setReportUploadError(null);
                                          setStatusChangeError(null);
                                        } else if (file) {
                                          setReportUploadError(
                                            "Solo se permiten archivos PDF",
                                          );
                                          setStatusChangeError(
                                            "Solo se permiten archivos PDF",
                                          );
                                          e.target.value = "";
                                        }
                                      }}
                                    />

                                    <label
                                      className="cursor-pointer flex flex-col items-center gap-2 py-4"
                                      htmlFor="file"
                                    >
                                      <Upload className="w-8 h-8 text-amber-400" />
                                      <span className="text-sm text-amber-900 text-center font-medium">
                                        {reportFile
                                          ? reportFile.name
                                          : "Seleccionar archivo PDF"}
                                      </span>
                                      {reportFile && (
                                        <span className="text-xs text-amber-600">
                                          {(
                                            reportFile.size /
                                            1024 /
                                            1024
                                          ).toFixed(2)}{" "}
                                          MB
                                        </span>
                                      )}
                                    </label>

                                    {reportUploadError && (
                                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                        <p className="text-xs text-red-700">
                                          {reportUploadError}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {reportFile && (
                                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-white p-2 rounded border border-amber-200">
                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                      <span>
                                        Archivo listo para subir al confirmar el
                                        cambio
                                      </span>
                                    </div>
                                  )}
                                </CardBody>
                              </Card>
                            )}

                          {/* CHANGE: Show upload card for RESUELTO only if no resolution exists */}
                          {selectedClaim?.estado.codigo === "RESUELTO" &&
                            !selectedClaim?.resolucion &&
                            (!selectedStatus ||
                              selectedStatus === selectedClaim?.estado.id) && (
                              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg mt-3">
                                <CardBody className="space-y-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                                      <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-green-900">
                                        Informe de Resolución (Opcional)
                                      </h3>
                                      <p className="text-xs text-green-700">
                                        Puede adjuntar un informe PDF con los
                                        detalles de la resolución
                                      </p>
                                    </div>
                                  </div>

                                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                                    <input
                                      accept=".pdf,application/pdf"
                                      className="hidden"
                                      disabled={isUploadingReport}
                                      id="file-resuelto" // Unique ID for this file input
                                      type="file"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];

                                        if (
                                          file &&
                                          file.type === "application/pdf"
                                        ) {
                                          setReportFile(file);
                                          setReportUploadError(null);
                                          setStatusChangeError(null);
                                        } else if (file) {
                                          setReportUploadError(
                                            "Solo se permiten archivos PDF",
                                          );
                                          e.target.value = "";
                                        }
                                      }}
                                    />

                                    <label
                                      className="cursor-pointer flex flex-col items-center gap-2 py-4"
                                      htmlFor="file-resuelto"
                                    >
                                      <Upload className="w-8 h-8 text-green-400" />
                                      <span className="text-sm text-green-900 text-center font-medium">
                                        {reportFile
                                          ? reportFile.name
                                          : "Seleccionar archivo PDF"}
                                      </span>
                                      {reportFile && (
                                        <span className="text-xs text-green-600">
                                          {(
                                            reportFile.size /
                                            1024 /
                                            1024
                                          ).toFixed(2)}{" "}
                                          MB
                                        </span>
                                      )}
                                    </label>

                                    {reportUploadError && (
                                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                        <p className="text-xs text-red-700">
                                          {reportUploadError}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {reportFile && (
                                    <div className="flex items-center gap-2 text-xs text-green-700 bg-white p-2 rounded border border-green-200">
                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                      <span>
                                        Archivo listo para subir al confirmar el
                                        cambio
                                      </span>
                                    </div>
                                  )}

                                  <Button
                                    className="w-full"
                                    color="success"
                                    isDisabled={!reportFile}
                                    isLoading={isUploadingReport}
                                    size="sm"
                                    startContent={
                                      <Upload className="w-4 h-4" />
                                    }
                                    onPress={handleUploadReport}
                                  >
                                    Subir Informe
                                  </Button>

                                  {reportUploadSuccess && (
                                    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-100 p-2 rounded border border-green-300">
                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                      <span>
                                        Informe PDF subido correctamente
                                      </span>
                                    </div>
                                  )}
                                </CardBody>
                              </Card>
                            )}

                          {selectedStatus === 4 &&
                            selectedStatus !== selectedClaim?.estado.id &&
                            !selectedClaim?.resolucion && (
                              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg mt-3">
                                <CardBody className="space-y-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                                      <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-green-900">
                                        Informe de Resolución (Opcional)
                                      </h3>
                                      <p className="text-xs text-green-700">
                                        Puede adjuntar un informe PDF con los
                                        detalles de la resolución
                                      </p>
                                    </div>
                                  </div>

                                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                                    <input
                                      accept=".pdf,application/pdf"
                                      className="hidden"
                                      disabled={isUploadingReport}
                                      id="file-resuelto-change" // Unique ID for this file input
                                      type="file"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];

                                        if (
                                          file &&
                                          file.type === "application/pdf"
                                        ) {
                                          setReportFile(file);
                                          setReportUploadError(null);
                                          setStatusChangeError(null);
                                        } else if (file) {
                                          setReportUploadError(
                                            "Solo se permiten archivos PDF",
                                          );
                                          e.target.value = "";
                                        }
                                      }}
                                    />

                                    <label
                                      className="cursor-pointer flex flex-col items-center gap-2 py-4"
                                      htmlFor="file-resuelto-change"
                                    >
                                      <Upload className="w-8 h-8 text-green-400" />
                                      <span className="text-sm text-green-900 text-center font-medium">
                                        {reportFile
                                          ? reportFile.name
                                          : "Seleccionar archivo PDF (opcional)"}
                                      </span>
                                      {reportFile && (
                                        <span className="text-xs text-green-600">
                                          {(
                                            reportFile.size /
                                            1024 /
                                            1024
                                          ).toFixed(2)}{" "}
                                          MB
                                        </span>
                                      )}
                                    </label>

                                    {reportUploadError && (
                                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                        <p className="text-xs text-red-700">
                                          {reportUploadError}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {reportFile && (
                                    <div className="flex items-center gap-2 text-xs text-green-700 bg-white p-2 rounded border border-green-200">
                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                      <span>
                                        Archivo listo para subir al confirmar el
                                        cambio
                                      </span>
                                    </div>
                                  )}
                                </CardBody>
                              </Card>
                            )}

                          {(selectedClaim?.estado.codigo === "CERRADO" ||
                            selectedClaim?.estado.codigo === "RESUELTO") &&
                            selectedClaim?.resolucion &&
                            (!selectedStatus ||
                              selectedStatus === selectedClaim?.estado.id) && (
                              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-lg mt-3">
                                <CardBody className="space-y-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                                      <FileDown className="w-10 h-10 text-blue-600" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-blue-900">
                                        Informe de Resolución
                                      </h3>
                                      <p className="text-xs text-blue-700">
                                        El reclamo tiene un informe adjunto
                                        disponible para descargar
                                      </p>
                                    </div>
                                  </div>

                                  <Button
                                    className="w-full"
                                    color="primary"
                                    size="sm"
                                    startContent={
                                      <Download className="w-4 h-4" />
                                    }
                                    onPress={async () => {
                                      try {
                                        const response = await fetch(
                                          `${API_BASE_URL}/denuncias/${selectedClaim.id}/informe-resolucion`,
                                          {
                                            headers: {
                                              Authorization: `Bearer ${token}`,
                                            },
                                            method: "GET",
                                          },
                                        );

                                        if (!response.ok)
                                          throw new Error(
                                            "Error al descargar el informe",
                                          );

                                        const blob = await response.blob();
                                        const url =
                                          window.URL.createObjectURL(blob);
                                        const a = document.createElement("a");

                                        a.href = url;
                                        a.download = `informe-resolucion-${selectedClaim.id}.pdf`;
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                      } catch (error) {
                                        console.error(
                                          "Error al descargar el informe:",
                                          error,
                                        );
                                        alert("Error al descargar el informe");
                                      }
                                    }}
                                  >
                                    Descargar Informe PDF
                                  </Button>
                                </CardBody>
                              </Card>
                            )}
                        </div>

                        <Divider />

                        {/* Priority (Read Only) */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">
                            Prioridad
                          </p>
                          <Chip
                            color={
                              priorityColors[
                                selectedClaim?.prioridad as keyof typeof priorityColors
                              ]
                            }
                            size="sm"
                            variant="flat"
                          >
                            {selectedClaim?.prioridad}
                          </Chip>
                        </div>

                        {/* Supervisor (Read Only) */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">
                            Supervisor Asignado
                          </p>
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={selectedClaim?.supervisor?.nombre}
                              size="sm"
                            />
                            <div>
                              <p className="text-sm font-medium">
                                {selectedClaim?.supervisor
                                  ? `${selectedClaim.supervisor.nombre || ""} ${selectedClaim.supervisor.apellido || ""}`.trim() ||
                                    "Sin asignar"
                                  : "Sin asignar"}
                              </p>
                              {selectedClaim?.supervisor && (
                                <p className="text-xs text-muted-foreground">
                                  {selectedClaim.supervisor.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>{/* Footer content here */}</ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
