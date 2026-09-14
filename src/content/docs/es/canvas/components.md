---
title: Componentes de interfaz y desarrollo a medida
description: "Arquitectura de los componentes de interfaz de EpoCanvas Docs: mecanismo de sobrescritura de componentes de Starlight, responsabilidad y flujo de datos de los siete componentes personalizados, y puntos a tener en cuenta en el desarrollo a medida."
---

La interfaz de **EpoCanvas Docs** no reinventa la rueda desde cero, sino que realiza una **sobrescritura dirigida** sobre los componentes nativos de Starlight: conserva el esqueleto de página y la capacidad de procesamiento de contenido de Starlight, y reemplaza los componentes de presentación como la barra superior, la barra lateral, el índice y la búsqueda, para obtener el layout de tres columnas y las interacciones deseadas. Esta página explica la estructura de este sistema de componentes y cómo modificarlo.

---

## Mecanismo de sobrescritura de componentes

Starlight permite reemplazar cualquier componente nativo por una implementación personalizada en el campo `components` de `astro.config.mjs`. Este proyecto sobrescribe 7 componentes:

```javascript
// astro.config.mjs (fragmento)
components: {
  Header: './src/components/starlight/Header.astro',
  Sidebar: './src/components/starlight/Sidebar.astro',
  TableOfContents: './src/components/starlight/TableOfContents.astro',
  PageTitle: './src/components/starlight/PageTitle.astro',
  TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
  Search: './src/components/starlight/Search.astro',
  Pagination: './src/components/starlight/Pagination.astro',
},
```

Durante la compilación, cada posición de la página que Starlight renderiza utiliza preferentemente el archivo indicado aquí. Los componentes no sobrescritos (como el pie de página Footer o el menú móvil) siguen usando la implementación nativa.

---

## Responsabilidades de los siete componentes personalizados

Todo el código fuente se encuentra en `src/components/starlight/`; su tamaño y responsabilidades son los siguientes:

| Archivo del componente | Tamaño | Responsabilidad |
| :--- | :--- | :--- |
| `Header.astro` | unas 713 líneas | Todo el contenido de la barra superior: logo, cuadro de búsqueda, navegación principal, insignia de versión, selector de idioma, conmutador de theme, accesos a GitHub y Telegram |
| `Search.astro` | unas 840 líneas | Búsqueda de doble modo: búsqueda dentro de la página desde la barra superior (resaltado y contador) + ventana emergente `Ctrl+K` de búsqueda en todo el sitio (Pagefind UI) |
| `Pagination.astro` | unas 123 líneas | Tarjetas de paginación "anterior / siguiente" al pie: borde fino plano, título en el color del theme, flechas diagonales ↙/↘ que indican la dirección de navegación |
| `TwoColumnContent.astro` | unas 77 líneas | Esqueleto de dos columnas para el cuerpo del texto y el índice de la derecha; controla el ancho fijo y el desplazamiento de la columna derecha |
| `TableOfContents.astro` | unas 64 líneas | Título "En esta página", icono y lista del índice; filtra el propio título de la página |
| `PageTitle.astro` | unas 62 líneas | Título grande de la página (toma el `title` del Frontmatter) y marca de tiempo de "última actualización" |
| `Sidebar.astro` | unas 22 líneas | Envoltorio ligero: reutiliza el `SidebarPersister` nativo de Starlight para que la posición de desplazamiento de la barra lateral no cambie al pasar de página |

---

## Flujo de datos: tres archivos de configuración impulsan toda la interfaz

Los componentes personalizados no contienen datos de negocio por sí mismos; el contenido de la interfaz lo impulsan tres archivos de configuración:

```text
astro.config.mjs ──→ locales + array sidebar ──→ Sidebar.astro renderiza el directorio de la izquierda (cada idioma toma su etiqueta traducida)
src/config/navigation.ts ──→ navigationConfig ──→ Header.astro renderiza la navegación superior y el resaltado (los enlaces llevan automáticamente el prefijo de idioma)
src/utils/i18n.ts ──→ diccionario UI_TRANSLATIONS ──→ cada componente toma las entradas según el idioma actual en tiempo de compilación
```

- El **directorio de la izquierda** solo reconoce la declaración `sidebar` de `astro.config.mjs`; los documentos nuevos deben registrarse aquí; el campo `translations` de cada entrada proporciona el texto del menú en 10 idiomas;
- La **navegación superior** obtiene el texto de cada elemento del diccionario de `i18n.ts` mediante `labelKey`, y la función `match` decide qué botón se resalta en la página actual (antes de comparar, se elimina el prefijo de idioma);
- Los **textos de la interfaz** (el placeholder del cuadro de búsqueda, el título "En esta página", el aviso del conmutador de theme, etc.) los generan los componentes llamando a `getTranslation(key, lang)` directamente en tiempo de compilación; no hay scripts de sustitución en tiempo de ejecución en la página.

En otras palabras: para cambiar el contenido de la interfaz, busque primero el archivo de configuración correspondiente; solo si cambia la apariencia (espaciados, colores, iconos) necesitará tocar el código fuente de los componentes.

---

## Detalles clave de implementación de cada componente

### PageTitle: título de la página y fecha real de actualización

