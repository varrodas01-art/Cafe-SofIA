// ---------------------------------------------------------------------------
// DATOS DE EJEMPLO (todos FICTICIOS, marcados como tales).
// Separados de la interfaz a propósito, para facilitar la futura integración
// con Google Sheets, APIs y agentes de IA.
// ---------------------------------------------------------------------------

export const PRODUCTOS_INICIALES = [
  { id_producto: "espresso", nombre: "Espresso", descripcion: "Extracción intensa y corta, pura energía.", categoria: "Café", precio_usd: 1.5, stock: 20, ventas_acumuladas: 150 },
  { id_producto: "americano", nombre: "Americano", descripcion: "Espresso alargado con agua caliente, suave y equilibrado.", categoria: "Café", precio_usd: 2.0, stock: 15, ventas_acumuladas: 130 },
  { id_producto: "cortado", nombre: "Cortado", descripcion: "Espresso con un toque de leche vaporizada.", categoria: "Café", precio_usd: 2.25, stock: 2, ventas_acumuladas: 40 },
  { id_producto: "capuchino", nombre: "Capuchino", descripcion: "Espresso, leche vaporizada y espuma en partes iguales.", categoria: "Café", precio_usd: 2.75, stock: 18, ventas_acumuladas: 200 },
  { id_producto: "latte", nombre: "Latte", descripcion: "Más leche, textura sedosa y sabor suave.", categoria: "Café", precio_usd: 3.0, stock: 25, ventas_acumuladas: 180 },
  { id_producto: "latte_macchiato", nombre: "Latte Macchiato", descripcion: "Capas de leche, espuma y un toque de espresso.", categoria: "Café", precio_usd: 3.5, stock: 0, ventas_acumuladas: 90 },
];

export const CLIENTES = [
  { id_cliente: "c1", nombre: "Ana", apellido: "Pérez", correo: "ana.perez@aden.edu", celular: "9999-1111", pais: "Costa Rica", ciudad: "San José", tipo_cliente: "Estudiante ADEN", consentimiento: true, fecha_registro: "2026-02-10" },
  { id_cliente: "c2", nombre: "Carlos", apellido: "Rivas", correo: "carlos.rivas@aden.edu", celular: "9999-2222", pais: "Costa Rica", ciudad: "Heredia", tipo_cliente: "Estudiante ADEN", consentimiento: true, fecha_registro: "2026-03-02" },
  { id_cliente: "c3", nombre: "María", apellido: "López", correo: "maria.lopez@aden.edu", celular: "9999-3333", pais: "Costa Rica", ciudad: "San José", tipo_cliente: "Colaborador ADEN", consentimiento: true, fecha_registro: "2025-11-20" },
  { id_cliente: "c4", nombre: "Jorge", apellido: "Duarte", correo: "jorge.duarte@example.com", celular: "9999-4444", pais: "Honduras", ciudad: "Tegucigalpa", tipo_cliente: "Visitante", consentimiento: true, fecha_registro: "2026-01-15" },
];

export const CUPONES_INICIALES = [
  { codigo: "BIENVENIDA10", porcentaje_descuento: 10, fecha_vencimiento: "2026-12-31", usado: false },
  { codigo: "VERANO20", porcentaje_descuento: 20, fecha_vencimiento: "2026-06-30", usado: false },
  { codigo: "CAMPUS15", porcentaje_descuento: 15, fecha_vencimiento: "2026-12-31", usado: true },
];

export const TIPOS_CLIENTE = ["Estudiante ADEN", "Colaborador ADEN", "Visitante"];

// Fecha de referencia usada para validar vencimiento de cupones en el prototipo.
export const HOY = new Date("2026-09-16");
