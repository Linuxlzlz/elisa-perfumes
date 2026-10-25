// ╔══════════════════════════════════════════════════════════════════╗
// ║  CONFIGURACIÓN DE LA TIENDA. Edita SOLO este archivo.            ║
// ║  Todo lo que cambia sin tocar código está acá.                   ║
// ╚══════════════════════════════════════════════════════════════════╝

export const tienda = {
  nombre: 'Elisa Perfumes',
  claim: 'Perfumes inspirados en las mejores marcas, con 8+ horas de fijación',
  descripcion:
    'Perfumería en Chile: 86 fragancias inspiradas en las grandes casas internacionales, en frasco de 30 ml. Alta fijación, precio justo y despacho dentro de 48 horas a todo el país. Pedidos por WhatsApp.',

  // Número de WhatsApp en formato internacional, SIN "+", sin espacios.
  // +56 9 2694 7785
  whatsapp: '56926947785',

  // Mensaje del botón flotante (cuando el carrito está vacío)
  whatsappSaludo: 'Hola Elisa 👋 quiero hacer una consulta sobre perfumes.',

  instagram: 'elisa.perfumes.boutique',
  ciudad: 'Hualañé, Región del Maule',

  // Horario de atención mostrado en el sitio
  horario: 'Lun a Sáb · 10:00 a 20:00 hrs',
} as const;

export const presentacion = {
  // Nombres de las dos líneas del catálogo.
  etiquetas: { mujer: 'Mujer', hombre: 'Hombre' },

  // Si lo pones en false, la marca de referencia ("Inspirado en Aventus de Creed")
  // desaparece de TODO el sitio: fichas, tarjetas, títulos, buscador y datos
  // estructurados. El producto queda identificado solo por su número.
  mostrarReferencia: true,
} as const;

export const envios = {
  // Los pedidos salen desde Hualañé. El despacho es a todo Chile con una sola
  // tarifa: desde acá no existe una "zona principal" que justifique dos precios.
  origen: 'Hualañé',
  puntosRetiro: ['Hualañé', 'Curicó'],
  retiroGratis: true,
  retiroTexto: 'Retiro sin costo en Hualañé y Curicó, coordinado por WhatsApp',
  despachoNacional: 4990,   // ⚠️ confirmar con el courier
  umbralEnvioGratis: 60000, // sobre este monto, envío gratis
  couriers: ['Starken', 'Chilexpress'],
  // Lo que sí controlamos: despachar. La entrega depende del courier.
  plazo: 'Despachamos dentro de 48 horas hábiles',
  entrega: 'El tiempo de entrega lo define el courier y se coordina contigo por WhatsApp',
} as const;

export const pagos = [
  'Transferencia bancaria',
  'Efectivo (retiro en persona)',
  'Link de pago con tarjeta (Mercado Pago)',
] as const;

// Datos del repositorio: los usa el panel de administración para guardar el stock.
export const repo = {
  owner: 'Linuxlzlz',
  name: 'elisa-perfumes',
  branch: 'main',
  rutaStock: 'public/stock.json',
} as const;
