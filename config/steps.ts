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
    title: "Datos",
    description: "Datos personales o anónimo",
    icon: User,
  },
  {
    id: 3,
    title: "Relato",
    description: "Relato detallado del hecho",
    icon: MessageSquare,
  },
  {
    id: 4,
    title: "Relación",
    description: "Tu relación con la empresa",
    icon: Users,
  },
  {
    id: 5,
    title: "Ubicación",
    description: "País donde ocurrió el hecho",
    icon: Globe,
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
    title: "Evidencias",
    description: "Documentos y fotografías",
    icon: FileText,
  },
  {
    id: 9,
    title: "Comentarios",
    description: "Información adicional",
    icon: MessageSquare,
  },
  {
    id: 10,
    title: "Resumen",
    description: "Resumen del reclamo",
    icon: MessageSquare,
  },
];

export default STEPS;
