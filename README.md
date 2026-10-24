# Elisa Perfumes

Catálogo de 86 perfumes inspirados, con carrito de compra y pedidos por WhatsApp,
pensado para alojarse gratis en GitHub Pages.

Construido con [Astro](https://astro.build) y Tailwind CSS. Sin servidor, sin base de
datos y sin costos de hosting.

---

## Qué incluye

| | |
|---|---|
| **Catálogo** | 86 fragancias en dos líneas (Mujer / Hombre), con página estática por perfume, pirámide olfativa, medidores de proyección y duración, y datos estructurados |
| **Filtros** | Por línea, familia olfativa, ocasión, intensidad y casa de referencia; búsqueda por número, marca o nota |
| **Carrito** | Persiste en el navegador, sobrevive recargas y se sincroniza entre pestañas |
| **Pedidos** | Genera el mensaje completo y abre WhatsApp. Incluye botón de respaldo "copiar pedido" |
| **Quiz** | Cuatro preguntas (línea, ocasión, aroma, intensidad) que recomiendan tres números |
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

## 3. El catálogo

86 fragancias en dos líneas, todas al mismo precio: **30 ml $15.000 · 100 ml $45.000**.

| Línea | Números | Cantidad |
|---|---|---|
| Mujer | Nº 01 a 39 | 39 |
| Hombre | Nº 51 a 97 | 47 |

### Cómo se identifica cada producto

El **nombre del producto es su número** (`Nº 54`). La fragancia en la que se inspira se
declara aparte, como referencia olfativa: *"Inspirado en Aventus de Creed"*.

Esto es deliberado. Usar una marca registrada como nombre de tu producto en un sitio
público e indexado es exposición legal innecesaria; citarla como referencia es la
práctica defendible y conserva el tráfico de búsqueda (el slug de la URL también la
incluye: `/perfume/54-aventus-creed`).

Si prefieres ocultar la referencia por completo, en `src/config.ts`:

```ts
export const presentacion = {
  mostrarReferencia: false,   // la marca desaparece de todo el sitio
};
```

Con eso, la referencia se va de fichas, tarjetas, títulos, buscador, filtros y datos
estructurados. Los productos quedan identificados solo por su número.

### Editar o ampliar el catálogo

Los datos viven en dos archivos, **no** en el JSON:

- `scripts/datos-mujer.mjs` — Nº 01 a 39
- `scripts/datos-hombre.mjs` — Nº 51 a 97

Cada fila tiene 13 columnas, en este orden:

```js
[54,'Aventus','Creed','Frutal chipre','Piña|Abedul ahumado|Musgo',
 'Piña|Bergamota|Manzana','Abedul|Pachulí|Jazmín','Musgo de roble|Ámbar gris|Vainilla',
 'Diario|Formal|Cita','Todo el año',4,4,
 'Descripción de una o dos frases.'],
```

`nº, referencia, casa, familia, acordes, salida, corazón, fondo, ocasiones,
estaciones, proyección (1-5), duración (1-5), descripción`. Las listas van separadas
por `|`.

Después de editar:

```bash
npm run generar
```

El generador valida todo (slugs y SKU únicos, notas no vacías, rangos correctos,
descripciones de largo mínimo) y falla con un listado si algo está mal. Deja un
respaldo en `catalogo.json.bak`.

Los precios de lista y los productos destacados también se configuran ahí, al inicio
de `scripts/generar-catalogo.mjs`:

```js
const PRECIOS = [
  { tamano: '30ml', precio: 15000 },
  { tamano: '100ml', precio: 45000 },
];
const DESTACADOS = new Set([54, 12, 6, 34, 29, 81, 58, 72, 96, 53, 31, 67]);
```

> Para cambiar el precio de **un** producto puntual, no edites el generador: usa el
> panel `/admin`, que permite sobrescribir precios por SKU sin tocar código.

### Fotos de producto

Mientras un producto no tenga el campo `img`, el sitio dibuja un frasco SVG cuyo color
sale de su familia olfativa. Se ve bien y es consistente, pero **las fotos reales
convierten bastante más**. Para usarlas:

1. Guarda las imágenes en `public/img/productos/`
2. En el archivo de datos, el producto necesita el campo `img`. Como el generador no lo
   contempla por omisión, añádelo al objeto que construye en `generar-catalogo.mjs`, o
   edita el JSON una vez generado.

Recomendación: mismo fondo, mismo ángulo, formato cuadrado, WebP de ~800 px. GitHub
Pages no optimiza imágenes: llegan al cliente tal como las subas.

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
- **El catálogo es de reventa.** Si tu proveedor cambia precios o descontinúa un
  número, nada se entera solo: hay que editar los archivos de datos y regenerar.
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
├── data/catalogo.json     ← generado, no editar a mano
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

scripts/
├── datos-mujer.mjs        ← Nº 01-39   (edita acá)
├── datos-hombre.mjs       ← Nº 51-97   (edita acá)
└── generar-catalogo.mjs   ← npm run generar
```

---

## Nota legal

Todos los productos se presentan como elaboración propia, identificados por número, y
la marca en la que se inspiran se cita únicamente como referencia olfativa. Esa
distinción está implementada en tres niveles:

1. El `name` y el `<h1>` de cada ficha son el número, nunca la marca.
2. El `brand` de los datos estructurados (JSON-LD) es **Elisa Perfumes**, no la casa de
   referencia: para Google el fabricante eres tú.
3. Cada ficha y el pie de página incluyen el descargo explícito de que no existe vínculo
   ni respaldo de esas casas.

Si en algún momento recibes un reclamo de marca, `mostrarReferencia: false` en
`src/config.ts` retira todas las menciones del sitio en un solo despliegue.
