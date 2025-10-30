"use client";
import type { Denuncia } from "@/lib/types/database";

import { useRouter } from "next/navigation"; // Import router here
import { useState } from "react";
import {
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
} from "@heroui/react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  FileText,
} from "lucide-react";

import { DataTable } from "@/components/data-table";

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

const columns = [
  {
    key: "codigo",
    label: "CÓDIGO",
    render: (
      claim: Denuncia & { empresa: string; tipo: string; estado: string },
    ) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-purple-600" />
        <span className="font-medium">{claim.codigo_acceso}</span>
      </div>
    ),
  },
  {
    key: "tipo",
    label: "TIPO",
    render: (
      claim: Denuncia & { empresa: string; tipo: string; estado: string },
    ) => claim.tipo,
  },
  {
    key: "empresa",
    label: "EMPRESA",
    render: (
      claim: Denuncia & { empresa: string; tipo: string; estado: string },
    ) => claim.empresa,
  },
  {
    key: "estado",
    label: "ESTADO",
    render: (
      claim: Denuncia & { empresa: string; tipo: string; estado: string },
    ) => (
      <Chip
        color={
          statusColors[claim.estado as keyof typeof statusColors] || "default"
        }
        size="sm"
        variant="flat"
      >
        {claim.estado}
      </Chip>
    ),
  },
  {
    key: "prioridad",
    label: "PRIORIDAD",
    render: (
      claim: Denuncia & { empresa: string; tipo: string; estado: string },
    ) => (
      <Chip
        color={priorityColors[claim.prioridad as keyof typeof priorityColors]}
        size="sm"
        variant="flat"
      >
        {claim.prioridad}
      </Chip>
    ),
  },
  {
    key: "fecha",
    label: "FECHA",
    render: (
      claim: Denuncia & { empresa: string; tipo: string; estado: string },
    ) => claim.fecha_creacion.toLocaleDateString(),
  },
  {
    key: "acciones",
    label: "ACCIONES",
    render: (
      claim: Denuncia & { empresa: string; tipo: string; estado: string },
    ) => {
      const router = useRouter(); // Declare router here

      return (
        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => router.push(`/admin/claims/${claim.id_denuncia}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button isIconOnly size="sm" variant="light">
            <Edit className="h-4 w-4" />
          </Button>
          <Button isIconOnly color="danger" size="sm" variant="light">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export default function ClaimsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [page, setPage] = useState(1);
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

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          <DataTable
            aria-label="Claims table"
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
            keyExtractor={(claim) => claim.id_denuncia.toString()}
          />
        </CardBody>
      </Card>
    </div>
  );
}
