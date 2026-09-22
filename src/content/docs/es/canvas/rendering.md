---
title: Reglas de renderizado en detalle
description: "Reglas completas de renderizado de EpoCanvas Docs: flujo de la canalización desde el archivo Markdown hasta la página final, y todas las convenciones sobre Frontmatter, encabezados, bloques de aviso, bloques de código, imágenes y enlaces."
---

Esta página explica en detalle las reglas de renderizado de **EpoCanvas Docs**: qué etapas atraviesa un archivo Markdown, a qué efecto se renderiza cada sintaxis y qué sintaxis no está admitida. Leerla de principio a fin antes de escribir documentación evita la gran mayoría de los problemas de maquetación.

---

## Canalización de renderizado: del archivo .md a la página en línea

![Diagrama de la canalización de renderizado de Markdown de EpoCanvas Docs: flujo completo de 5 pasos, desde el escaneo del código fuente Markdown, el análisis del AST con GFM y el resaltado de código, hasta el ensamblado del diseño con 7 componentes personalizados y la generación de HTML estático y del índice de Pagefind](/images/canvas/docs-render-pipeline.svg)

*Figura: flujo de 5 pasos de la canalización de renderizado de Markdown. Los pasos se ejecutan en orden durante la compilación; el resultado de la compilación son archivos puramente estáticos, sin coste de framework en tiempo de ejecución en el cliente.*

Un archivo Markdown, desde que se guarda hasta que el lector lo ve, pasa por las cinco etapas siguientes:

1. **Recolección de contenido**: al arrancar o compilar, Astro escanea el directorio `src/content/docs/`, registra cada archivo `.md` / `.mdx` como entrada de contenido y valida el Frontmatter (si falta `title`, se produce directamente un error).
2. **Compilación de Markdown**: el cuerpo lo convierte a HTML el compilador de Markdown (con las extensiones GFM). Las sintaxis extendidas como tablas, listas de tareas o tachado surten efecto en este paso.
3. **Resaltado de bloques de código**: todos los bloques de código los procesa Expressive Code, que genera bloques con resaltado de sintaxis, barra de título, números de línea y botón de copiar.
4. **Aplicación del diseño del sitio**: el HTML compilado se inserta en el esqueleto de página de Starlight; la barra superior, el índice izquierdo y el índice de la página a la derecha los renderizan los componentes personalizados de `src/components/starlight/`.
5. **Generación del índice y de los archivos estáticos**: al ejecutar `pnpm run build`, Pagefind recorre todas las páginas generadas y extrae el índice de texto completo; el HTML puro del directorio `dist/` se puede alojar directamente en cualquier servidor estático.

:::note
Todo este flujo se completa de una sola vez durante la compilación. Una vez en línea el sitio, no interviene ningún servidor: todas las interacciones (búsqueda, cambio de theme, cambio de idioma) ocurren en el navegador.
:::

---

## Reglas del Frontmatter

- `title` es **obligatorio**; si falta, la compilación falla con el error `InvalidInputError`;
- Se recomienda rellenar `description`; se muestra en los resultados de los buscadores y en las tarjetas de compartir;
- El Frontmatter debe ser un bloque YAML válido al comienzo del archivo; las tres rayas no se pueden omitir.

---

## Reglas de los encabezados

| Regla | Explicación |
| :--- | :--- |
| No escribir un encabezado de nivel 1 `#` en el cuerpo | El `title` del Frontmatter ya se renderiza como título principal de la página; escribir además un `#` en el cuerpo produce dos títulos principales |
| El cuerpo empieza con encabezados de nivel 2 `##` | Los `##` y `###` entran automáticamente en el "índice de esta página" de la derecha |
| `####` y niveles inferiores no entran en el índice | Los niveles más profundos se renderizan solo como estilos del cuerpo |
| El texto del encabezado genera anclas | El ancla de un encabezado en chino es el propio texto chino, como `#标题规则` |

---

## Reglas de los bloques de aviso (Asides)

Los bloques de aviso usan la sintaxis de tres dos puntos de Starlight y admiten 4 tipos:

```markdown
:::note
Texto de un aviso aclaratorio.
:::

:::tip
Truco para trabajar con más eficiencia.
:::

:::caution
Riesgo a tener en cuenta u operación propensa a errores.
:::

:::danger
Advertencia de alto riesgo por posible pérdida de datos u operaciones irreversibles.
:::
```

También se puede añadir un título personalizado tras el tipo: `:::tip[Acelerar la instalación]`.

