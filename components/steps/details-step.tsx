"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Badge, Textarea } from "@heroui/react";
import { MessageSquare, AlertCircle } from "lucide-react";

interface DetailsStepProps {
  readonly formData: Record<string, any>;
  readonly onUpdate: (data: Record<string, any>) => void;
}

export function DetailsStep({ formData, onUpdate }: DetailsStepProps) {
  const [details, setDetails] = useState(formData.details || "");
  const maxLength = 240;
  const remainingChars = maxLength - details.length;

  const handleDetailsChange = (value: string) => {
    if (value.length <= maxLength) {
      setDetails(value);
      onUpdate({ details: value });
    }
  };

  // Extracted variant logic from nested ternary
  let badgeVariant: "shadow" | "flat" | "faded" | "solid" | undefined;

  if (remainingChars < 20) {
    badgeVariant = "shadow";
  } else if (remainingChars < 50) {
    badgeVariant = "flat";
  } else {
    badgeVariant = "faded";
  }

  return (
    <div className="space-y-6">
      <div className="p-4 overflow-hidden">
        <h3 className="text-lg font-semibold mb-2">Información adicional</h3>
        <p className="text-muted-foreground">
          Proporciona detalles adicionales que consideres relevantes para tu
          reclamo (máximo 240 caracteres)
        </p>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-base flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Detalles adicionales</span>
          </h1>
          <h2>
            Información complementaria que ayude a contextualizar tu reclamo
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="relative">
            <Textarea
              className="min-h-32 resize-none"
              maxLength={maxLength}
              placeholder="Escribe aquí cualquier información adicional que consideres importante para tu reclamo..."
              value={details}
              onChange={(e) => handleDetailsChange(e.target.value)}
            />
            <div className="absolute bottom-3 right-3">
              <Badge className="text-xs" variant={badgeVariant}>
                {remainingChars} restantes
              </Badge>
            </div>
          </div>

          {remainingChars < 20 && (
            <div className="flex items-center space-x-2 text-sm text-orange-600">
              <AlertCircle className="h-4 w-4" />
              <span>Te quedan pocos caracteres disponibles</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>
              💡 <strong>Sugerencias:</strong>
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Menciona fechas específicas si son relevantes</li>
              <li>Incluye números de referencia o códigos</li>
              <li>Indica si hay testigos o documentos adicionales</li>
            </ul>
          </div>
        </CardBody>
      </Card>

      {details && (
        <Card className="bg-primary/5 border-primary/20">
          <CardBody className="p-4">
            <div className="flex items-start space-x-3">
              <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Información adicional registrada</p>
                <p className="text-sm text-muted-foreground mt-1">
                  &ldquo;{details}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {details.length} de {maxLength} caracteres utilizados
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
