"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Input,
  ButtonGroup,
} from "@heroui/react";
import { Plus, X, Users, Building, User } from "lucide-react";

interface InvolvedStepProps {
  readonly formData: Record<string, any>;
  readonly onUpdate: (data: Record<string, any>) => void;
}

export function InvolvedStep({ formData, onUpdate }: InvolvedStepProps) {
  const [involvedParties, setInvolvedParties] = useState<Array<any>>(
    formData.involvedParties || [],
  );
  const [newParty, setNewParty] = useState("");
  const [partyType, setPartyType] = useState("person");

  useEffect(() => {
    setInvolvedParties(formData.involvedParties || []);
  }, [formData.involvedParties]);

  const addParty = () => {
    if (newParty.trim()) {
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

  const removeParty = (id: number) => {
    const updatedParties = involvedParties.filter(
      (party: any) => party.id !== id,
    );

    setInvolvedParties(updatedParties);
    onUpdate({ involvedParties: updatedParties });
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

  return (
    <div className="space-y-6">
      <div className="p-4 overflow-hidden">
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
              onPress={() => setPartyType("person")}
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
              onPress={() => setPartyType("company")}
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
              onPress={() => setPartyType("entity")}
            >
              <Users className="h-4 w-4" />
              <span>Entidad</span>
            </Button>
          </ButtonGroup>
        </CardHeader>
        <CardBody className="space-y-4 justify-start">
          <div className="flex gap-2">
            <Input
              className="flex-1"
              placeholder={`Nombre de la ${getTypeLabel(partyType).toLowerCase()}...`}
              value={newParty}
              onChange={(e) => setNewParty(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addParty()}
            />
            <Button disabled={!newParty.trim()} onPress={addParty}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
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
