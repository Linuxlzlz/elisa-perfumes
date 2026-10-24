import datos from '../data/catalogo.json';
import type { Categoria, Producto } from './tipos';

export const productos = datos.productos as unknown as Producto[];

export function buscarPorSlug(slug: string): Producto | undefined {
  return productos.find((p) => p.slug === slug);
}

export function porCategoria(categoria: Categoria): Producto[] {
  return productos.filter((p) => p.categoria === categoria);
}

export function destacados(limite = 8): Producto[] {
  const marcados = productos.filter((p) => p.destacado);
  return (marcados.length ? marcados : productos).slice(0, limite);
}

/** Precio más bajo entre las variantes: lo que se muestra como "desde". */
export function precioDesde(p: Producto): number {
  return Math.min(...p.variantes.map((v) => v.precio));
}

export function relacionados(p: Producto, limite = 4): Producto[] {
  const puntuar = (otro: Producto) => {
    let n = 0;
    if (otro.familia === p.familia) n += 3;
    if (otro.genero === p.genero) n += 2;
    if (otro.categoria === p.categoria) n += 1;
    n += otro.acordes.filter((a) => p.acordes.includes(a)).length;
    return n;
  };
  return productos
    .filter((o) => o.slug !== p.slug)
    .sort((a, b) => puntuar(b) - puntuar(a))
    .slice(0, limite);
}

const unicos = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b, 'es'));

export const familias = unicos(productos.map((p) => p.familia));
export const casas = unicos(productos.map((p) => p.casa));
export const todasLasOcasiones = unicos(productos.flatMap((p) => p.ocasiones));

export const etiquetasCategoria: Record<Categoria, { titulo: string; bajada: string }> = {
  originales: {
    titulo: 'Originales',
    bajada: 'Frascos sellados de casas reconocidas, con caja y celofán.',
  },
  decants: {
    titulo: 'Decants',
    bajada: 'Porciones de 5 y 10 ml en atomizador. Prueba antes de invertir.',
  },
  inspirados: {
    titulo: 'Alternativas',
    bajada: 'Perfiles equivalentes en concentración extracto, a una fracción del precio.',
  },
  nicho: {
    titulo: 'Nicho y árabes',
    bajada: 'Lattafa, Armaf, Rasasi y más. Proyección y duración sobresalientes.',
  },
};

export const etiquetasGenero: Record<string, string> = {
  femenino: 'Femenino',
  masculino: 'Masculino',
  unisex: 'Unisex',
};
