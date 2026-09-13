---
title: Búsqueda de texto completo y atajos de teclado
description: "Instrucciones de uso de la búsqueda de doble modo de EpoCanvas Docs: búsqueda dentro de la página desde la barra superior y ventana de búsqueda de todo el sitio con Ctrl+K, además del mecanismo de índice estático local."
---

Al consultar grandes cantidades de documentación técnica, es fundamental encontrar rápidamente el elemento de configuración o el parámetro deseado. **EpoCanvas Docs** incorpora una **búsqueda de doble modo**: el cuadro de búsqueda de la barra superior localiza con rapidez dentro de la página actual, y la ventana `Ctrl+K` busca en todos los documentos del sitio. Ambas búsquedas se ejecutan por completo en el navegador, sin necesidad de ningún servicio de backend, por lo que también funcionan en sitios alojados en una intranet sin acceso a Internet.

---

## ¿Cuándo usar cada tipo de búsqueda?

| Escenario | Cuál usar | Cómo se hace |
| :--- | :--- | :--- |
| Se recuerda que el texto está en **el artículo actual** | Búsqueda en la página | Haga clic directamente en el cuadro de búsqueda de la barra superior e introduzca la palabra clave |
| No se sabe en **qué artículo** está el contenido y hay que buscar en todo el sitio | Búsqueda global | Pulse `Ctrl + K` (en Mac, `Cmd + K`) |

---

## Búsqueda en la página: cuadro de búsqueda de la barra superior

Haga clic en el cuadro de búsqueda situado en el centro superior de la página (icono de lupa) e introduzca directamente la palabra clave:

![Diagrama anotado de la búsqueda en la página desde la barra superior: ① campo de entrada ② contador de coincidencias ③ salto anterior/siguiente ④ borrar ⑤ resaltado en la página](/images/canvas/ui-inpage-search.png)

*Figura: resultado real anotado tras escribir "despliegue" en el cuadro de búsqueda de la barra superior. ① campo de entrada de la barra superior; ② contador de coincidencias (N.ª actual / total M); ③ botones de salto al anterior / siguiente; ④ botón de borrar; ⑤ todos los textos coincidentes de la página actual se resaltan automáticamente.*

### Introducir la palabra clave

Se admiten frases en chino (como "despliegue", "componente"), palabras en inglés y fragmentos de código (como `pnpm`, `astro.config.mjs`). Mientras se escribe, todos los textos coincidentes de la página actual se resaltan de inmediato con un color de fondo y la página se desplaza automáticamente a la primera coincidencia.

### Saltar entre los resultados

- Pulse <kbd>Enter</kbd> o haga clic en la flecha hacia abajo: salta a la siguiente coincidencia;
- Pulse <kbd>Shift + Enter</kbd> o haga clic en la flecha hacia arriba: vuelve a la coincidencia anterior;
- En el cuadro de búsqueda se muestra en tiempo real el contador de progreso `N.ª actual / total M`, para saber en todo momento por dónde se va.

### Borrar la búsqueda y restaurar la página

Pulse <kbd>Esc</kbd> o haga clic en el botón `×` para eliminar todos los resaltados y devolver la página a su estado original.

---

## Búsqueda global: ventana Ctrl+K

Esté donde esté, pulse el atajo de teclado <kbd>Ctrl</kbd> + <kbd>K</kbd> (en Mac, <kbd>Cmd</kbd> + <kbd>K</kbd>), o haga clic en la insignia `Ctrl K` a la derecha del cuadro de búsqueda: se abrirá en el centro de la pantalla la ventana de búsqueda global:

![Diagrama anotado de la ventana de búsqueda global: ① insignia de activación ② campo de búsqueda ③ lista de resultados ④ barra de atajos de teclado](/images/canvas/ui-search-modal.png)

*Figura: resultado real anotado tras escribir "despliegue" en la ventana. ① insignia `Ctrl K` a la derecha del cuadro de búsqueda (al hacer clic también se abre la ventana); ② campo de búsqueda; ③ lista de resultados agrupada por documentos, con las coincidencias resaltadas; ④ barra inferior con los atajos de teclado.*

### Introducir la palabra clave

Se admiten frases en chino (como "despliegue", "componente"), palabras en inglés y fragmentos de código (como `pnpm`, `astro.config.mjs`). Los resultados cuyos títulos contienen la palabra clave se muestran primero.

### Recorrer la lista de resultados

Los resultados se agrupan por documento; cada entrada muestra el título del documento, la sección a la que pertenece y una vista previa del contexto que contiene la palabra clave, con el término coincidente resaltado. Al hacer clic en el título de un grupo se expanden o contraen los párrafos coincidentes de ese documento.

### Completar todo el flujo con el teclado

- <kbd>↑</kbd> <kbd>↓</kbd>: mueve la selección entre los resultados;
- <kbd>Enter</kbd>: abre el resultado seleccionado y salta al párrafo correspondiente;
- <kbd>Esc</kbd>: cierra la ventana.

En ningún momento hace falta el ratón.

---

## ¿Por qué la búsqueda es tan rápida?

![Diagrama comparativo del mecanismo de búsqueda de doble modo de EpoCanvas Docs: a la izquierda, búsqueda en la página desde la barra superior (recorrido del DOM con resaltado, contador en tiempo real y scroll suave); a la derecha, ventana de búsqueda global (invocación con Ctrl+K, coincidencias en segundos con el índice invertido en memoria de Pagefind WASM)](/images/canvas/docs-search-flow.svg)

*Figura: comparación del funcionamiento de la búsqueda de doble modo. A la izquierda, localización rápida de palabras clave dentro de la página desde la barra superior; a la derecha, búsqueda global basada en el índice estático de Pagefind WASM. Ambas se ejecutan por completo en el navegador.*

La búsqueda de documentación de muchos sitios web necesita enviar la petición a una base de datos en un servidor remoto, y si la red va mal no queda más que esperar con el indicador girando.

EpoCanvas Docs usa la solución de búsqueda estática local **Pagefind**:

1. **Extracción del índice durante la compilación**: al ejecutar `pnpm run build`, el sistema extrae automáticamente el contenido de cada documento y genera un conjunto de fragmentos de índice estático comprimidos.
2. **Descarga ligera bajo demanda**: al escribir en el cuadro de búsqueda, el navegador solo descarga los fragmentos de índice de los caracteres correspondientes (de apenas unos KB a varias decenas de KB).
3. **Coincidencia local instantánea**: la búsqueda y la ordenación se realizan por completo en el navegador, de modo que no hay retardo de red y funciona íntegramente en entornos de intranet sin acceso a Internet.

---

## Consejos de uso de la búsqueda

- **Dividir en términos**: para encontrar contenido con más precisión, introduzca varias palabras separadas por espacios (por ejemplo, `Cloudflare 域名`).
- **Priorizar los títulos**: los títulos de los documentos y de las secciones tienen el mayor peso en la ordenación; los resultados con coincidencias en el título aparecen primero.
- **Limitación en modo de desarrollo**: el servidor de desarrollo iniciado con `pnpm run dev` no reconstruye en tiempo real el índice de todo el sitio; para que un artículo recién escrito aparezca en la búsqueda global hay que ejecutar antes una vez `pnpm run build`. La búsqueda en la página no está sujeta a esta limitación.
