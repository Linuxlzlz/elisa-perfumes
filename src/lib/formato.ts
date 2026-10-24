/** Formatea un entero como precio chileno: 89990 → "$89.990" */
export function clp(valor: number): string {
  return '$' + Math.round(valor).toLocaleString('es-CL', { maximumFractionDigits: 0 });
}

/** Convierte texto a slug apto para URL. */
export function slugificar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Prefija una ruta con el base path del sitio (necesario en GitHub Pages). */
export function ruta(camino: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return base + '/' + String(camino).replace(/^\/+/, '');
}
