"use client";

import type React from "react";

import { Card, CardBody, Input, Button } from "@heroui/react";
import { Search, FileText, Clock, CheckCircle, Lock } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TrackClaimPage() {
  const router = useRouter();
  const [claimCode, setClaimCode] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!claimCode.trim()) {
      setError("Por favor ingresa un código de reclamo");
      setIsLoading(false);

      return;
    }

    if (!accessKey.trim()) {
      setError("Por favor ingresa tu clave de acceso");
      setIsLoading(false);

      return;
    }

    // Validate format (should be like: 2024-XXXXXXX)
    if (!/^\d{4}-\d{4,}$/.test(claimCode.trim())) {
      setError(
        "Formato de código inválido. Debe ser como: 2024-XXXX (al menos 4 dígitos después del guión)",
      );
      setIsLoading(false);

      return;
    }

    try {
      // Llamar a la función lookupDenuncia del backend
      const response = await fetch(`${API_BASE_URL}/denuncias/lookup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numero: claimCode.trim(),
          clave: accessKey.trim(),
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError("Reclamo no encontrado");
        } else if (response.status === 401) {
          setError("Clave de acceso inválida");
        } else {
          const errorData = await response.json();

          setError(errorData.error || "Error al consultar el reclamo");
        }
        setIsLoading(false);

        return;
      }

      // Si la consulta es exitosa, navegar a la página de detalle
      router.push(
        `/track/${claimCode.trim()}?key=${encodeURIComponent(accessKey.trim())}`,
      );
    } catch {
      setError("Error al conectar con el servidor");
      setIsLoading(false);
    }
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
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Input
                    description="Ingresa el código que recibiste en el correo al enviar tu reclamo"
                    errorMessage={error}
                    isInvalid={!!error}
                    label="Código de Reclamo"
                    placeholder="2025-XXXXXXX"
                    size="lg"
                    startContent={
                      <Search className="w-4 h-4 text-default-400" />
                    }
                    value={claimCode}
                    variant="bordered"
                    onChange={(e) => setClaimCode(e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    description="Ingresa la clave de acceso enviada a tu correo"
                    label="Clave de Acceso"
                    placeholder="Ingresa tu clave de acceso"
                    size="lg"
                    startContent={<Lock className="w-4 h-4 text-default-400" />}
                    type="password"
                    value={accessKey}
                    variant="bordered"
                    onChange={(e) => setAccessKey(e.target.value)}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                color="primary"
                disabled={isLoading}
                isLoading={isLoading}
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
