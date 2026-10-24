#!/usr/bin/env node
/**
 * Importa un CSV al catálogo del sitio.
 *
 *   node scripts/importar-catalogo.mjs mi-catalogo.csv
 *
 * Columnas esperadas (el orden no importa, los nombres sí):
 *
 *   nombre, casa, categoria, genero, concentracion, familia,
 *   acordes, salida, corazon, fondo, ocasiones, estaciones,
 *   proyeccion, duracion, descripcion, tamanos, precios,
 *   perfilSimilarA, img, destacado, forma
 *
 * Las listas van separadas por "|":  acordes = "Tabaco|Café|Piña"
 * tamanos y precios son listas paralelas:
 *   tamanos = "50ml|100ml"   precios = "74990|94990"
 *
 * Genera src/data/catalogo.json. Haz una copia antes si tienes datos a mano.
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const aquí = dirname(fileURLToPath(import.meta.url));
const destino = resolve(aquí, '..', 'src', 'data', 'catalogo.json');

const entrada = process.argv[2];
if (!entrada) {
  console.error('Uso: node scripts/importar-catalogo.mjs <archivo.csv>');
  process.exit(1);
}
if (!existsSync(entrada)) {
  console.error(`No existe el archivo: ${entrada}`);
  process.exit(1);
}

/** Parser de CSV que respeta comillas dobles y saltos de línea dentro de celdas. */
function parsearCSV(texto) {
  const filas = [];
  let fila = [];
  let celda = '';
  let enComillas = false;

  const limpio = texto.replace(/^﻿/, '').replace(/\r\n?/g, '\n');

  for (let i = 0; i < limpio.length; i++) {
    const c = limpio[i];
    if (enComillas) {
      if (c === '"') {
        if (limpio[i + 1] === '"') { celda += '"'; i++; }
        else enComillas = false;
      } else celda += c;
    } else if (c === '"') {
      enComillas = true;
    } else if (c === ',' || c === ';') {
      fila.push(celda); celda = '';
    } else if (c === '\n') {
      fila.push(celda); filas.push(fila); fila = []; celda = '';
    } else {
      celda += c;
    }
  }
  if (celda || fila.length) { fila.push(celda); filas.push(fila); }
  return filas.filter((f) => f.some((x) => x.trim() !== ''));
}

const slugificar = (t) =>
  String(t).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const lista = (v) => String(v ?? '').split('|').map((x) => x.trim()).filter(Boolean);
const numero = (v, def) => {
  const n = Number(String(v ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) && n !== 0 ? n : def;
};
const rango = (v, def) => Math.min(5, Math.max(1, Math.round(numero(v, def))));

const CATEGORIAS = ['originales', 'decants', 'inspirados', 'nicho'];
const GENEROS = ['femenino', 'masculino', 'unisex'];
const FORMAS = ['rect', 'redonda', 'alta', 'ornada'];

const filas = parsearCSV(readFileSync(entrada, 'utf8'));
const cabecera = filas[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, ''));
const idx = (nombre) => cabecera.indexOf(nombre.toLowerCase());

const requeridas = ['nombre', 'casa', 'tamanos', 'precios'];
const faltantes = requeridas.filter((r) => idx(r) === -1);
if (faltantes.length) {
  console.error(`Faltan columnas obligatorias: ${faltantes.join(', ')}`);
  console.error(`Columnas encontradas: ${cabecera.join(', ')}`);
  process.exit(1);
}

const avisos = [];
const vistos = new Set();
const productos = [];

