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
} from "@heroui/react";
import {
  Search,
  Plus,
  Building2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import { DataTable } from "@/components/data-table";
import { useAuth } from "@/lib/auth/auth-context";
import { empresasAPI } from "@/lib/api/empresas";
// Mock data - para usar mientras se completa la integración
const mockCompanies: Empresa[] = [];

const columns = [
  { key: "empresa", label: "EMPRESA" },
  { key: "rut", label: "RUT" },
  { key: "contacto", label: "CONTACTO" },
  { key: "direccion", label: "DIRECCIÓN" },
  { key: "estado", label: "ESTADO" },
];

export default function CompaniesPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Empresa[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
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
    </div>
  );
}
