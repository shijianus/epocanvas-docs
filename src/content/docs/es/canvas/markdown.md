---
title: Guía de redacción y formato en Markdown
description: "EpoCanvas Docs: dónde se guardan los archivos de documentación, requisitos de los metadatos de encabezado (Frontmatter) y lista completa de todos los formatos admitidos: comparación entre la forma de escribir y el resultado real de renderizado del Markdown básico y de la sintaxis extendida."
---

Añadir o editar documentación en **EpoCanvas Docs** es muy sencillo. Todo el cuerpo del texto se escribe con sintaxis **Markdown** estándar: en cuanto sepa escribir Markdown, podrá participar de inmediato en la redacción y el mantenimiento de la documentación.

Esta página es la lista completa de los formatos admitidos en todo el sitio: la sección 3 enumera uno por uno los formatos básicos de Markdown y la sección 4, las sintaxis extendidas que este sitio admite además. Cada punto incluye la comparación entre "cómo se escribe" y "cómo queda renderizado"; lo que usted ve ahora mismo es el resultado real del renderizado.

---

## 1. ¿Dónde se guardan los archivos de documentación?

Todos los archivos de documentación se guardan en el directorio `src/content/docs/` del proyecto:

```text
src/content/docs/
├── index.mdx          # página de inicio del sitio
├── canvas/            # capítulos principales de la documentación (chino simplificado, idioma predeterminado)
│   ├── index.md       # descripción del producto
│   ├── deployment.md  # inicio rápido
│   ├── layout.md      # layout de la página
│   ├── ...            # otros documentos
└── en/ ja/ ...        # traducciones a los otros 9 idiomas, con una estructura de directorios idéntica a la versión china
```

- **Requisitos del nombre de archivo**: use letras minúsculas y guiones medios (por ejemplo, `quickstart-guide.md`); no incluya chino ni espacios. El nombre del archivo determina la ruta de acceso: `canvas/deployment.md` corresponde a `/canvas/deployment/`.
- **Extensión**: normalmente basta con un archivo `.md` de texto plano; si necesita incrustar componentes interactivos en el artículo (como la cuadrícula de tarjetas de la página de inicio), use el formato `.mdx`.
- **Registro en la barra lateral**: tras crear un archivo, hay que registrarlo en el array `sidebar` de `astro.config.mjs`; de lo contrario, no aparecerá en el índice de la izquierda.
- **Traducciones a otros idiomas**: las traducciones se guardan en el directorio `src/content/docs/<idioma>/`, con una estructura de subdirectorios idéntica a la de la versión china (por ejemplo, `en/canvas/deployment.md` corresponde al inicio rápido en inglés); las páginas que aún no tienen traducción muestran automáticamente el contenido en chino como fallback.

---

## 2. ¿Cómo se escribe el encabezado de metadatos (Frontmatter)?

Al principio de cada documento Markdown debe incluirse un bloque de metadatos YAML envuelto en tres guiones `---`:

```yaml
---
title: Inicio rápido (en marcha en 3 minutos)
description: Guía de preparación del entorno local, instalación de dependencias y arranque del servicio de EpoCanvas Docs.
---
```

### Descripción de los campos

| Nombre del campo | ¿Es obligatorio? | Función |
| :--- | :--- | :--- |
| `title` | **Obligatorio** | Título principal del artículo. Se renderiza como el gran título de la parte superior de la página y sirve de título para la pestaña del navegador. |
| `description` | Recomendado | Resumen breve del artículo. Se usa como texto descriptivo en los resultados de búsqueda del navegador y en las tarjetas al compartir en redes sociales. |
| `template` | Solo la página de inicio | Cuando se establece en `splash`, se usa la plantilla de página de inicio sin barra lateral. |

:::tip
Si al escribir un documento olvida el `title`, durante la compilación Astro mostrará un error claro en la terminal indicando el nombre del archivo; basta con añadirlo siguiendo el aviso.
:::

---

## 3. Vista completa de los formatos básicos de Markdown

Este sitio renderiza con Markdown estándar más las extensiones GFM; todos los formatos siguientes están admitidos. Vea primero el resumen y luego, uno por uno, la comparación entre la forma de escribir y el resultado renderizado:

