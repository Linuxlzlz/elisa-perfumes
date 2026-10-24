import { envios, tienda } from '../config';
import type { ItemCarrito } from './tipos-carrito';
import { clp } from './formato';

export type DatosPedido = {
  nombre: string;
  entrega: 'retiro' | 'despacho';
  comuna: string;
  pago: string;
  nota?: string;
};

/** Código corto y legible para rastrear el pedido en el chat. */
export function codigoPedido(): string {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin I, O, 0, 1
  let codigo = '';
  for (let i = 0; i < 4; i++) {
    codigo += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return codigo;
}

/**
 * Costo de envío. Devuelve null cuando hay que acordarlo por WhatsApp.
 * Reglas: retiro = 0 · sobre el umbral = 0 · Santiago vs. regiones.
 */
export function costoEnvio(
  subtotal: number,
  datos: Pick<DatosPedido, 'entrega' | 'comuna'>,
  comunasSantiago: readonly string[],
): number | null {
  if (datos.entrega === 'retiro') return 0;
  if (subtotal >= envios.umbralEnvioGratis) return 0;
  if (!datos.comuna) return null;
  return comunasSantiago.includes(datos.comuna)
    ? envios.despachoSantiago
    : envios.despachoRegiones;
}

/** Arma el texto del pedido con el formato de negritas de WhatsApp. */
export function construirMensaje(
  items: ItemCarrito[],
  datos: DatosPedido,
  codigo: string,
  comunasSantiago: readonly string[],
): string {
  const linea = '━━━━━━━━━━━━━━━';
  const subtotal = items.reduce((a, i) => a + i.precio * i.cantidad, 0);
  const envio = costoEnvio(subtotal, datos, comunasSantiago);

  const partes: string[] = [];
  partes.push(`🛒 *PEDIDO #${codigo}*`);
  partes.push(`_${tienda.nombre}_`);
  partes.push(linea);

  for (const i of items) {
    partes.push(`*${i.cantidad}×* ${i.nombre} · ${i.casa}`);
    const importe =
      i.cantidad > 1
        ? `${clp(i.precio)} c/u = ${clp(i.precio * i.cantidad)}`
        : clp(i.precio);
    partes.push(`      ${i.tamano} — ${importe}`);
  }

  partes.push(linea);
  partes.push(`Subtotal: ${clp(subtotal)}`);

  if (datos.entrega === 'retiro') {
    partes.push('Envío: Retiro en persona');
    partes.push(`*TOTAL: ${clp(subtotal)}*`);
  } else if (envio === null) {
    partes.push('Envío: Por confirmar');
    partes.push(`*TOTAL: ${clp(subtotal)} + envío*`);
  } else if (envio === 0) {
    partes.push('Envío: ¡Gratis! 🎉');
    partes.push(`*TOTAL: ${clp(subtotal)}*`);
  } else {
    partes.push(`Envío: ${clp(envio)}`);
    partes.push(`*TOTAL: ${clp(subtotal + envio)}*`);
  }

  partes.push('');
  if (datos.nombre) partes.push(`👤 ${datos.nombre}`);
  partes.push(
    datos.entrega === 'retiro'
      ? `📍 Retiro — ${envios.retiroTexto}`
      : `📍 Despacho — ${datos.comuna || 'comuna por confirmar'}`,
  );
  if (datos.pago) partes.push(`💳 ${datos.pago}`);
  if (datos.nota?.trim()) partes.push(`📝 ${datos.nota.trim()}`);

  partes.push(linea);
  partes.push('_Pedido generado desde la web_');

  return partes.join('\n');
}

/** Enlace wa.me listo para abrir. Se usa encodeURIComponent para los saltos de línea. */
export function enlaceWhatsApp(mensaje: string, numero = tienda.whatsapp): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
