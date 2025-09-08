"use client"

import { useState } from "react"
import { Card, CardBody, CardHeader, Button, Badge, Input, Tab, Tabs, ButtonGroup} from "@heroui/react";
import { Plus, X, Users, Building, User } from "lucide-react"

interface InvolvedStepProps {
  readonly formData: any
  readonly onUpdate: (data: any) => void
}

export function InvolvedStep({ formData, onUpdate }: InvolvedStepProps) {
  const [involvedParties, setInvolvedParties] = useState(formData.involvedParties || [])
  const [newParty, setNewParty] = useState("")
  const [partyType, setPartyType] = useState("person")

  const addParty = () => {
    if (newParty.trim()) {
      const party = {
        id: Date.now(),
        name: newParty.trim(),
        type: partyType,
      }
      const updatedParties = [...involvedParties, party]
      setInvolvedParties(updatedParties)
      onUpdate({ ...formData, involvedParties: updatedParties })
      setNewParty("")
    }
  }

  const removeParty = (id: number) => {
    const updatedParties = involvedParties.filter((party: any) => party.id !== id)
    setInvolvedParties(updatedParties)
    onUpdate({ ...formData, involvedParties: updatedParties })
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "person":
        return User
      case "company":
        return Building
      case "entity":
        return Users
      default:
        return User
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "person":
        return "Persona"
      case "company":
        return "Empresa"
      case "entity":
        return "Entidad"
      default:
        return "Persona"
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-4 overflow-hidden">
        <h3 className="text-lg font-semibold mb-2">Personas, empresas o entidades involucradas</h3>
        <p className="text-muted-foreground">
          Agrega todas las partes que consideres relevantes para este reclamo
        </p>
      </div>

      {/* Add New Party */}
      <Card>
        <CardHeader>
          <ButtonGroup className="flex">
            <Button
              type="button"
              variant={partyType === "person" ? "flat" : "solid"}
              size="sm"
              onPress={() => setPartyType("person")}
              className="flex items-center"
              color={partyType === "person" ? "primary" : undefined}
            >
              <User className="h-4 w-4" />
              <span>Persona</span>
            </Button>
            <Button
              type="button"
              variant={partyType === "company" ? "flat" : "solid"}
              size="sm"
              onPress={() => setPartyType("company")}
              className="flex items-center"
              color={partyType === "company" ? "primary" : undefined}
            >
              <Building className="h-4 w-4" />
              <span>Empresa</span>
            </Button>
            <Button
              type="button"
              variant={partyType === "entity" ? "flat" : "solid"}
              size="sm"
              onPress={() => setPartyType("entity")}
              className="flex items-center"
              color={partyType === "entity" ? "primary" : undefined}
            >
              <Users className="h-4 w-4" />
              <span>Entidad</span>
            </Button>
          </ButtonGroup>
        </CardHeader>
        <CardBody className="space-y-4 justify-start">
          <div className="flex gap-2">
            <Input
              placeholder={`Nombre de la ${getTypeLabel(partyType).toLowerCase()}...`}
              value={newParty}
              onChange={(e) => setNewParty(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addParty()}
              className="flex-1"
            />
            <Button onPress={addParty} disabled={!newParty.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* List of Added Parties */}
      {involvedParties.length > 0 && (
        <Card>
          <CardHeader>
            <h1 className="text-base">Partes involucradas ({involvedParties.length})</h1>
            <h2>Lista de personas, empresas y entidades agregadas</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="space-y-2">
              {involvedParties.map((party: any) => {
                const Icon = getIcon(party.type)
                return (
                  <div key={party.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{party.name}</p>
                        <Badge variant="flat" className="text-xs">
                          {getTypeLabel(party.type)}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => removeParty(party.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
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
            <p className="text-sm">Usa el formulario de arriba para agregar personas, empresas o entidades</p>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
