"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, Image } from "@heroui/react";
import Link from "next/link";
import {
  Search,
  LogIn,
  Shield,
  Lock,
  Clock,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

import { ClaimsWizard } from "@/components/claims-wizard";
import LoginDrawer from "@/components/login-drawer";
import LogoCarousel from "@/components/LogoCarousel";
export default function HomePage() {
  const [isLoginDrawerOpen, setIsLoginDrawerOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="relative overflow-hidden bg-[#202e5e] mb-4">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative container mx-auto px-4 pb-20">
          {/* Logo y header */}
          <div className="flex flex-col items-center mb-10">
            <Image
              alt="Belator group logo"
              height={500}
              src="/sub/Logo.svg"
              width={500}
            />

            <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-4 tracking-tight">
              Línea de Denuncias
            </h1>
            <p className="text-lg md:text-xl text-blue-100 text-center max-w-2xl font-light">
              Grupo Belator
            </p>
          </div>

          {/* Badges de confianza */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Shield className="w-4 h-4 text-emerald-300" />
              <span className="text-sm text-white font-medium">
                100% Confidencial
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Lock className="w-4 h-4 text-amber-300" />
              <span className="text-sm text-white font-medium">
                Denuncia Anónima
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Clock className="w-4 h-4 text-sky-300" />
              <span className="text-sm text-white font-medium">
                Respuesta en 48h
              </span>
            </div>
          </div>

          <LogoCarousel />
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
              fill="#FCFDFE"
            />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6 relative z-10 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Descripción */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 md:p-8 mb-8 border border-slate-100">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-[#202e5e] p-3 rounded-xl shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                  ¿Qué es la Línea de Denuncias?
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Es una herramienta para que cualquier persona pueda denunciar
                  hechos o conductas que constituyan o puedan constituir una
                  violación de los principios y valores de la Compañía, sus
                  normas corporativas o las leyes vigentes. La información
                  entregada es{" "}
                  <strong className="text-[#202e5e]">
                    estrictamente confidencial
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Cards de acción */}
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300">
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-500 p-2.5 rounded-xl">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    ¿Ya enviaste un reclamo?
                  </h3>
                </div>
                <p className="text-slate-600 mb-5 text-sm">
                  Consulta el estado de tu denuncia ingresando el código único
                  que recibiste al momento de enviarla.
                </p>
                <Button
                  as={Link}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                  href="/track"
                  size="lg"
                  startContent={<Search className="w-4 h-4" />}
                >
                  Hacer Seguimiento
                </Button>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#202e5e] p-2.5 rounded-xl">
                    <LogIn className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    ¿Eres administrador?
                  </h3>
                </div>
                <p className="text-slate-600 mb-5 text-sm">
                  Accede al panel de administración para gestionar y dar
                  seguimiento a las denuncias recibidas.
                </p>
                <Button
                  className="w-full bg-[#202e5e] hover:bg-[#1a2550] text-white font-medium"
                  size="lg"
                  startContent={<LogIn className="w-4 h-4" />}
                  onPress={() => setIsLoginDrawerOpen(true)}
                >
                  Acceder al Panel
                </Button>
              </CardBody>
            </Card>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Realizar una Denuncia
              </h2>
              <p className="text-slate-500">
                Complete el formulario a continuación. Todos los datos son
                tratados con absoluta confidencialidad.
              </p>
            </div>
            <ClaimsWizard />
          </div>
        </div>
      </div>

      <LoginDrawer
        isOpen={isLoginDrawerOpen}
        onOpenChange={setIsLoginDrawerOpen}
      />

      <footer className="bg-[#202e5e] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-10">
              {/* Logo y descripción */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white p-2 rounded-lg">
                    <Image
                      alt="Belator group logo"
                      height={40}
                      src="/icon.svg"
                      width={40}
                    />
                  </div>
                  <span className="text-xl font-bold">Grupo Belator</span>
                </div>
                <p className="text-blue-200 text-sm leading-relaxed mb-4">
                  Comprometidos con la transparencia, la ética empresarial y el
                  cumplimiento normativo. Nuestra línea de denuncias es un canal
                  seguro y confidencial para reportar irregularidades.
                </p>
                <div className="flex gap-3">
                  <a
                    className="text-blue-300 hover:text-white transition-colors text-sm flex items-center gap-1"
                    href="https://www.grupobelator.com"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    www.grupobelator.com
                  </a>
                </div>
              </div>

              {/* Enlaces rápidos */}
              <div>
                <h4 className="font-semibold mb-4 text-white">
                  Enlaces Rápidos
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      className="text-blue-200 hover:text-white transition-colors text-sm"
                      href="/track"
                    >
                      Seguimiento de Denuncia
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-blue-200 hover:text-white transition-colors text-sm"
                      href="/about"
                    >
                      Acerca del Canal
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-blue-200 hover:text-white transition-colors text-sm"
                      href="/about/faq"
                    >
                      Preguntas Frecuentes
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-blue-200 hover:text-white transition-colors text-sm"
                      href="/about/legal"
                    >
                      Aviso Legal
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contacto */}
              <div>
                <h4 className="font-semibold mb-4 text-white">Contacto</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-blue-300 mt-0.5 shrink-0" />
                    <span className="text-blue-200 text-sm">
                      contacto@grupobelator.com
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-blue-300 mt-0.5 shrink-0" />
                    <span className="text-blue-200 text-sm">
                      +56 2 2345 6789
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-300 mt-0.5 shrink-0" />
                    <span className="text-blue-200 text-sm">
                      Santiago, Chile
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-white/10 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-blue-200 text-sm">
                  © {new Date().getFullYear()} Grupo Belator. Todos los
                  derechos reservados.
                </p>
                <div className="flex items-center gap-6">
                  <Link
                    className="text-blue-200 hover:text-white transition-colors text-xs"
                    href="/about/privacy"
                  >
                    Política de Privacidad
                  </Link>
                  <Link
                    className="text-blue-200 hover:text-white transition-colors text-xs"
                    href="/about/terms"
                  >
                    Términos de Uso
                  </Link>
                </div>
              </div>
              <p className="text-blue-300/50 text-xs text-center mt-6">
                Desarrollado por Blocktype SpA
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
