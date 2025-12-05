/* eslint-disable no-console */
"use client";

import type React from "react";
import type {
  TipoDenuncia,
  EstadoDenuncia,
  CategoriaDenuncia,
} from "@/lib/types/database";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab,
  Textarea,
  Checkbox,
  Accordion,
  AccordionItem,
  Spinner,
} from "@heroui/react";
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Activity,
  Palette,
  Folder,
} from "lucide-react";

import { DataTable } from "@/components/data-table";
import {
  getCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  getTipos,
  crearTipo,
  actualizarTipo,
  eliminarTipo,
} from "@/lib/api/settings";

// Mock data for statuses (keeping as is for now)
const mockClaimStatuses: EstadoDenuncia[] = [
  {
    id_estado: 1,
    nombre: "Nuevo",
    descripcion: "Reclamo recién ingresado",
    color: "#0070F3",
    orden: 1,
  },
  {
    id_estado: 2,
    nombre: "En Proceso",
    descripcion: "Reclamo en investigación",
    color: "#F5A524",
    orden: 2,
  },
  {
    id_estado: 3,
    nombre: "En Revisión",
    descripcion: "Reclamo en revisión final",
    color: "#7928CA",
    orden: 3,
  },
  {
    id_estado: 4,
    nombre: "Resuelto",
    descripcion: "Reclamo resuelto satisfactoriamente",
    color: "#17C964",
    orden: 4,
  },
  {
    id_estado: 5,
    nombre: "Cerrado",
    descripcion: "Reclamo cerrado",
    color: "#A1A1AA",
    orden: 5,
  },
];

const typeColumns = [
  { key: "nombre", label: "NOMBRE" },
  { key: "descripcion", label: "DESCRIPCIÓN" },
  { key: "codigo", label: "CÓDIGO" },
  { key: "estado", label: "ESTADO" },
  { key: "acciones", label: "ACCIONES" },
];

const statusColumns = [
  { key: "orden", label: "ORDEN" },
  { key: "nombre", label: "NOMBRE" },
  { key: "descripcion", label: "DESCRIPCIÓN" },
  { key: "color", label: "COLOR" },
  { key: "acciones", label: "ACCIONES" },
];