| Formato | Escritura rápida | Uso |
| :--- | :--- | :--- |
| Títulos | `## Título de sección` | Organizan la estructura de capítulos; se recogen automáticamente en el índice de la página de la derecha |
| Párrafos y saltos de línea | Línea en blanco para separar párrafos | Unidad básica del cuerpo del texto |
| Negrita / cursiva / tachado | `**negrita**` `*cursiva*` `~~tachado~~` | Resaltar el texto importante |
| Código en línea | `` `comando` `` | Marcar comandos, nombres de archivo, atajos de teclado |
| Teclas | `<kbd>Ctrl</kbd>` | Identificar teclas con estilo de tecla física |
| Listas sin ordenar / ordenadas | `- elemento` / `1. elemento` | Enumerar contenidos paralelos o por pasos |
| Listas de tareas | `- [x] completado` | Listas de comprobación con casillas |
| Bloques de cita | `> texto citado` | Citar texto original y añadir notas al margen |
| Bloques de código | Rodeados con tres acentos graves | Código multilínea, con resaltado y botón de copiar |
| Tablas | Columnas separadas por barras verticales | Comparación de parámetros, listado de datos |
| Enlaces | `[texto](dirección)` | Saltar a otra página del sitio o a un sitio externo |
| Imágenes | `![descripción](ruta)` | Insertar capturas de pantalla y diagramas de arquitectura |
| Líneas divisorias | `---` | Separar grandes bloques de contenido |

### 3.1 Niveles de título

En el cuerpo del texto **no escriba títulos de primer nivel (`#`)**: el `title` del Frontmatter ya se renderiza automáticamente como el gran título de la página, y añadir otro `#` en el cuerpo haría que la página tuviera dos grandes títulos. Las secciones empiezan a partir del título de segundo nivel (`##`):

```markdown
## Título de segundo nivel (capítulo)

### Subtítulo de tercer nivel (sección)
```

**Efecto renderizado**: esta misma página que está leyendo es un ejemplo listo para usar: "3. Vista completa de los formatos básicos de Markdown" es un título de segundo nivel y esta sección, "3.1 Niveles de título", es un título de tercer nivel; ambos aparecen ya en el "índice de la página" de la derecha. Los títulos de cuarto nivel (`####`) solo reciben estilo de cuerpo del texto y ya no entran en el índice, de modo que sirven para las secciones menores que no quiera recoger en el índice.

### 3.2 Párrafos y saltos de línea

Markdown separa los párrafos con líneas en blanco; es el punto donde los principiantes tropiezan con más facilidad:

```markdown
Este es el primer párrafo: entre las dos frases solo se pulsó un Enter,
así que tras el renderizado siguen dentro del mismo párrafo.

Esta línea está separada de la anterior por una línea en blanco; tras el renderizado formará un párrafo nuevo.

Esta línea termina con una barra invertida\
de modo que la línea siguiente empieza de verdad en una línea nueva.
```

**Efecto renderizado:**

Este es el primer párrafo: entre las dos frases solo se pulsó un Enter,
así que tras el renderizado siguen dentro del mismo párrafo.

Esta línea está separada de la anterior por una línea en blanco; tras el renderizado formará un párrafo nuevo.

Esta línea termina con una barra invertida\
de modo que la línea siguiente empieza de verdad en una línea nueva.

Resumen de las reglas: **un solo Enter = cambio de línea solo en el código fuente, sin dividir el párrafo**; para empezar un párrafo nuevo, deje una línea en blanco; para forzar un salto de línea dentro del párrafo, use una barra invertida al final de la línea o dos espacios al final de la línea.

### 3.3 Énfasis de texto y estilos en línea

```markdown
Esto es **negrita**, esto es *cursiva*, esto es ***negrita cursiva***, esto es ~~tachado~~.

Para marcar comandos y nombres de archivo se usa el código en línea: ejecute `pnpm run dev` para abrir el servicio de desarrollo.

Las teclas se marcan con etiquetas HTML: <kbd>Ctrl</kbd> + <kbd>K</kbd> abre la búsqueda en todo el sitio.
```

**Efecto renderizado:**

Esto es **negrita**, esto es *cursiva*, esto es ***negrita cursiva***, esto es ~~tachado~~.

Para marcar comandos y nombres de archivo se usa el código en línea: ejecute `pnpm run dev` para abrir el servicio de desarrollo.

