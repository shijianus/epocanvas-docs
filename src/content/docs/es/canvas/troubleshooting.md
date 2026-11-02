---
title: Preguntas frecuentes y solución de problemas
description: Lista de comprobación de EpoCanvas Docs para errores al ejecutar en local, documentos que no se muestran, renderizado anómalo de los bloques de aviso, fallos de búsqueda y despliegue en Cloudflare Pages.
---

Si encuentra un problema al usar, redactar o desplegar **EpoCanvas Docs**, busque aquí el caso correspondiente. Los problemas siguen el orden "arranque local → redacción de documentación → búsqueda → despliegue" e incluyen causas habituales y pasos de diagnóstico. Contrástelos con el error real y los resultados de las comprobaciones; esta página no es un registro de pruebas satisfactorias de todas las soluciones en la candidata actual.

---

## 1. Problemas de arranque local e instalación

### Q1: Al ejecutar `pnpm run dev` se indica que el puerto 4321 está ocupado

- **Causa**: el servidor de desarrollo de una ejecución anterior no se cerró por completo, u otro programa ocupa el puerto 4321.
- **Solución**: arranque en otro puerto:

  ```bash
  pnpm run dev --port 4322
  ```

### Q2: Aparece un error al instalar las dependencias
- **Causa**: Este sitio usa el servicio de imágenes passthrough y no optimiza imágenes en tiempo de ejecución. Revise primero el error exacto de la terminal; una causa habitual es usar una versión de Node.js o pnpm fuera de la base del proyecto.
- **Solución**: Use Node.js 22.x ≥ 22.23.4 / 24.x ≥ 24.12.0 y pnpm 10.34.5, conserve `pnpm-lock.yaml` y haga una instalación reproducible:
  ```bash
  pnpm install --frozen-lockfile
  ```

### Q3: Al ejecutar `pnpm install` se produce el error `packages field missing or empty`

- **Causa**: `pnpm-workspace.yaml` está vacío o con un formato incompleto; pnpm lo interpreta como archivo de configuración de workspace y lanza el error.
- **Solución**: asegúrese de que el archivo contiene el campo `packages`:

  ```yaml
  packages:
    - .
  ```

---

## 2. Problemas de redacción y renderizado de documentación

### Q4: Creé un Markdown nuevo, pero no aparece en la barra lateral izquierda

- **Causa**: el directorio de la barra lateral se declara manualmente; los archivos nuevos deben registrarse en la configuración.
- **Solución**: abra `astro.config.mjs` y añada la entrada en el grupo adecuado del array `sidebar`:

  ```javascript
  { label: 'Nueva función', link: '/canvas/new-feature/' }
  ```

### Q5: La terminal muestra el error `"title" is required`

- **Causa**: falta el `title` en la cabecera del Markdown, o los tres guiones `---` iniciales no tienen el formato correcto.
- **Solución**: revise el Frontmatter al principio del archivo:

  ```yaml
  ---
  title: Título del artículo
  description: Descripción del artículo
  ---
  ```

### Q6: La página muestra dos títulos grandes idénticos

- **Causa**: en el cuerpo del texto se volvió a escribir un encabezado de nivel 1 con `#`. El `title` del Frontmatter ya se renderiza como título grande, así que un `#` en el cuerpo lo duplica inevitablemente.
- **Solución**: elimine el encabezado `#` del cuerpo y empiece las secciones en `##`. Las reglas completas están en [Reglas de renderizado en detalle](/canvas/rendering/#reglas-de-los-encabezados).

### Q7: Escribí `> [!TIP]` pero el bloque de aviso no cambia de color y el texto se muestra tal cual

- **Causa**: la sintaxis de cita estilo GitHub `> [!TIP]` no está soportada; el compilador de Markdown no la reconoce.
- **Solución**: use la sintaxis de tres dos puntos:

  ```markdown
  :::tip
  Esta es la forma correcta de escribirlo.
  :::
  ```

### Q8: La imagen insertada se muestra rota

- **Causa**: la ruta de la imagen está mal escrita, o la imagen no se colocó en el directorio estático `public/`.
- **Solución**:
  1. Confirma que la imagen está guardada en `public/images/canvas/ui-docs-reading.png`;
  2. Al referenciarla, use una ruta absoluta que empiece por `/`: `![descripción](/images/canvas/ui-docs-reading.png)`; no escriba rutas relativas como `../public/...`.

---

## 3. Problemas de la función de búsqueda

### Q9: Al depurar con `pnpm dev` en local, la búsqueda global no encuentra el artículo recién escrito

- **Causa**: la búsqueda global depende del índice de Pagefind, que solo se genera durante `pnpm run build`; en modo de desarrollo el diálogo de `Ctrl+K` no carga el índice (se abre sin campo de búsqueda), por lo que la búsqueda global no está disponible. Es el comportamiento previsto del framework, no un fallo del sitio.
- **Solución**: compile por completo y verifique con el servidor de vista previa:

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

- **Causa**: Error 525 no basta para concluir que el certificado sigue emitiéndose. Revise la validación del dominio, el estado del certificado, los registros DNS, la configuración del proxy y los detalles del error.
- **Solución**: Compruebe la validación y el certificado en **Custom domains**, después revise DNS y el proxy y compare con el dominio predeterminado `pages.dev`. No se limite a esperar un número fijo de minutos; compruebe ambos dominios mediante solicitudes reales. Consulte el [diagnóstico de despliegue](/canvas/cloudflare/).

### Q12: Al ejecutar `pnpm run deploy` se produce el error `Project not found`

- **Causa**: el parámetro `--project-name` del comando de despliegue no coincide con el nombre del proyecto en la consola de Cloudflare; también puede ser que no haya iniciado sesión en esa máquina.
- **Solución**:
  1. Ejecute primero `npx wrangler whoami` para confirmar que la sesión está iniciada;
  2. Verifica el nombre del proyecto en la consola de Cloudflare y, si hace falta, modifica el parámetro `--project-name` en `scripts/verify-release.mjs`.

ejecute una vez `npx wrangler login` y después `pnpm run deploy`. El despliegue lo ejecuta `scripts/verify-release.mjs`, que rechaza ramas distintas de `main`, un árbol de trabajo con cambios o un HEAD que no coincida con el commit real de `origin/main` en el remoto. Ejecuta `pnpm run verify` antes de Wrangler. El nombre del proyecto está definido en este script, no en `package.json`.

---

## 5. Autoverificación local antes de confirmar cambios

Antes de enviar cambios a GitHub, ejecute la comprobación común: pruebas, comprobaciones de configuración y tipos de Astro, compilación y comprobaciones de contenido y artefactos:

```bash
pnpm run verify
```

Todas las etapas de `pnpm run verify` deben pasar y el comando debe terminar con código 0. Ver solo `0 errors` o `Complete!` no significa que la verificación completa haya terminado. CI (`build.yml`) ejecuta las mismas validaciones; el resultado visual sigue requiriendo revisión manual.
