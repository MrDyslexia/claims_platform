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
  Chip,
  Tabs,
  Tab,
  Accordion,
  AccordionItem,
  Spinner,
} from "@heroui/react";
import { FileText, Activity, Folder } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { getCategorias, getTipos } from "@/lib/api/settings";

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
];

const statusColumns = [
  { key: "orden", label: "ORDEN" },
  { key: "nombre", label: "NOMBRE" },
  { key: "descripcion", label: "DESCRIPCIÓN" },
  { key: "color", label: "COLOR" },
];

export default function SettingsPage() {
  const [categories, setCategories] = useState<CategoriaDenuncia[]>([]);
  const [types, setTypes] = useState<TipoDenuncia[]>([]);
  const [loading, setLoading] = useState(true);
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
                    Estados del flujo de trabajo de reclamos
                  </p>
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
    </div>
  );
}
