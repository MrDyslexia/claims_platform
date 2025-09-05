"use client"

import { useState } from "react"
import { Card, CardBody, Badge} from "@heroui/react";
import { Users, Building, UserCheck, Crown, Shield, Briefcase } from "lucide-react"

const RELATIONSHIPS = [
  {
    id: "cliente",
    title: "Cliente",
    description: "Soy cliente de la empresa",
    icon: Users,
    color: "bg-blue-500/10 text-blue-700 border-blue-200",
  },
  {
    id: "empleado",
    title: "Empleado",
    description: "Trabajo en la empresa",
    icon: Briefcase,
    color: "bg-green-500/10 text-green-700 border-green-200",
  },
  {
    id: "proveedor",
    title: "Proveedor",
    description: "Soy proveedor de la empresa",
    icon: Building,
    color: "bg-orange-500/10 text-orange-700 border-orange-200",
  },
  {
    id: "administrador",
    title: "Administrador",
    description: "Tengo rol administrativo",
    icon: UserCheck,
    color: "bg-purple-500/10 text-purple-700 border-purple-200",
  },
  {
    id: "gerente",
    title: "Gerente",
    description: "Soy gerente o supervisor",
    icon: Crown,
    color: "bg-red-500/10 text-red-700 border-red-200",
  },
  {
    id: "tercero",
    title: "Tercero",
    description: "No tengo relación directa",
    icon: Shield,
    color: "bg-gray-500/10 text-gray-700 border-gray-200",
  },
]

interface RelationshipStepProps {
  readonly formData: any
  readonly onUpdate: (data: any) => void
}

export function RelationshipStep({ formData, onUpdate }: RelationshipStepProps) {
  const [selectedRelationship, setSelectedRelationship] = useState(formData.relationship || "")

  const handleRelationshipSelect = (relationshipId: string) => {
    setSelectedRelationship(relationshipId)
    onUpdate({ ...formData, relationship: relationshipId })
  }

  const selectedRelationshipData = RELATIONSHIPS.find((r) => r.id === selectedRelationship)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">¿Cuál es tu relación con la empresa?</h3>
        <p className="text-muted-foreground mb-6">
          Esta información nos ayuda a dirigir tu reclamo al departamento correcto
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RELATIONSHIPS.map((relationship) => {
          const Icon = relationship.icon
          const isSelected = selectedRelationship === relationship.id

          return (
            <Card
              key={relationship.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-accent bg-accent/10 shadow-md scale-105"
                  : "hover:border-accent/50 hover:bg-accent/5 hover:scale-102"
              }`}
              onClick={() => handleRelationshipSelect(relationship.id)}
            >
              <CardBody className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${relationship.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{relationship.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{relationship.description}</p>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <Badge variant="flat" className="bg-accent">
                        Seleccionado
                      </Badge>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {selectedRelationshipData && (
        <Card className="bg-primary/5 border-primary/20">
          <CardBody className="p-4">
            <div className="flex items-center space-x-3">
              <selectedRelationshipData.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Relación seleccionada: {selectedRelationshipData.title}</p>
                <p className="text-sm text-muted-foreground">{selectedRelationshipData.description}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
