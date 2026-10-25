#!/usr/bin/env node
/**
 * Genera src/data/catalogo.json a partir de scripts/datos-mujer.mjs y datos-hombre.mjs.
 *
 *   node scripts/generar-catalogo.mjs
 *
 * Edita los archivos de datos (no el JSON) y vuelve a correr esto.
 */
import { writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mujer } from './datos-mujer.mjs';
import { hombre } from './datos-hombre.mjs';

const aquí = dirname(fileURLToPath(import.meta.url));
const destino = resolve(aquí, '..', 'src', 'data', 'catalogo.json');

// Precios de lista. Para cambiarlos puntualmente usa el panel /admin;
// para cambiarlos todos, edita acá y regenera.
const PRECIOS = [
  { tamano: '30ml', precio: 15000 },
  { tamano: '100ml', precio: 45000 },
];

// Los que se muestran en "Los más pedidos" de la portada.
const DESTACADOS = new Set([54, 12, 6, 34, 29, 81, 58, 72, 96, 53, 31, 67]);

const slugificar = (t) =>
  String(t).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const lista = (v) => String(v ?? '').split('|').map((x) => x.trim()).filter(Boolean);

function construir(fila, linea) {
  const [numero, refNombre, refCasa, familia, acordes,
         salida, corazon, fondo, ocasiones, estaciones,
         proyeccion, duracion, descripcion] = fila;

  // El slug incluye la referencia: mejora el posicionamiento en búsquedas
  // del tipo "perfume similar a aventus".
  const slug = `${numero}-${slugificar(refNombre)}-${slugificar(refCasa)}`;

  return {
    slug,
    numero,
    linea,
    referencia: { nombre: refNombre, casa: refCasa },
    familia,
    acordes: lista(acordes),
    notas: { salida: lista(salida), corazon: lista(corazon), fondo: lista(fondo) },
    ocasiones: lista(ocasiones),
    estaciones: lista(estaciones),
    proyeccion,
    duracion,
    descripcion,
    variantes: PRECIOS.map((v) => ({ sku: `${slug}-${v.tamano}`, ...v })),
    ...(DESTACADOS.has(numero) ? { destacado: true } : {}),
  };
}

const productos = [
  ...mujer.map((f) => construir(f, 'mujer')),
  ...hombre.map((f) => construir(f, 'hombre')),
];

// ── Validaciones ────────────────────────────────────────────
const problemas = [];
const slugs = new Set();
const skus = new Set();

for (const p of productos) {
  if (slugs.has(p.slug)) problemas.push(`Slug duplicado: ${p.slug}`);
  slugs.add(p.slug);
  for (const v of p.variantes) {
    if (skus.has(v.sku)) problemas.push(`SKU duplicado: ${v.sku}`);
    skus.add(v.sku);
    if (!(v.precio > 0)) problemas.push(`Precio inválido en ${v.sku}`);
  }
  for (const campo of ['salida', 'corazon', 'fondo']) {
    if (!p.notas[campo].length) problemas.push(`Nº ${p.numero}: notas de ${campo} vacías`);
  }
  if (!p.acordes.length) problemas.push(`Nº ${p.numero}: sin acordes`);
  if (p.descripcion.length < 40) problemas.push(`Nº ${p.numero}: descripción demasiado corta`);
  if (p.proyeccion < 1 || p.proyeccion > 5) problemas.push(`Nº ${p.numero}: proyección fuera de rango`);
  if (p.duracion < 1 || p.duracion > 5) problemas.push(`Nº ${p.numero}: duración fuera de rango`);
}

if (problemas.length) {
  console.error('\n✗ Se encontraron problemas:\n');
  for (const p of problemas) console.error('  ·', p);
  process.exit(1);
}

if (existsSync(destino)) copyFileSync(destino, destino + '.bak');
writeFileSync(destino, JSON.stringify({ productos }, null, 2) + '\n');

const porLinea = {};
for (const p of productos) porLinea[p.linea] = (porLinea[p.linea] ?? 0) + 1;

console.log(`\n✓ ${productos.length} productos generados`);
console.log('  Por línea:', porLinea);
console.log(`  ${skus.size} SKUs · ${new Set(productos.map((p) => p.referencia.casa)).size} casas de referencia`);
console.log(`  ${productos.filter((p) => p.destacado).length} destacados\n`);