export default function SettingsPage() {
  // Category Modal
  const {
    isOpen: isCategoryOpen,
    onOpen: onCategoryOpen,
    onClose: onCategoryClose,
  } = useDisclosure();

  // Type Modal
  const {
    isOpen: isTypeOpen,
    onOpen: onTypeOpen,
    onClose: onTypeClose,
  } = useDisclosure();

  // Status Modal
  const {
    isOpen: isStatusOpen,
    onOpen: onStatusOpen,
    onClose: onStatusClose,
  } = useDisclosure();

  const [categories, setCategories] = useState<CategoriaDenuncia[]>([]);
  const [types, setTypes] = useState<TipoDenuncia[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingCategory, setEditingCategory] =
    useState<CategoriaDenuncia | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    nombre: "",
    descripcion: "",
    activo: true,
  });

  const [editingType, setEditingType] = useState<TipoDenuncia | null>(null);
  // const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [typeFormData, setTypeFormData] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    activo: true,
    categoria_id: 0,
  });

  const [editingStatus, setEditingStatus] = useState<EstadoDenuncia | null>(
    null,
  );
  const [statusFormData, setStatusFormData] = useState({
    nombre: "",
    descripcion: "",
    color: "#0070F3",
    orden: 1,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, typs] = await Promise.all([getCategorias(), getTipos()]);
      setCategories(cats);
      setTypes(typs);
    } catch (error) {
      console.error("Error loading settings data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Category Handlers ---

  const handleOpenCategoryModal = (category?: CategoriaDenuncia) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        nombre: category.nombre,
        descripcion: category.descripcion || "",
        activo: category.activo,
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        nombre: "",
        descripcion: "",
        activo: true,
      });
    }
    onCategoryOpen();
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await actualizarCategoria(editingCategory.id, categoryFormData);
      } else {
        await crearCategoria(categoryFormData);
      }
      await loadData();
      onCategoryClose();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta categoría?")) {
      try {
        await eliminarCategoria(id);
        await loadData();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  // --- Type Handlers ---

  const handleOpenTypeModal = (categoryId: number, type?: TipoDenuncia) => {
    // setSelectedCategoryId(categoryId);
    if (type) {
      setEditingType(type);
      setTypeFormData({
        nombre: type.nombre,
        codigo: type.codigo,
        descripcion: type.descripcion || "",
        activo: type.activo,
        categoria_id: categoryId,
      });
    } else {
      setEditingType(null);
      setTypeFormData({
        nombre: "",
        codigo: "",
        descripcion: "",
        activo: true,
        categoria_id: categoryId,
      });
    }
    onTypeOpen();
  };

  const handleSaveType = async () => {
    try {
      if (editingType) {
        await actualizarTipo(editingType.id, typeFormData);
      } else {
        await crearTipo(typeFormData);
      }
      await loadData();
      onTypeClose();
    } catch (error) {
      console.error("Error saving type:", error);
    }
  };

  const handleDeleteType = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este tipo?")) {
      try {
        await eliminarTipo(id);
        await loadData();
      } catch (error) {
        console.error("Error deleting type:", error);
      }
    }
  };

  // --- Status Handlers (Mock) ---

  const handleOpenStatusModal = (status?: EstadoDenuncia | null) => {
    if (status) {
      setEditingStatus(status);
      setStatusFormData({
        nombre: status.nombre,
        descripcion: status.descripcion || "",
        color: status.color || "#0070F3",
        orden: status.orden,
      });
    } else {
      setEditingStatus(null);
      setStatusFormData({
        nombre: "",
        descripcion: "",
        color: "#0070F3",
        orden: mockClaimStatuses.length + 1,
      });
    }
    onStatusOpen();
  };

  const handleSaveStatus = () => {
    console.log("[v0] Saving claim status:", statusFormData);
    onStatusClose();
  };

  // --- Renderers ---

  const renderTypeCell = (type: TipoDenuncia, columnKey: React.Key) => {
    switch (columnKey) {
      case "nombre":
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-600" />
            <span className="font-medium">{type.nombre}</span>
          </div>
        );
      case "codigo":
        return (
          <Chip size="sm" variant="flat">
            {type.codigo}
          </Chip>
        );
      case "descripcion":
        return type.descripcion;
      case "estado":
        return (
          <Chip
            color={type.activo ? "success" : "default"}
            size="sm"
            variant="flat"
          >
            {type.activo ? "Activo" : "Inactivo"}
          </Chip>
        );
      case "acciones":
        return (
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => handleOpenTypeModal(type.categoria_id!, type)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              isIconOnly 
              color="danger"
              size="sm"
              variant="light"
              onPress={() => handleDeleteType(type.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const renderStatusCell = (status: EstadoDenuncia, columnKey: React.Key) => {
    switch (columnKey) {
      case "orden":
        return (
          <Chip size="sm" variant="flat">
            {status.orden}
          </Chip>
        );
      case "nombre":
        return (
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-600" />
            <span className="font-medium">{status.nombre}</span>
          </div>
        );
      case "descripcion":
        return status.descripcion;
      case "color":
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded border border-divider"
              style={{ backgroundColor: status.color }}
            />
            <span className="text-sm font-mono">{status.color}</span>
          </div>
        );
      case "acciones":
        return (
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => handleOpenStatusModal(status)}
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

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tipos de reclamos, estados y otras configuraciones
        </p>
      </div>

      {/* Tabs */}
      <Card>
        <CardBody className="p-0">
          <Tabs aria-label="Settings tabs" className="w-full">
            {/* Categories & Types Tab */}
            <Tab
              key="types"
              title={
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Categorías y Tipos</span>
                </div>
              }
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Gestiona las categorías de reclamos y sus tipos asociados
                  </p>
                  <Button
                    color="primary"
                    size="sm"
                    startContent={<Plus className="h-4 w-4" />}
                    onPress={() => handleOpenCategoryModal()}
                  >
                    Nueva Categoría
                  </Button>
                </div>

                <Accordion selectionMode="multiple" variant="splitted">
                  {categories.map((category) => (
                    <AccordionItem
                      key={category.id}
                      aria-label={category.nombre}
                      startContent={<Folder className="text-primary" />}
                      subtitle={category.descripcion}
                      title={
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">
                              {category.nombre}
                            </span>
                            <Chip
                              color={category.activo ? "success" : "default"}
                              size="sm"
                              variant="flat"
                            >
                              {category.activo ? "Activo" : "Inactivo"}
                            </Chip>
                          </div>
                        </div>
                      }
                    >
                      <div className="py-2">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                          <div className="flex gap-2">
                            <Button
                              onPress={() => handleOpenCategoryModal(category)}
                              size="sm"
                              startContent={<Edit className="h-4 w-4" />}
                              variant="flat"
                            >
                              Editar Categoría
                            </Button>
                            <Button
                              color="danger"
                              onPress={() => handleDeleteCategory(category.id)}
                              size="sm"
                              startContent={<Trash2 className="h-4 w-4" />}
                              variant="flat"
                            >
                              Eliminar Categoría
                            </Button>
                          </div>
                          <Button
                            color="primary"
                            onPress={() => handleOpenTypeModal(category.id)}
                            size="sm"
                            startContent={<Plus className="h-4 w-4" />}
                          >
                            Agregar Tipo
                          </Button>
                        </div>
                        
                        <h4 className="text-sm font-semibold mb-2">
                          Tipos asociados
                        </h4>
                        <DataTable
                          columns={typeColumns}
                          data={types.filter(
                            (t) => t.categoria_id === category.id,
                          )}
                          renderCell={renderTypeCell}
                        />
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                {categories.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay categorías definidas. Crea una para comenzar.
                  </div>
                )}
              </div>
            </Tab>

            {/* Claim Statuses Tab */}
            <Tab
              key="statuses"
              title={
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Estados de Reclamos</span>
                </div>
              }
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Configura los estados del flujo de trabajo de reclamos
                  </p>
                  <Button
                    color="primary"
                    size="sm"
                    startContent={<Plus className="h-4 w-4" />}
                    onPress={() => handleOpenStatusModal()}
                  >
                    Nuevo Estado
                  </Button>
                </div>

                <DataTable
                  columns={statusColumns}
                  data={mockClaimStatuses}
                  renderCell={renderStatusCell}
                />
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      {/* Category Modal */}
      <Modal isOpen={isCategoryOpen} onClose={onCategoryClose}>
        <ModalContent>
          <ModalHeader>
            {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                isRequired
                label="Nombre"
                placeholder="Ej: Recursos Humanos"
                value={categoryFormData.nombre}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    nombre: e.target.value,
                  })
                }
              />
              <Textarea
                label="Descripción"
                minRows={3}
                placeholder="Descripción de la categoría"
                value={categoryFormData.descripcion}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    descripcion: e.target.value,
                  })
                }
              />
              <Checkbox
                isSelected={categoryFormData.activo}
                onValueChange={(checked) =>
                  setCategoryFormData({ ...categoryFormData, activo: checked })
                }
              >
                Categoría activa
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onPress={onCategoryClose}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSaveCategory}>
              {editingCategory ? "Guardar Cambios" : "Crear Categoría"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Type Modal */}
      <Modal isOpen={isTypeOpen} onClose={onTypeClose}>
        <ModalContent>
          <ModalHeader>
            {editingType ? "Editar Tipo de Reclamo" : "Nuevo Tipo de Reclamo"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                isRequired
                label="Nombre"
                placeholder="Ej: Acoso Laboral"
                value={typeFormData.nombre}
                onChange={(e) =>
                  setTypeFormData({ ...typeFormData, nombre: e.target.value })
                }
              />
              <Input
                isRequired
                label="Código"
                placeholder="Ej: AL-001"
                value={typeFormData.codigo}
                onChange={(e) =>
                  setTypeFormData({ ...typeFormData, codigo: e.target.value })
                }
              />
              <Textarea
                label="Descripción"
                minRows={3}
                placeholder="Describe este tipo de reclamo"
                value={typeFormData.descripcion}
                onChange={(e) =>
                  setTypeFormData({
                    ...typeFormData,
                    descripcion: e.target.value,
                  })
                }
              />
              <Checkbox
                isSelected={typeFormData.activo}
                onValueChange={(checked) =>
                  setTypeFormData({ ...typeFormData, activo: checked })
                }
              >
                Tipo activo
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onPress={onTypeClose}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSaveType}>
              {editingType ? "Guardar Cambios" : "Crear Tipo"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Status Modal */}
      <Modal isOpen={isStatusOpen} size="lg" onClose={onStatusClose}>
        <ModalContent>
          <ModalHeader>
            {editingStatus ? "Editar Estado" : "Nuevo Estado"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                isRequired
                label="Nombre"
                placeholder="Ej: En Proceso"
                value={statusFormData.nombre}
                onChange={(e) =>
                  setStatusFormData({
                    ...statusFormData,
                    nombre: e.target.value,
                  })
                }
              />
              <Textarea
                label="Descripción"
                minRows={2}
                placeholder="Describe este estado"
                value={statusFormData.descripcion}
                onChange={(e) =>
                  setStatusFormData({
                    ...statusFormData,
                    descripcion: e.target.value,
                  })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  isRequired
                  label="Orden"
                  placeholder="1"
                  type="number"
                  value={statusFormData.orden.toString()}
                  onChange={(e) =>
                    setStatusFormData({
                      ...statusFormData,
                      orden: Number.parseInt(e.target.value) || 1,
                    })
                  }
                />
                <Input
                  label="Color"
                  startContent={
                    <Palette className="h-4 w-4 text-default-400" />
                  }
                  type="color"
                  value={statusFormData.color}
                  onChange={(e) =>
                    setStatusFormData({
                      ...statusFormData,
                      color: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onPress={onStatusClose}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSaveStatus}>
              {editingStatus ? "Guardar Cambios" : "Crear Estado"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
