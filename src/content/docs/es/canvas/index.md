---
title: Descripción del producto y valor clave
description: "Manual de producto oficial de EpoCanvas Docs: un sitio de documentación estático de alto rendimiento diseñado para proyectos de código abierto; posicionamiento del producto, ventajas principales y problemas que resuelve."
---

**EpoCanvas Docs** es el sistema oficial de sitio de documentación técnica creado específicamente para el ecosistema de código abierto EpoCanvas. Está construido sobre el framework moderno de sitios estáticos **Astro 5** y **Starlight**, y su objetivo es ofrecer a los desarrolladores una plataforma de documentación con una maquetación profesional, carga rápida, búsqueda cómoda y fácil mantenimiento.

Tanto si se trata de escribir el manual de usuario de un producto, la especificación de una API o la documentación del diseño de la arquitectura de un sistema, EpoCanvas Docs permite al autor concentrarse en escribir buen contenido en Markdown, mientras ofrece al lector una experiencia de navegación cómoda y natural.

---

## Problemas reales que resuelve

En el desarrollo diario y la escritura técnica, muchos equipos se topan con las siguientes dificultades al mantener documentación:

1. **Páginas lentas y alto consumo de memoria**: muchas herramientas de documentación generan páginas con mucho JavaScript en tiempo de ejecución; en móviles o redes lentas tardan en abrir y se traban al desplazar artículos largos.
2. **Navegación incómoda en artículos largos**: los sitios de documentación habituales suelen contar solo con un menú lateral izquierdo; al leer explicaciones técnicas de miles de palabras es difícil hacerse una idea rápida de la jerarquía de subtítulos del artículo.
3. **Búsqueda dependiente de servicios externos**: servicios de búsqueda en la nube como Algolia exigen registrarse aparte y configurar claves de rastreo, y dejan de funcionar por completo en entornos de intranet sin acceso a servicios externos.
4. **Multilingüe a medias**: muchos sitios de documentación dicen admitir varios idiomas, pero en realidad solo tienen traducidos los botones de navegación y el cuerpo de los artículos sigue en el idioma original; otros devuelven directamente un 404 cuando falta una traducción, y el lector tiene que andar modificando la URL para encontrar el contenido.

EpoCanvas Docs se diseñó precisamente para resolver estos problemas reales.

---

## Resumen de las funciones principales

![Efecto real de renderizado en el navegador de la página de descripción del producto de EpoCanvas Docs: catálogo por categorías a la izquierda, cuerpo del texto al centro e índice de la página a la derecha](/images/canvas/ui-docs-reading.png)

*Figura: aspecto real de la página de descripción del producto. A la izquierda, el catálogo de categorías de la documentación; al centro, el cuerpo del texto; a la derecha, el esquema de "índice de la página" generado automáticamente, que resalta la sección actual según se desplaza.*

### 1. Interfaz de lectura clara en tres columnas

- **Barra lateral de navegación izquierda**: organiza todas las categorías de documentación por módulos, con plegado jerárquico y sin saltos al cambiar de página.
- **Zona central del cuerpo del texto**: ancho máximo de 60rem, interlineado de 1,68, bloques de código de ancho adaptable; cansa menos en lecturas prolongadas.
- **Columna derecha del esquema**: captura automáticamente los títulos `h2` y `h3` del artículo para generar el "índice de la página", resalta la posición de lectura según se desplaza y salta suavemente a cualquier subtítulo al hacer clic.

### 2. Búsqueda de doble modo: búsqueda en la página + búsqueda en todo el sitio

- **Búsqueda en la página actual**: escriba palabras clave directamente en el cuadro de búsqueda de la parte superior; todo el texto coincidente de la página se resalta al instante, con un contador de progreso como `3/9`, y Enter salta de una coincidencia a la siguiente.
- **Ventana emergente de búsqueda en todo el sitio**: pulse `Ctrl + K` (`Cmd + K` en Mac) para abrir la ventana de búsqueda global, basada en el índice estático de Pagefind, que muestra todos los documentos y fragmentos coincidentes.
- Toda la capacidad de búsqueda se ejecuta localmente en el navegador, sin depender de ningún servicio de backend, y funciona incluso alojada en una intranet.

