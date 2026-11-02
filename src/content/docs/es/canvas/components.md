---
title: Componentes de interfaz y desarrollo a medida
description: "Arquitectura de los componentes de interfaz de EpoCanvas Docs: mecanismo de sobrescritura de componentes de Starlight, responsabilidad y flujo de datos de los componentes personalizados, y puntos a tener en cuenta en el desarrollo a medida."
---

La interfaz de **EpoCanvas Docs** no reinventa la rueda desde cero, sino que realiza una **sobrescritura dirigida** sobre los componentes nativos de Starlight: conserva el esqueleto de página y la capacidad de procesamiento de contenido de Starlight, y reemplaza los componentes de presentación como la barra superior, la barra lateral, el índice y la búsqueda, para obtener el layout de tres columnas y las interacciones deseadas. Esta página explica la estructura de este sistema de componentes y cómo modificarlo.

---

## Mecanismo de sobrescritura de componentes

Registre las sustituciones en `components` de `astro.config.mjs` como se muestra; la configuración actual define la lista completa.

```javascript
// astro.config.mjs (fragmento)
components: {
  Header: './src/components/starlight/Header.astro',
  MobileMenuToggle: './src/components/starlight/MobileMenuToggle.astro',
  Sidebar: './src/components/starlight/Sidebar.astro',
  TableOfContents: './src/components/starlight/TableOfContents.astro',
  PageTitle: './src/components/starlight/PageTitle.astro',
  TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
  Search: './src/components/starlight/Search.astro',
  Pagination: './src/components/starlight/Pagination.astro',
  SkipLink: './src/components/starlight/SkipLink.astro',
},
```

Las sustituciones registradas tienen prioridad al compilar. Los demás componentes conservan la implementación nativa de Starlight.

---

## Responsabilidades de los componentes personalizados

Los archivos están en `src/components/starlight/`; sus funciones principales son las siguientes.

| Archivo del componente | Responsabilidad |
| :--- | :--- |
| `Header.astro` | Todo el contenido de la barra superior: logo, cuadro de búsqueda, navegación principal, insignia de versión, selector de idioma, conmutador de theme, accesos a GitHub y Telegram |
| `Search.astro` | Búsqueda de doble modo: búsqueda dentro de la página desde la barra superior (resaltado y contador) + ventana emergente `Ctrl+K` de búsqueda en todo el sitio (Pagefind UI) |
| `Pagination.astro` | Tarjetas de paginación "anterior / siguiente" al pie: borde fino plano, título en el color del theme, flechas diagonales ↙/↘ que indican la dirección de navegación |
| `TwoColumnContent.astro` | Esqueleto de dos columnas para el cuerpo del texto y el índice de la derecha; controla el ancho fijo y el desplazamiento de la columna derecha |
| `TableOfContents.astro` | Título "En esta página", icono y lista del índice; filtra el propio título de la página |
| `PageTitle.astro` | Título grande de la página (toma el `title` del Frontmatter) y marca de tiempo de "última actualización" |
| `Sidebar.astro` | Envoltorio ligero: reutiliza el `SidebarPersister` nativo de Starlight para que la posición de desplazamiento de la barra lateral no cambie al pasar de página |
| `SkipLink.astro` | Muestra el enlace de salto al recibir foco de teclado y lleva el foco al título `_top` |
| `MobileMenuToggle.astro` | Abre y cierra la barra lateral móvil, sincroniza el estado y cierra con Esc devolviendo el foco |

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

El título de la página se lee del `title` del Frontmatter, por lo que **no escriba otro encabezado de nivel 1 con `#` en el cuerpo**. Con `lastUpdated: true` en `astro.config.mjs` y sin una fecha que lo sustituya en el Frontmatter, la compilación lee la fecha del último commit de Git que modificó ese archivo. No es la fecha de cada commit del repositorio ni de cada compilación; cambiar otros archivos no actualiza la fecha de esta página.

:::caution
Un documento nuevo sin commit no tiene historial de Git y no muestra fecha. Los cambios sin confirmar de un archivo existente tampoco modifican su fecha de commit. Un clon superficial (como `fetch-depth: 1`) puede devolver la fecha del commit donde se corta el historial o no devolver ninguna; no equivale al historial completo. Para fechas precisas, use todo el historial de Git (`fetch-depth: 0` en CI). No poder leer la fecha no hace fallar la compilación.
:::

### Sidebar: cómo se recuerda la posición de desplazamiento

`Sidebar.astro` reutiliza `SidebarPersister` de Starlight para restaurar la posición de desplazamiento al cambiar de página. `MobileMenuToggle.astro` gestiona el estado y el foco del menú móvil.