Las teclas se marcan con etiquetas HTML: <kbd>Ctrl</kbd> + <kbd>K</kbd> abre la búsqueda en todo el sitio.

### 3.4 Listas y listas de tareas

```markdown
Lista sin ordenar; los subelementos se indentan con dos espacios:
- Función principal uno
- Función principal dos
  - Subfunción de la dos
  - Otra subfunción de la dos

Lista ordenada:
1. Paso 1: instalar Node.js
2. Paso 2: clonar el repositorio de código
3. Paso 3: iniciar el servicio de desarrollo

Lista de tareas:
- [x] Resaltado de sintaxis admitido
- [x] Copia con un clic admitida
- [ ] Tarea pendiente
```

**Efecto renderizado:**

Lista sin ordenar; los subelementos se indentan con dos espacios:

- Función principal uno
- Función principal dos
  - Subfunción de la dos
  - Otra subfunción de la dos

Lista ordenada:

1. Paso 1: instalar Node.js
2. Paso 2: clonar el repositorio de código
3. Paso 3: iniciar el servicio de desarrollo

Lista de tareas:

- [x] Resaltado de sintaxis admitido
- [x] Copia con un clic admitida
- [ ] Tarea pendiente

### 3.5 Bloques de cita

```markdown
> Esto es una cita. Es un buen lugar para extractos del original, aclaraciones de contexto o notas al margen.
> Varias líneas seguidas se escriben dentro del mismo bloque de cita.

> > Dentro de una cita se puede anidar otra cita.

> Una cita también admite listas:
>
> - Primer punto
> - Segundo punto
```

**Efecto renderizado:**

> Esto es una cita. Es un buen lugar para extractos del original, aclaraciones de contexto o notas al margen.
> Varias líneas seguidas se escriben dentro del mismo bloque de cita.

> > Dentro de una cita se puede anidar otra cita.

> Una cita también admite listas:
>
> - Primer punto
> - Segundo punto

:::note
El bloque de cita es solo un estilo sencillo y **no puede sustituir a los bloques de aviso (asides)**. Cuando necesite un aviso llamativo en color, use la sintaxis de bloques de aviso de la sección 4.1.
:::

### 3.6 Bloques de código

Rodee el contenido con tres acentos graves e indique el lenguaje justo después del primer grupo de acentos graves para obtener resaltado de sintaxis; cada bloque de código incorpora a su derecha un botón de copiar con un clic:

````markdown
```js
export function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
```
````

**Efecto renderizado:**

```js
export function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
```

El identificador de lenguaje determina el esquema de resaltado; se admiten los habituales `js`, `ts`, `bash`, `json`, `yaml`, `html`, `css`, `python`, entre otros. Los lenguajes de terminal como `bash` se renderizan con un borde oscuro de estilo terminal:

```bash
pnpm run build
```

Los usos avanzados de los bloques de código, como el título con nombre de archivo o el resaltado de líneas concretas, se describen en la sección 4.2.

### 3.7 Tablas

En la fila de guiones bajo el encabezado, los dos puntos controlan la alineación (dos puntos a la izquierda: alineado a la izquierda; a ambos lados: centrado; a la derecha: alineado a la derecha):

```markdown
| Comando | Parámetro | Descripción |
| :--- | :---: | ---: |
| `astro dev` | `--host` | Ejemplo alineado a la izquierda |
| `astro build` | ninguno | Ejemplo centrado |
| `astro preview` | `--port` | Ejemplo alineado a la derecha |
```

**Efecto renderizado:**

| Comando | Parámetro | Descripción |
| :--- | :---: | ---: |
| `astro dev` | `--host` | Ejemplo alineado a la izquierda |
| `astro build` | ninguno | Ejemplo centrado |
| `astro preview` | `--port` | Ejemplo alineado a la derecha |

:::tip
Si el contenido de una tabla es demasiado ancho, no hace falta hacer nada: el sitio añade automáticamente una barra de desplazamiento horizontal a las tablas, de modo que se pueden leer por completo incluso en el móvil.
:::

### 3.8 Enlaces

```markdown
Enlace interno: [Inicio rápido](/canvas/deployment/)

Enlace externo: [Sitio web oficial de Astro](https://astro.build)

Ancla de esta página: [Saltar a la sección "Tablas"](#37-tablas)

Enlace automático: <https://github.com/shijianus/epocanvas-docs>
```

