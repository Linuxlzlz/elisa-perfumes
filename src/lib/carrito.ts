/**
 * Carrito de compra en el navegador.
 * Persiste en localStorage y avisa los cambios con un evento global,
 * para que el contador del header y la barra móvil se actualicen solos.
 */
import type { ItemCarrito } from './tipos-carrito';
export type { ItemCarrito };

const CLAVE = 'elisa_carrito_v1';
export const EVENTO_CAMBIO = 'carrito:cambio';

/** localStorage puede fallar (modo incógnito, cookies bloqueadas). Nunca debe romper la página. */
function almacen(): Storage | null {
  try {
    const s = window.localStorage;
    const prueba = '__t';
    s.setItem(prueba, '1');
    s.removeItem(prueba);
    return s;
  } catch {
    return null;
  }
}

let memoria: ItemCarrito[] = [];

export function leer(): ItemCarrito[] {
  const s = almacen();
  if (!s) return memoria;
  try {
    const bruto = s.getItem(CLAVE);
    if (!bruto) return [];
    const datos = JSON.parse(bruto);
    if (!Array.isArray(datos)) return [];
    return datos.filter(
      (i) => i && typeof i.sku === 'string' && typeof i.precio === 'number' && i.cantidad > 0,
    );
  } catch {
    return [];
  }
}

function escribir(items: ItemCarrito[]): void {
  memoria = items;
  const s = almacen();
  if (s) {
    try {
      s.setItem(CLAVE, JSON.stringify(items));
    } catch {
      /* cuota llena: seguimos en memoria */
    }
  }
  window.dispatchEvent(new CustomEvent(EVENTO_CAMBIO, { detail: items }));
}

export function agregar(item: Omit<ItemCarrito, 'cantidad'>, cantidad = 1): ItemCarrito[] {
  const items = leer();
  const existente = items.find((i) => i.sku === item.sku);
  if (existente) {
    existente.cantidad = Math.min(existente.cantidad + cantidad, 99);
  } else {
    items.push({ ...item, cantidad: Math.min(cantidad, 99) });
  }
  escribir(items);
  return items;
}

export function fijarCantidad(sku: string, cantidad: number): ItemCarrito[] {
  let items = leer();
  if (cantidad <= 0) {
    items = items.filter((i) => i.sku !== sku);
  } else {
    const i = items.find((x) => x.sku === sku);
    if (i) i.cantidad = Math.min(cantidad, 99);
  }
  escribir(items);
  return items;
}

export function quitar(sku: string): ItemCarrito[] {
  return fijarCantidad(sku, 0);
}

export function vaciar(): void {
  escribir([]);
}

export function total(items = leer()): number {
  return items.reduce((a, i) => a + i.precio * i.cantidad, 0);
}

export function unidades(items = leer()): number {
  return items.reduce((a, i) => a + i.cantidad, 0);
}

export function alCambiar(cb: (items: ItemCarrito[]) => void): void {
  window.addEventListener(EVENTO_CAMBIO, (e) => cb((e as CustomEvent).detail ?? leer()));
  // Sincroniza entre pestañas abiertas
  window.addEventListener('storage', (e) => {
    if (e.key === CLAVE) cb(leer());
  });
}