El título grande de la página se lee directamente del `title` del Frontmatter, por lo que **no debe volver a escribir un encabezado de nivel 1 con `#` en el cuerpo del texto**. La marca de tiempo de "última actualización" proviene del historial de commits de Git en el momento de la compilación (`lastUpdated: true` está activado en `astro.config.mjs`); se actualiza automáticamente con cada commit y no requiere mantenimiento manual.

:::caution
La fecha de actualización se lee del historial de Git en tiempo de compilación, por lo tanto: **los documentos nuevos aún sin confirmar no muestran fecha** (bajo el título solo queda la firma estándar); tras hacer commit y recompilar aparecerá. Si el entorno de compilación es un clon superficial (como en CI con `fetch-depth: 1`), el historial de Git está incompleto y la marca de tiempo también faltará. En ninguno de los dos casos se ve afectada la compilación.
:::

### Sidebar: cómo se recuerda la posición de desplazamiento

`Sidebar.astro` tiene poco más de 20 líneas; lo esencial es que reutiliza el componente `SidebarPersister` oficial de Starlight: al cambiar de página mantiene el DOM de la barra lateral sin reconstruir, con lo que se conserva la posición de la barra de desplazamiento. Este es el principio detrás de que el directorio de la izquierda "no salte" al cambiar de página.

### TableOfContents: generación del índice de la página

Los datos del índice los genera Starlight en tiempo de compilación analizando los encabezados del cuerpo del texto (`##` y `###`); el componente solo se encarga de filtrar el propio título de la página y renderizar. El resaltado al desplazarse lo realiza el elemento personalizado `starlight-toc` en el navegador, sin depender de ningún framework.

### TwoColumnContent: única fuente del ancho de la columna derecha

El ancho de la columna del índice de la derecha está fijado en `20rem` bajo `@media (min-width: 72rem)` (y en `21rem` para pantallas ultra anchas de `90rem` o más), y el ancho máximo del área del cuerpo del texto se reduce en consecuencia el ancho de la columna derecha. Para ajustar ese ancho, basta con modificar este único archivo; no lo sobrescriba de forma dispersa en otras hojas de estilos.

### Header: navegación, theme e idioma

- Los botones de navegación se renderizan recorriendo `navigationConfig`; el estilo del estado activo lo determina el valor de retorno de la función `match`, y los enlaces reciben automáticamente el prefijo del idioma actual mediante `localizedHref()`;
- El conmutador de theme guarda la selección en la clave `starlight-theme` de LocalStorage; al cargar la página, el theme inicial se decide en el orden "selección local → preferencia del sistema";
- Cada opción del menú desplegable de idiomas es un enlace real a la versión de la página actual en ese idioma; al hacer clic se salta directamente, sin almacenamiento de estado adicional;
- El enlace de GitHub a la derecha de la barra superior proviene de `social.github` de `astro.config.mjs`; el enlace de Telegram (`https://t.me/epocanvas`) está actualmente hardcodeado dentro del componente; para modificarlo, edita directamente `Header.astro`.

### Search: búsqueda de doble modo

Un mismo componente implementa dos búsquedas (detalles en [Búsqueda de texto completo y atajos de teclado](/canvas/search-engine/)):

1. **Búsqueda dentro de la página**: el cuadro de entrada de la barra superior; con Enter se salta entre los textos coincidentes de la página actual, y el resaltado se implementa marcando con un script;
2. **Búsqueda en todo el sitio**: ventana emergente `<dialog>` + la UI predeterminada de Pagefind; el índice se genera en la fase `pnpm run build`.

### Pagination: tarjetas de paginación

Los datos de página anterior / siguiente los calcula Starlight en tiempo de compilación según el orden de `sidebar` (`Astro.locals.starlightRoute.pagination`); el componente solo renderiza: dos tarjetas de igual ancho, borde fino sin sombra, título en el color del theme, y las flechas diagonales ↙ / ↘ se desplazan en la dirección de navegación al pasar el cursor. Las flechas son rutas SVG en línea; si el sitio se usa en un idioma RTL, la dirección se refleja automáticamente.

---

## Puntos a tener en cuenta en el desarrollo a medida

:::caution
Sobrescribir componentes implica renunciar a las actualizaciones futuras de los componentes nativos de Starlight. Al actualizar la versión de Starlight, los props de los componentes y la estructura de `Astro.locals.starlightRoute` pueden cambiar; después de actualizar debe hacer pruebas de regresión de los 7 componentes sobrescritos.
:::

- **Para cambiar estilos, usa primero variables CSS**: los colores, las fuentes y las dimensiones del layout están centralizados en las variables `:root` de `src/styles/custom.css`; ver [Configuración del sitio y personalización de estilos](/canvas/configuration/); la mayoría de las personalizaciones no requieren tocar los componentes;
- **Toca los componentes solo para cambiar interacciones**: al añadir botones o ajustar la estructura, obtén los textos de la interfaz con `getTranslation(key, lang)` y completa las entradas de los 10 idiomas en `i18n.ts`; los idiomas que falten mostrarán el texto en chino como fallback;
- **Verifica siempre en local después de cambiar algo**: usa `pnpm run dev` para comprobar las interacciones y `pnpm run build` para confirmar que los tipos y la compilación pasan (los comandos locales se detallan en [Preguntas frecuentes y solución de problemas](/canvas/troubleshooting/)).

Para las operaciones de personalización concretas más habituales, consulta directamente [Recetas de personalización habituales](/canvas/recipes/).
