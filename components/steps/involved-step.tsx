"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Input,
  ButtonGroup,
} from "@heroui/react";
import { Plus, X, Users, Building, User, Search } from "lucide-react";

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

  useEffect(() => {
    setInvolvedParties(formData.involvedParties || []);
  }, [formData.involvedParties]);

  const filteredEnterprises = useMemo(() => {
    if (!searchQuery.trim()) return enterprises;
    const query = searchQuery.toLowerCase();

    return enterprises.filter(
      (e) =>
        e.nombre.toLowerCase().includes(query) ||
        e.rut.toLowerCase().includes(query),
    );
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

  const canAdd =
    partyType === "company"
      ? selectedEnterprise !== null
      : newParty.trim() !== "";

  return (
    <div className="space-y-6">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">
          Personas, empresas o entidades involucradas
        </h3>
        <p className="text-muted-foreground">
          Agrega todas las partes que consideres relevantes para este reclamo
        </p>
      </div>

      {/* Add New Party */}
      <Card>
        <CardHeader>
          <ButtonGroup className="flex">
            <Button
              className="flex items-center"
              color={partyType === "person" ? "primary" : undefined}
              size="sm"
              type="button"
              variant={partyType === "person" ? "flat" : "solid"}
              onPress={() => handlePartyTypeChange("person")}
            >
              <User className="h-4 w-4" />
              <span>Persona</span>
            </Button>
            <Button
              className="flex items-center"
              color={partyType === "company" ? "primary" : undefined}
              size="sm"
              type="button"
              variant={partyType === "company" ? "flat" : "solid"}
              onPress={() => handlePartyTypeChange("company")}
            >
              <Building className="h-4 w-4" />
              <span>Empresa</span>
            </Button>
            <Button
              className="flex items-center"
              color={partyType === "entity" ? "primary" : undefined}
              size="sm"
              type="button"
              variant={partyType === "entity" ? "flat" : "solid"}
              onPress={() => handlePartyTypeChange("entity")}
            >
              <Users className="h-4 w-4" />
              <span>Entidad</span>
            </Button>
          </ButtonGroup>
        </CardHeader>
        <CardBody className="space-y-4 justify-start overflow-visible h-auto">
          <div className="flex gap-2">
            {partyType === "company" ? (
              <div className="flex-1 relative z-40">
                <Input
                  className="w-full"
                  placeholder="Buscar empresa por nombre o RUT..."
                  startContent={<Search className="h-4 w-4 text-gray-400" />}
                  value={searchQuery}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 200);
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
                {showSuggestions &&
                  searchQuery &&
                  filteredEnterprises.length > 0 && (
                    <div className="absolute left-0 right-0 z-[100] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto h-full">
                      {filteredEnterprises.map((enterprise) => (
                        <button
                          key={enterprise.rut}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center justify-between border-b border-gray-100 last:border-0 transition-colors ${
                            selectedEnterprise?.rut === enterprise.rut
                              ? "bg-purple-50"
                              : ""
                          }`}
                          type="button"
                          onClick={() => handleSelectEnterprise(enterprise)}
                        >
                          <div className="flex items-center gap-3">
                            <Building className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {enterprise.nombre}
                              </p>
                              <p className="text-sm text-gray-500">
                                RUT: {enterprise.rut}
                              </p>
                            </div>
                          </div>
                          {selectedEnterprise?.rut === enterprise.rut && (
                            <span className="text-purple-600 text-sm font-medium">
                              Seleccionada
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                {showSuggestions &&
                  searchQuery &&
                  filteredEnterprises.length === 0 && (
                    <div className="absolute left-0 right-0 z-[100] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-center text-gray-500">
                      No se encontraron empresas que coincidan con &quot;
                      {searchQuery}&quot;
                    </div>
                  )}
              </div>
            ) : (
              <Input
                className="flex-1"
                placeholder={`Nombre de la ${getTypeLabel(partyType).toLowerCase()}...`}
                value={newParty}
                onChange={(e) => setNewParty(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addParty()}
              />
            )}
            <Button disabled={!canAdd} onPress={addParty}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {partyType === "company" && selectedEnterprise && (
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
              <Building className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">
                Empresa seleccionada:{" "}
                <strong>{selectedEnterprise.nombre}</strong> (RUT:{" "}
                {selectedEnterprise.rut})
              </span>
            </div>
          )}
        </CardBody>
      </Card>

      {/* List of Added Parties */}
      {involvedParties.length > 0 && (
        <Card>
          <CardHeader>
            <h1 className="text-base">
              Partes involucradas ({involvedParties.length})
            </h1>
            <h2>Lista de personas, empresas y entidades agregadas</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="space-y-2">
              {involvedParties.map((party: any) => {
                const Icon = getIcon(party.type);

                return (
                  <div
                    key={party.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{party.name}</p>
                        {party.rut && (
                          <p className="text-xs text-gray-500">
                            RUT: {party.rut}
                          </p>
                        )}
                        <Badge className="text-xs" variant="flat">
                          {getTypeLabel(party.type)}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      className="text-destructive hover:text-destructive"
                      size="sm"
                      variant="ghost"
                      onPress={() => removeParty(party.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {involvedParties.length === 0 && (
        <Card className="border-dashed">
          <CardBody className="p-8 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay partes involucradas agregadas</p>
            <p className="text-sm">
              Usa el formulario de arriba para agregar personas, empresas o
              entidades
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
