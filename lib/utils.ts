import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extrae las empresas/entidades involucradas de la descripción del reclamo
 * si están presentes en un formato estructurado ("Partes Involucradas:")
 */
export const extractCompaniesFromDesc = (description: string): string[] => {
  if (!description || typeof description !== "string") return [];

  const normalizedDesc = description.toLowerCase();
  const searchStr = "partes involucradas:";
  const partsIndex = normalizedDesc.indexOf(searchStr);

  if (partsIndex === -1) return [];

  try {
    const fromIndex = description.substring(partsIndex + searchStr.length);
    const listPart = fromIndex.split(/\r?\n\r?\n/)[0].trim();

    return listPart
      .split("\n")
      .map((line) => {
        const match = line.match(/Empresa:\s*([^,\n\r(]+)/i);
        return match ? match[1].trim() : null;
      })
      .filter((name): name is string => !!name);
  } catch (e) {
    return [];
  }
};

/**
 * Obtiene las empresas a mostrar para un reclamo, priorizando el campo JSON
 * involved_parties, luego la extracción del relato y finalmente la empresa principal.
 */
export const getDisplayCompanies = (claim: any): string[] => {
  if (
    Array.isArray(claim.involved_organizations) &&
    claim.involved_organizations.length > 0
  ) {
    return claim.involved_organizations
      .map((p: any) => (typeof p?.name === "string" ? p.name : null))
      .filter((name: string | null): name is string => Boolean(name));
  }

  // 1. Intentar usar involved_parties si existe (formato JSON o Array)
  if (claim.involved_parties) {
    try {
      const parties =
        typeof claim.involved_parties === "string"
          ? JSON.parse(claim.involved_parties)
          : claim.involved_parties;

      if (Array.isArray(parties) && parties.length > 0) {
        return parties
          .filter((p: any) => {
            if (!p || typeof p === "string") return true;
            return p.type === "company" || p.type === "entity";
          })
          .map((p: any) => (typeof p === "string" ? p : p.name))
          .filter(
            (name: any): name is string =>
              typeof name === "string" && name.trim().length > 0,
          );
      }
    } catch (e) {
      // Si falla el parseo, continuamos con los otros métodos
    }
  }

  // 2. Intentar extraer de la descripción
  const extracted = extractCompaniesFromDesc(claim.descripcion);
  if (extracted.length > 0) return extracted;

  // 3. Fallback a la empresa principal
  return [claim.empresa_nombre || "Sin empresa"];
};
