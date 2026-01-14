"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Badge, Textarea } from "@heroui/react";
import { FileText, AlertCircle, CheckCircle } from "lucide-react";

interface DescriptionStepProps {
  readonly formData: Record<string, any>;
  readonly onUpdate: (data: Record<string, any>) => void;
}

export function DescriptionStep({ formData, onUpdate }: DescriptionStepProps) {
  const [description, setDescription] = useState(formData.description || "");
  const minLength = 100;
  const recommendedLength = 300;
  const isValid = description.length >= minLength;

  // 🔄 Sincronizar cuando formData cambie desde afuera
  useEffect(() => {
    setDescription(formData.description || "");
  }, [formData.description]);

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    onUpdate({ description: value });
  };

  const getStatusColor = () => {
    if (description.length < minLength) return "text-red-600";
    if (description.length < recommendedLength) return "text-orange-600";

    return "text-green-600";
  };

  const getStatusIcon = () => {
    if (description.length < minLength) return AlertCircle;

    return CheckCircle;
  };

  const StatusIcon = getStatusIcon();

  return (
    <div>
      <div className="p-4 overflow-hidden">
        <h3 className="text-lg font-semibold mb-2">
          Relato detallado del hecho
        </h3>
        <p className="text-muted-foreground">
          Relata de manera detallada y completa lo ocurrido. Incluye fechas,
          lugares, circunstancias y cualquier información relevante.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div>
            <h1 className="text-base flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Relato detallado</span>
            </h1>
            <h2>
              Describe los hechos de manera cronológica y detallada (mínimo{" "}
              {minLength} caracteres)
            </h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-2">
          <div className="relative">
            <Textarea
              maxLength={4800}
              placeholder="Describe detalladamente lo ocurrido. "
              size="lg"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div
              className={`flex items-center space-x-2 text-sm ${getStatusColor()}`}
            >
              <StatusIcon className="h-4 w-4" />
              <span>
                {description.length} caracteres
                {description.length < minLength &&
                  ` (faltan ${minLength - description.length})`}
              </span>
            </div>
            <Badge
              className={isValid ? "bg-green-500" : ""}
              variant={isValid ? "flat" : "faded"}
            >
              {isValid ? "Válido" : "Muy corto"}
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-2">
              💡 Consejos para una buena descripción:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Sé específico con fechas, horarios y ubicaciones</li>
              <li>Lugar donde ocurrió</li>
              <li>Describe los hechos en orden cronológico</li>
              <li>Incluye nombres de personas involucradas (si los conoces)</li>
              <li>Menciona cualquier comunicación previa sobre el tema</li>
              <li>Describe las consecuencias o impacto del problema</li>
              <li>Evita opiniones personales, enfócate en los hechos</li>
              <li>Números de referencia, códigos o documentos relevantes</li>
            </ul>
          </div>
        </CardBody>
      </Card>
      {description && description.length >= minLength && (
        <Card className="bg-primary/5 border-primary/20">
          <CardBody className="p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-700">
                  Descripción registrada correctamente
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Has proporcionado una descripción detallada de{" "}
                  {description.length} caracteres
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
