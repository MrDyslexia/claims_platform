"use client"

import { Card, CardBody, Chip, Button, Tabs, Tab } from "@heroui/react"
import {
  ArrowLeft,
  Building2,
  Calendar,
  User,
  MessageSquare,
  Clock,
  CheckCircle2,
  MapPin,
  FileText,
  Mail,
  Phone,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ClaimTimeline } from "./claim-timeline"

interface ClaimDetailProps {
  claim: any
  onBack: () => void
}

const STATUS_COLORS: Record<string, any> = {
  Nuevo: "primary",
  "En Revisión": "warning",
  "En Investigación": "warning",
  Resuelto: "success",
  Cerrado: "default",
  Rechazado: "danger",
}

export function ClaimDetail({ claim, onBack }: ClaimDetailProps) {
  const comments = claim?.comments || []

  const getStatusIcon = (estado: string) => {
    if (estado === "Resuelto" || estado === "Cerrado") {
      return <CheckCircle2 className="w-4 h-4" />
    }
    return <Clock className="w-4 h-4" />
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <Button
        className="mb-6 hover:scale-105 transition-transform"
        startContent={<ArrowLeft className="w-4 h-4" />}
        variant="flat"
        onPress={onBack}
      >
        Volver a Búsqueda
      </Button>

      {/* Hero Header with gradient */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#202e5e] via-[#1a2550] to-[#141d42] p-8 shadow-2xl">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">{claim.numero}</h1>
            </div>
            <p className="text-blue-100 text-lg">{claim.tipo || "Tipo desconocido"}</p>
          </div>
          <Chip
            color={STATUS_COLORS[claim.estado || "Desconocido"]}
            size="lg"
            startContent={getStatusIcon(claim.estado || "Desconocido")}
            variant="flat"
            classNames={{
              base: "bg-white/90 backdrop-blur-sm shadow-lg",
              content: "font-bold text-base",
            }}
          >
            {claim.estado || "Desconocido"}
          </Chip>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="border-2 border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Empresa</p>
                <p className="font-bold text-slate-800 text-lg">{claim.empresa?.nombre || "No disponible"}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-2 border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Fecha de Envío</p>
                <p className="font-bold text-slate-800 text-lg">
                  {format(new Date(claim.fecha_creacion), "dd MMM yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-2 border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Ubicación</p>
                <p className="font-bold text-slate-800 text-base line-clamp-2">
                  {claim.ubicacion || "No especificada"}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs with improved styling */}
      <Tabs
        aria-label="Claim details"
        className="mb-8"
        size="lg"
        classNames={{
          tabList: "bg-white p-2 rounded-2xl shadow-lg border-2 border-slate-200",
          tab: "font-semibold",
          cursor: "bg-gradient-to-r from-[#202e5e] to-[#1a2550] shadow-md",
        }}
      >
        <Tab key="timeline" title="Línea de Tiempo">
          <Card className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 shadow-xl">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#202e5e] rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Historial de Estados</h3>
              </div>
              <ClaimTimeline statusHistory={claim?.statusHistory || []} />
            </CardBody>
          </Card>
        </Tab>

        <Tab key="details" title="Detalles">
          <Card className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 shadow-xl">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#202e5e] rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Descripción del Reclamo</h3>
              </div>
              <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-md">
                <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap">{claim.descripcion}</p>
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="comments" title={`Comentarios (${comments.length})`}>
          <Card className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 shadow-xl">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#202e5e] rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Comentarios del Equipo</h3>
              </div>
              {comments.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-300">
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg font-medium">No hay comentarios disponibles</p>
                  <p className="text-slate-400 text-sm mt-2">
                    Los comentarios aparecerán aquí cuando el equipo actualice tu caso
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment: any) => (
                    <Card
                      key={comment.id}
                      className="bg-white border-2 border-slate-200 shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <CardBody className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-slate-800">
                                {comment.autor_nombre || "Equipo de Soporte"}
                              </span>
                              <span className="text-sm text-slate-500">
                                {format(new Date(comment.fecha_creacion), "dd MMM yyyy, HH:mm", { locale: es })}
                              </span>
                            </div>
                            <p className="text-slate-700 leading-relaxed">{comment.contenido}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Contact Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl">
        <CardBody className="p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4">¿Necesitas más información?</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Si tienes preguntas adicionales o necesitas proporcionar más información, contacta directamente con la
            empresa:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md border-2 border-slate-200">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Email</p>
                <p className="font-bold text-slate-800">{claim.empresa?.email_contacto || "No disponible"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md border-2 border-slate-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Teléfono</p>
                <p className="font-bold text-slate-800">{claim.empresa?.telefono_contacto || "No disponible"}</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
