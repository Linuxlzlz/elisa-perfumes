// ╔══════════════════════════════════════════════════════════════════╗
// ║  CONFIGURACIÓN DE LA TIENDA — edita SOLO este archivo            ║
// ║  Todo lo que cambia sin tocar código está acá.                   ║
// ╚══════════════════════════════════════════════════════════════════╝

export const tienda = {
  nombre: 'Elisa Perfumes',
  claim: 'Fragancias originales, decants y alternativas de autor',
  descripcion:
    'Perfumería en Chile: originales sellados, decants desde 5 ml, nicho árabe y alternativas de alta fijación. Pedidos por WhatsApp con despacho a todo el país.',

  // ⚠️ CAMBIAR: número de WhatsApp en formato internacional, SIN "+", sin espacios.
  // Chile = 56 + 9 + 8 dígitos.  Ejemplo: 56912345678
  whatsapp: '56900000000',

  // Mensaje del botón flotante (cuando el carrito está vacío)
  whatsappSaludo: 'Hola Elisa 👋 quiero hacer una consulta sobre perfumes.',

  email: 'contacto@elisaperfumes.cl',
  instagram: 'perfumes.rdelatorre',
  ciudad: 'Santiago, Chile',

  // Horario de atención mostrado en el sitio
  horario: 'Lun a Sáb · 10:00 a 20:00 hrs',
} as const;

export const envios = {
  // Costos en pesos chilenos. null = "a convenir por WhatsApp"
  retiroGratis: true,
  retiroTexto: 'Retiro coordinado en Santiago (Metro Quilín)',
  despachoSantiago: 3500,
  despachoRegiones: 4990,
  umbralEnvioGratis: 60000, // sobre este monto, envío gratis
  couriers: ['Starken', 'Chilexpress', 'Bluexpress'],
  plazo: '24 a 48 hrs hábiles en Santiago · 2 a 4 días en regiones',
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

export const comunasSantiago = [
  'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central',
  'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja',
  'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo',
  'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda',
  'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal',
  'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón',
  'Santiago Centro', 'Vitacura', 'Puente Alto', 'San Bernardo',
] as const;
