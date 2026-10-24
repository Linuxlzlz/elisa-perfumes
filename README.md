# Elisa Perfumes

Catálogo de perfumería con carrito de compra y pedidos por WhatsApp, pensado para
alojarse gratis en GitHub Pages.

Construido con [Astro](https://astro.build) y Tailwind CSS. Sin servidor, sin base de
datos y sin costos de hosting.

---

## Qué incluye

| | |
|---|---|
| **Catálogo** | Una página estática por perfume, con pirámide olfativa, medidores de proyección y duración, y datos estructurados para Google |
| **Filtros** | Por línea, género, familia olfativa, ocasión, casa, precio y búsqueda por nota |
| **Carrito** | Persiste en el navegador, sobrevive recargas y se sincroniza entre pestañas |
| **Pedidos** | Genera el mensaje completo y abre WhatsApp. Incluye botón de respaldo "copiar pedido" |
| **Quiz** | Cuatro preguntas que recomiendan tres fragancias del catálogo |
| **Stock** | Panel en `/admin` para marcar agotados y ajustar precios sin tocar código |

---

## 1. Puesta en marcha

### Crear el repositorio y publicar

```bash
# En GitHub: crea un repositorio PÚBLICO llamado "elisa-perfumes"
# (Pages gratuito requiere repositorio público)

git remote add origin https://github.com/Linuxlzlz/elisa-perfumes.git
git branch -M main
git push -u origin main
```

Luego, en GitHub:

1. **Settings → Pages → Build and deployment → Source: `GitHub Actions`**
2. Listo. Cada `push` a `main` republica el sitio en 1 a 2 minutos.

La web queda en `https://linuxlzlz.github.io/elisa-perfumes/`

> Si cambias el nombre del repositorio, actualiza `BASE` en `astro.config.mjs` y
> `repo.name` en `src/config.ts`.

---

## 2. Configuración

Todo lo editable sin tocar código está en **`src/config.ts`**.

Lo primero y más importante:

```ts
// ⚠️ CAMBIAR antes de publicar
whatsapp: '56900000000',   // formato internacional, SIN "+" ni espacios
```

Chile = `56` + `9` + 8 dígitos. Ejemplo: `+56 9 1234 5678` se escribe `56912345678`.

En ese mismo archivo ajustas nombre de la tienda, horario, Instagram, costos de envío,
umbral de envío gratis, comunas y formas de pago.

---

## 3. Cargar tu catálogo

**El catálogo que viene incluido es de ejemplo.** Hay dos formas de reemplazarlo.

### Opción A — importar desde CSV (recomendado si tienes muchos productos)

```bash
npm run importar mi-catalogo.csv
```

Mira `scripts/ejemplo-catalogo.csv` para el formato exacto. Columnas obligatorias:
`nombre`, `casa`, `tamanos`, `precios`. Las listas van separadas por `|`:

```csv
nombre,casa,categoria,tamanos,precios,acordes
Asad,Lattafa,nicho,100ml,36990,Tabaco|Café|Piña
Sauvage,Dior,originales,60ml|100ml,74990|94990,Fresco especiado|Ambarado
```

El importador valida los datos, avisa de filas con problemas y deja un respaldo en
`catalogo.json.bak`.

### Opción B — editar a mano

`src/data/catalogo.json`. Cada producto necesita al menos `slug`, `nombre`, `casa`,
`categoria`, `variantes` y `descripcion`. Las categorías válidas son
`originales`, `decants`, `inspirados` y `nicho`.

> **Sobre las descripciones:** escribe las tuyas en lugar de copiar las del proveedor.
> Google penaliza el contenido duplicado, y la descripción propia es justamente lo que
> hace que tu ficha rankee en vez de la de otro revendedor.

### Fotos de producto

Mientras un producto no tenga el campo `img`, el sitio dibuja un frasco SVG generado
según su familia olfativa. Sirve para lanzar, pero **las fotos reales convierten mucho
más**. Para usarlas:

1. Guarda las imágenes en `public/img/productos/`
2. Agrega el campo al producto: `"img": "img/productos/asad.webp"`

Recomendación: mismo fondo, mismo ángulo, formato cuadrado, WebP de ~800 px.
GitHub Pages no optimiza imágenes, así que llegan al cliente tal como las subas.

---

## 4. Panel de administración de stock

Abre `https://linuxlzlz.github.io/elisa-perfumes/admin`

Permite marcar cada SKU como **disponible / agotado / por encargo** y sobrescribir
precios. Al guardar, hace un commit en `public/stock.json` y el sitio se republica solo.

### Cómo es posible sin servidor

El sitio es estático: no hay login ni sesiones. El panel usa un **token de GitHub** que
pegas una vez y queda guardado solo en tu navegador.

**Para crear el token:**

1. Entra a <https://github.com/settings/personal-access-tokens/new>
2. Elige **Fine-grained token**
3. *Repository access* → **Only select repositories** → `elisa-perfumes`
4. *Permissions* → *Repository permissions* → **Contents: Read and write**
   (nada más — ese es el único permiso necesario)
5. Fija una expiración (90 días es razonable) y genera
6. Pégalo en `/admin` y presiona Conectar

### Lo que debes saber

- **Sin el token, la página no puede modificar nada.** Es un formulario inerte.
- El token se guarda en `localStorage` de ese dispositivo. No pasa por ningún servidor
  nuestro, solo por `api.github.com`.
- **No uses un token clásico** con todos los permisos: si se filtra, da acceso a toda tu
  cuenta. El fine-grained limitado a este repositorio solo permite escribir archivos acá.
- No lo uses en un computador compartido. Si lo pierdes, revócalo desde GitHub.
- Tras guardar, hay **1 a 2 minutos** de espera hasta que GitHub Pages republique.
- La página `/admin` lleva `noindex` y está excluida del sitemap y de `robots.txt`.

### Cómo funciona por dentro

`public/stock.json` guarda solo las excepciones: los SKUs que están agotados o tienen
precio distinto al del catálogo. Todo lo que no aparezca ahí se asume disponible al
precio de `catalogo.json`. El sitio lo lee en cada carga con `cache: no-store`, así que
no hace falta que el visitante limpie caché.

---

## 5. Dominio propio

Un `.cl` propio cuesta poco y da bastante más credibilidad que una URL de `github.io`.

1. Compra el dominio (NIC Chile, u otro registrador)
2. Apunta los DNS a GitHub Pages ([instrucciones oficiales](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site))
3. En **Settings → Pages → Custom domain**, escribe tu dominio y activa **Enforce HTTPS**
4. En `astro.config.mjs` cambia:
   ```js
   const SITE = 'https://elisaperfumes.cl';
   const BASE = '/';
   ```
5. Actualiza la URL del sitemap en `public/robots.txt`

---

## 6. Desarrollo local

```bash
npm install
npm run dev       # http://localhost:4321/elisa-perfumes
npm run build     # genera dist/
npm run preview   # sirve dist/ como lo hará GitHub Pages
```

---

## 7. Limitaciones conocidas

Son consecuencia de usar hosting estático. Conviene tenerlas presentes:

- **El stock no es automático.** Nadie descuenta unidades al vender: lo marcas tú en
  `/admin`. Siempre confirma disponibilidad por WhatsApp antes de cobrar.
- **No hay pasarela de pago.** El checkout es la conversación de WhatsApp.
- **Los precios son públicos.** La competencia los ve. Aun así conviene mostrarlos:
  esconderlos baja la conversión, y por Ley del Consumidor el precio publicado se
  debe respetar.
- **Retraso de 1 a 2 minutos** entre guardar en `/admin` y verlo publicado.
- **Mensajes muy largos** (más de ~15 productos distintos) pueden truncarse en el enlace
  de WhatsApp en algunos navegadores.

Si el negocio crece hasta necesitar stock en tiempo real, pagos en línea o un panel
multiusuario, el paso siguiente natural es mover los datos a Supabase o similar
manteniendo este mismo frontend.

---

## 8. Estructura

```
src/
├── config.ts              ← configuración de la tienda (WhatsApp, envíos, pagos)
├── data/catalogo.json     ← los productos
├── lib/
│   ├── carrito.ts         ← carrito en localStorage
│   ├── whatsapp.ts        ← armado del mensaje de pedido
│   ├── stock.ts           ← lectura de stock.json en vivo
│   └── catalogo.ts        ← consultas sobre el catálogo
├── components/            ← header, carrito, tarjetas, frasco SVG…
└── pages/
    ├── index.astro        ← portada
    ├── catalogo.astro     ← catálogo con filtros
    ├── perfume/[slug]     ← ficha por producto
    ├── quiz.astro         ← test de recomendación
    ├── envios.astro       ← envíos, pagos y preguntas frecuentes
    └── admin.astro        ← panel de stock

public/
├── stock.json             ← lo escribe /admin
└── img/productos/         ← tus fotos acá
```

---

## Nota legal

La línea de alternativas se presenta como elaboración propia con un campo
`perfilSimilarA` que indica el perfil de referencia en texto secundario. **No uses
marcas registradas como nombre de producto** — eso es lo que genera problemas legales.
El pie de página ya incluye la aclaración correspondiente.