### TableOfContents: generación del índice de la página

Los datos del índice los genera Starlight en tiempo de compilación analizando los encabezados del cuerpo del texto (`##` y `###`); el componente solo se encarga de filtrar el propio título de la página y renderizar. El resaltado al desplazarse lo realiza el elemento personalizado `starlight-toc` en el navegador, sin depender de ningún framework.

### TwoColumnContent: única fuente del ancho de la columna derecha

El ancho de la columna del índice de la derecha está fijado en `20rem` bajo `@media (min-width: 72rem)` (y en `21rem` para pantallas ultra anchas de `90rem` o más), y el ancho máximo del área del cuerpo del texto se reduce en consecuencia el ancho de la columna derecha. Para ajustar ese ancho, basta con modificar este único archivo; no lo sobrescriba de forma dispersa en otras hojas de estilos.

### Header: navegación, theme e idioma

- Los botones de navegación se renderizan recorriendo `navigationConfig`; el estilo del estado activo lo determina el valor de retorno de la función `match`, y los enlaces reciben automáticamente el prefijo del idioma actual mediante `localizedHref()`;
- El conmutador de theme guarda la selección en la clave `starlight-theme` de LocalStorage; al cargar la página, el theme inicial se decide en el orden "selección local → preferencia del sistema";
- Cada opción del menú desplegable de idiomas es un enlace real a la versión de la página actual en ese idioma; al hacer clic se salta directamente, sin almacenamiento de estado adicional;
- Los iconos de GitHub y de Telegram a la derecha de la barra superior están fijados en `src/components/starlight/Header.astro`; cambiar una dirección significa editar ese archivo. Telegram apunta a la página de la cuenta `@epocanvas` y su descripción emergente es la cadena `social.telegram`. La entrada `social` de `astro.config.mjs` controla el juego de iconos aparte al final de la barra lateral; los dos no se influyen entre sí.

### Search: búsqueda de doble modo

Un mismo componente implementa dos búsquedas (detalles en [Búsqueda de texto completo y atajos de teclado](/canvas/search-engine/)):

1. **Búsqueda dentro de la página**: el cuadro de entrada de la barra superior; con Enter se salta entre los textos coincidentes de la página actual, y el resaltado se implementa marcando con un script;
2. **Búsqueda en todo el sitio**: ventana emergente `<dialog>` + la UI predeterminada de Pagefind; el índice se genera en la fase `pnpm run build`.

El campo de búsqueda en la página solo aparece desde `64rem`; por debajo queda el botón global. Use Buscar en la página del navegador para el artículo actual. Si las capturas difieren, prevalece la interfaz actual.

### Pagination: tarjetas de paginación

Los datos de página anterior / siguiente los calcula Starlight en tiempo de compilación según el orden de `sidebar` (`Astro.locals.starlightRoute.pagination`); el componente solo renderiza: dos tarjetas de igual ancho, borde fino sin sombra, título en el color del theme, y las flechas diagonales ↙ / ↘ se desplazan en la dirección de navegación al pasar el cursor. Las flechas son rutas SVG en línea; si el sitio se usa en un idioma RTL, la dirección se refleja automáticamente.

---

## Puntos a tener en cuenta en el desarrollo a medida

:::caution
Sobrescribir componentes implica renunciar a las actualizaciones futuras de los componentes nativos de Starlight. Al actualizar la versión de Starlight, los props de los componentes y la estructura de `Astro.locals.starlightRoute` pueden cambiar; después de actualizar debe hacer pruebas de regresión de los componentes sobrescritos.
:::

- **Para cambiar estilos, usa primero variables CSS**: los colores, las fuentes y las dimensiones del layout están centralizados en las variables `:root` de `src/styles/custom.css`; ver [Configuración del sitio y personalización de estilos](/canvas/configuration/); la mayoría de las personalizaciones no requieren tocar los componentes;
- **Toca los componentes solo para cambiar interacciones**: al añadir botones o ajustar la estructura, obtén los textos de la interfaz con `getTranslation(key, lang)` y completa las entradas de los 10 idiomas en `i18n.ts`; los idiomas que falten mostrarán el texto en chino como fallback;
- **Verifica siempre en local después de cambiar algo**: usa `pnpm run dev` para comprobar las interacciones y `pnpm run verify` para confirmar que los tipos y la compilación pasan (los comandos locales se detallan en [Preguntas frecuentes y solución de problemas](/canvas/troubleshooting/)).

Para las operaciones de personalización concretas más habituales, consulta directamente [Recetas de personalización habituales](/canvas/recipes/).
