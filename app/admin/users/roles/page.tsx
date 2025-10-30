/* eslint-disable no-console */
"use client";

import type { Rol, Permiso } from "@/lib/types/database";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
  Checkbox,
  Tabs,
  Tab,
} from "@heroui/react";
import { Plus, Edit, Trash2, Shield, CheckCircle2 } from "lucide-react";

// Mock data
const mockRoles: (Rol & { permisos: Permiso[] })[] = [
  {
    id_rol: 1,
    nombre: "Administrador",
    descripcion: "Acceso total al sistema",
    activo: true,
    permisos: [
      {
        id_permiso: 1,
        nombre: "view_claims",
        descripcion: "Ver reclamos",
        modulo: "claims",
      },
      {
        id_permiso: 2,
        nombre: "edit_claims",
        descripcion: "Editar reclamos",
        modulo: "claims",
      },
      {
        id_permiso: 3,
        nombre: "manage_users",
        descripcion: "Gestionar usuarios",
        modulo: "users",
      },
      {
        id_permiso: 4,
        nombre: "view_reports",
        descripcion: "Ver reportes",
        modulo: "reports",
      },
    ],
  },
  {
    id_rol: 2,
    nombre: "Analista",
    descripcion: "Gestión de reclamos",
    activo: true,
    permisos: [
      {
        id_permiso: 1,
        nombre: "view_claims",
        descripcion: "Ver reclamos",
        modulo: "claims",
      },
      {
        id_permiso: 2,
        nombre: "edit_claims",
        descripcion: "Editar reclamos",
        modulo: "claims",
      },
    ],
  },
  {
    id_rol: 3,
    nombre: "Supervisor",
    descripcion: "Supervisión de casos",
    activo: true,
    permisos: [
      {
        id_permiso: 1,
        nombre: "view_claims",
        descripcion: "Ver reclamos",
        modulo: "claims",
      },
      {
        id_permiso: 4,
        nombre: "view_reports",
        descripcion: "Ver reportes",
        modulo: "reports",
      },
    ],
  },
];

const mockPermisos: Permiso[] = [
  {
    id_permiso: 1,
    nombre: "view_claims",
    descripcion: "Ver reclamos",
    modulo: "claims",
  },
  {
    id_permiso: 2,
    nombre: "edit_claims",
    descripcion: "Editar reclamos",
    modulo: "claims",
  },
  {
    id_permiso: 3,
    nombre: "manage_users",
    descripcion: "Gestionar usuarios",
    modulo: "users",
  },
  {
    id_permiso: 4,
    nombre: "view_reports",
    descripcion: "Ver reportes",
    modulo: "reports",
  },
  {
    id_permiso: 5,
    nombre: "manage_companies",
    descripcion: "Gestionar empresas",
    modulo: "companies",
  },
  {
    id_permiso: 6,
    nombre: "view_audit",
    descripcion: "Ver auditoría",
    modulo: "audit",
  },
  {
    id_permiso: 7,
    nombre: "manage_settings",
    descripcion: "Gestionar configuración",
    modulo: "settings",
  },
];

export default function RolesPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingRole, setEditingRole] = useState<
    (Rol & { permisos: Permiso[] }) | null
  >(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    activo: true,
    permisos: [] as number[],
  });

  const handleOpenModal = (role?: (Rol & { permisos: Permiso[] }) | null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        nombre: role.nombre,
        descripcion: role.descripcion || "",
        activo: role.activo,
        permisos: role.permisos.map((p) => p.id_permiso),
      });
    } else {
      setEditingRole(null);
      setFormData({
        nombre: "",
        descripcion: "",
        activo: true,
        permisos: [],
      });
    }
    onOpen();
  };

  const handleSave = () => {
    console.log("[v0] Saving role:", formData);
    onClose();
  };

  const togglePermission = (permisoId: number) => {
    setFormData((prev) => ({
      ...prev,
      permisos: prev.permisos.includes(permisoId)
        ? prev.permisos.filter((id) => id !== permisoId)
        : [...prev.permisos, permisoId],
    }));
  };

  // Group permissions by module
  const permisosByModule = mockPermisos.reduce(
    (acc, permiso) => {
      if (!acc[permiso.modulo]) {
        acc[permiso.modulo] = [];
      }
      acc[permiso.modulo].push(permiso);

      return acc;
    },
    {} as Record<string, Permiso[]>,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Roles y Permisos</h1>
          <p className="text-muted-foreground mt-1">
            Configura roles y sus permisos asociados
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="h-4 w-4" />}
          onPress={() => handleOpenModal()}
        >
          Nuevo Rol
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockRoles.map((role) => (
          <Card key={role.id_rol}>
            <CardHeader className="flex justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{role.nombre}</h3>
                  <Chip
                    color={role.activo ? "success" : "default"}
                    size="sm"
                    variant="flat"
                  >
                    {role.activo ? "Activo" : "Inactivo"}
                  </Chip>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {role.descripcion}
              </p>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Permisos ({role.permisos.length})
                </p>
                <div className="space-y-1">
                  {role.permisos.slice(0, 3).map((permiso) => (
                    <div
                      key={permiso.id_permiso}
                      className="flex items-center gap-2 text-xs"
                    >
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span>{permiso.descripcion}</span>
                    </div>
                  ))}
                  {role.permisos.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{role.permisos.length - 3} más
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  size="sm"
                  variant="bordered"
                  onPress={() => handleOpenModal(role)}
                >
                  <Edit className="h-3 w-3" />
                  Editar
                </Button>
                <Button isIconOnly color="danger" size="sm" variant="bordered">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Role Modal */}
      <Modal
        isOpen={isOpen}
        scrollBehavior="inside"
        size="3xl"
        onClose={onClose}
      >
        <ModalContent>
          <ModalHeader>{editingRole ? "Editar Rol" : "Nuevo Rol"}</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                isRequired
                label="Nombre del Rol"
                placeholder="Ej: Administrador"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />
              <Textarea
                label="Descripción"
                minRows={2}
                placeholder="Describe las responsabilidades de este rol"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
              />
              <Checkbox
                isSelected={formData.activo}
                onValueChange={(checked) =>
                  setFormData({ ...formData, activo: checked })
                }
              >
                Rol activo
              </Checkbox>

              <div>
                <h3 className="font-semibold mb-3">Permisos</h3>
                <Tabs aria-label="Permissions by module">
                  {Object.entries(permisosByModule).map(
                    ([modulo, permisos]) => (
                      <Tab
                        key={modulo}
                        title={modulo.charAt(0).toUpperCase() + modulo.slice(1)}
                      >
                        <div className="space-y-2 pt-4">
                          {permisos.map((permiso) => (
                            <div
                              key={permiso.id_permiso}
                              className="flex items-center justify-between p-3 bg-default-50 dark:bg-default-100/50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-sm">
                                  {permiso.descripcion}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {permiso.nombre}
                                </p>
                              </div>
                              <Checkbox
                                isSelected={formData.permisos.includes(
                                  permiso.id_permiso,
                                )}
                                onValueChange={() =>
                                  togglePermission(permiso.id_permiso)
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </Tab>
                    ),
                  )}
                </Tabs>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSave}>
              {editingRole ? "Guardar Cambios" : "Crear Rol"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
