---
title: Recetas de personalización habituales
description: "Guía rápida de las operaciones de personalización más frecuentes en EpoCanvas Docs: pasos completos para añadir documentos, botones de navegación, idiomas de la interfaz, colores del theme, logo, dimensiones del layout y textos de búsqueda."
---

Esta página organiza las necesidades de personalización más habituales en un manual de consulta rápida donde basta con seguir los pasos. En cada receta se indica la ubicación exacta del cambio, hasta el archivo concreto; antes de empezar se recomienda conocer las [reglas de renderizado](/canvas/rendering/) y el [sistema de componentes](/canvas/components/), lo que te ahorrará desvíos.

---

## Receta 1: añadir un documento

1. Crea un archivo `.md` en `src/content/docs/canvas/` (nómbralo en minúsculas y con guiones, por ejemplo `user-guide.md`);
2. Escribe el Frontmatter al inicio del archivo:

   ```yaml
   ---
   title: Guía del usuario
   description: Una frase que resuma el contenido de la página; se muestra en los resultados de búsqueda y en las tarjetas para compartir.
   ---
   ```

3. Abre `astro.config.mjs` y registra el documento en el grupo correspondiente del array `sidebar`:

   ```javascript
   { label: 'Guía del usuario', link: '/canvas/user-guide/' }
   ```

4. Guarda, comprueba en la vista previa local que aparece en el directorio de la izquierda, y después ejecuta `pnpm run deploy` para publicar.

:::warning
Si creas el archivo sin registrarlo en la `sidebar`, la página es accesible pero no aparece en el directorio de la izquierda; es el error más habitual entre los principiantes.
:::

---

## Receta 2: añadir un botón de navegación superior

1. Abre `src/config/navigation.ts` y añade una entrada al array `navigationConfig`:

   ```typescript
   {
     id: 'blog',
     labelKey: 'nav.blog',
     defaultLabel: 'Blog',
     href: 'https://blog.epocanvas.com',
     isExternal: true,          // los enlaces externos se abren en una ventana nueva
   },
   ```

2. Abre `src/utils/i18n.ts` y añade las entradas de traducción de `nav.blog` para los 10 idiomas;
3. Tras guardar, el nuevo botón aparece de inmediato en la barra superior; si es un enlace interno y debe participar en el resaltado de la navegación, configúrale una función `match`.

---

## Receta 3: ajustar las reglas de resaltado de la página

Si un cambio en la ruta de la página provoca un resaltado incorrecto en la barra superior, modifica la función `match` de la entrada correspondiente en `navigation.ts`:

```typescript
match: (pathname: string) =>
  pathname === '/canvas/' || pathname.includes('layout'),
```

La regla es que la coincidencia exacta tiene prioridad y `includes` actúa como fallback; los `match` de varios botones no deben solaparse, de lo contrario dos botones aparecerán resaltados a la vez.

---

## Receta 4: cambiar el color de marca del theme

1. Abre `src/styles/custom.css`;
2. Modifica a la vez el trío de colores principales en los dos bloques, el claro (`:root`) y el oscuro (`:root[data-theme='dark']`):

   ```css
   --sl-color-accent: #10b981;      /* color principal: botones, estado seleccionado */
   --sl-color-accent-low: rgba(16, 185, 129, 0.1);  /* fondo claro del elemento seleccionado */
   --sl-color-accent-high: #047857; /* enlaces y texto resaltado */
   ```

3. Tras guardar, los botones, los resaltados y los enlaces de todo el sitio cambian de color automáticamente. Si solo cambia uno de los bloques, los colores quedarán descoordinados en el otro theme.

---

## Receta 5: reemplazar el logo

| Ubicación | Archivo | Uso |
| :--- | :--- | :--- |
| Izquierda de la barra superior | `public/images/logo.svg` | Icono de la barra superior en las páginas interiores; la ruta se configura en `logo.src` de `astro.config.mjs` |
| Imagen grande de la portada | `src/assets/logo.svg` | Imagen decorativa de la parte derecha de la página de inicio |

Se recomienda reemplazar ambas a la vez. El logo usa formato vectorial SVG; establecer `logo.replacesTitle` en `true` en `astro.config.mjs` oculta el texto del título y deja solo el icono.

---

## Receta 6: ajustar las dimensiones del layout

Los tres elementos del layout están centralizados al inicio de `src/styles/custom.css`:

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* ancho del directorio de la izquierda */
  --sl-content-width: 60rem;    /* ancho máximo del cuerpo del texto */
  --sl-nav-height: 3.5rem;      /* altura de la barra superior */
}
```

:::caution
El ancho de la columna del índice de la derecha no está en estas variables: lo controla el valor `20rem` de `src/components/starlight/TwoColumnContent.astro` (`21rem` en pantallas ultra anchas). Al ajustar el ancho de la columna derecha, sincroniza también el `max-width: calc(100% - 20rem)` del área del cuerpo del texto en el mismo archivo.
:::

---

## Receta 7: modificar los textos del cuadro de búsqueda

El placeholder del cuadro de búsqueda, las ayudas de los botones y demás textos de la interfaz provienen del diccionario multilingüe de `src/utils/i18n.ts`. Abre ese archivo y modifica las entradas como `search.placeholder` siguiendo la estructura de dos niveles "idioma → clave de entrada":

```typescript
// Ruta del archivo: src/utils/i18n.ts
export const UI_TRANSLATIONS = {
  'zh-CN': {
    'search.placeholder': '搜索文档与指令...',
    // ...resto de entradas de este idioma
  },
  en: {
    'search.placeholder': 'Search documentation...',
    // ...resto de entradas de este idioma
  },
  // los 8 idiomas restantes siguen el mismo esquema
};
```

Los idiomas que no se actualicen mostrarán automáticamente el valor predeterminado en chino como fallback, sin errores. Tras guardar, la actualización en caliente local lo muestra de inmediato; no hace falta compilar.

---

## Receta 8: añadir etiquetas `<head>` de verificación al sitio

Para conectar servicios como Google Search Console o Baidu Webmaster Tools hay que inyectar etiquetas de verificación en el `<head>`. Abre `astro.config.mjs` y añade al array `head` de la configuración de Starlight:

```javascript
head: [
  // configuración del favicon existente ...
  {
    tag: 'meta',
    attrs: {
      name: 'google-site-verification',
      content: 'cadena de verificación',
    },
  },
],
```

Tras guardar y volver a desplegar, realiza la comprobación con el botón de verificación que aporta cada plataforma. Para más configuración de motores de búsqueda después de publicar, ver [SEO y optimización del rendimiento](/canvas/seo/).

---

## Flujo de verificación general tras cualquier cambio

Sea cual sea la personalización, verifica en este orden antes de confirmar:

```bash
pnpm run dev      # 1. revisar el resultado página por página en el navegador
pnpm exec astro check && pnpm run build   # 2. comprobación de tipos + compilación completa
pnpm run preview  # 3. previsualizar el resultado de la compilación y publicar solo si todo es correcto
```

Las formas de publicación se detallan en [Despliegue en Cloudflare Pages](/canvas/cloudflare/).
