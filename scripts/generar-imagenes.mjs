#!/usr/bin/env node
/**
 * Rasteriza las imágenes de marca que no pueden ser SVG:
 *
 *   public/og.png             1200×630  — se ve al pegar el enlace en WhatsApp/Instagram
 *   public/marca/avatar.png   1024×1024 — foto de perfil de WhatsApp Business e Instagram
 *
 * Requiere Playwright:  npx playwright install chromium
 * Las imágenes ya están versionadas: solo hay que correr esto si cambia la marca.
 *
 *   node scripts/generar-imagenes.mjs
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const aquí = dirname(fileURLToPath(import.meta.url));
const raíz = resolve(aquí, '..');

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Falta Playwright. Instálalo con:  npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

// Se le quita el tamaño SOLO a la etiqueta <svg> raíz, para que lo fije el CSS.
// Ojo: un reemplazo global comería también el width/height de los <rect> de la letra.
const sello = readFileSync(resolve(raíz, 'public/marca/sello-oro.svg'), 'utf8')
  .replace(/<svg([^>]*)>/, (_, atributos) =>
    '<svg' + atributos.replace(/\s(width|height)="[^"]*"/g, '') + '>');

const tipografías = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Inter:wght@400;500&display=swap" rel="stylesheet">`;

const og = `<!doctype html><meta charset="utf-8">${tipografías}
<style>
 *{margin:0;box-sizing:border-box}
 body{width:1200px;height:630px;background:#0b0a09;color:#f5f1ea;font-family:Inter,sans-serif;
      display:flex;flex-direction:column;justify-content:center;align-items:center;
      text-align:center;position:relative;overflow:hidden}
 .halo{position:absolute;width:900px;height:900px;border-radius:50%;
       background:radial-gradient(circle,rgba(201,162,39,.20),transparent 62%)}
 .c{position:relative}
 svg{width:118px;height:118px}
 h1{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:92px;line-height:1;margin-top:26px;letter-spacing:-.01em}
 .sub{font-size:16px;letter-spacing:.42em;color:#e3c77b;margin-top:12px}
 .claim{font-size:23px;color:#a89f92;margin-top:30px;max-width:740px;line-height:1.5}
 .pie{display:flex;gap:30px;margin-top:38px;font-size:15px;color:#a89f92;
      border-top:1px solid #2e2823;padding-top:22px}
 .pie b{color:#f5f1ea;font-weight:500}
</style>
<div class="halo"></div>
<div class="c">${sello}<h1>Elisa</h1><div class="sub">PERFUMES</div>
<p class="claim">Perfumes inspirados en las mejores marcas internacionales, con más de 8 horas de fijación.</p>
<div class="pie"><span><b>86</b> fragancias</span><span><b>30</b> y <b>100</b> ml</span><span>Despacho a <b>todo Chile</b></span></div>
</div>`;

const avatar = `<!doctype html><meta charset="utf-8">
<style>*{margin:0}body{width:1024px;height:1024px;background:#0b0a09;display:grid;place-items:center}
 .halo{position:absolute;width:900px;height:900px;border-radius:50%;
       background:radial-gradient(circle,rgba(201,162,39,.16),transparent 60%)}
 svg{width:660px;height:660px;position:relative}</style>
<div class="halo"></div>${sello}`;

const navegador = await chromium.launch();

for (const [archivo, html, ancho, alto] of [
  ['public/og.png', og, 1200, 630],
  ['public/marca/avatar.png', avatar, 1024, 1024],
]) {
  const pag = await navegador.newPage({ viewport: { width: ancho, height: alto } });
  await pag.setContent(html, { waitUntil: 'networkidle' });
  await pag.waitForTimeout(1200);
  writeFileSync(resolve(raíz, archivo), await pag.screenshot());
  await pag.close();
  console.log(`✓ ${archivo}  ${ancho}×${alto}`);
}

await navegador.close();