**Efecto renderizado:**

Enlace interno: [Inicio rápido](/canvas/deployment/)

Enlace externo: [Sitio web oficial de Astro](https://astro.build)

Ancla de esta página: [Saltar a la sección "Tablas"](#37-tablas)

Enlace automático: <https://github.com/shijianus/epocanvas-docs>

Convenciones de escritura:

- Los **enlaces internos** usan la ruta completa, empezando y terminando por `/` (por ejemplo, `/canvas/deployment/`); no escriba rutas relativas;
- El **ancla** es el ID generado a partir del texto del título; en los títulos en chino, el ancla es el propio texto chino (quitando la puntuación y sustituyendo los espacios por guiones); haciendo clic en la dirección de la barra de direcciones del navegador se copia el enlace con el ancla incluido;
- El texto del enlace debe dejar claro el destino; no escriba "haga clic aquí".

### 3.9 Imágenes y pies de foto

Guarde todos los recursos de imagen que necesite la documentación en el directorio `public/images/canvas/` y referéncielos con rutas absolutas que empiecen por `/`:

```markdown
![Aspecto real de la página de inicio rápido en el servidor de desarrollo local](/images/canvas/ui-quickstart.png)

*Figura: el texto en cursiva de la línea inmediatamente inferior a la imagen se muestra como pie de foto.*
```

**Efecto renderizado:**

![Aspecto real de la página de inicio rápido en el servidor de desarrollo local](/images/canvas/ui-quickstart.png)

*Figura: aspecto real de la página de inicio rápido; se incluye aquí solo como demostración.*

**Normas para las imágenes**:

- **Diagramas de arquitectura y de flujo**: guárdelos como vectoriales `.svg`, que no pierden nitidez al ampliarlos en móviles ni en pantallas de alta densidad. Los diagramas de arquitectura de este sitio están en `public/images/canvas/docs-*.svg`.
- **Capturas de pantalla de la interfaz**: guárdelas como `.png` comprimidas, con un ancho de unos 1440 píxeles; no suba directamente originales de varias decenas de MB.
- **La descripción es obligatoria**: el texto dentro de `![ ]` se renderiza como texto alternativo de la imagen; describa con cuidado el contenido de la imagen y no lo deje vacío.

Tras insertar una imagen, **compruebe siempre el resultado renderizado en el navegador** y confirme que la ruta es correcta y que la imagen se ve bien antes de enviar los cambios.

### 3.10 Líneas divisorias

Tres guiones o más en una línea propia se renderizan como línea divisoria, y se usan para separar grandes bloques de contenido:

```markdown
Aquí termina el contenido anterior.

---

A continuación empieza un tema nuevo.
```

**Efecto renderizado:**

Aquí termina el contenido anterior.

---

A continuación empieza un tema nuevo.

:::caution
Encima de la línea divisoria debe quedar siempre una línea en blanco. Un `---` pegado justo debajo de una línea de texto se interpreta como "otra forma de escribir un título" y convierte la línea anterior en un gran título.
:::

---

## 4. Formatos extendidos: sintaxis adicional de este sitio

Los siguientes formatos son sintaxis extendidas que este sitio admite además del Markdown estándar, y las proporciona el motor de renderizado (bloques de aviso (asides) de Starlight y Expressive Code).

### 4.1 Los cuatro bloques de aviso (asides) en color

Los bloques de aviso (asides) usan la sintaxis de tres dos puntos: empiezan con `:::tipo` y terminan con `:::` en una línea aparte. Hay cuatro tipos, cada uno con su color y su icono:

:::note
**note (aclaración)**: conocimientos de fondo, detalles de diseño, dependencias previas.
:::

:::tip
**tip (consejo práctico)**: trucos para ganar eficiencia y buenas prácticas.
:::

:::caution
**caution (precaución)**: operaciones propensas a errores y posibles problemas de compatibilidad.
:::

:::danger
**danger (aviso de riesgo alto)**: operaciones irreversibles, como la pérdida de datos o sobrescribir el entorno de producción.
:::

Añadiendo corchetes después del tipo se puede personalizar el título:

````markdown
:::tip[Instalación más rápida]
Instalar las dependencias con pnpm es mucho más rápido que con npm:

```bash
npm install -g pnpm
```
:::
````

**Efecto renderizado:**

:::tip[Instalación más rápida]
Instalar las dependencias con pnpm es mucho más rápido que con npm:

```bash
npm install -g pnpm
```
:::

Dentro de un bloque de aviso se puede seguir usando cualquier formato: listas, bloques de código, tablas, etc. Encontrará más ejemplos en [Avisos, bloques de código y diagramas de ejemplo](/canvas/syntax/).

### 4.2 Título con nombre de archivo y resaltado de líneas en los bloques de código

Escriba `title="ruta del archivo"` en la primera línea del cercado de código para mostrar la barra de título, y use `{números de línea}` para resaltar las líneas clave; separe varios números de línea con comas:

````markdown
```typescript title="src/config/site.ts" {2,4}
export const siteConfig = {
  name: 'EpoCanvas Docs', // ← línea resaltada
  version: '1.0.0',
  locale: 'zh-CN',        // ← línea resaltada
};
```
````

**Efecto renderizado:**

```typescript title="src/config/site.ts" {2,4}
export const siteConfig = {
  name: 'EpoCanvas Docs',
  version: '1.0.0',
  locale: 'zh-CN',
};
```

### 4.3 diff: comparación de cambios

Use el lenguaje `diff` para mostrar cambios de configuración: las líneas que empiezan por `-` se muestran como eliminadas y las que empiezan por `+` como añadidas:

````markdown
```diff
  export default defineConfig({
-   site: 'http://localhost:3000',
+   site: 'https://docs.epocanvas.com',
  });
```
````

**Efecto renderizado:**

```diff
  export default defineConfig({
-   site: 'http://localhost:3000',
+   site: 'https://docs.epocanvas.com',
  });
```

### 4.4 Notas al pie

Cuando necesite indicar la fuente de un dato o añadir una aclaración, use la sintaxis de notas al pie de GFM:

````markdown
El índice de búsqueda en todo el sitio lo genera Pagefind durante la compilación[^pf].

[^pf]: [Documentación oficial de Pagefind](https://pagefind.app/) — biblioteca de búsqueda local para sitios estáticos.
````

**Efecto renderizado:** en el cuerpo del texto aparece una marca de salto en superíndice con número[^md-page]; al hacer clic, se salta suavemente a la entrada de nota correspondiente al pie de la página.

[^md-page]: Esta es la nota al pie propiamente dicha, renderizada al pie de esta página: escriba el contenido de la nota donde quiera dentro del texto, que siempre se recoge y se muestra al final de la página.

### 4.5 Sintaxis no admitida y escrituras propensas a errores de un vistazo

Estas formas de escribir son habituales en otras plataformas, pero en este sitio **no funcionan** o se comportan de forma distinta a la esperada; evítelas directamente al redactar la documentación:

| Escritura propensa a errores | Comportamiento real | Alternativa correcta |
| :--- | :--- | :--- |
| Cercado <code>```mermaid</code> | Muestra el código fuente como un bloque de código normal, sin generar el gráfico | Exporte el SVG en mermaid.live e insértelo como imagen |
| Sintaxis de aviso de GitHub `> [!NOTE]` | Se renderiza como un bloque de cita normal | Reescribirlo como `:::note` |
| `:::warning` / `:::important` | Se renderiza en silencio como un párrafo normal, sin estilo de bloque de aviso | Reescribirlo como `:::caution` |
| Escribir un título de primer nivel `#` en el cuerpo | La página acaba con dos grandes títulos | Elimine el `#` y empiece el cuerpo por `##` |
| Un solo Enter para saltar de línea | Las dos líneas se unen en una | Separe los párrafos con una línea en blanco, o añada una barra invertida al final de la línea |

---

## 5. Para seguir avanzando

- ¿Quiere conocer el pipeline completo de renderizado de Markdown, del archivo a la página, y todas sus convenciones? Lea **[Reglas de renderizado en detalle](/canvas/rendering/)**.
- ¿Quiere ver los bloques de aviso, los bloques de código, las notas al pie y demás sintaxis reunidas en una "página de ejemplo viva"? Lea **[Avisos, bloques de código y diagramas de ejemplo](/canvas/syntax/)**.
