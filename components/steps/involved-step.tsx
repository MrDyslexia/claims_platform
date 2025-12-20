"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Card, CardBody, Button, Input, ButtonGroup } from "@heroui/react";
import { Plus, X, Users, Building, User, Search, Check } from "lucide-react";

interface Enterprise {
  nombre: string;
  rut: string;
}

interface InvolvedStepProps {
  readonly formData: Record<string, any>;
  readonly onUpdate: (data: Record<string, any>) => void;
  readonly enterprises?: Enterprise[];
}

export function InvolvedStep({
  formData,
  onUpdate,
  enterprises = [],
}: InvolvedStepProps) {
  const [involvedParties, setInvolvedParties] = useState<Array<any>>(
    formData.involvedParties || [],
  );
  const [newParty, setNewParty] = useState("");
  const [partyType, setPartyType] = useState("person");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] =
    useState<Enterprise | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);

    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    setInvolvedParties(formData.involvedParties || []);
  }, [formData.involvedParties]);

  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      const updatePosition = () => {
        const rect = inputRef.current?.getBoundingClientRect();

        if (rect) {
          setDropdownPosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
          });
        }
      };

      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [showSuggestions, searchQuery]);

  const filteredEnterprises = useMemo(() => {
    if (!searchQuery?.trim()) return enterprises.slice(0, 10);
    const query = searchQuery.toLowerCase();

    return enterprises
      .filter(
        (e) =>
          e.nombre.toLowerCase().includes(query) ||
          e.rut.toLowerCase().includes(query),
      )
      .slice(0, 10);
  }, [searchQuery, enterprises]);

  const addParty = () => {
    if (partyType === "company" && selectedEnterprise) {
      const party = {
        id: Date.now(),
        name: selectedEnterprise.nombre,
        rut: selectedEnterprise.rut,
        type: partyType,
      };
      const updatedParties = [...involvedParties, party];

      setInvolvedParties(updatedParties);
      onUpdate({ involvedParties: updatedParties });
      setSelectedEnterprise(null);
      setSearchQuery("");
    } else if (partyType !== "company" && newParty.trim()) {
      const party = {
        id: Date.now(),
        name: newParty.trim(),
        type: partyType,
      };
      const updatedParties = [...involvedParties, party];

      setInvolvedParties(updatedParties);
      onUpdate({ involvedParties: updatedParties });
      setNewParty("");
    }
  };

  const handleSelectEnterprise = (enterprise: Enterprise) => {
    setSelectedEnterprise(enterprise);
    setSearchQuery(enterprise.nombre);
    setShowSuggestions(false);
  };

  const removeParty = (id: number) => {
    const updatedParties = involvedParties.filter(
      (party: any) => party.id !== id,
    );

    setInvolvedParties(updatedParties);
    onUpdate({ involvedParties: updatedParties });
  };

  const handlePartyTypeChange = (type: string) => {
    setPartyType(type);
    setNewParty("");
    setSearchQuery("");
    setSelectedEnterprise(null);
    setShowSuggestions(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "person":
        return User;
      case "company":
        return Building;
      case "entity":
        return Users;
      default:
        return User;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "person":
        return "Persona";
      case "company":
        return "Empresa";
      case "entity":
        return "Entidad";
      default:
        return "Persona";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "person":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "company":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "entity":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const canAdd =
    partyType === "company"
      ? selectedEnterprise !== null
      : newParty.trim() !== "";

  const renderDropdown = () => {
    if (!showSuggestions || !isMounted) return null;

    const dropdownContent = (
      <div
        style={{
          position: "fixed",
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          zIndex: 99999,
        }}
      >
        <div className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden max-h-[280px] overflow-y-auto">
          {filteredEnterprises.length > 0 ? (
            filteredEnterprises.map((enterprise) => (
              <button
                key={enterprise.rut}
                className={`w-full px-4 py-3 text-left hover:bg-purple-50 flex items-center justify-between border-b border-gray-100 last:border-0 transition-colors ${
                  selectedEnterprise?.rut === enterprise.rut
                    ? "bg-purple-50"
                    : ""
                }`}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectEnterprise(enterprise);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Building className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {enterprise.nombre}
                    </p>
                    <p className="text-sm text-gray-500">
                      RUT: {enterprise.rut}
                    </p>
                  </div>
                </div>
                {selectedEnterprise?.rut === enterprise.rut && (
                  <Check className="h-5 w-5 text-purple-600 flex-shrink-0" />
                )}
              </button>
            ))
          ) : (
            <div className="p-4 text-center">
              <Search className="h-6 w-6 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                No se encontraron empresas
              </p>
            </div>
          )}
        </div>
      </div>
    );

    return createPortal(dropdownContent, document.body);
  };

  return (
    <div className="space-y-6">
      <div className="px-4">
        <h3 className="text-lg font-semibold mb-2">Partes Involucradas</h3>
        <p className="text-muted-foreground">
          Agrega las personas, empresas o entidades relacionadas con este
          reclamo
        </p>
      </div>

      {/* Selectores de tipo */}
      <div className="flex justify-start">
        <ButtonGroup size="lg" variant="flat">
          <Button
            color={partyType === "person" ? "primary" : "default"}
            startContent={<User className="h-4 w-4" />}
            variant={partyType === "person" ? "solid" : "flat"}
            onPress={() => handlePartyTypeChange("person")}
          >
            Persona
          </Button>
          <Button
            color={partyType === "company" ? "secondary" : "default"}
            startContent={<Building className="h-4 w-4" />}
            variant={partyType === "company" ? "solid" : "flat"}
            onPress={() => handlePartyTypeChange("company")}
          >
            Empresa
          </Button>
          <Button
            className={partyType === "entity" ? "text-white" : ""}
            color={partyType === "entity" ? "warning" : "default"}
            startContent={<Users className="h-4 w-4" />}
            variant={partyType === "entity" ? "solid" : "flat"}
            onPress={() => handlePartyTypeChange("entity")}
          >
            Otras Entidades
          </Button>
        </ButtonGroup>
      </div>

      {/* Input para agregar */}
      <Card className="border border-gray-200">
        <CardBody className="p-4">
          <div className="flex gap-3">
            {partyType === "company" ? (
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  maxLength={220}
                  className="w-full"
                  placeholder="Buscar empresa por nombre o RUT..."
                  size="lg"
                  startContent={<Search className="h-5 w-5 text-gray-400" />}
                  value={searchQuery}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 150);
                  }}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                    if (
                      selectedEnterprise &&
                      e.target.value !== selectedEnterprise.nombre
                    ) {
                      setSelectedEnterprise(null);
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {renderDropdown()}
              </div>
            ) : (
              <Input
                className="flex-1"
                placeholder={`Ingresa el nombre de la ${getTypeLabel(partyType).toLowerCase()}...`}
                size="lg"
                maxLength={100}
                startContent={
                  partyType === "person" ? (
                    <User className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Users className="h-5 w-5 text-gray-400" />
                  )
                }
                value={newParty}
                onChange={(e) => setNewParty(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && canAdd && addParty()}
              />
            )}
            <Button
              className={`px-5 ${canAdd ? "bg-primary text-white" : ""}`}
              isDisabled={!canAdd}
              size="lg"
              onPress={addParty}
            >
              <Plus className="h-5 w-5" />
              <span className="ml-1 hidden sm:inline">Agregar</span>
            </Button>
          </div>

          {/* Empresa seleccionada */}
          {partyType === "company" && selectedEnterprise && (
            <div className="flex items-center gap-3 mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                <Building className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {selectedEnterprise.nombre}
                </p>
                <p className="text-sm text-gray-500">
                  RUT: {selectedEnterprise.rut}
                </p>
              </div>
              <Check className="h-5 w-5 text-purple-500 flex-shrink-0" />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Lista de partes agregadas */}
      {involvedParties.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-medium text-gray-900">Partes agregadas</h4>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {involvedParties.length}
            </span>
          </div>
          <div className="space-y-2">
            {involvedParties.map((party: any) => {
              const Icon = getIcon(party.type);

              return (
                <div
                  key={party.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        party.type === "person"
                          ? "bg-blue-100"
                          : party.type === "company"
                            ? "bg-purple-100"
                            : "bg-amber-100"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          party.type === "person"
                            ? "text-blue-600"
                            : party.type === "company"
                              ? "text-purple-600"
                              : "text-amber-600"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{party.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${getTypeColor(party.type)}`}
                        >
                          {getTypeLabel(party.type)}
                        </span>
                        {party.rut && (
                          <span className="text-xs text-gray-500">
                            RUT: {party.rut}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => removeParty(party.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {involvedParties.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <h4 className="font-medium text-gray-700 mb-1">
            Sin partes involucradas
          </h4>
          <p className="text-sm text-gray-500">
            Selecciona el tipo y agrega las partes relacionadas con el reclamo
          </p>
        </div>
      )}
    </div>
  );
}
