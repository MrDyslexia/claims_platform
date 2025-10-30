"use client";
import type { Denuncia } from "@/lib/types/database";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  Input,
  Button,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab,
  Avatar,
  Divider,
  Textarea,
} from "@heroui/react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  FileText,
  User,
  Building2,
  Calendar,
  MapPin,
  MessageSquare,
  Paperclip,
  Clock,
  CheckCircle2,
  Send,
} from "lucide-react";

// Mock data
const mockClaims: (Denuncia & {
  empresa: string;
  tipo: string;
  estado: string;
})[] = [
  {
    id_denuncia: 1,
    codigo_acceso: "RC-2024-001",
    id_empresa: 1,
    empresa: "Empresa ABC",
    id_tipo: 1,
    tipo: "Acoso Laboral",
    id_estado: 2,
    estado: "En Proceso",
    descripcion: "Situación de acoso por parte de supervisor directo",
    fecha_creacion: new Date("2024-10-07"),
    fecha_actualizacion: new Date("2024-10-07"),
    anonimo: false,
    nombre_denunciante: "Juan Pérez",
    email_denunciante: "juan@example.com",
    pais: "Chile",
    prioridad: "alta",
  },
  {
    id_denuncia: 2,
    codigo_acceso: "RC-2024-002",
    id_empresa: 2,
    empresa: "Empresa XYZ",
    id_tipo: 2,
    tipo: "Discriminación",
    id_estado: 1,
    estado: "Nuevo",
    descripcion: "Discriminación por género en proceso de promoción",
    fecha_creacion: new Date("2024-10-07"),
    fecha_actualizacion: new Date("2024-10-07"),
    anonimo: true,
    pais: "Argentina",
    prioridad: "critica",
  },
  {
    id_denuncia: 3,
    codigo_acceso: "RC-2024-003",
    id_empresa: 1,
    empresa: "Empresa ABC",
    id_tipo: 3,
    tipo: "Fraude",
    id_estado: 3,
    estado: "En Revisión",
    descripcion: "Posible fraude en proceso de licitación",
    fecha_creacion: new Date("2024-10-06"),
    fecha_actualizacion: new Date("2024-10-06"),
    anonimo: false,
    nombre_denunciante: "María González",
    email_denunciante: "maria@example.com",
    pais: "Chile",
    prioridad: "media",
  },
];

const priorityColors = {
  baja: "default",
  media: "warning",
  alta: "danger",
  critica: "danger",
} as const;

const statusColors = {
  Nuevo: "primary",
  "En Proceso": "warning",
  "En Revisión": "secondary",
  Resuelto: "success",
  Cerrado: "default",
} as const;

export default function ClaimsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedClaim, setSelectedClaim] = useState<
    (Denuncia & { empresa: string; tipo: string; estado: string }) | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [newComment, setNewComment] = useState("");
  const rowsPerPage = 10;

  const filteredClaims = mockClaims.filter((claim) => {
    const matchesSearch =
      claim.codigo_acceso.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.tipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.empresa.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || claim.estado === filterStatus;
    const matchesPriority =
      filterPriority === "all" || claim.prioridad === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pages = Math.ceil(filteredClaims.length / rowsPerPage);
  const items = filteredClaims.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const handleViewClaim = (
    claim: Denuncia & { empresa: string; tipo: string; estado: string },
  ) => {
    setSelectedClaim(claim);
    onOpen();
  };

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
                <DropdownItem key="Nuevo">Nuevo</DropdownItem>
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
            >
              Exportar
            </Button>
          </div>
        </CardBody>
      </Card>

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
                  key={claim.id_denuncia}
                  className="cursor-pointer hover:bg-default-100"
                  onClick={() => handleViewClaim(claim)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">{claim.codigo_acceso}</span>
                    </div>
                  </TableCell>
                  <TableCell>{claim.tipo}</TableCell>
                  <TableCell>{claim.empresa}</TableCell>
                  <TableCell>
                    <Chip
                      color={
                        statusColors[
                          claim.estado as keyof typeof statusColors
                        ] || "default"
                      }
                      size="sm"
                      variant="flat"
                    >
                      {claim.estado}
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
                    {claim.fecha_creacion.toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

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
                    {selectedClaim?.codigo_acceso}
                  </h2>
                  <Chip
                    color={
                      statusColors[
                        selectedClaim?.estado as keyof typeof statusColors
                      ] || "default"
                    }
                    size="lg"
                    variant="flat"
                  >
                    {selectedClaim?.estado}
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
                  {selectedClaim?.tipo}
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
                                <span>Comentarios</span>
                              </div>
                            }
                          >
                            <div className="p-4 space-y-4">
                              <div className="space-y-3">
                                <div className="flex gap-3 p-3 bg-default-50 dark:bg-default-100/50 rounded-lg">
                                  <Avatar
                                    className="flex-shrink-0"
                                    name="Sistema"
                                    size="sm"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm">
                                        Sistema
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {selectedClaim?.fecha_creacion.toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-foreground">
                                      Reclamo creado
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <Divider />
                              <div className="space-y-2">
                                <Textarea
                                  minRows={3}
                                  placeholder="Agregar un comentario..."
                                  value={newComment}
                                  onChange={(e) =>
                                    setNewComment(e.target.value)
                                  }
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
                          </Tab>
                          <Tab
                            key="attachments"
                            title={
                              <div className="flex items-center gap-2">
                                <Paperclip className="h-4 w-4" />
                                <span>Adjuntos</span>
                              </div>
                            }
                          >
                            <div className="p-4">
                              <p className="text-sm text-muted-foreground">
                                No hay adjuntos disponibles
                              </p>
                            </div>
                          </Tab>
                          <Tab
                            key="history"
                            title={
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Historial</span>
                              </div>
                            }
                          >
                            <div className="p-4">
                              <div className="space-y-4">
                                <div className="flex gap-3">
                                  <div className="flex flex-col items-center">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                      <CheckCircle2 className="h-4 w-4 text-purple-600" />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">
                                      {selectedClaim?.estado}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {selectedClaim?.fecha_creacion.toLocaleString()}{" "}
                                      - Sistema
                                    </p>
                                  </div>
                                </div>
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
                              {selectedClaim?.empresa}
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
                              {selectedClaim?.fecha_creacion.toLocaleDateString()}
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
                              {selectedClaim?.pais}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Complainant Info */}
                    {!selectedClaim?.anonimo && (
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
                                {selectedClaim?.nombre_denunciante}
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
                                {selectedClaim?.email_denunciante}
                              </p>
                            </div>
                          </div>
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
