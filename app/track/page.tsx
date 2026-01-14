"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardBody, Button, Image } from "@heroui/react";
import {
  FileText,
  Clock,
  CheckCircle,
  Shield,
  AlertCircle,
  ArrowLeftToLine,
} from "lucide-react";

import { TrackSearch } from "@/components/track-search";
import { ClaimDetail } from "@/components/claim-detail";
import Footer from "@/components/Footer";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TrackClaimPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read params once and store them
  const [initialNumero] = useState(() => searchParams.get("numero") || "");
  const [initialClave] = useState(() => searchParams.get("clave") || "");

  const [view, setView] = useState<"search" | "loading" | "detail" | "error">(
    "search",
  );
  const [claim, setClaim] = useState<any>(null);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<{
    numero: string;
    clave: string;
  } | null>(null);
  const [autoSearchDone, setAutoSearchDone] = useState(false);

  // Clear URL params after reading them (for security and cleaner URL)
  useEffect(() => {
    if (searchParams.get("numero") || searchParams.get("clave")) {
      router.replace("/track", { scroll: false });
    }
  }, [router, searchParams]);

  const handleSearch = async (claimCode: string, accessKey: string) => {
    setError("");

    if (!claimCode.trim()) {
      setError("Por favor ingresa un código de reclamo");

      return;
    }

    if (!accessKey.trim()) {
      setError("Por favor ingresa tu clave de acceso");

      return;
    }

    // Validate format
    if (!/^\d{4}-\d{4,}$/.test(claimCode.trim())) {
      setError("Formato inválido. Debe ser como: 2024-1234");

      return;
    }

    setView("loading");

    try {
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
        setView("error");

        return;
      }

      const data = await response.json();

      setClaim(data);
      setCredentials({ numero: claimCode.trim(), clave: accessKey.trim() });
      setView("detail");
    } catch {
      setError("Error al conectar con el servidor");
      setView("error");
    }
  };

  // Auto-búsqueda cuando hay numero y clave en la URL (desde el email)
  useEffect(() => {
    if (initialNumero && initialClave && !autoSearchDone) {
      setAutoSearchDone(true);
      handleSearch(initialNumero, initialClave);
    }
  }, [initialNumero, initialClave, autoSearchDone]);

  const handleBack = () => {
    setView("search");
    setClaim(null);
    setError("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <Button
        className="fixed top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-slate-700 hover:text-slate-900 transition z-[50] bg-white border border-slate-500 shadow-lg hover:shadow-xl"
        variant="flat"
        onPress={() => router.push("/")}
      >
        <ArrowLeftToLine className="w-4 h-4" />
        Volver al Inicio
      </Button>
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a2647] via-[#202e5e] to-[#2a3f7a] mb-4">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative container mx-auto px-4 pb-20 mb-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <Image
                alt="Belator group logo"
                className="drop-shadow-2xl cursor-pointer"
                height={400}
                src="/sub/Logo.svg"
                width={400}
                onClick={() => router.push("/")}
              />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Seguimiento de Reclamo
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl font-light">
              Ingresa tu código de reclamo para consultar el estado en tiempo
              real
            </p>
          </div>

          {/* Badges de confianza */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/20 shadow-lg">
              <Shield className="w-4 h-4 text-emerald-300" />
              <span className="text-sm text-white font-medium">
                100% Confidencial
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/20 shadow-lg">
              <Clock className="w-4 h-4 text-amber-300" />
              <span className="text-sm text-white font-medium">
                Actualización en Tiempo Real
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/20 shadow-lg">
              <CheckCircle className="w-4 h-4 text-sky-300" />
              <span className="text-sm text-white font-medium">
                Historial Completo
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-[-1] w-full z-10">
          <svg
            className="w-full"
            fill="none"
            viewBox="0 0 1440 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#FDFEFE"
            />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-16 relative z-10 pb-16">
        <div className="max-w-6xl mx-auto">
          {view === "search" && (
            <>
              {/* Search Form */}
              <div className="mb-12">
                <TrackSearch
                  error={error}
                  initialAccessKey={initialClave}
                  initialClaimCode={initialNumero}
                  onSearch={handleSearch}
                />
              </div>

              {/* Feature Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <Card className="border-2 border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <CardBody className="text-center p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/30">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-3 text-slate-800">
                      Información Detallada
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Consulta todos los detalles y el progreso de tu reclamo
                    </p>
                  </CardBody>
                </Card>

                <Card className="border-2 border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <CardBody className="text-center p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/30">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-3 text-slate-800">
                      Estado en Tiempo Real
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Conoce el estado actual y las actualizaciones más
                      recientes
                    </p>
                  </CardBody>
                </Card>

                <Card className="border-2 border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <CardBody className="text-center p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-3 text-slate-800">
                      Historial Completo
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Revisa toda la línea de tiempo y comentarios del proceso
                    </p>
                  </CardBody>
                </Card>
              </div>

              {/* Security Badge */}
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 mb-1">
                        Tu privacidad está protegida
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Toda la información es tratada de forma confidencial y
                        segura. Solo podrás acceder con tu código y clave de
                        acceso únicos.
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Help Section */}
              <Card className="mt-8 bg-slate-50 border-2 border-slate-200">
                <CardBody className="p-6">
                  <h3 className="font-bold text-slate-800 mb-3">
                    ¿No encuentras tu código de reclamo?
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    El código y la clave fueron enviados a tu correo electrónico
                    cuando enviaste tu reclamo. Revisa tu carpeta de spam o
                    contacta con soporte.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      as="a"
                      className="font-semibold"
                      href="/"
                      size="sm"
                      variant="flat"
                    >
                      Enviar Nuevo Reclamo
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </>
          )}

          {view === "loading" && (
            <Card className="border-2 border-slate-200 shadow-2xl">
              <CardBody className="text-center p-16">
                <div className="flex justify-center mb-6">
                  <div className="animate-spin">
                    <Clock className="w-16 h-16 text-[#202e5e]" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-3 text-slate-800">
                  Consultando reclamo...
                </h2>
                <p className="text-slate-600 text-lg">
                  Por favor espera mientras recuperamos la información
                </p>
              </CardBody>
            </Card>
          )}

          {view === "error" && (
            <Card className="border-2 border-red-200 shadow-2xl bg-gradient-to-br from-red-50 to-rose-50">
              <CardBody className="text-center p-16">
                <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-3 text-slate-800">
                  {error || "Error al cargar"}
                </h2>
                <p className="text-slate-600 mb-8 text-lg">
                  Por favor verifica tu código y clave e intenta nuevamente
                </p>
                <Button
                  className="bg-gradient-to-r from-[#202e5e] to-[#1a2550] text-white font-semibold"
                  color="primary"
                  size="lg"
                  onPress={handleBack}
                >
                  Volver a Intentar
                </Button>
              </CardBody>
            </Card>
          )}

          {view === "detail" && claim && (
            <ClaimDetail
              claim={claim}
              credentials={credentials}
              onBack={handleBack}
              onRefresh={() =>
                credentials &&
                handleSearch(credentials.numero, credentials.clave)
              }
            />
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
