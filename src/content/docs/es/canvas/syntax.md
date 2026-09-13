---
title: Avisos, bloques de código y diagramas de ejemplo
description: Uso real y efecto de renderizado de los 4 bloques de aviso con color de EpoCanvas Docs, títulos y resaltado de líneas en bloques de código, comparación con diff e inserción de diagramas.
---

Escribir documentación técnica de calidad no requiere solo un texto claro, sino también avisos destacados, ejemplos de código bien formateados y diagramas que se entiendan de un vistazo. Todos los ejemplos de esta página usan sintaxis realmente efectiva: el efecto que ve es el resultado del renderizado; este propio artículo es una página de ejemplos viva.

---

## 1. Los cuatro bloques de aviso con color

Los bloques de aviso usan la sintaxis de tres dos puntos: empiezan con `:::tipo`, terminan con `:::` y el contenido va en medio. El sitio se basa en Starlight y admite los cuatro tipos **note, tip, caution y danger**.

### Comparación entre sintaxis y efecto real

:::note
**note (aclaración)**: para presentar conocimientos de contexto, añadir detalles de diseño o indicar dependencias previas.
:::

:::tip
**tip (truco práctico)**: para compartir pequeños consejos o buenas prácticas que agilizan el trabajo.
:::

:::caution
**caution (advertencia)**: avisa de posibles conflictos de compatibilidad, errores latentes u operaciones que requieren especial atención.
:::

:::danger
**danger (aviso de alto riesgo)**: la alerta de máximo nivel cuando intervienen pérdida de datos, sobrescritura en producción u operaciones irreversibles.
:::

### Dentro de un bloque de aviso cabe cualquier contenido

Dentro de un bloque de aviso se pueden seguir usando listas, bloques de código, tablas y otras sintaxis:

:::tip[Acelerar la instalación]
Instalar las dependencias con pnpm es mucho más rápido que con npm:

```bash
npm install -g pnpm
```
:::

:::caution
Dos formas de escribirlo habituales pero inválidas; procure evitarlas:

- La sintaxis de cita de estilo GitHub `> [!NOTE]` no está admitida y se muestra tal cual como un bloque de cita normal;
- `:::important` y `:::warning` **no son tipos admitidos en este sitio**: no dan error, pero se renderizan silenciosamente como un párrafo normal, sin ningún estilo de bloque de aviso.

Al migrar documentación desde GitHub, reescriba `> [!NOTE]` como `:::note`, `> [!WARNING]` como `:::caution` y `> [!CAUTION]` como `:::danger`.
:::

---

## 2. Maquetación avanzada de bloques de código

### 2.1 Título con nombre de archivo y resaltado de líneas concretas

Anote `title="ruta del archivo"` en la primera línea del bloque de código y use `{n.º de línea}` para resaltar las líneas importantes:

````markdown
```typescript title="src/config/site.ts" {2}
export const siteConfig = {
  name: 'EpoCanvas Docs', // esta línea se destaca con el fondo de resaltado
  version: '1.2.0',
};
```
````

**Efecto renderizado:**

```typescript title="src/config/site.ts" {2}
export const siteConfig = {
  name: 'EpoCanvas Docs',
  version: '1.2.0',
};
```

### 2.2 Comparación de cambios de código (diff)

Para mostrar una actualización de configuración o una refactorización, el lenguaje `diff` hace los cambios visibles de un vistazo: las líneas que empiezan por `-` se muestran como eliminadas y las que empiezan por `+` como añadidas:

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

### 2.3 Comandos de terminal

Los lenguajes de terminal como `bash`, `sh` o `powershell` se renderizan con un borde oscuro de estilo terminal:

```bash
pnpm run build
```

---

## 3. Cómo insertar diagramas

La versión actual **no incorpora de serie el renderizado de diagramas textuales como Mermaid**. Si escribe directamente un bloque ` ```mermaid `, solo se mostrará el código fuente como un bloque de código normal; no se generará ningún gráfico.

La práctica recomendada es: escribir el diagrama y exportarlo como **imagen vectorial SVG** en una herramienta como [mermaid.live](https://mermaid.live), guardarlo en `public/images/canvas/` e insertarlo con la sintaxis de imágenes. Así se han elaborado el diagrama de arquitectura y el diagrama de flujo del cambio de idioma de este sitio:

![Diagrama de la arquitectura del sistema](/images/canvas/docs-architecture.svg)

*Figura: diagrama de arquitectura insertado como imagen SVG, que se escala sin perder nitidez.*

Si de verdad necesita que el código fuente de Mermaid se renderice directamente como gráfico, hay que incorporar al proyecto un plugin de renderizado adicional (como `rehype-mermaid`); eso entra en el ámbito de la personalización, así que valore su coste de mantenimiento antes de añadirla.

---

## 4. Otras maquetaciones útiles

- Código en línea: `pnpm run dev`, se renderiza en monoespaciada con el color del theme;
- Teclas del teclado: <kbd>Ctrl</kbd> + <kbd>K</kbd>, se renderizan con estilo de tecla;
- Lista de tareas:

```markdown
- [x] Resaltado de sintaxis admitido
- [x] Copia con un clic admitida
- [ ] Renderizado de Mermaid integrado (planificado)
```

Se renderiza como elementos de lista con su estado de casilla marcada.

### 4.1 Notas al pie

Cuando necesite indicar fuentes o añadir aclaraciones, puede usar la sintaxis de notas al pie de GFM:

````markdown
El índice estático lo genera Pagefind durante la compilación[^pagefind].

[^pagefind]: [Documentación oficial de Pagefind](https://pagefind.app/) — biblioteca de búsqueda local para sitios estáticos.
````

**Efecto renderizado:** al final del cuerpo aparece un superíndice numerado que sirve de marcador de salto[^pagefind-demo]; al hacer clic, la página se desplaza suavemente hasta la lista de notas al pie del final.

[^pagefind-demo]: Esta es la nota al pie real renderizada al final de esta página.

Usar con soltura los bloques de aviso, las anotaciones de código y los diagramas mejora notablemente la comodidad de lectura y el aire profesional de la documentación técnica. Para el conjunto de las convenciones de sintaxis, lea **[Reglas de renderizado en detalle](/canvas/rendering/)**.
