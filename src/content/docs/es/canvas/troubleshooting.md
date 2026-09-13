---
title: Preguntas frecuentes y solución de problemas
description: Lista de comprobación de EpoCanvas Docs para errores al ejecutar en local, documentos que no se muestran, renderizado anómalo de los bloques de aviso, fallos de búsqueda y despliegue en Cloudflare Pages.
---

Si encuentra alguna anomalía al usar, redactar o desplegar **EpoCanvas Docs**, busque primero aquí su caso. Los problemas están ordenados según la secuencia "arranque local → redacción de documentación → búsqueda → despliegue", y cada uno incluye su causa y una solución verificada.

---

## 1. Problemas de arranque local e instalación

### Q1: Al ejecutar `pnpm run dev` se indica que el puerto 4321 está ocupado

- **Causa**: el servidor de desarrollo de una ejecución anterior no se cerró por completo, u otro programa ocupa el puerto 4321.
- **Solución**: arranca en otro puerto:

  ```bash
  pnpm run dev -- --port 4322
  ```

### Q2: Al instalar las dependencias aparece un error de compilación del módulo Sharp

- **Causa**: Sharp es el módulo C++ subyacente que comprime las imágenes durante la compilación; tras cambiar la versión de Node.js, la caché antigua puede no coincidir con él.
- **Solución**: limpia las dependencias y reinstala:

  ```bash
  rm -rf node_modules pnpm-lock.yaml
  pnpm install
  ```

### Q3: Al ejecutar `pnpm install` se produce el error `packages field missing or empty`

- **Causa**: `pnpm-workspace.yaml` está vacío o con un formato incompleto; pnpm lo interpreta como archivo de configuración de workspace y lanza el error.
- **Solución**: asegúrate de que el archivo contiene el campo `packages`:

  ```yaml
  packages:
    - .
  ```

---

## 2. Problemas de redacción y renderizado de documentación

### Q4: Creé un Markdown nuevo, pero no aparece en la barra lateral izquierda

- **Causa**: el directorio de la barra lateral se declara manualmente; los archivos nuevos deben registrarse en la configuración.
- **Solución**: abre `astro.config.mjs` y añade la entrada en el grupo adecuado del array `sidebar`:

  ```javascript
  { label: '新功能说明', link: '/canvas/new-feature/' }
  ```

### Q5: La terminal muestra el error `"title" is required`

- **Causa**: falta el `title` en la cabecera del Markdown, o los tres guiones `---` iniciales no tienen el formato correcto.
- **Solución**: revisa el Frontmatter al principio del archivo:

  ```yaml
  ---
  title: Título del artículo
  description: Descripción del artículo
  ---
  ```

### Q6: La página muestra dos títulos grandes idénticos

- **Causa**: en el cuerpo del texto se volvió a escribir un encabezado de nivel 1 con `#`. El `title` del Frontmatter ya se renderiza como título grande, así que un `#` en el cuerpo lo duplica inevitablemente.
- **Solución**: elimina el encabezado `#` del cuerpo y empieza las secciones en `##`. Las reglas completas están en [Reglas de renderizado en detalle](/canvas/rendering/#reglas-de-los-encabezados).

### Q7: Escribí `> [!TIP]` pero el bloque de aviso no cambia de color y el texto se muestra tal cual

- **Causa**: la sintaxis de cita estilo GitHub `> [!TIP]` no está soportada; el compilador de Markdown no la reconoce.
- **Solución**: usa la sintaxis de tres dos puntos:

  ```markdown
  :::tip
  Esta es la forma correcta de escribirlo.
  :::
  ```

### Q8: La imagen insertada se muestra rota

- **Causa**: la ruta de la imagen está mal escrita, o la imagen no se colocó en el directorio estático `public/`.
- **Solución**:
  1. Confirma que la imagen está guardada en `public/images/canvas/your-pic.png`;
  2. Al referenciarla, usa una ruta absoluta que empiece por `/`: `![descripción](/images/canvas/your-pic.png)`; no escribas rutas relativas como `../public/...`.

---

## 3. Problemas de la función de búsqueda

### Q9: Al depurar con `pnpm dev` en local, la búsqueda global no encuentra el artículo recién escrito

- **Causa**: la ventana emergente de búsqueda en todo el sitio depende del índice de Pagefind, y el índice solo se genera durante `pnpm run build`; el servidor de desarrollo no reconstruye el índice en tiempo real para mantener la velocidad de la actualización en caliente.
- **Solución**: compila por completo y verifica con el servidor de vista previa:

  ```bash
  pnpm run build
  pnpm run preview
  ```

  La búsqueda dentro de la página de la barra superior no tiene esta limitación; al desarrollar puede usarla directamente para localizar contenido de la página actual.

### Q10: Al pulsar `Ctrl+K` no se abre la ventana de búsqueda

- **Causa**: algunos métodos de entrada, utilidades de portapapeles o programas de captura de pantalla ocupan el atajo de teclado `Ctrl+K` / `Cmd+K`.
- **Solución**: haga clic directamente en la pequeña insignia `Ctrl K` a la derecha del cuadro de búsqueda; también abre la ventana de búsqueda en todo el sitio.

---

## 4. Problemas de despliegue en Cloudflare Pages

### Q11: El dominio propio recién vinculado muestra un error de handshake SSL (Error 525)

- **Causa**: la emisión del certificado Universal SSL de Cloudflare para un dominio nuevo necesita entre 2 y 5 minutos para hacerse efectiva globalmente.
- **Solución**: espere unos minutos y haga una recarga forzada (`Ctrl+F5` / `Cmd+Shift+R`); mientras tanto, acceda primero al dominio predeterminado `<nombre-del-proyecto>.pages.dev`, que está siempre disponible.

### Q12: Al ejecutar `pnpm run deploy` se produce el error `Project not found`

- **Causa**: el parámetro `--project-name` del comando de despliegue no coincide con el nombre del proyecto en la consola de Cloudflare; también puede ser que no hayas iniciado sesión en esa máquina.
- **Solución**:
  1. Ejecuta primero `npx wrangler whoami` para confirmar que la sesión está iniciada;
  2. Verifica el nombre del proyecto en la consola de Cloudflare y, si hace falta, modifica el parámetro `--project-name` del script `deploy` en `package.json`.

---

## 5. Autoverificación local antes de confirmar cambios

Antes de hacer push a GitHub, ejecuta el siguiente comando para una autoverificación completa (comprobación de tipos + compilación total):

```bash
pnpm exec astro check && pnpm run build
```

Cuando `astro check` muestra `0 errors` y la compilación termina con `Complete!`, la documentación no tiene errores de sintaxis y puede confirmar con tranquilidad. El CI del repositorio (`build.yml`) ejecuta la misma compilación tras cada push; pasarla primero en local evita fallos del CI.
