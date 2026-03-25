"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, Image } from "@heroui/react";
import Link from "next/link";
import { Search, Shield, Lock, Clock } from "lucide-react";

import { ClaimsWizard } from "@/components/claims-wizard";
import LogoCarousel from "@/components/LogoCarousel";
import Footer from "@/components/Footer";
export default function HomePage() {
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
                className="drop-shadow-2xl"
                height={400}
                src="/sub/Logo.svg"
                width={400}
              />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4 tracking-tight">
              Canal de Denuncias
            </h1>
            <p className="text-lg md:text-xl text-blue-100 text-center max-w-2xl font-light">
              Grupo Belator
            </p>
          </div>

          {/* Badges de confianza con mejor espaciado */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/20 shadow-lg">
              <Shield className="w-4 h-4 text-emerald-300" />
              <span className="text-sm text-white font-medium">
                100% Confidencial
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/20 shadow-lg">
              <Lock className="w-4 h-4 text-amber-300" />
              <span className="text-sm text-white font-medium">
                Denuncia o reclamo Anónimo
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/20 shadow-lg">
              <Clock className="w-4 h-4 text-sky-300" />
              <span className="text-sm text-white font-medium">
                Seguimiento en línea
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-slate-600 text-[1.05rem] md:text-lg leading-relaxed space-y-5 font-light">
            <p>
              Bienvenido al Canal de Denuncias de Grupo Belator. Esta es una plataforma oficial, segura y estrictamente confidencial, dispuesta para que colaboradores y terceros reporten cualquier hecho o conducta que pudiese constituir una infracción a nuestros principios éticos o a la legalidad vigente (en especial bajo el marco de las Leyes N° 20.393 y N° 21.643).
            </p>
            <p>
              Nuestra organización garantiza la protección absoluta de los denunciantes que actúen de buena fe, asegurando la inexistencia de represalias y el manejo profesional de la información.
            </p>
            <p>
              Para facilitar una investigación efectiva, le solicitamos hacer un uso responsable de este medio, proporcionando un relato detallado de los hechos, identificando a los involucrados, señalando el lugar y adjuntando cualquier antecedente o evidencia relevante para el caso.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Card Importante */}
            <Card className="bg-white border border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardBody className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-500 w-10 h-10 flex items-center justify-center rounded-xl shrink-0 shadow-md">
                    <span className="text-white font-bold text-xl">!</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800 uppercase">
                    Importante
                  </h2>
                </div>
                <p className="text-slate-600 mb-2 text-base">
                  No utilices el canal de denuncias para:
                </p>
                <ul className="text-slate-600 text-sm md:text-base space-y-1 list-disc pl-5">
                  <li>Reclamos por servicios o productos.</li>
                  <li>Consultas u ofrecimientos de carácter comercial.</li>
                </ul>
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
                    <h3 className="text-xl font-semibold text-slate-800">
                      Seguimiento de denuncia o reclamo
                    </h3>
                  </div>
                  <p className="text-slate-600 mb-6 text-base leading-relaxed">
                    Consulta el estado de tu denuncia o reclamo ingresando el código único que recibió al momento de enviarla.
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
              <h2 className="text-3xl font-bold text-slate-800 mb-3">
                Realizar una Denuncia o reclamo
              </h2>
              <p className="text-slate-600 text-base max-w-2xl mx-auto">
                Complete el formulario a continuación. Todos los datos son
                tratados con absoluta confidencialidad.
              </p>
            </div>
            <ClaimsWizard />
          </div>

          <div className="mt-12 text-slate-700 text-[0.95rem] leading-relaxed space-y-6">
            <p>
              <strong className="text-slate-900 font-semibold">Modelo de Prevención de Delitos (Ley N° 20.393):</strong> Este canal constituye un elemento esencial de nuestro Modelo de Prevención de Delitos (MPD), implementado bajo los estándares de la Ley N° 20.393 sobre responsabilidad penal de las personas jurídicas. A través de este medio, Grupo Belator recibe denuncias relativas a delitos económicos, cohecho, lavado de activos, administración desleal y cualquier otro ilícito contemplado en el catálogo legal vigente. Nuestro compromiso es gestionar cada reporte de manera técnica y eficiente, asegurando una respuesta oportuna ante cualquier riesgo corporativo identificado.
            </p>
            <p>
              <strong className="text-slate-900 font-semibold">Ley Karin (Ley N° 21.643):</strong> En estricto cumplimiento con la Ley N° 21.643, este espacio está habilitado para la recepción de denuncias sobre acoso laboral, acoso sexual y violencia en el trabajo. Grupo Belator garantiza que estos reportes serán gestionados bajo los principios de confidencialidad, celeridad, imparcialidad y perspectiva de género. Aseguramos un procedimiento orientado a la protección de la integridad de los denunciantes, promoviendo un entorno laboral digno, seguro y libre de violencia para todos nuestros integrantes
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