:::caution
Tenga en cuenta dos confusiones frecuentes:

- La sintaxis de cita de estilo GitHub `> [!TIP]` **no está admitida**; al escribirla, `[!TIP]` aparece como texto normal dentro del bloque de cita;
- `:::important` y `:::warning` **no son tipos válidos**: no dan error, pero se renderizan silenciosamente como un párrafo normal.

Al migrar documentación antigua: `> [!NOTE]` → `:::note`, `> [!WARNING]` → `:::caution`, `> [!CAUTION]` → `:::danger`.
:::

![Efecto real de renderizado de los cuatro bloques de aviso con color](/images/canvas/ui-markup-examples.png)

*Figura: aspecto real de los cuatro bloques de aviso escritos con la sintaxis anterior, tomado de la página [Avisos, bloques de código y diagramas de ejemplo](/canvas/syntax/).*

---

## Reglas de los bloques de código

Los bloques de código (tres acentos graves) los renderiza Expressive Code, que admite las siguientes anotaciones (escritas tras los acentos graves de la primera línea):

| Anotación | Función | Ejemplo |
| :--- | :--- | :--- |
| Identificador de lenguaje | Determina el esquema de resaltado de sintaxis | <code>```ts</code> |
| `title="..."` | Muestra una barra de título con el nombre del archivo | <code>```ts title="src/config/site.ts"</code> |
| `{2}` / `{2-4}` | Resalta las líneas indicadas | <code>```ts {2}</code> |
| `lang="diff"` o `diff` | Muestra líneas añadidas y eliminadas en rojo y verde | <code>```diff</code> |
| Lenguajes de terminal como `bash` / `sh` | Se renderizan con un borde de estilo terminal | <code>```bash</code> |

Todos los bloques de código incluyen automáticamente un botón de copiar con un clic; el texto del código se incluye en el índice de búsqueda de Pagefind, de modo que los lectores pueden encontrar directamente palabras clave presentes en el código.

---

## Reglas de las imágenes

- Las imágenes se guardan de forma unificada en `public/images/canvas/` y se referencian con rutas absolutas: `![descripción](/images/canvas/ui-docs-reading.png)`;
- Los diagramas de arquitectura y de flujo usan formato vectorial `.svg`; las capturas de pantalla de la interfaz usan `.png` comprimidas;
- El texto descriptivo es obligatorio: es el texto alternativo cuando la imagen no carga y la base de la accesibilidad;
- **La versión actual no incorpora renderizado de diagramas Mermaid**: un bloque ` ```mermaid ` solo se muestra como un bloque de código normal con el código fuente. Cuando necesite un diagrama de flujo, expórtelo primero como SVG desde una herramienta como mermaid.live e insértelo como imagen.

---

## Reglas de los enlaces

- **Enlaces internos**: se usan rutas completas que empiezan y terminan en `/`, como `/canvas/deployment/`. Si cambia la ruta de un documento, la ruta antigua debe registrarse en la tabla `redirects` de `astro.config.mjs`;
- **Enlaces con ancla**: `/canvas/rendering/#reglas-de-los-bloques-de-código` lleva directamente a una sección de esta página;
- **Enlaces externos**: basta con escribir la URL completa; en el cuerpo se muestran en el color del theme.

---

## Otros comportamientos de renderizado

| Sintaxis | Resultado renderizado |
| :--- | :--- |
| `**negrita**`, `*cursiva*`, `~~tachado~~` | Los estilos de texto correspondientes |
| `código en línea` | Cápsula de monoespaciada en el color del theme |
| Escritura <kbd>Ctrl</kbd>+<kbd>K</kbd> | Tecla representada con estilo de tecla física |
| Tablas GFM | Tablas de datos con bordes y resaltado al pasar el cursor |
| Listas de tareas `- [x]` | Casillas de verificación visuales (en estado deshabilitado) |
| Notas al pie `[^nombre]` | Superíndice numerado en el cuerpo + lista de notas al pie al final de la página, con salto de ida y vuelta al hacer clic |
| Bloque de cita de Markdown `>` | Línea vertical en el color del theme a la izquierda + fondo claro |
| Separador `---` | Línea divisoria fina a lo ancho de la zona del cuerpo |

:::tip
Cuando no esté seguro del efecto de renderizado de una sintaxis, la forma más fiable de comprobarlo es: arrancar `pnpm run dev`, escribir un pequeño fragmento en un documento de prueba y verificarlo con sus propios ojos en el navegador antes de usarlo de forma definitiva.
:::
