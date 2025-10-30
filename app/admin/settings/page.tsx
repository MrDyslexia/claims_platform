/* eslint-disable no-console */
"use client";

import type React from "react";
import type { TipoDenuncia, EstadoDenuncia } from "@/lib/types/database";

import { useState } from "react";
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
} from "@heroui/react";
import { Plus, Edit, Trash2, FileText, Activity, Palette } from "lucide-react";

import { DataTable } from "@/components/data-table";

// Mock data
const mockClaimTypes: TipoDenuncia[] = [
  {
    id_tipo: 1,
    nombre: "Acoso Laboral",
    descripcion: "Situaciones de acoso en el ambiente laboral",
    activo: true,
  },
  {
    id_tipo: 2,
    nombre: "Discriminación",
    descripcion: "Casos de discriminación por cualquier motivo",
    activo: true,
  },
  {
    id_tipo: 3,
    nombre: "Fraude",
    descripcion: "Actividades fraudulentas o irregulares",
    activo: true,
  },
  {
    id_tipo: 4,
    nombre: "Conflicto de Interés",
    descripcion: "Situaciones de conflicto de interés",
    activo: true,
  },
  {
    id_tipo: 5,
    nombre: "Incumplimiento Normativo",
    descripcion: "Violación de normas o políticas internas",
    activo: false,
  },
];

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
  const {
    isOpen: isTypeOpen,
    onOpen: onTypeOpen,
    onClose: onTypeClose,
  } = useDisclosure();
  const {
    isOpen: isStatusOpen,
    onOpen: onStatusOpen,
    onClose: onStatusClose,
  } = useDisclosure();

  const [editingType, setEditingType] = useState<TipoDenuncia | null>(null);
  const [typeFormData, setTypeFormData] = useState({
    nombre: "",
    descripcion: "",
    activo: true,
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

  const handleOpenTypeModal = (type?: TipoDenuncia | null) => {
    if (type) {
      setEditingType(type);
      setTypeFormData({
        nombre: type.nombre,
        descripcion: type.descripcion || "",
        activo: type.activo,
      });
    } else {
      setEditingType(null);
      setTypeFormData({
        nombre: "",
        descripcion: "",
        activo: true,
      });
    }
    onTypeOpen();
  };

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

  const handleSaveType = () => {
    console.log("[v0] Saving claim type:", typeFormData);
    onTypeClose();
  };

  const handleSaveStatus = () => {
    console.log("[v0] Saving claim status:", statusFormData);
    onStatusClose();
  };

  const renderTypeCell = (type: TipoDenuncia, columnKey: React.Key) => {
    switch (columnKey) {
      case "nombre":
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-600" />
            <span className="font-medium">{type.nombre}</span>
          </div>
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
              onPress={() => handleOpenTypeModal(type)}
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
            {/* Claim Types Tab */}
            <Tab
              key="types"
              title={
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Tipos de Reclamos</span>
                </div>
              }
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Configura los tipos de reclamos disponibles en el sistema
                  </p>
                  <Button
                    color="primary"
                    size="sm"
                    startContent={<Plus className="h-4 w-4" />}
                    onPress={() => handleOpenTypeModal()}
                  >
                    Nuevo Tipo
                  </Button>
                </div>

                <DataTable
                  columns={typeColumns}
                  data={mockClaimTypes}
                  renderCell={renderTypeCell}
                />
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

      {/* Claim Type Modal */}
      <Modal isOpen={isTypeOpen} size="lg" onClose={onTypeClose}>
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

      {/* Claim Status Modal */}
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
