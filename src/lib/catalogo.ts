import datos from '../data/catalogo.json';
import { presentacion } from '../config';
import type { Linea, Producto } from './tipos';

export const productos = datos.productos as unknown as Producto[];

export function buscarPorSlug(slug: string): Producto | undefined {
  return productos.find((p) => p.slug === slug);
}

export function porLinea(linea: Linea): Producto[] {
  return productos.filter((p) => p.linea === linea);
}

export function destacados(limite = 8): Producto[] {
  const marcados = productos.filter((p) => p.destacado);
  return (marcados.length ? marcados : productos).slice(0, limite);
}

/* ── Nombres mostrados ────────────────────────────────────────
   El nombre del producto es su número. La marca de referencia se
   declara aparte, nunca como nombre propio. Si presentacion.mostrarReferencia
   es false, la referencia desaparece de todo el sitio.
   ──────────────────────────────────────────────────────────── */

export function nombre(p: Producto): string {
  return `Nº ${String(p.numero).padStart(2, '0')}`;
}

export function referenciaTexto(p: Producto): string {
  return `${p.referencia.nombre} · ${p.referencia.casa}`;
}

/** "Inspirado en Aventus de Creed" — o cadena vacía si está desactivado. */
export function inspiradoEn(p: Producto): string {
  if (!presentacion.mostrarReferencia) return '';
  return `Inspirado en ${p.referencia.nombre} de ${p.referencia.casa}`;
}

/** Título para <title> y resultados de búsqueda. */
export function tituloLargo(p: Producto): string {
  const base = nombre(p);
  return presentacion.mostrarReferencia ? `${base} — ${referenciaTexto(p)}` : base;
}

export function relacionados(p: Producto, limite = 4): Producto[] {
  const puntuar = (otro: Producto) => {
    let n = 0;
    if (otro.familia === p.familia) n += 4;
    if (otro.linea === p.linea) n += 2;
    if (otro.referencia.casa === p.referencia.casa) n += 2;
    n += otro.acordes.filter((a) => p.acordes.includes(a)).length * 2;
    n += otro.ocasiones.filter((o) => p.ocasiones.includes(o)).length;
    return n;
  };
  return productos
    .filter((o) => o.slug !== p.slug)
    .sort((a, b) => puntuar(b) - puntuar(a))
    .slice(0, limite);
}

const unicos = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b, 'es'));

export const familias = unicos(productos.map((p) => p.familia));
export const casasReferencia = unicos(productos.map((p) => p.referencia.casa));
export const todasLasOcasiones = unicos(productos.flatMap((p) => p.ocasiones));

export const etiquetasLinea: Record<Linea, { titulo: string; bajada: string }> = {
  mujer: {
    titulo: presentacion.etiquetas.mujer,
    bajada: 'Florales, gourmands y frutales inspirados en los grandes femeninos.',
  },
  hombre: {
    titulo: presentacion.etiquetas.hombre,
    bajada: 'Frescos, amaderados y especiados inspirados en los grandes masculinos.',
  },
};
