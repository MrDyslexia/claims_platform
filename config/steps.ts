import {
  FileText,
  User,
  Users,
  Globe,
  MessageSquare,
  Clock,
  Building,
} from "lucide-react";
const STEPS = [
  {
    id: 1,
    title: "Categoría",
    description: "Tipo de reclamo",
    icon: FileText,
  },
  {
    id: 2,
    title: "Identificación",
    description: "Datos personales o anónimo",
    icon: User,
  },
  {
    id: 3,
    title: "Relación",
    description: "Tu relación con la empresa",
    icon: Users,
  },
  {
    id: 4,
    title: "Ubicación",
    description: "País donde ocurrió el hecho",
    icon: Globe,
  },
  {
    id: 5,
    title: "Detalles",
    description: "Información adicional",
    icon: MessageSquare,
  },
  { id: 6, title: "Tiempo", description: "Duración del problema", icon: Clock },
  {
    id: 7,
    title: "Involucrados",
    description: "Personas y entidades",
    icon: Building,
  },
  {
    id: 8,
    title: "Descripción",
    description: "Relato detallado del hecho",
    icon: MessageSquare,
  },
  {
    id: 9,
    title: "Evidencias",
    description: "Documentos y fotografías",
    icon: FileText,
  },
];

export default STEPS;
