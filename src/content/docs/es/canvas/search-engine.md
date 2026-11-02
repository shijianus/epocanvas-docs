---
title: Búsqueda de texto completo y atajos de teclado
description: "Instrucciones de uso de la búsqueda de doble modo de EpoCanvas Docs: búsqueda dentro de la página desde la barra superior y ventana de búsqueda de todo el sitio con Ctrl+K, además del mecanismo de índice estático local."
---

**EpoCanvas Docs** ofrece búsqueda en la página y en todo el sitio. Desde `64rem` de ancho se muestra el campo en la barra superior; por debajo de `64rem` solo aparece el botón de búsqueda global. Esta usa el índice estático de Pagefind, sin backend de búsqueda.

---

## ¿Cuándo usar cada tipo de búsqueda?

| Escenario | Cuál usar | Cómo se hace |
| :--- | :--- | :--- |
| El texto está en **el artículo actual** | Búsqueda en la página | Campo superior desde `64rem`; en pantallas estrechas, Buscar en la página del navegador |
| No sabe **en qué artículo** está | Búsqueda global | Botón superior o `Ctrl + K` (`Cmd + K` en Mac) |

---

## Búsqueda en la página: cuadro de búsqueda de la barra superior

Estas instrucciones se aplican desde `64rem` de ancho. Escriba en el campo superior. Por debajo, el campo, el contador y los controles quedan ocultos; solo permanece la lupa que abre la búsqueda global. Para el artículo actual, use Buscar en la página del navegador.

![Diagrama anotado de la búsqueda en la página desde la barra superior: ① campo de entrada ② contador de coincidencias ③ salto anterior/siguiente ④ borrar ⑤ resaltado en la página](/images/canvas/ui-inpage-search.png)

*Figura: captura existente como referencia. El contador y los botones anterior/siguiente y borrar aparecen ahora debajo del campo, no dentro, y se ocultan en pantallas estrechas. Si la posición, los números o el diseño difieren, prevalece la interfaz real.*

### Introducir la palabra clave

Escriba palabras o código como `pnpm` y `astro.config.mjs`. Se resaltan las coincidencias visibles del cuerpo y se salta a la primera. La navegación y el contenido oculto no se incluyen.

### Saltar entre los resultados

- Con el campo enfocado, <kbd>Enter</kbd> o el botón de flecha abajo: siguiente coincidencia;
- Con el campo enfocado, <kbd>Shift + Enter</kbd> o el botón de flecha arriba: coincidencia anterior;
- Debajo del campo aparece el contador `N/M` (por ejemplo `3/9`): coincidencia actual y total.

### Borrar la búsqueda y restaurar la página

Con el foco en el campo, pulse <kbd>Esc</kbd>, o haga clic en `×`, para borrar la consulta y el resaltado.

---

## Búsqueda global: ventana Ctrl+K

Pulse <kbd>Ctrl</kbd> + <kbd>K</kbd> (<kbd>Cmd</kbd> + <kbd>K</kbd> en Mac), o el botón superior. En pantallas anchas muestra el atajo; por debajo de `64rem`, una lupa. Ambos abren la búsqueda global, no un campo de búsqueda en la página.

![Diagrama anotado de la ventana de búsqueda global: ① insignia de activación ② campo de búsqueda ③ lista de resultados ④ barra de atajos de teclado](/images/canvas/ui-search-modal.png)

*Figura: captura existente del campo y los resultados. Si los botones o las indicaciones de teclado difieren del diseño actual, siga la interfaz real y las instrucciones siguientes. Actualmente se usa Tab para enfocar enlaces; en pantallas estrechas puede ocultarse la barra inferior.*

### Introducir la palabra clave

Introduzca palabras del idioma de la página o código como `pnpm` y `astro.config.mjs`. Pagefind ordena por relevancia; una coincidencia en el título no garantiza la primera posición.

### Recorrer la lista de resultados

Los resultados se organizan por documento, con título, extracto y subresultados de secciones disponibles. Los títulos y subresultados son enlaces: el título abre el documento y la sección sigue su ancla. El título no es un control para expandir o contraer.

### Completar todo el flujo con el teclado

- <kbd>Tab</kbd> / <kbd>Shift + Tab</kbd>: mover el foco entre campos, botones y enlaces de resultados;
- Con un enlace enfocado, <kbd>Enter</kbd>: abrirlo; los enlaces de sección siguen su ancla;
- <kbd>Esc</kbd>: cierra la ventana.

La interfaz actual de Pagefind no selecciona resultados con <kbd>↑</kbd> / <kbd>↓</kbd> ni expande los pasajes al hacer clic en el título del documento.

---

## ¿Por qué la búsqueda es tan rápida?

![Diagrama comparativo del mecanismo de búsqueda de doble modo de EpoCanvas Docs: a la izquierda, búsqueda en la página desde la barra superior (recorrido del DOM con resaltado, contador en tiempo real y scroll suave); a la derecha, ventana de búsqueda global (invocación con Ctrl+K, coincidencias en segundos con el índice invertido en memoria de Pagefind WASM)](/images/canvas/docs-search-flow.svg)

*Figura: comparación del funcionamiento de la búsqueda de doble modo. A la izquierda, localización rápida de palabras clave dentro de la página desde la barra superior; a la derecha, búsqueda global basada en el índice estático de Pagefind WASM. Ambas se ejecutan por completo en el navegador.*

La búsqueda de documentación de muchos sitios web necesita enviar la petición a una base de datos en un servidor remoto, y si la red va mal no queda más que esperar con el indicador girando.

EpoCanvas Docs usa la solución de búsqueda estática local **Pagefind**:

1. **Extracción del índice durante la compilación**: al ejecutar `pnpm run build`, el sistema extrae automáticamente el contenido de cada documento y genera un conjunto de fragmentos de índice estático comprimidos.
2. **Descarga bajo demanda**: el navegador carga del sitio el código de búsqueda y los fragmentos necesarios del índice. La primera carga o la falta de caché sigue requiriendo peticiones de red.
3. **Búsqueda en el navegador**: con el índice cargado, la búsqueda y el orden se calculan localmente. La intranet también debe servir los recursos de búsqueda; no significa que la primera visita funcione sin red.

---

## Consejos de uso de la búsqueda

- **Dividir en términos**: para encontrar contenido con más precisión, introduzca varias palabras separadas por espacios (por ejemplo, `Cloudflare dominio`).
- **Use términos concretos**: títulos y secciones ayudan a acotar, pero Pagefind decide el orden por relevancia.
- **Limitación en modo de desarrollo**: el índice de todo el sitio solo se genera al compilar, y en el servidor de desarrollo iniciado con `pnpm run dev` el diálogo de `Ctrl+K` no carga el índice, por lo que la búsqueda global no está disponible. Para probarla, ejecute `pnpm run build` y luego `pnpm run preview`. La búsqueda en la página no está sujeta a esta limitación.
