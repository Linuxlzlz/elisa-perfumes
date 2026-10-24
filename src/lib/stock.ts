import type { EstadoStock, MapaStock } from './tipos';
import { ruta } from './formato';

export const etiquetasEstado: Record<EstadoStock, string> = {
  disponible: 'Disponible',
  agotado: 'Agotado',
  encargo: 'Por encargo',
};

/**
 * Lee public/stock.json en tiempo de ejecución, con parámetro anti-caché.
 * Así el sitio refleja los cambios del panel de administración sin
 * depender de que el visitante recargue con caché limpia.
 */
export async function cargarStock(): Promise<MapaStock> {
  try {
    const r = await fetch(`${ruta('stock.json')}?v=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) return {};
    const datos = await r.json();
    return (datos && typeof datos === 'object' ? datos.skus ?? {} : {}) as MapaStock;
  } catch {
    return {};
  }
}

export function estadoDe(mapa: MapaStock, sku: string): EstadoStock {
  return mapa[sku]?.estado ?? 'disponible';
}

export function precioDe(mapa: MapaStock, sku: string, precioCatalogo: number): number {
  const p = mapa[sku]?.precio;
  return typeof p === 'number' && p > 0 ? p : precioCatalogo;
}
