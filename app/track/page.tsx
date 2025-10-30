"use client";

import type React from "react";

import { Card, CardBody, Input, Button } from "@heroui/react";
import { Search, FileText, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TrackClaimPage() {
  const router = useRouter();
  const [claimCode, setClaimCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!claimCode.trim()) {
      setError("Por favor ingresa un código de reclamo");

      return;
    }

    // Validate format (should be like: CLM-2024-001)
    if (!/^CLM-\d{4}-\d{3}$/.test(claimCode.trim())) {
      setError("Formato de código inválido. Debe ser como: CLM-2024-001");

      return;
    }

    router.push(`/track/${claimCode.trim()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-default-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Seguimiento de Reclamo</h1>
          <p className="text-lg text-default-600">
            Ingresa tu código de reclamo para consultar el estado
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-12">
          <CardBody className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Input
                  description="Ingresa el código que recibiste al enviar tu reclamo"
                  errorMessage={error}
                  isInvalid={!!error}
                  label="Código de Reclamo"
                  placeholder="CLM-2024-001"
                  size="lg"
                  startContent={<Search className="w-4 h-4 text-default-400" />}
                  value={claimCode}
                  variant="bordered"
                  onChange={(e) => setClaimCode(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                color="primary"
                size="lg"
                startContent={<Search className="w-5 h-5" />}
                type="submit"
              >
                Consultar Estado
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardBody className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Información Detallada</h3>
              <p className="text-sm text-default-600">
                Consulta todos los detalles de tu reclamo
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center p-6">
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <h3 className="font-semibold mb-2">Estado en Tiempo Real</h3>
              <p className="text-sm text-default-600">
                Conoce el estado actual de tu reclamo
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center p-6">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Historial Completo</h3>
              <p className="text-sm text-default-600">
                Revisa todo el historial de tu reclamo
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="mt-8 bg-default-50">
          <CardBody className="p-6">
            <h3 className="font-semibold mb-3">
              ¿No tienes tu código de reclamo?
            </h3>
            <p className="text-sm text-default-600 mb-4">
              El código de reclamo fue enviado a tu correo electrónico cuando
              enviaste tu reclamo. Si no lo encuentras, revisa tu carpeta de
              spam o contacta con soporte.
            </p>
            <div className="flex gap-4">
              <Button as="a" href="/" size="sm" variant="flat">
                Enviar Nuevo Reclamo
              </Button>
              <Button as="a" href="/contact" size="sm" variant="flat">
                Contactar Soporte
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
