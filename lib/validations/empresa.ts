/**
 * Validaciones para formulario de empresas
 */

/**
 * Valida RUT chileno en formato: 76.123.456-7 o 7612345-67
 * También acepta RUT sin formato
 */
export function validarRUT(rut: string): {
  valido: boolean;
  mensaje: string;
} {
  if (!rut || rut.trim() === "") {
    return { valido: true, mensaje: "" }; // RUT es opcional
  }

  // Limpiar formato (quitar puntos y guión)
  const rutLimpio = rut.replace(/[.-]/g, "").trim();

  // Validar que tenga entre 7 y 9 dígitos
  if (!/^\d{7,9}$/.test(rutLimpio)) {
    return {
      valido: false,
      mensaje: "RUT inválido. Debe tener entre 7 y 9 dígitos (ej: 76123456-7)",
    };
  }

  // Separar número y dígito verificador
  const numero = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();

  // Calcular dígito verificador
  let suma = 0;
  let multiplicador = 2;

  for (let i = numero.length - 1; i >= 0; i--) {
    suma += parseInt(numero[i]) * multiplicador;
    multiplicador++;
    if (multiplicador > 7) {
      multiplicador = 2;
    }
  }

  const residuo = 11 - (suma % 11);
  let dvCalculado: string;

  if (residuo === 11) {
    dvCalculado = "0";
  } else if (residuo === 10) {
    dvCalculado = "K";
  } else {
    dvCalculado = residuo.toString();
  }

  if (dvCalculado !== dv) {
    return {
      valido: false,
      mensaje: `RUT inválido. El dígito verificador debería ser ${dvCalculado}`,
    };
  }

  return { valido: true, mensaje: "" };
}

/**
 * Valida email
 */
export function validarEmail(email: string): {
  valido: boolean;
  mensaje: string;
} {
  if (!email || email.trim() === "") {
    return { valido: true, mensaje: "" }; // Email es opcional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      valido: false,
      mensaje: "Email inválido (ej: contacto@empresa.cl)",
    };
  }

  return { valido: true, mensaje: "" };
}

/**
 * Valida teléfono: solo números y + al inicio
 * Permite formatos como: +56223456789, 223456789, +56 9 2234 5678, etc.
 */
export function validarTelefono(telefono: string): {
  valido: boolean;
  mensaje: string;
} {
  if (!telefono || telefono.trim() === "") {
    return { valido: true, mensaje: "" }; // Teléfono es opcional
  }

  // Solo debe permitir números y el símbolo + al inicio
  if (!/^[+]?[\d\s\-()]*$/.test(telefono)) {
    return {
      valido: false,
      mensaje:
        "Teléfono inválido. Solo números, espacios, guiones y + al inicio",
    };
  }

  // Contar solo los dígitos
  const soloDigitos = telefono.replace(/\D/g, "");

  // Debe tener entre 8 y 15 dígitos (estándar E.164)
  if (soloDigitos.length < 8 || soloDigitos.length > 15) {
    return {
      valido: false,
      mensaje: `Teléfono debe tener entre 8 y 15 dígitos (actual: ${soloDigitos.length})`,
    };
  }

  return { valido: true, mensaje: "" };
}

/**
 * Filtra el teléfono permitiendo solo números, +, espacios, guiones y paréntesis
 * Útil para filtrar caracteres en tiempo real
 */
export function filtrarTelefono(input: string): string {
  // Solo permitir: números (0-9), + al inicio, espacios, guiones y paréntesis
  return input.replace(/[^\d+\s\-()]/g, "");
}

/**
 * Formatea el RUT chileno automáticamente
 * Entrada: "76123456" → Salida: "76.123.456-7" (si el DV es 7)
 * Entrada: "7612345-67" → Salida: "76.123.456-7"
 * Entrada: "76.123.456-7" → Salida: "76.123.456-7" (sin cambios)
 */
export function formatearRUT(input: string): string {
  if (!input) {
    return "";
  }

  // Limpiar: eliminar puntos, espacios y guiones
  const rutLimpio = input.replace(/[.\s\-]/g, "").trim();

  // Si no hay números, retornar vacío
  if (!/^\d+$/.test(rutLimpio)) {
    return input; // Retornar el input original si contiene caracteres no numéricos
  }

  // Si tiene menos de 7 dígitos, retornar sin formato
  if (rutLimpio.length < 7) {
    return rutLimpio;
  }

  // Si tiene más de 9 dígitos, solo retornar los primeros 9
  const rutValido = rutLimpio.slice(0, 9);

  // Separar número y dígito verificador
  const numero = rutValido.slice(0, -1);
  const dv = rutValido.slice(-1);

  // Formatear: XX.XXX.XXX-X
  // Ejemplo: "7612345" → "76.123.45-7"
  if (numero.length === 1) {
    return `${numero}-${dv}`;
  }

  if (numero.length === 2) {
    return `${numero}-${dv}`;
  }

  if (numero.length === 3) {
    return `${numero.slice(0, 1)}.${numero.slice(1)}-${dv}`;
  }

  if (numero.length === 4) {
    return `${numero.slice(0, 1)}.${numero.slice(1, 4)}.${numero.slice(4)}-${dv}`;
  }

  if (numero.length === 5) {
    return `${numero.slice(0, 2)}.${numero.slice(2, 5)}.${numero.slice(5)}-${dv}`;
  }

  if (numero.length === 6) {
    return `${numero.slice(0, 2)}.${numero.slice(2, 5)}.${numero.slice(5)}-${dv}`;
  }

  // Para 7 o más dígitos: XX.XXX.XXX-X
  return `${numero.slice(0, 2)}.${numero.slice(2, 5)}.${numero.slice(5, 8)}-${dv}`;
}

/**
 * Valida el formulario completo de empresa
 */
export interface ErroresFormulario {
  nombre?: string;
  rut?: string;
  email?: string;
  telefono?: string;
}

export function validarFormularioEmpresa(data: {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
}): ErroresFormulario {
  const errores: ErroresFormulario = {};

  // Nombre es obligatorio
  if (!data.nombre || data.nombre.trim() === "") {
    errores.nombre = "El nombre de la empresa es requerido";
  }

  // Validar RUT
  const validacionRUT = validarRUT(data.rut);

  if (!validacionRUT.valido) {
    errores.rut = validacionRUT.mensaje;
  }

  // Validar Email
  const validacionEmail = validarEmail(data.email);

  if (!validacionEmail.valido) {
    errores.email = validacionEmail.mensaje;
  }

  // Validar Teléfono
  const validacionTelefono = validarTelefono(data.telefono);

  if (!validacionTelefono.valido) {
    errores.telefono = validacionTelefono.mensaje;
  }

  return errores;
}
