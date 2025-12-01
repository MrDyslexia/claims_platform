/* eslint-disable no-console */
"use client";

import type { Usuario as UsuarioAPI } from "@/lib/api/usuarios";

import React from "react";
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
import { FormInput } from "@/components/form-input";
import {
  useGetListaCompletaUsuarios,
  crearUsuario,
  actualizarUsuario,
  asignarRolesUsuario,
  eliminarUsuario,
} from "@/lib/api/usuarios";

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
  const [token, setToken] = React.useState<string | null>(null);
  const { data, loading, error, page, setPage, refetch } =
    useGetListaCompletaUsuarios(token);
  const [searchQuery, setSearchQuery] = React.useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingUser, setEditingUser] = React.useState<UsuarioAPI | null>(null);
  const [formData, setFormData] = React.useState({
    rut: "",
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: "",
    activo: true,
    roles: [] as string[],
  });
  const [originalRoles, setOriginalRoles] = React.useState<string[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [deletingUser, setDeletingUser] = React.useState<UsuarioAPI | null>(
    null,
  );
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  // Validar y formatear número de teléfono
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return true; // Campo opcional

    // Permite solo números y +
    const phoneRegex = /^[\d+\s\-()]*$/;

    if (!phoneRegex.test(phone)) {
      return false;
    }

    // Extrae solo números
    const digitsOnly = phone.replace(/\D/g, "");

    // Validar longitud: debe tener entre 9 y 15 dígitos
    // (estándar internacional E.164)
    if (digitsOnly.length < 9 || digitsOnly.length > 15) {
      return false;
    }

    // Si empieza con +, debe tener código de país válido
    if (phone.startsWith("+")) {
      // Código de país debe ser de 1-3 dígitos
      const match = phone.match(/^\+(\d{1,3})/);

      if (!match) {
        return false;
      }
    }

    return true;
  };

  // Formatear número de teléfono mientras se escribe
  const handlePhoneChange = (value: string) => {
    // Solo permitir números, +, espacios, guiones y paréntesis
    const filtered = value.replace(/[^\d+\s\-()]/g, "");

    setFormData({
      ...formData,
      telefono: filtered,
    });
  };

  // Cargar token de localStorage
  React.useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");

    setToken(storedToken);
  }, []);

  const usuarios = data?.usuarios || [];
  const rolesDisponibles = data?.roles_disponibles || [];

  const filteredUsers = usuarios.filter(
    (user) =>
      user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Usar metadata del backend para paginación
  const pages = data?.metadata?.total_paginas || 1;
  const items = filteredUsers;

  const handleOpenModal = (user?: UsuarioAPI | null) => {
    setSaveError(null);
    if (user) {
      setEditingUser(user);
      const rolesMap = user.roles.map((r) => r.id_rol.toString());

      setFormData({
        rut: "", // No se puede editar el RUT
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        password: "", // No se envía la contraseña en edición
        telefono: user.telefono || "",
        activo: user.activo,
        roles: rolesMap,
      });
      setOriginalRoles(rolesMap);
    } else {
      setEditingUser(null);
      setFormData({
        rut: "",
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        telefono: "",
        activo: true,
        roles: [],
      });
      setOriginalRoles([]);
    }
    onOpen();
  };

  const handleSave = async () => {
    if (!token) {
      setSaveError("No hay token de autenticación");

      return;
    }

    // Validaciones básicas
    if (!editingUser && !formData.rut) {
      setSaveError("El RUT es obligatorio para crear un usuario");

      return;
    }

    if (!formData.nombre || !formData.apellido) {
      setSaveError("El nombre y apellido son obligatorios");

      return;
    }

    if (!formData.email) {
      setSaveError("El email es obligatorio");

      return;
    }

    if (!editingUser && !formData.password) {
      setSaveError("La contraseña es obligatoria para crear un usuario");

      return;
    }

    // Validar teléfono si está presente
    if (formData.telefono && !validatePhoneNumber(formData.telefono)) {
      setSaveError(
        "Teléfono inválido. Debe contener solo números y +, con 9-15 dígitos",
      );

      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const nombre_completo = `${formData.nombre} ${formData.apellido}`;
      const rol_ids = formData.roles.map((r) => parseInt(r));

      if (editingUser) {
        // Actualizar usuario existente
        await actualizarUsuario(token, editingUser.id_usuario, {
          nombre_completo,
          email: formData.email,
          telefono: formData.telefono || undefined,
          activo: formData.activo ? 1 : 0,
        });

        // Comparar roles originales con nuevos roles
        const rolesActuales = new Set(formData.roles);
        const rolesOriginales = new Set(originalRoles);
        const rolesChanged =
          rolesActuales.size !== rolesOriginales.size ||
          !Array.from(rolesActuales).every((r) => rolesOriginales.has(r));

        // Asignar roles solo si cambiaron
        if (rolesChanged) {
          await asignarRolesUsuario(token, editingUser.id_usuario, rol_ids);
        }

        console.log("✅ Usuario actualizado exitosamente");
      } else {
        // Crear nuevo usuario
        const nuevoUsuario = await crearUsuario(token, {
          rut: formData.rut,
          nombre_completo,
          email: formData.email,
          password: formData.password,
          telefono: formData.telefono || undefined,
          activo: formData.activo ? 1 : 0,
        });

        // Asignar roles si se seleccionaron
        if (rol_ids.length > 0 && nuevoUsuario.id) {
          await asignarRolesUsuario(token, nuevoUsuario.id, rol_ids);
        }

        console.log("✅ Usuario creado exitosamente");
      }

      // Recargar la lista de usuarios
      refetch();

      // Cerrar el modal
      onClose();
    } catch (err: any) {
      console.error("❌ Error al guardar usuario:", err);
      setSaveError(err.message || "Error al guardar el usuario");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDeleteModal = (user: UsuarioAPI) => {
    setDeletingUser(user);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (!deletingUser || !token) return;

    try {
      await eliminarUsuario(token, deletingUser.id_usuario);

      // Recargar la lista de usuarios
      refetch();

      // Cerrar el modal
      onDeleteClose();
    } catch (err: any) {
      console.error("❌ Error al eliminar usuario:", err);
      setSaveError(err.message || "Error al eliminar el usuario");
    }
  };

  const renderCell = (user: UsuarioAPI, columnKey: React.Key) => {
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
        return new Date(user.fecha_creacion).toLocaleDateString("es-CL");
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
            <Button
              isIconOnly
              color="danger"
              size="sm"
              variant="light"
              onPress={() => handleOpenDeleteModal(user)}
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

      {/* Error State */}
      {error && (
        <Card>
          <CardBody>
            <div className="text-center py-8 text-danger">
              <p className="font-semibold">Error al cargar usuarios</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Loading State */}
      {loading && !error && (
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <p>Cargando usuarios...</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Table */}
      {!loading && !error && (
        <Card>
          <CardBody className="p-0">
            <DataTable<UsuarioAPI>
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
      )}

      {/* User Modal */}
      <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {saveError && (
                <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                  <p className="text-sm text-danger-700">{saveError}</p>
                </div>
              )}

              {!editingUser && (
                <FormInput
                  isRequired
                  id="rut"
                  label="RUT"
                  placeholder="12345678-9"
                  value={formData.rut}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rut: e.target.value,
                    })
                  }
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  isRequired
                  id="nombre"
                  label="Nombre"
                  placeholder="Ingrese el nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nombre: e.target.value,
                    })
                  }
                />
                <FormInput
                  isRequired
                  id="apellido"
                  label="Apellido"
                  placeholder="Ingrese el apellido"
                  value={formData.apellido}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      apellido: e.target.value,
                    })
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
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
              />
              {!editingUser && (
                <FormInput
                  isRequired
                  id="password"
                  label="Contraseña"
                  placeholder="********"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                />
              )}
              <FormInput
                description="Formato: +56912345678 (9-15 dígitos)"
                errorMessage={
                  formData.telefono && !validatePhoneNumber(formData.telefono)
                    ? "Teléfono inválido. Solo números y +, 9-15 dígitos"
                    : ""
                }
                id="telefono"
                isInvalid={
                  formData.telefono
                    ? !validatePhoneNumber(formData.telefono)
                    : false
                }
                label="Teléfono"
                placeholder="+56912345678"
                startContent={<Phone className="h-4 w-4 text-default-400" />}
                type="tel"
                value={formData.telefono}
                onChange={(e) => handlePhoneChange(e.target.value)}
              />
              <Select
                label="Rol"
                placeholder="Seleccione un rol"
                selectedKeys={formData.roles}
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    roles: Array.from(keys) as string[],
                  })
                }
              >
                {rolesDisponibles.map((role) => (
                  <SelectItem key={role.id_rol.toString()}>
                    {role.nombre}
                  </SelectItem>
                ))}
              </Select>
              <Checkbox
                isSelected={formData.activo}
                onValueChange={(checked) =>
                  setFormData({
                    ...formData,
                    activo: checked,
                  })
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
            <Button color="primary" isLoading={isSaving} onPress={handleSave}>
              {isSaving
                ? "Guardando..."
                : editingUser
                  ? "Guardar Cambios"
                  : "Crear Usuario"}
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
              ¿Estás seguro de que deseas eliminar al usuario{" "}
              <strong>
                {deletingUser?.nombre} {deletingUser?.apellido}
              </strong>
              ?
            </p>
            <p className="text-sm text-danger mt-2">
              Esta acción no se puede deshacer y se eliminarán todos los datos
              asociados al usuario.
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
