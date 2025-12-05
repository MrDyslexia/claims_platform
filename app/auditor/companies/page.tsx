/* eslint-disable no-console */
"use client";

import type React from "react";
import type { Empresa } from "@/lib/api/empresas";

import { useState, useEffect } from "react";
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
import { useAuth } from "@/lib/auth/auth-context";
import { empresasAPI } from "@/lib/api/empresas";
import {
  validarFormularioEmpresa,
  filtrarTelefono,
  formatearRUT,
  type ErroresFormulario,
} from "@/lib/validations/empresa";

// Mock data - para usar mientras se completa la integración
const mockCompanies: Empresa[] = [];

const columns = [
  { key: "empresa", label: "EMPRESA" },
  { key: "rut", label: "RUT" },
  { key: "contacto", label: "CONTACTO" },
  { key: "direccion", label: "DIRECCIÓN" },
  { key: "estado", label: "ESTADO" },
  { key: "acciones", label: "ACCIONES" },
];

export default function CompaniesPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Empresa[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ErroresFormulario>({});
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
  const [deletingCompany, setDeletingCompany] = useState<Empresa | null>(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const rowsPerPage = 10;

  // Cargar datos del backend
  useEffect(() => {
    if (!user) {
      return;
    }

    const loadCompanies = async () => {
      try {
        const token = localStorage.getItem("auth_token");

        if (!token) {
          return;
        }

        const response = await empresasAPI.obtenerListaCompleta(
          token,
          page,
          rowsPerPage,
        );

        setCompanies(response.empresas);
        setTotalPages(response.metadata.total_paginas);
      } catch (err: any) {
        console.error("Error al cargar empresas:", err.message);
        setCompanies(mockCompanies);
      }
    };

    loadCompanies();
  }, [user, page]);

  const filteredCompanies = companies.filter(
    (company) =>
      company.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.rut?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const items = filteredCompanies.slice(0, rowsPerPage);

  const handleOpenModal = (company?: Empresa | null) => {
    setFieldErrors({});
    setSaveError(null);
    setSaveSuccess(false);

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

  const handleSave = async () => {
    try {
      setSaveError(null);
      setSaveSuccess(false);

      // Validar formulario
      const errores = validarFormularioEmpresa(formData);

      if (Object.keys(errores).length > 0) {
        setFieldErrors(errores);

        return;
      }

      setFieldErrors({});
      setIsSaving(true);
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setSaveError("No hay sesión activa");
        setIsSaving(false);

        return;
      }

      if (editingCompany) {
        // Actualizar
        console.log("Actualizando empresa:", editingCompany.id_empresa);
        const result = await empresasAPI.actualizarEmpresa(
          token,
          editingCompany.id_empresa,
          {
            nombre: formData.nombre,
            rut: formData.rut,
            direccion: formData.direccion,
            telefono: formData.telefono,
            email: formData.email,
            estado: formData.activo ? 1 : 0,
          },
        );

        console.log("Empresa actualizada:", result);
      } else {
        // Crear
        console.log("Creando nueva empresa");
        const result = await empresasAPI.crearEmpresa(token, {
          nombre: formData.nombre,
          rut: formData.rut,
          direccion: formData.direccion,
          telefono: formData.telefono,
          email: formData.email,
        });

        console.log("Empresa creada:", result);
      }

      setSaveSuccess(true);

      // Recargar datos desde el backend
      const newPage = editingCompany ? page : 1;
      const token2 = localStorage.getItem("auth_token");

      if (token2) {
        const response = await empresasAPI.obtenerListaCompleta(
          token2,
          newPage,
          rowsPerPage,
        );

        setCompanies(response.empresas);
        setTotalPages(response.metadata.total_paginas);
        setPage(newPage);
      }

      // Cerrar modal después de 500ms para mostrar el éxito
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      console.error("Error al guardar empresa:", err.message);
      setSaveError(
        err.message ||
          "Error al guardar la empresa. Por favor, intente nuevamente.",
      );
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDeleteModal = (company: Empresa) => {
    setDeletingCompany(company);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (!deletingCompany) return;

    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        console.error("No hay sesión activa");

        return;
      }

      await empresasAPI.eliminarEmpresa(token, deletingCompany.id_empresa);

      // Recargar datos desde el backend
      const token2 = localStorage.getItem("auth_token");

      if (token2) {
        const response = await empresasAPI.obtenerListaCompleta(
          token2,
          page,
          rowsPerPage,
        );

        setCompanies(response.empresas);
        setTotalPages(response.metadata.total_paginas);
      }

      onDeleteClose();
    } catch (err: any) {
      console.error("Error al eliminar empresa:", err.message);
    }
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
            <Button
              isIconOnly
              color="danger"
              size="sm"
              variant="light"
              onPress={() => handleOpenDeleteModal(company)}
            >
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
                  total={totalPages || 1}
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
              {saveError && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-4 py-3 rounded">
                  {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-3 rounded">
                  {editingCompany
                    ? "Empresa actualizada exitosamente"
                    : "Empresa creada exitosamente"}
                </div>
              )}
              <Input
                isRequired
                label="Nombre de la Empresa"
                placeholder="Ej: Empresa ABC S.A."
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nombre: e.target.value,
                  })
                }
              />
              <Input
                errorMessage={fieldErrors.rut}
                isInvalid={!!fieldErrors.rut}
                label="RUT"
                placeholder="76.123.456-7"
                value={formData.rut}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rut: formatearRUT(e.target.value),
                  })
                }
              />
              <Textarea
                label="Dirección"
                minRows={2}
                placeholder="Av. Providencia 1234, Santiago"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    direccion: e.target.value,
                  })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  errorMessage={fieldErrors.email}
                  isInvalid={!!fieldErrors.email}
                  label="Email"
                  placeholder="contacto@empresa.cl"
                  startContent={<Mail className="h-4 w-4 text-default-400" />}
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />
                <Input
                  errorMessage={fieldErrors.telefono}
                  isInvalid={!!fieldErrors.telefono}
                  label="Teléfono"
                  placeholder="+56223456789"
                  startContent={<Phone className="h-4 w-4 text-default-400" />}
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      telefono: filtrarTelefono(e.target.value),
                    })
                  }
                />
              </div>
              <Checkbox
                isSelected={formData.activo}
                onValueChange={(checked) =>
                  setFormData({
                    ...formData,
                    activo: checked,
                  })
                }
              >
                Empresa activa
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button isDisabled={isSaving} variant="bordered" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="primary" isLoading={isSaving} onPress={handleSave}>
              {editingCompany ? "Guardar Cambios" : "Crear Empresa"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Confirmar Eliminación</ModalHeader>
          <ModalBody>
            <p>
              ¿Estás seguro de que deseas eliminar la empresa{" "}
              <strong>{deletingCompany?.nombre}</strong>?
            </p>
            <p className="text-sm text-danger mt-2">
              Esta acción no se puede deshacer.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onPress={onDeleteClose}>
              Cancelar
            </Button>
            <Button color="danger" onPress={handleDelete}>
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
