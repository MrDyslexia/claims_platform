/* eslint-disable no-console */
"use client";

import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Input,
  Textarea,
  Checkbox,
  Tabs,
  Tab,
  Select,
  SelectItem,
  ModalFooter,
} from "@heroui/react";
import { Shield, CheckCircle2, Eye } from "lucide-react";

import {
  useGetListaCompletaUsuarios,
  listarArquetipos,
  obtenerCategoriasDisponibles,
} from "@/lib/api/usuarios";
import type { Rol, Arquetipo, Categoria } from "@/lib/api/usuarios";

interface Permiso {
  id_permiso: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
}

export default function RolesPage() {
  const [token, setToken] = React.useState<string | null>(null);
  const { data, loading, error, refetch } = useGetListaCompletaUsuarios(token);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingRole, setEditingRole] = React.useState<Rol | null>(null);
  const [formData, setFormData] = React.useState({
    nombre: "",
    descripcion: "",
    permisos: [] as number[],
  });
  const [arquetipos, setArquetipos] = React.useState<Arquetipo[]>([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = React.useState<
    Categoria[]
  >([]);
  const [selectedArquetipo, setSelectedArquetipo] = React.useState<string>("");
  const [selectedCategoria, setSelectedCategoria] = React.useState<string>("");

  React.useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");

    setToken(storedToken);
  }, []);

  // Cargar arquetipos y categorías
  React.useEffect(() => {
    if (token) {
      listarArquetipos(token)
        .then((res) => setArquetipos(res.data || []))
        .catch((err) => console.error("Error al cargar arquetipos:", err));

      obtenerCategoriasDisponibles(token)
        .then((res) => setCategoriasDisponibles(res.categorias || []))
        .catch((err) => console.error("Error al cargar categorías:", err));
    }
  }, [token]);
  const rolesDisponibles = data?.roles_disponibles || [];
  const permisosDisponibles = data?.permisos_disponibles || [];

  const handleOpenModal = (role?: Rol | null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        nombre: role.nombre,
        descripcion: role.descripcion || "",
        permisos: role.permisos?.map((p) => p.id_permiso) || [],
      });
      setSelectedArquetipo(role.arquetipo_id?.toString() || "");
      setSelectedCategoria("");
    } else {
      setEditingRole(null);
      setFormData({
        nombre: "",
        descripcion: "",
        permisos: [],
      });
      setSelectedArquetipo("");
      setSelectedCategoria("");
    }
    onOpen();
  };

  // Agrupar permisos por categoría
  const permisosByCategory = permisosDisponibles.reduce(
    (acc, permiso) => {
      const category = permiso.categoria || "General";

      if (!acc[category]) {
        acc[category] = [];
      }

      acc[category].push(permiso);

      return acc;
    },
    {} as Record<string, Permiso[]>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-danger">
          <p className="font-semibold">Error al cargar datos</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

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
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rolesDisponibles.map((role) => (
          <Card key={role.id_rol}>
            <CardHeader className="flex justify-between items-start">
              <div className="flex items-center gap-2 flex-1">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{role.nombre}</h3>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {role.descripcion || "Sin descripción"}
              </p>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Permisos ({role.permisos?.length || 0})
                </p>
                <div className="space-y-1">
                  {role.permisos?.slice(0, 3).map((permiso) => (
                    <div
                      key={permiso.id_permiso}
                      className="flex items-center gap-2 text-xs"
                    >
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span>{permiso.nombre}</span>
                    </div>
                  ))}
                  {role.permisos && role.permisos.length > 3 && (
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
                  <Eye className="h-3 w-3" />
                  Ver
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
          <ModalHeader>Detalles</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                isDisabled
                label="Nombre del Rol"
                placeholder="Ej: Administrador"
                value={formData.nombre}
              />
              <Textarea
                label="Descripción"
                isDisabled
                minRows={2}
                placeholder="Describe las responsabilidades de este rol"
                value={formData.descripcion}
              />
              <Select
                description="Deja vacío para que el rol acceda a todas las categorías"
                label="Categoría de Denuncia (Opcional)"
                placeholder="Sin restricción de categoría"
                selectedKeys={selectedCategoria ? [selectedCategoria] : []}
                isDisabled
              >
                {categoriasDisponibles.map((cat) => (
                  <SelectItem key={cat.id.toString()}>{cat.nombre}</SelectItem>
                ))}
              </Select>

              <div>
                <h3 className="font-semibold mb-3">Permisos</h3>
                <div className="space-y-4">
                  {Object.entries(permisosByCategory).map(
                    ([categoria, permisos]) => (
                      <div key={categoria}>
                        <h4 className="text-sm font-medium mb-2">
                          {categoria.charAt(0).toUpperCase() +
                            categoria.slice(1)}
                        </h4>
                        <div className="space-y-2">
                          {permisos.map((permiso) => (
                            <div
                              key={permiso.id_permiso}
                              className="flex items-center justify-between p-3 bg-default-50 dark:bg-default-100/50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-sm">
                                  {permiso.nombre}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {permiso.codigo}
                                </p>
                              </div>
                              <Checkbox
                                isSelected={formData.permisos.includes(
                                  permiso.id_permiso
                                )}
                                isDisabled
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
