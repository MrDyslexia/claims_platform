/* eslint-disable no-console */
"use client";

import type React from "react";
import type { Empresa } from "@/lib/types/database";

import { useState } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Chip,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Checkbox,
} from "@heroui/react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Building2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import { DataTable } from "@/components/data-table";

// Mock data
const mockCompanies: Empresa[] = [
  {
    id_empresa: 1,
    nombre: "Empresa ABC S.A.",
    rut: "76.123.456-7",
    direccion: "Av. Providencia 1234, Santiago",
    telefono: "+56223456789",
    email: "contacto@empresaabc.cl",
    activo: true,
  },
  {
    id_empresa: 2,
    nombre: "Corporación XYZ Ltda.",
    rut: "77.987.654-3",
    direccion: "Calle Principal 567, Valparaíso",
    telefono: "+56321234567",
    email: "info@corporacionxyz.cl",
    activo: true,
  },
  {
    id_empresa: 3,
    nombre: "Industrias DEF",
    rut: "78.555.444-2",
    direccion: "Av. Industrial 890, Concepción",
    telefono: "+56412345678",
    email: "contacto@industriasdef.cl",
    activo: false,
  },
];

const columns = [
  { key: "empresa", label: "EMPRESA" },
  { key: "rut", label: "RUT" },
  { key: "contacto", label: "CONTACTO" },
  { key: "direccion", label: "DIRECCIÓN" },
  { key: "estado", label: "ESTADO" },
  { key: "acciones", label: "ACCIONES" },
];

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingCompany, setEditingCompany] = useState<Empresa | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    rut: "",
    direccion: "",
    telefono: "",
    email: "",
    activo: true,
  });

  const rowsPerPage = 10;

  const filteredCompanies = mockCompanies.filter(
    (company) =>
      company.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.rut?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pages = Math.ceil(filteredCompanies.length / rowsPerPage);
  const items = filteredCompanies.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const handleOpenModal = (company?: Empresa | null) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        nombre: company.nombre,
        rut: company.rut || "",
        direccion: company.direccion || "",
        telefono: company.telefono || "",
        email: company.email || "",
        activo: company.activo,
      });
    } else {
      setEditingCompany(null);
      setFormData({
        nombre: "",
        rut: "",
        direccion: "",
        telefono: "",
        email: "",
        activo: true,
      });
    }
    onOpen();
  };

  const handleSave = () => {
    console.log("[v0] Saving company:", formData);
    onClose();
  };

  const renderCell = (company: Empresa, columnKey: React.Key) => {
    switch (columnKey) {
      case "empresa":
        return (
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <span className="font-medium">{company.nombre}</span>
          </div>
        );
      case "rut":
        return company.rut || "-";
      case "contacto":
        return (
          <div className="space-y-1">
            {company.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span>{company.email}</span>
              </div>
            )}
            {company.telefono && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span>{company.telefono}</span>
              </div>
            )}
          </div>
        );
      case "direccion":
        return company.direccion ? (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="truncate max-w-xs">{company.direccion}</span>
          </div>
        ) : (
          "-"
        );
      case "estado":
        return (
          <Chip
            color={company.activo ? "success" : "default"}
            size="sm"
            variant="flat"
          >
            {company.activo ? "Activa" : "Inactiva"}
          </Chip>
        );
      case "acciones":
        return (
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => handleOpenModal(company)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button isIconOnly color="danger" size="sm" variant="light">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Empresas</h1>
          <p className="text-muted-foreground mt-1">
            Administra las empresas registradas en el sistema
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="h-4 w-4" />}
          onPress={() => handleOpenModal()}
        >
          Nueva Empresa
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <Input
            placeholder="Buscar por nombre, RUT o email..."
            startContent={<Search className="h-4 w-4 text-default-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          <DataTable
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
            renderCell={renderCell}
          />
        </CardBody>
      </Card>

      {/* Company Modal */}
      <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {editingCompany ? "Editar Empresa" : "Nueva Empresa"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                isRequired
                label="Nombre de la Empresa"
                placeholder="Ej: Empresa ABC S.A."
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />
              <Input
                label="RUT"
                placeholder="76.123.456-7"
                value={formData.rut}
                onChange={(e) =>
                  setFormData({ ...formData, rut: e.target.value })
                }
              />
              <Textarea
                label="Dirección"
                minRows={2}
                placeholder="Av. Providencia 1234, Santiago"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email"
                  placeholder="contacto@empresa.cl"
                  startContent={<Mail className="h-4 w-4 text-default-400" />}
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <Input
                  label="Teléfono"
                  placeholder="+56223456789"
                  startContent={<Phone className="h-4 w-4 text-default-400" />}
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                />
              </div>
              <Checkbox
                isSelected={formData.activo}
                onValueChange={(checked) =>
                  setFormData({ ...formData, activo: checked })
                }
              >
                Empresa activa
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSave}>
              {editingCompany ? "Guardar Cambios" : "Crear Empresa"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
