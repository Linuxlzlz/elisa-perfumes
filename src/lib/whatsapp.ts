import { envios, tienda } from '../config';
import type { ItemCarrito } from './tipos-carrito';
import { clp } from './formato';

export type DatosPedido = {
  nombre: string;
  entrega: 'retiro' | 'despacho';
  /** Comuna o ciudad de destino, cuando el pedido se despacha. */
  destino: string;
  /** Punto de retiro elegido, cuando el pedido se retira. */
  puntoRetiro: string;
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
 * Costo del envío.
 *
 * Los pedidos salen desde Hualañé y el despacho es a todo Chile con una sola
 * tarifa, así que no hay zonas: o se retira sin costo, o se paga la tarifa
 * nacional, o el monto supera el umbral y el envío va gratis.
 */
export function costoEnvio(
  subtotal: number,
  datos: Pick<DatosPedido, 'entrega'>,
): number {
  if (datos.entrega === 'retiro') return 0;
  if (subtotal >= envios.umbralEnvioGratis) return 0;
  return envios.despachoNacional;
}

/** Arma el texto del pedido con el formato de negritas de WhatsApp. */
export function construirMensaje(
  items: ItemCarrito[],
  datos: DatosPedido,
  codigo: string,
): string {
  const subtotal = items.reduce((a, i) => a + i.precio * i.cantidad, 0);
  const envio = costoEnvio(subtotal, datos);

  const partes: string[] = [];
  partes.push(`*Pedido ${codigo}*`);
  partes.push(tienda.nombre);
  partes.push('');

  for (const i of items) {
    const referencia = i.casa ? ` (${i.casa})` : '';
    partes.push(`${i.cantidad} x ${i.nombre}${referencia}`);
    partes.push(
      i.cantidad > 1
        ? `${i.tamano}, ${clp(i.precio)} c/u: ${clp(i.precio * i.cantidad)}`
        : `${i.tamano}, ${clp(i.precio)}`,
    );
    partes.push('');
  }

  partes.push(`Subtotal: ${clp(subtotal)}`);

  if (datos.entrega === 'retiro') {
    partes.push('Entrega: retiro en persona');
    partes.push(`*Total: ${clp(subtotal)}*`);
  } else if (envio === 0) {
    partes.push('Envío: gratis');
    partes.push(`*Total: ${clp(subtotal)}*`);
  } else {
    partes.push(`Envío: ${clp(envio)}`);
    partes.push(`*Total: ${clp(subtotal + envio)}*`);
  }

  partes.push('');
  if (datos.nombre) partes.push(`Nombre: ${datos.nombre}`);
  partes.push(
    datos.entrega === 'retiro'
      ? `Retiro en: ${datos.puntoRetiro || 'punto por confirmar'}`
      : `Despacho a: ${datos.destino || 'comuna por confirmar'}`,
  );
  if (datos.pago) partes.push(`Pago: ${datos.pago}`);
  if (datos.nota?.trim()) partes.push(`Nota: ${datos.nota.trim()}`);

  partes.push('');
  partes.push('Pedido hecho desde la web.');

  return partes.join('\n');
}

/** Enlace wa.me listo para abrir. Se usa encodeURIComponent por los saltos de línea. */
export function enlaceWhatsApp(mensaje: string, numero = tienda.whatsapp): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
