import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// ─────────────────────────────────────────────────────────────
//  Si conectas un dominio propio (ej. elisaperfumes.cl):
//    SITE = 'https://elisaperfumes.cl'   y   BASE = '/'
//  Mientras uses la URL de GitHub Pages, deja estos valores.
// ─────────────────────────────────────────────────────────────
const SITE = 'https://linuxlzlz.github.io';
const BASE = '/elisa-perfumes';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  integrations: [
    // El panel de administración no debe indexarse ni figurar en el sitemap.
    sitemap({ filter: (pagina) => !pagina.includes('/admin') }),
  ],
  vite: { plugins: [tailwindcss()] },
});
