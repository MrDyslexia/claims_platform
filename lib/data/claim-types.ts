import type { TipoDenuncia } from "@/lib/types/database";

export const mockClaimTypes: TipoDenuncia[] = [
  {
    id: 1,
    id_tipo: 1,
    codigo: "ACO-001",
    nombre: "Acoso Laboral",
    descripcion:
      "Situaciones de acoso, hostigamiento o maltrato en el ambiente laboral",
    activo: true,
  },
  {
    id: 2,
    id_tipo: 2,
    codigo: "DIS-001",
    nombre: "Discriminación",
    descripcion:
      "Actos discriminatorios por género, edad, orientación sexual, religión, etc.",
    activo: true,
  },
  {
    id: 3,
    id_tipo: 3,
    codigo: "FRA-001",
    nombre: "Fraude",
    descripcion:
      "Actividades fraudulentas, malversación de fondos o corrupción",
    activo: true,
  },
  {
    id: 4,
    id_tipo: 4,
    codigo: "SEG-001",
    nombre: "Seguridad Laboral",
    descripcion:
      "Condiciones inseguras de trabajo o incumplimiento de normas de seguridad",
    activo: true,
  },
  {
    id: 5,
    id_tipo: 5,
    codigo: "CON-001",
    nombre: "Conflicto de Interés",
    descripcion:
      "Situaciones donde existe conflicto entre intereses personales y corporativos",
    activo: true,
  },
  {
    id: 6,
    id_tipo: 6,
    codigo: "INC-001",
    nombre: "Incumplimiento Normativo",
    descripcion: "Violación de políticas internas, leyes o regulaciones",
    activo: true,
  },
  {
    id: 7,
    id_tipo: 7,
    codigo: "AMB-001",
    nombre: "Medio Ambiente",
    descripcion:
      "Daños ambientales o incumplimiento de normativas medioambientales",
    activo: true,
  },
  {
    id: 8,
    id_tipo: 8,
    codigo: "OTR-001",
    nombre: "Otros",
    descripcion: "Otros tipos de reclamos no categorizados",
    activo: true,
  },
];
