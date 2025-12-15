"use client"

import { Button } from "@heroui/button"
import { Card, CardBody, Image } from "@heroui/react"
import Link from "next/link"
import { Search, Shield, Lock, Clock, CheckCircle, Mail, Phone, MapPin, ExternalLink } from "lucide-react"
import { useState } from "react"

import { ClaimsWizard } from "@/components/claims-wizard"
import LoginDrawer from "@/components/login-drawer"
import LogoCarousel from "@/components/LogoCarousel"
export default function HomePage() {
  const [isLoginDrawerOpen, setIsLoginDrawerOpen] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a2647] via-[#202e5e] to-[#2a3f7a] mb-4">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative container mx-auto px-4  pb-20">
          {/* Logo y header con mejor jerarquía visual */}
          <div className="flex flex-col items-center mb-12">
            <div className="mb-6">
              <Image
                alt="Belator group logo"
                height={400}
                src="/sub/Logo.svg"
                width={400}
                className="drop-shadow-2xl"
              />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4 tracking-tight">
              Línea de Denuncias
            </h1>
            <p className="text-lg md:text-xl text-blue-100 text-center max-w-2xl font-light">Grupo Belator</p>
          </div>

          {/* Badges de confianza con mejor espaciado */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/20 shadow-lg">
              <Shield className="w-4 h-4 text-emerald-300" />
              <span className="text-sm text-white font-medium">100% Confidencial</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/20 shadow-lg">
              <Lock className="w-4 h-4 text-amber-300" />
              <span className="text-sm text-white font-medium">Denuncia Anónima</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/20 shadow-lg">
              <Clock className="w-4 h-4 text-sky-300" />
              <span className="text-sm text-white font-medium">Respuesta en 48h</span>
            </div>
          </div>

          <LogoCarousel />
        </div>

        <div className="absolute bottom-[-1] w-full z-10">
          <svg className="w-full" fill="none" viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#FCFDFE"
            />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6 relative z-10 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Card informativa */}
            <Card className="bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardBody className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-[#202e5e] p-3 rounded-xl shrink-0 shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold text-slate-800">¿Qué es la Línea de Denuncias?</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-base">
                  Es una herramienta para que cualquier persona pueda denunciar hechos o conductas que constituyan o
                  puedan constituir una violación de los principios y valores de la Compañía, sus normas corporativas o
                  las leyes vigentes. La información entregada es{" "}
                  <strong className="text-[#202e5e]">estrictamente confidencial</strong>.
                </p>
              </CardBody>
            </Card>

            {/* Card de seguimiento */}
            <Card className="bg-gradient-to-br from-emerald-50 via-emerald-50 to-teal-50 border border-emerald-200 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <CardBody className="p-6 md:p-8 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800">¿Ya enviaste un reclamo?</h3>
                  </div>
                  <p className="text-slate-600 mb-6 text-base leading-relaxed">
                    Consulta el estado de tu denuncia ingresando el código único que recibiste al momento de enviarla.
                  </p>
                </div>
                <Button
                  as={Link}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  href="/track"
                  size="lg"
                  startContent={<Search className="w-5 h-5" />}
                >
                  Hacer Seguimiento
                </Button>
              </CardBody>
            </Card>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Realizar una Denuncia</h2>
              <p className="text-slate-600 text-base max-w-2xl mx-auto">
                Complete el formulario a continuación. Todos los datos son tratados con absoluta confidencialidad.
              </p>
            </div>
            <ClaimsWizard />
          </div>
        </div>
      </div>

      <LoginDrawer isOpen={isLoginDrawerOpen} onOpenChange={setIsLoginDrawerOpen} />

      <footer className="bg-[#202e5e] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-10">
              {/* Logo y descripción */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white p-2 rounded-lg">
                    <Image alt="Belator group logo" height={40} src="/icon.svg" width={40} />
                  </div>
                  <span className="text-xl font-bold">Grupo Belator</span>
                </div>
                <p className="text-blue-200 text-sm leading-relaxed mb-4">
                  Comprometidos con la transparencia, la ética empresarial y el cumplimiento normativo. Nuestra línea de
                  denuncias es un canal seguro y confidencial para reportar irregularidades.
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
                <h4 className="font-semibold mb-4 text-white">Enlaces Rápidos</h4>
                <ul className="space-y-2">
                  <li>
                    <Link className="text-blue-200 hover:text-white transition-colors text-sm" href="/track">
                      Seguimiento de Denuncia
                    </Link>
                  </li>
                  <li
                    className="text-blue-200 hover:text-white transition-colors text-sm cursor-pointer"
                    onClick={() => setIsLoginDrawerOpen(true)}
                  >
                    Panel de administración
                  </li>
                  <li>
                    <Link className="text-blue-200 hover:text-white transition-colors text-sm" href="/about">
                      Acerca del Canal
                    </Link>
                  </li>
                  <li>
                    <Link className="text-blue-200 hover:text-white transition-colors text-sm" href="/about/faq">
                      Preguntas Frecuentes
                    </Link>
                  </li>
                  <li>
                    <Link className="text-blue-200 hover:text-white transition-colors text-sm" href="/about/legal">
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
                    <span className="text-blue-200 text-sm">contacto@grupobelator.com</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-blue-300 mt-0.5 shrink-0" />
                    <span className="text-blue-200 text-sm">+56 2 2345 6789</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-300 mt-0.5 shrink-0" />
                    <span className="text-blue-200 text-sm">Santiago, Chile</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-white/10 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-blue-200 text-sm">
                  © {new Date().getFullYear()} Grupo Belator. Todos los derechos reservados.
                </p>
                <div className="flex items-center gap-6">
                  <Link className="text-blue-200 hover:text-white transition-colors text-xs" href="/about/privacy">
                    Política de Privacidad
                  </Link>
                  <Link className="text-blue-200 hover:text-white transition-colors text-xs" href="/about/terms">
                    Términos de Uso
                  </Link>
                </div>
              </div>
              <p className="text-blue-300/50 text-xs text-center mt-6">Desarrollado por Blocktype SpA</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
