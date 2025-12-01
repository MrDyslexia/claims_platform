import type { TipoDenuncia } from "@/lib/types/database";

export const mockClaimTypes: TipoDenuncia[] = [
  {
    id_tipo: 1,
    nombre: "Acoso Laboral",
    descripcion:
      "Situaciones de acoso, hostigamiento o maltrato en el ambiente laboral",
    activo: true,
  },
  {
    id_tipo: 2,
    nombre: "Discriminación",
    descripcion:
      "Actos discriminatorios por género, edad, orientación sexual, religión, etc.",
    activo: true,
  },
  {
    id_tipo: 3,
    nombre: "Fraude",
    descripcion:
      "Actividades fraudulentas, malversación de fondos o corrupción",
    activo: true,
  },
  {
    id_tipo: 4,
    nombre: "Seguridad Laboral",
    descripcion:
      "Condiciones inseguras de trabajo o incumplimiento de normas de seguridad",
    activo: true,
  },
  {
    id_tipo: 5,
    nombre: "Conflicto de Interés",
    descripcion:
      "Situaciones donde existe conflicto entre intereses personales y corporativos",
    activo: true,
  },
  {
    id_tipo: 6,
    nombre: "Incumplimiento Normativo",
    descripcion: "Violación de políticas internas, leyes o regulaciones",
    activo: true,
  },
  {
    id_tipo: 7,
    nombre: "Medio Ambiente",
    descripcion:
      "Daños ambientales o incumplimiento de normativas medioambientales",
    activo: true,
  },
  {
    id_tipo: 8,
    nombre: "Otros",
    descripcion: "Otros tipos de reclamos no categorizados",
    activo: true,
  },
];
