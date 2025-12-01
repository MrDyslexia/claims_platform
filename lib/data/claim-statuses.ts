import type { EstadoDenuncia } from "@/lib/types/database";

export const mockClaimStatuses: EstadoDenuncia[] = [
  {
    id_estado: 1,
    nombre: "Recibido",
    descripcion: "Reclamo recibido y pendiente de revisión inicial",
    color: "#3b82f6",
    orden: 1,
  },
  {
    id_estado: 2,
    nombre: "En Revisión",
    descripcion: "Reclamo en proceso de análisis y evaluación",
    color: "#f59e0b",
    orden: 2,
  },
  {
    id_estado: 3,
    nombre: "En Investigación",
    descripcion: "Se está llevando a cabo una investigación formal",
    color: "#8b5cf6",
    orden: 3,
  },
  {
    id_estado: 4,
    nombre: "Pendiente de Información",
    descripcion: "Se requiere información adicional del denunciante",
    color: "#eab308",
    orden: 4,
  },
  {
    id_estado: 5,
    nombre: "Resuelto",
    descripcion: "Reclamo resuelto satisfactoriamente",
    color: "#10b981",
    orden: 5,
  },
  {
    id_estado: 6,
    nombre: "Cerrado",
    descripcion: "Reclamo cerrado sin resolución o por falta de evidencia",
    color: "#6b7280",
    orden: 6,
  },
  {
    id_estado: 7,
    nombre: "Rechazado",
    descripcion: "Reclamo rechazado por no cumplir criterios",
    color: "#ef4444",
    orden: 7,
  },
];
