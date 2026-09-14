---
title: Configuración del sitio y personalización de estilos
description: Guía para modificar los archivos de configuración principales de EpoCanvas Docs, ajustar el menú de la barra lateral, reemplazar el logo de marca y personalizar los colores del theme.
---

Si quiere usar **EpoCanvas Docs** como sitio de documentación de su propio equipo, o ajustar el título del sitio, el logo, la estructura de directorios y el color del theme, esta sección presenta los puntos de personalización más habituales. Después de guardar cualquier cambio de configuración, el servidor de desarrollo local se actualiza automáticamente en caliente y el resultado es visible de inmediato en el navegador.

---

## 1. Información básica del sitio (`astro.config.mjs`)

El archivo `astro.config.mjs` en la raíz del proyecto es el archivo de configuración principal de todo el sitio de documentación. Las opciones relacionadas directamente con la información del sitio son las siguientes (los comentarios indican cuándo modificarlas):

```javascript
export default defineConfig({
  // Dominio del sitio en producción; afecta a los enlaces SEO y a la generación del sitemap
  site: 'https://docs.epocanvas.com',

  integrations: [
    starlight({
      // Título del sitio; se muestra en la pestaña del navegador y en la barra superior
      title: 'EpoCanvas Docs',
      // Descripción del sitio; se usa en el resumen de los resultados de los buscadores
      description: 'EpoCanvas 全栈技术、架构与产品运维指南',

      // Ruta de la imagen del logo en la parte izquierda de la barra superior
      logo: {
        src: './public/images/logo.svg',
        replacesTitle: false, // si se establece en true, solo se muestra el logo y se oculta el texto del título
      },

      // Enlace al repositorio de GitHub en la esquina superior derecha
      social: {
        github: 'https://github.com/shijianus/epocanvas-docs',
      },

      // Punto de entrada de la hoja de estilos personalizada
      customCss: ['./src/styles/custom.css'],

      // Directorio de la barra lateral (ver la sección siguiente)
      sidebar: [/* ... */],
    }),
  ],

  // Tabla de redirecciones de rutas antiguas, para evitar enlaces rotos
  redirects: { '/mail': '/canvas' },
});
```

---

## 2. ¿Cómo modificar el menú de la barra lateral izquierda?

El directorio de categorías de documentación de la izquierda está controlado por el array `sidebar` de la configuración de Starlight en `astro.config.mjs`:

```javascript
sidebar: [
  // Grupo 1: vista general del producto
  {
    label: '产品概览与入门',       // nombre del grupo
    items: [
      { label: '产品简介与核心价值', link: '/canvas/' },
      { label: '快速上手 (3分钟运行)', link: '/canvas/deployment/' },
    ],
  },
  // Grupo 2: aquí puede añadir sus propios grupos de negocio
  {
    label: '用户指南',
    items: [
      { label: '账号注册与登录', link: '/canvas/login/' },
    ],
  },
];
```

- **`label`**: nombre de la categoría o del artículo que se muestra en la barra lateral; puede ser distinto del `title` del Frontmatter (por ejemplo, usando un nombre de visualización más corto);
- **`link`**: ruta de acceso del artículo; corresponde a la ubicación del archivo bajo `src/content/docs/`.

:::warning
Un archivo `.md` recién creado debe registrarse en el array `sidebar` para que aparezca en el directorio de la izquierda; crear el archivo sin registrarlo es el error más habitual entre los principiantes.
:::

---

## 3. Personalización del color de marca del theme (`src/styles/custom.css`)

Todos los colores del sitio están controlados por variables CSS, definidas en `src/styles/custom.css`. En la parte superior del archivo están las variables del modo claro, y el bloque `:root[data-theme='dark']` contiene las variables del modo oscuro:

```css
:root {
  /* Color principal de la marca (modo claro) */
  --sl-color-accent: #2563eb;
  --sl-color-accent-low: rgba(37, 99, 235, 0.08);  /* fondo claro del elemento seleccionado */
  --sl-color-accent-high: #1d4ed8;                  /* enlaces y texto resaltado */

  /* Color de fondo de la página y líneas de separación */
  --sl-color-bg: #ffffff;
  --sl-color-hairline: #e2e8f0;
}

:root[data-theme='dark'] {
  /* El modo oscuro usa las mismas variables; basta con sustituir los valores de color */
  --sl-color-accent: #3b82f6;
  --sl-color-accent-low: rgba(59, 130, 246, 0.12);
  --sl-color-accent-high: #60a5fa;

  --sl-color-bg: #0b0f19;
  --sl-color-hairline: #1e293b;
}
```

Por ejemplo, si quiere cambiar el color principal de todo el sitio a un verde vivaz, basta con cambiar `--sl-color-accent` en los bloques de modo claro y oscuro a los valores de la serie `#10b981`; los botones, los estados seleccionados y los enlaces cambiarán de color automáticamente.

Las dimensiones del layout también se definen de forma centralizada al inicio de este archivo:

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* ancho del directorio de la izquierda */
  --sl-content-width: 60rem;    /* ancho máximo del cuerpo del texto */
  --sl-nav-height: 3.5rem;      /* altura de la barra superior */
}
```

---

## 4. Reemplazar el logo del sitio

1. Prepare una imagen vectorial del logo de marca (se recomienda `.svg`, aunque también puede usarse un `.png` nítido);
2. Sobrescríbelo guardándolo como `public/images/logo.svg` (la imagen grande de la portada está en `src/assets/logo.svg`);
3. Actualiza el navegador y el icono de la barra superior y de la portada se reemplaza automáticamente.

:::tip
Los dos logos tienen usos distintos: `public/images/logo.svg` se usa en la barra superior y `src/assets/logo.svg` en la imagen decorativa grande de la parte derecha de la portada; se recomienda reemplazar ambos.
:::