### 3. Traducciones completas en 10 idiomas

- Admite 10 idiomas: chino simplificado, chino tradicional, inglés, japonés, coreano, español, francés, alemán, ruso y portugués; la navegación, la barra lateral y el cuerpo de todos los documentos están completamente traducidos en cada idioma.
- Al hacer clic en el botón de idioma de la esquina superior derecha se salta a la versión del mismo artículo en el idioma elegido; la URL lleva el prefijo del idioma (por ejemplo, `/en/canvas/`), de modo que se puede guardar en favoritos o compartir con compañeros que usen otros idiomas.
- Cuando a una página concreta aún le falta la traducción a algún idioma, esa página muestra automáticamente como fallback el contenido chino predeterminado, sin generar ningún error 404.

### 4. Maquetación profesional de Markdown y código

- Resaltado de código basado en Expressive Code, con posibilidad de añadir a los bloques de código un título con nombre de archivo, resaltar líneas concretas y mostrar diff comparativos.
- Compatibilidad nativa con 4 bloques de aviso (asides) en color (Note, Tip, Caution, Danger), además de títulos personalizados.
- Admite las sintaxis extendidas de Markdown más habituales, como tablas GFM, listas de tareas y tachado; las reglas completas están en [Reglas de renderizado en detalle](/canvas/rendering/).

### 5. Compilación rápida y alojamiento gratuito

- Compilación estática basada en Astro 5: el resultado son HTML y CSS puros con un poco de JS cargado bajo demanda; todo el sitio, con sus 10 idiomas y unas 180 páginas, se compila por completo en unos 25 segundos.
- Incluye el comando de despliegue para Cloudflare Pages preconfigurado: con una sola instrucción se publica la documentación en línea y se obtiene automáticamente el certificado HTTPS.

---

## Arquitectura general del proyecto

Para que la documentación se mantenga ligera y fácil de mantener, el sistema se divide en cuatro partes según sus responsabilidades:

![Diagrama de arquitectura del sistema de EpoCanvas Docs: el contenido fuente en Markdown se compila con Astro, se le aplican los componentes de interfaz personalizados y, finalmente, se generan páginas estáticas alojadas en Cloudflare Pages](/images/canvas/docs-architecture.svg)

*Figura: arquitectura del sistema. Quien escribe solo necesita mantener el contenido fuente en Markdown; todo lo demás se hace automáticamente.*

- **Base y estilos**: núcleo estático basado en Astro 5; las variables de diseño se definen en `src/styles/custom.css`, y los modos claro y oscuro comparten los mismos nombres de variables.
- **Gestión del contenido fuente**: toda la documentación se guarda en el directorio `src/content/docs/`, escrita en Markdown puro (`.md`) o en MDX (`.mdx`) con posibilidad de incrustar componentes.
- **Componentes de interfaz**: sobrescribiendo los componentes nativos de Starlight se han personalizado la barra superior, la barra lateral, el índice de la página y la ventana de búsqueda.
- **Distribución y acceso**: el resultado de la compilación se guarda en el directorio `dist/` y se aloja en Cloudflare Pages, que responde desde el nodo CDN global más cercano.

---

## Para quién es

EpoCanvas Docs es adecuado para los siguientes escenarios:

- **Sitio de documentación oficial de un proyecto de código abierto**: manual de producto, referencia de API y explicación de la arquitectura, todo en un solo repositorio;
- **Base de conocimiento interna de un equipo**: puramente estático y sin dependencias de servicios externos; la búsqueda funciona por completo incluso en una intranet;
- **Documentación tipo blog técnico personal**: solo se escribe Markdown, sin ocuparse de la ingeniería de frontend, y se publica con un comando.

**No es adecuado** para escenarios que requieran inicio de sesión con autenticación, comentarios e interacción o visualización de datos en tiempo real: un sitio puramente estático no tiene backend, y este tipo de necesidades requiere añadir servicios aparte.

---

## Comparación con herramientas de documentación habituales