for (let n = 1; n < filas.length; n++) {
  const f = filas[n];
  const val = (col) => {
    const i = idx(col);
    return i === -1 ? '' : (f[i] ?? '').trim();
  };

  const nombre = val('nombre');
  const casa = val('casa');
  if (!nombre || !casa) { avisos.push(`Fila ${n + 1}: sin nombre o casa, se omite.`); continue; }

  let slug = slugificar(`${nombre}`);
  if (vistos.has(slug)) slug = slugificar(`${nombre}-${casa}`);
  let sufijo = 2;
  while (vistos.has(slug)) slug = `${slugificar(nombre)}-${sufijo++}`;
  vistos.add(slug);

  const tamanos = lista(val('tamanos'));
  const precios = lista(val('precios')).map((p) => numero(p, 0));
  if (!tamanos.length || !precios.length) {
    avisos.push(`Fila ${n + 1} (${nombre}): sin tamaños o precios, se omite.`);
    continue;
  }
  if (tamanos.length !== precios.length) {
    avisos.push(`Fila ${n + 1} (${nombre}): ${tamanos.length} tamaños vs ${precios.length} precios. Se usa el mínimo.`);
  }

  const variantes = tamanos.slice(0, Math.min(tamanos.length, precios.length)).map((t, i) => ({
    sku: `${slug}-${slugificar(t)}`,
    tamano: t,
    precio: precios[i],
  })).filter((v) => v.precio > 0);

  if (!variantes.length) { avisos.push(`Fila ${n + 1} (${nombre}): precios inválidos, se omite.`); continue; }

  const categoria = CATEGORIAS.includes(val('categoria').toLowerCase())
    ? val('categoria').toLowerCase() : 'originales';
  const genero = GENEROS.includes(val('genero').toLowerCase())
    ? val('genero').toLowerCase() : 'unisex';
  const forma = FORMAS.includes(val('forma').toLowerCase())
    ? val('forma').toLowerCase() : 'rect';

  if (val('categoria') && !CATEGORIAS.includes(val('categoria').toLowerCase())) {
    avisos.push(`Fila ${n + 1} (${nombre}): categoría "${val('categoria')}" no reconocida, se usa "originales".`);
  }

  productos.push({
    slug,
    nombre,
    casa,
    categoria,
    genero,
    concentracion: val('concentracion') || 'EDP',
    familia: val('familia') || 'Sin clasificar',
    acordes: lista(val('acordes')),
    notas: {
      salida: lista(val('salida')),
      corazon: lista(val('corazon')),
      fondo: lista(val('fondo')),
    },
    ocasiones: lista(val('ocasiones')).length ? lista(val('ocasiones')) : ['Diario'],
    estaciones: lista(val('estaciones')).length ? lista(val('estaciones')) : ['Todo el año'],
    proyeccion: rango(val('proyeccion'), 4),
    duracion: rango(val('duracion'), 4),
    descripcion: val('descripcion') || `${nombre} de ${casa}. Consúltanos por WhatsApp para más detalles.`,
    variantes,
    forma,
    ...(val('img') ? { img: val('img') } : {}),
    ...(/^(1|si|sí|true|x)$/i.test(val('destacado')) ? { destacado: true } : {}),
    ...(val('perfilsimilara') ? { perfilSimilarA: val('perfilsimilara') } : {}),
  });
}

if (!productos.length) {
  console.error('No se importó ningún producto. Revisa el CSV.');
  process.exit(1);
}

if (existsSync(destino)) {
  copyFileSync(destino, destino + '.bak');
  console.log(`Respaldo del catálogo anterior: ${destino}.bak`);
}

writeFileSync(destino, JSON.stringify({ productos }, null, 2) + '\n');

console.log(`\n✓ ${productos.length} productos importados a src/data/catalogo.json`);
console.log(`  ${productos.reduce((a, p) => a + p.variantes.length, 0)} SKUs en total`);
const porCat = {};
for (const p of productos) porCat[p.categoria] = (porCat[p.categoria] ?? 0) + 1;
console.log('  Por línea:', porCat);

if (avisos.length) {
  console.log(`\n⚠ ${avisos.length} avisos:`);
  for (const a of avisos.slice(0, 25)) console.log('  ·', a);
  if (avisos.length > 25) console.log(`  … y ${avisos.length - 25} más.`);
}
console.log('\nSiguiente paso: npm run dev para revisarlo.\n');
