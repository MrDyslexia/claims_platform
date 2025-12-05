"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import {
  Users,
  Building,
  UserCheck,
  Crown,
  Shield,
  Briefcase,
  CircleCheckBig,
  type LucideIcon,
} from "lucide-react";

import {
  type RelationshipMetadata,
  FALLBACK_RELATIONSHIPS,
} from "@/lib/form-metadata";

const RELATIONSHIP_STYLES: Record<string, { icon: LucideIcon; color: string }> =
  {
    cliente: {
      icon: Users,
      color: "bg-blue-500/10 text-blue-700 border-blue-200",
    },
    empleado: {
      icon: Briefcase,
      color: "bg-green-500/10 text-green-700 border-green-200",
    },
    proveedor: {
      icon: Building,
      color: "bg-orange-500/10 text-orange-700 border-orange-200",
    },
    administrador: {
      icon: UserCheck,
      color: "bg-purple-500/10 text-purple-700 border-purple-200",
    },
    gerente: {
      icon: Crown,
      color: "bg-red-500/10 text-red-700 border-red-200",
    },
    tercero: {
      icon: Shield,
      color: "bg-gray-500/10 text-gray-700 border-gray-200",
    },
  };

const DEFAULT_STYLE = {
  icon: Users,
  color: "bg-gray-500/10 text-gray-700 border-gray-200",
};

interface RelationshipStepProps {
  readonly formData: Record<string, any>;
  readonly onUpdate: (data: Record<string, any>) => void;
}

export function RelationshipStep({
  formData,
  onUpdate,
}: RelationshipStepProps) {
  const [selectedRelationship, setSelectedRelationship] = useState<string>(
    formData.relationship || "",
  );

  // 🔄 Sincronizar cuando formData cambie desde afuera
  useEffect(() => {
    setSelectedRelationship(formData.relationship || "");
  }, [formData.relationship]);

  const handleRelationshipSelect = (relationship: RelationshipMetadata) => {
    setSelectedRelationship(relationship.id);
    onUpdate({
      relationship: relationship.id,
      relationshipLabel: relationship.title,
    });
  };

  const selectedRelationshipData = FALLBACK_RELATIONSHIPS.find(
    (relationship) => relationship.id === selectedRelationship,
  );
  const selectedStyle =
    (selectedRelationshipData &&
      (RELATIONSHIP_STYLES[selectedRelationshipData.id] ?? DEFAULT_STYLE)) ||
    null;
  const SelectedIcon = selectedStyle?.icon;

  return (
    <div className="space-y-6">
      <div className="px-4 overflow-hidden">
        <h3 className="text-lg font-semibold mb-2">
          ¿Cuál es tu relación con la empresa?
        </h3>
        <p className="text-muted-foreground">
          Esta información nos ayuda a dirigir tu reclamo al departamento
          correcto
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FALLBACK_RELATIONSHIPS.map((relationship) => {
          const style = RELATIONSHIP_STYLES[relationship.id] ?? DEFAULT_STYLE;
          const Icon = style.icon;
          const isSelected = selectedRelationship === relationship.id;

          return (
            <Card
              key={relationship.id}
              isPressable
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-accent bg-accent/10 shadow-md scale-105"
                  : "hover:border-accent/50 hover:bg-accent/5 hover:scale-102"
              }`}
              onPress={() => handleRelationshipSelect(relationship)}
            >
              <CardBody className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${style.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">
                      {relationship.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {relationship.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <Chip
                        color="success"
                        startContent={<CircleCheckBig size={18} />}
                        variant="bordered"
                      >
                        Seleccionado
                      </Chip>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {selectedRelationshipData && SelectedIcon && (
        <Card className="bg-primary/5 border-primary/20">
          <CardBody className="p-4">
            <div className="flex items-center space-x-3">
              <SelectedIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">
                  Relación seleccionada: {selectedRelationshipData.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedRelationshipData.description}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
