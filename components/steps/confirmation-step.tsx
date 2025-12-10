"use client";

import { Card, CardBody, Button } from "@heroui/react";
import { CheckCircle, Home, Copy, AlertTriangle, Mail } from "lucide-react";
import { useState } from "react";

interface ConfirmationStepProps {
  claimNumber: string;
  trackingKey: string;
  isAnonymous: boolean;
  hasEmail: boolean;
  onReturnHome: () => void;
}

export function ConfirmationStep({
  claimNumber,
  trackingKey,
  isAnonymous,
  hasEmail,
  onReturnHome,
}: ConfirmationStepProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6 py-4">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          ¡Reclamo enviado exitosamente!
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Gracias por utilizar nuestra plataforma. Tu denuncia ha sido recibida
          y será revisada por nuestro equipo.
        </p>
      </div>

      {/* Warning for anonymous without email */}
      {isAnonymous && !hasEmail && (
        <Card className="bg-amber-50 border-2 border-amber-300">
          <CardBody className="p-6">
            <div className="flex gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h4 className="font-bold text-amber-900 text-lg">
                  ¡IMPORTANTE! Guarda estos datos
                </h4>
                <p className="text-amber-800">
                  Como realizaste una denuncia anónima sin proporcionar un
                  correo electrónico, esta es la <strong>única forma</strong> de
                  acceder al estado de tu denuncia.
                </p>
                <p className="text-amber-800 font-semibold">
                  Te recomendamos tomar una captura de pantalla o anotar estos
                  datos en un lugar seguro.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Claim Information */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardBody className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-5 w-5" />
                <span className="font-semibold">Número de Reclamo</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <span className="text-2xl font-mono font-bold text-gray-900">
                  {claimNumber}
                </span>
                <Button
                  color={copiedField === "number" ? "success" : "primary"}
                  size="sm"
                  variant="flat"
                  onPress={() => handleCopy(claimNumber, "number")}
                >
                  <Copy className="h-4 w-4" />
                  {copiedField === "number" ? "Copiado" : "Copiar"}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Clave de Seguimiento</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <span className="text-2xl font-mono font-bold text-gray-900">
                  {trackingKey}
                </span>
                <Button
                  color={copiedField === "key" ? "success" : "primary"}
                  size="sm"
                  variant="flat"
                  onPress={() => handleCopy(trackingKey, "key")}
                >
                  <Copy className="h-4 w-4" />
                  {copiedField === "key" ? "Copiado" : "Copiar"}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Next Steps Information */}
      <Card className="bg-blue-50 border-2 border-blue-200">
        <CardBody className="p-6">
          <h4 className="font-bold text-blue-900 text-lg mb-3">
            ¿Qué sigue ahora?
          </h4>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>
                Tu denuncia será revisada por nuestro equipo especializado
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>
                Recibirás actualizaciones sobre el estado de tu reclamo
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>
                Puedes consultar el estado en cualquier momento usando tu número
                de reclamo y clave de seguimiento
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>
                Tiempo estimado de primera respuesta: 48 horas hábiles
              </span>
            </li>
          </ul>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <Button
          className="bg-[#202e5e] hover:bg-[#1a2550] text-white font-medium"
          size="lg"
          startContent={<Home className="h-5 w-5" />}
          onPress={onReturnHome}
        >
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
}
