"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, CheckCircle2, FileText, Search, XCircle, Eye } from "lucide-react"

interface StatusHistoryItem {
  id: string
  estado: string
  fecha_cambio: string
  motivo?: string
}

interface ClaimTimelineProps {
  statusHistory: StatusHistoryItem[]
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  Nuevo: {
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    label: "Nuevo",
  },
  "En Revisión": {
    icon: Search,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    label: "En Revisión",
  },
  "En Investigación": {
    icon: Eye,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    label: "En Investigación",
  },
  Resuelto: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    label: "Resuelto",
  },
  Cerrado: {
    icon: CheckCircle2,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    label: "Cerrado",
  },
  Rechazado: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    label: "Rechazado",
  },
}

export function ClaimTimeline({ statusHistory }: ClaimTimelineProps) {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">No hay historial disponible</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {statusHistory.map((item, index) => {
        const config = STATUS_CONFIG[item.estado] || STATUS_CONFIG["En Revisión"]
        const Icon = config.icon
        const isFirst = index === 0
        const isLast = index === statusHistory.length - 1

        return (
          <div key={item.id} className="relative flex gap-6 pb-8">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-slate-300 to-slate-200" />
            )}

            {/* Icon */}
            <div className="relative flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${config.bgColor} ${config.color} shadow-lg ${
                  isFirst ? "ring-4 ring-blue-100 scale-110" : ""
                } transition-all duration-300`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div
                className={`bg-white rounded-xl p-5 border-2 ${
                  isFirst ? "border-[#202e5e]" : "border-slate-200"
                } shadow-md hover:shadow-lg transition-shadow duration-300`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`text-lg font-bold ${isFirst ? "text-[#202e5e]" : "text-slate-800"}`}>
                    {config.label}
                  </h4>
                  <span className={`text-sm font-medium ${isFirst ? "text-[#202e5e]" : "text-slate-500"}`}>
                    {format(new Date(item.fecha_cambio), "dd MMM yyyy, HH:mm", {
                      locale: es,
                    })}
                  </span>
                </div>
                {item.motivo && <p className="text-slate-600 text-sm leading-relaxed">{item.motivo}</p>}
                {isFirst && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-blue-700">Estado Actual</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
