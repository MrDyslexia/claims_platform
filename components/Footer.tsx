import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Mail, Phone, MapPin } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
export default function Footer() {
  const { setIsLoginDrawerOpen } = useAuth();

  return (
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
                cumplimiento normativo. Nuestra canal de denuncias es una
                plataforma segura y confidencial para reportar irregularidades.
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
                  <Link
                    className="text-blue-200 hover:text-white transition-colors text-sm"
                    href="/track"
                  >
                    Seguimiento de denuncia o reclamo
                  </Link>
                </li>
                <li>
                  <button
                    className="text-blue-200 hover:text-white transition-colors text-sm cursor-pointer"
                    type="button"
                    onClick={() => setIsLoginDrawerOpen(true)}
                  >
                    Panel de administración
                  </button>
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
                © {new Date().getFullYear()} Grupo Belator. Todos los derechos
                reservados.
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
  );
}
