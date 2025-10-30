/* eslint-disable no-console */
"use client";

import type React from "react";
import type { Usuario, Rol } from "@/lib/types/database";

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
  Select,
  SelectItem,
  Checkbox,
} from "@heroui/react";
import { Search, Plus, Edit, Trash2, Users, Mail, Phone } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { FormInput } from "@/components/form-input"; // Import FormInput component

// Mock data
const mockUsers: (Usuario & { roles: Rol[] })[] = [
  {
    id_usuario: 1,
    nombre: "María",
    apellido: "González",
    email: "maria@example.com",
    password_hash: "",
    telefono: "+56912345678",
    activo: true,
    fecha_creacion: new Date("2024-01-15"),
    roles: [{ id_rol: 1, nombre: "Administrador", activo: true }],
  },
  {
    id_usuario: 2,
    nombre: "Carlos",
    apellido: "Ruiz",
    email: "carlos@example.com",
    password_hash: "",
    telefono: "+56987654321",
    activo: true,
    fecha_creacion: new Date("2024-02-20"),
    roles: [{ id_rol: 2, nombre: "Analista", activo: true }],
  },
  {
    id_usuario: 3,
    nombre: "Ana",
    apellido: "Torres",
    email: "ana@example.com",
    password_hash: "",
    activo: false,
    fecha_creacion: new Date("2024-03-10"),
    roles: [{ id_rol: 3, nombre: "Supervisor", activo: true }],
  },
];

const mockRoles: Rol[] = [
  {
    id_rol: 1,
    nombre: "Administrador",
    descripcion: "Acceso total al sistema",
    activo: true,
  },
  {
    id_rol: 2,
    nombre: "Analista",
    descripcion: "Gestión de reclamos",
    activo: true,
  },
  {
    id_rol: 3,
    nombre: "Supervisor",
    descripcion: "Supervisión de casos",
    activo: true,
  },
  {
    id_rol: 4,
    nombre: "Auditor",
    descripcion: "Solo lectura y reportes",
    activo: true,
  },
];

const columns = [
  { key: "usuario", label: "USUARIO" },
  { key: "email", label: "EMAIL" },
  { key: "telefono", label: "TELÉFONO" },
  { key: "roles", label: "ROLES" },
  { key: "estado", label: "ESTADO" },
  { key: "fecha", label: "FECHA CREACIÓN" },
  { key: "acciones", label: "ACCIONES" },
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingUser, setEditingUser] = useState<
    (Usuario & { roles: Rol[] }) | null
  >(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    activo: true,
    roles: [] as string[],
  });

  const rowsPerPage = 10;

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pages = Math.ceil(filteredUsers.length / rowsPerPage);
  const items = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const handleOpenModal = (user?: (Usuario & { roles: Rol[] }) | null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono || "",
        activo: user.activo,
        roles: user.roles.map((r) => r.id_rol.toString()),
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        activo: true,
        roles: [],
      });
    }
    onOpen();
  };

  const handleSave = () => {
    console.log("[v0] Saving user:", formData);
    onClose();
  };

  const renderCell = (
    user: Usuario & { roles: Rol[] },
    columnKey: React.Key,
  ) => {
    switch (columnKey) {
      case "usuario":
        return (
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">
                {user.nombre} {user.apellido}
              </p>
            </div>
          </div>
        );
      case "email":
        return (
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{user.email}</span>
          </div>
        );
      case "telefono":
        return user.telefono ? (
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{user.telefono}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      case "roles":
        return (
          <div className="flex flex-wrap gap-1">
            {user.roles.map((role) => (
              <Chip
                key={role.id_rol}
                color="secondary"
                size="sm"
                variant="flat"
              >
                {role.nombre}
              </Chip>
            ))}
          </div>
        );
      case "estado":
        return (
          <Chip
            color={user.activo ? "success" : "default"}
            size="sm"
            variant="flat"
          >
            {user.activo ? "Activo" : "Inactivo"}
          </Chip>
        );
      case "fecha":
        return user.fecha_creacion.toLocaleDateString();
      case "acciones":
        return (
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => handleOpenModal(user)}
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
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="h-4 w-4" />}
          onPress={() => handleOpenModal()}
        >
          Nuevo Usuario
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <Input
            placeholder="Buscar por nombre, apellido o email..."
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

      {/* User Modal */}
      <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  isRequired
                  id="nombre"
                  label="Nombre"
                  placeholder="Ingrese el nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
                <FormInput
                  isRequired
                  id="apellido"
                  label="Apellido"
                  placeholder="Ingrese el apellido"
                  value={formData.apellido}
                  onChange={(e) =>
                    setFormData({ ...formData, apellido: e.target.value })
                  }
                />
              </div>
              <FormInput
                isRequired
                id="email"
                label="Email"
                placeholder="usuario@example.com"
                startContent={<Mail className="h-4 w-4 text-default-400" />}
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <FormInput
                id="telefono"
                label="Teléfono"
                placeholder="+56912345678"
                startContent={<Phone className="h-4 w-4 text-default-400" />}
                type="tel"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
              />
              <Select
                label="Roles"
                placeholder="Seleccione uno o más roles"
                selectedKeys={formData.roles}
                selectionMode="multiple"
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    roles: Array.from(keys) as string[],
                  })
                }
              >
                {mockRoles.map((role) => (
                  <SelectItem key={role.id_rol.toString()}>
                    {role.nombre}
                  </SelectItem>
                ))}
              </Select>
              <Checkbox
                isSelected={formData.activo}
                onValueChange={(checked) =>
                  setFormData({ ...formData, activo: checked })
                }
              >
                Usuario activo
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSave}>
              {editingUser ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
