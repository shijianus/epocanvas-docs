---
title: SEO y optimización del rendimiento
description: Capacidades SEO integradas en EpoCanvas Docs (etiquetas meta, Open Graph, sitemap, robots.txt) y mecanismos de rendimiento, además del procedimiento para darse de alta en los motores de búsqueda.
---

La documentación se escribe para ser leída, y para eso primero debe poder encontrarse y abrirse rápido. **EpoCanvas Docs** incorpora, a nivel de compilación, un conjunto de capacidades SEO y mecanismos de rendimiento listos para usar; esta página explica qué son, cómo verificarlos y qué queda por hacer después de publicar.

---

## Capacidades SEO integradas

Todas las capacidades siguientes entran en vigor automáticamente durante la compilación, sin configuración adicional:

| Capacidad | Implementación | Cómo verificarla |
| :--- | :--- | :--- |
| Título de la página | `<title>Título del artículo \| EpoCanvas Docs</title>`, tomado del Frontmatter | Ver el código fuente de la página o la pestaña del navegador |
| Descripción de la página | `<meta name="description">`, tomada del `description` del Frontmatter | Ver el código fuente |
| Etiquetas Open Graph | `og:title`, `og:type`, `og:url`, `og:locale`, `og:description`; muestran la tarjeta al compartir en redes sociales | Pegar el enlace en un chat para ver la vista previa |
| Enlace canonical | Cada página genera automáticamente `<link rel="canonical">` que apunta al dominio principal | Ver el código fuente |
| Sitemap | Genera automáticamente `sitemap-index.xml` durante la compilación | Acceder a `/sitemap-index.xml` |
| robots.txt | El proyecto incluye `public/robots.txt`, que permite el paso a todos los rastreadores y declara la ubicación del sitemap | Acceder a `/robots.txt` |

:::tip
El `title` y el `description` del Frontmatter son el material principal que muestran los motores de búsqueda. Al escribir documentación, rellene siempre un `description` breve y preciso; es la optimización puntual más importante para el SEO.
:::

### Canonical y dominio espejo

El dominio principal del sitio es `docs.epocanvas.com` y la configuración `<site>` coincide con él; el canonical y el `og:url` de cada página apuntan al dominio principal. Aunque el contenido también sea accesible a través del espejo `epocanvas-docs.pages.dev`, los motores de búsqueda concentrarán la autoridad en el dominio principal y no lo clasificarán como contenido duplicado.

---

## Mecanismos de rendimiento

### Salida puramente estática, sin runtime de framework

El resultado de la compilación es HTML + CSS puro. La navegación entre páginas, la lectura y el resaltado del índice al desplazarse no requieren descargar ningún framework de frontend (React/Vue y similares tienen un tamaño de runtime de cero); solo los componentes interactivos como la búsqueda, el conmutador de theme y el selector de idioma cargan bajo demanda unos pocos scripts. El primer renderizado no espera a JavaScript, y en redes lentas o dispositivos de gama baja la experiencia es igual de fluida.

### Compresión de imágenes en tiempo de compilación

Los recursos estáticos referenciados mediante `public/` los distribuye el CDN al desplegar; la cadena de herramientas de compilación integra el módulo de procesamiento de imágenes sharp, dejando preparada la capacidad para introducir en el futuro la optimización de imágenes en tiempo de compilación. La guía actual exige que las capturas de pantalla tengan unos 1440 píxeles de ancho y que los diagramas sean preferiblemente SVG, controlando el peso de las imágenes en el origen.

### Carga del índice de búsqueda bajo demanda

Pagefind genera fragmentos de índice altamente comprimidos durante `pnpm run build`. Cuando el lector abre una página no descarga ningún índice; solo cuando realmente usa la búsqueda en todo el sitio, el navegador descarga los fragmentos correspondientes a las palabras clave (de unos pocos KB a unas decenas de KB), sin afectar a la velocidad de la primera pantalla.

### Cómo verificar el rendimiento

1. Abre el panel **Network** de las herramientas de desarrollador del navegador, recarga la página y revisa el volumen de datos transferido en la primera pantalla;
2. Ejecuta una auditoría **Lighthouse** (categoría Performance) en una ventana de incógnito de Chrome y comprueba la puntuación;
3. Usa `curl -sI https://docs.epocanvas.com` para comprobar que las políticas de caché del CDN, como `Cache-Control`, surten efecto en las cabeceras de respuesta.

---

## Tres tareas recomendadas después de publicar

Tras completar el despliegue (ver [Despliegue en Cloudflare Pages](/canvas/cloudflare/)), se recomienda terminar, en este orden:

### 1. Enviar el Sitemap a Google Search Console

1. Abre [Google Search Console](https://search.google.com/search-console) y añade la propiedad `docs.epocanvas.com`;
2. Verifica la propiedad del dominio mediante un registro DNS TXT, según las indicaciones (si el dominio está gestionado en Cloudflare, surte efecto en pocos minutos);
3. En "Sitemaps" del menú de la izquierda, envía `https://docs.epocanvas.com/sitemap-index.xml`.

### 2. Verificar el resultado de la indexación

Una semana después de publicar, busca en Google con `site:docs.epocanvas.com` para confirmar que los artículos ya están indexados; en el informe "Páginas" de Search Console, comprueba si el número de páginas indexadas coincide con el número de documentos.

### 3. Revisar periódicamente los enlaces rotos

Tras reestructurar la documentación o renombrar rutas, los enlaces antiguos citados desde fuera del sitio pueden dejar de funcionar. En el informe "Páginas" de Search Console puede revisar las entradas "No encontrada (404)" y añadir redirecciones en la tabla `redirects` de `astro.config.mjs` para las rutas caídas con más tráfico.

:::caution
El dominio espejo `epocanvas-docs.pages.dev` es solo una vía de acceso de respaldo; el canonical garantiza que los motores de búsqueda solo indexen el dominio principal. No difundas activamente la dirección del espejo fuera del sitio, para evitar que los lectores guarden en favoritos un dominio que no controlas.
:::