| Característica | EpoCanvas Docs | Docusaurus | VitePress | GitBook comercial |
| :--- | :--- | :--- | :--- | :--- |
| **Tecnología base** | Astro 5 + Starlight | React 18 | Vue 3 + Vite | Plataforma SaaS de código cerrado |
| **Mecanismo de búsqueda** | Índice estático local de Pagefind | Depende del servicio en la nube Algolia | Búsqueda en memoria con Minisearch | Motor de búsqueda de backend propio |
| **Diseño del layout** | Tres columnas (menú izquierda + cuerpo centro + índice derecha) | Requiere configurar plugins para modificarlo | Dos/tres columnas predeterminadas | Dos columnas fijas |
| **Método de despliegue** | Subida directa a Cloudflare Pages | S3 / Vercel / GitHub | GitHub Pages | Alojamiento privado de la plataforma |
| **Grado de autonomía** | 100 % de código abierto, control total del código fuente | 100 % de código abierto | 100 % de código abierto | Código cerrado, muchas funciones de pago |

---

## Stack tecnológico y versiones

Stack tecnológico realmente usado en la versión actual (según el resultado de la compilación):

| Componente | Versión | Función |
| :--- | :--- | :--- |
| **Astro** | v5.18.2 | Núcleo del sitio estático, encargado de la compilación y el enrutado |
| **Starlight** | v0.32.6 | Framework del sitio de documentación, aporta el esqueleto del layout y el procesado del contenido |
| **Expressive Code** | Integrado con Starlight | Resaltado de bloques de código, barra de título y resaltado de líneas |
| **Pagefind** | Integrado vía `@pagefind/default-ui` 1.5.2 | Genera el índice de búsqueda estático durante la compilación |
| **Wrangler** | v4.131.0 | CLI oficial de Cloudflare, ejecuta el despliegue |
| **Entorno de ejecución** | Node.js >= 18.14.1 + pnpm >= 9 | Entorno de desarrollo y compilación local |

Al actualizar las dependencias, lea también las precauciones sobre pruebas de regresión de [Componentes de interfaz y personalización](/canvas/components/).

---

## Estructura de directorios del proyecto

La organización del código del proyecto es la siguiente, con tareas bien repartidas entre directorios:

```text
epocanvas-docs/
├── public/                    # Directorio de recursos estáticos (las imágenes y los iconos vectoriales van aquí)
│   └── images/canvas/         # Capturas de pantalla de la interfaz y diagramas vectoriales de la arquitectura
├── src/
│   ├── components/starlight/  # Componentes de página personalizados (barra superior, barra lateral, índice de la página, ventana de búsqueda, etc.)
│   ├── config/navigation.ts   # Configuración de la barra de navegación superior (añadir o quitar elementos del menú se hace aquí)
│   ├── content/docs/          # Ubicación de los archivos Markdown del cuerpo de la documentación
│   │   ├── index.mdx          # Página de inicio del sitio de documentación
│   │   ├── canvas/            # Documentos de cada capítulo (chino simplificado, idioma predeterminado)
│   │   └── en/ ja/ ...        # Directorios de las traducciones completas a los otros 9 idiomas
│   ├── styles/custom.css      # Estilos globales y variables de color del tema
│   └── utils/i18n.ts          # Diccionario de textos de la interfaz y lista de idiomas
├── astro.config.mjs           # Archivo principal de configuración del sitio (título, lista de idiomas y catálogo de la barra lateral se configuran aquí)
└── package.json               # Dependencias del proyecto y configuración de los comandos de ejecución
```

---

## Siguientes pasos

- ¿Quiere ejecutar el proyecto en local? Lea **[Inicio rápido (en marcha en 3 minutos)](/canvas/deployment/)**.
- ¿Quiere conocer la distribución concreta de la interfaz y su uso? Lea **[Layout de la página y experiencia de lectura](/canvas/layout/)**.
- ¿Quiere empezar a redactar nuevos documentos? Lea la **[Guía de redacción y formato en Markdown](/canvas/markdown/)** y las **[Reglas de renderizado en detalle](/canvas/rendering/)**.
