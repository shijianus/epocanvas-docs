---
title: Gestión de versiones y flujos automatizados
description: Convención de numeración de versiones de EpoCanvas Docs, pasos estándar para publicar una versión nueva y la canalización de publicación automática con GitHub Actions.
---

Para que el lector sepa con claridad "a qué versión del producto corresponde la documentación actual" y para que el equipo pueda seguir el historial de cambios de forma ordenada, **EpoCanvas Docs** adopta números de versión semánticos y un flujo de publicación fijo.

![Flujo de publicación: cinco puntos de control desde la edición del contenido y la ejecución local de pnpm run verify, pasando por la revisión y la fusión en main, hasta el etiquetado v*; la etiqueta solo crea una GitHub Release, mientras que el despliegue del sitio requiere ejecutar pnpm run deploy en main por separado](/images/canvas/docs-release-flow.svg)

---

## 1. Reglas del versionado semántico (SemVer)

Las versiones estables usan `vMAJOR.MINOR.PATCH`; las preliminares añaden un identificador, como la candidata actual `v1.3.2-beta.1`. Esto no significa que se haya publicado una Release ni desplegado en producción.

| Tipo de cambio | Ejemplo | Situación que lo activa |
| :--- | :--- | :--- |
| **Versión mayor (Major)** | `v2.0.0` | Reestructuración importante del sistema de documentación (como actualizar la versión principal de Astro o cambiar por completo el diseño). |
| **Versión menor (Minor)** | `v1.2.0` | Funciones de envergadura: nuevos capítulos de documentación, nuevos idiomas, actualización del sistema de diseño, etc. |
| **Revisión (Patch)** | `v1.2.1` | Cambios pequeños: corregir erratas, actualizar ejemplos de código, ajustar detalles de estilo, etc. |

---

## 2. Los 3 pasos estándar para publicar una versión nueva

### Paso 1: registrar las notas de la versión (`RELEASE_NOTES.md`)

Describa la actualización en `RELEASE_NOTES.md`, en la raíz del proyecto; este archivo será el cuerpo de la Release de GitHub. La primera línea debe ser exactamente `# EpoCanvas Docs v<versión>` y coincidir con `package.json`; `verify:config` comprueba este formato. El ejemplo solo ilustra el formato: para una publicación real use una versión aún no utilizada. Las notas de una versión preliminar también deben incluir `candidate` o `prerelease` en el texto.

```markdown
# EpoCanvas Docs v1.2.1

2026-09-14

### Correcciones
- Se corrige una errata en un comando de la sección de despliegue.
- Se actualizan las capturas de pantalla de la interfaz a la versión más reciente.
```

### Paso 2: actualizar el número de versión de package.json

La insignia de versión de la barra de navegación ya está vinculada automáticamente al campo `version` de `package.json`, que actúa como fuente única de verdad (Single Source of Truth) de la versión de todo el sitio. Actualice el número de versión en `package.json` (o ejecute `pnpm version patch --no-git-tag-version`) y la insignia de la barra superior se sincronizará sola con la versión más reciente, sin necesidad de modificar nada a mano en varios sitios:

```json
{
  "name": "epocanvas-docs",
  "version": "1.2.1"
}
```

### Paso 3: confirmar el código y crear la etiqueta Git

```bash
# 1. Confirmar todos los cambios
git add .
git commit -m "chore(release): bump version to v1.2.1"
git push origin main

# 2. Crear la etiqueta de versión correspondiente y enviarla
git tag v1.2.1
git push origin v1.2.1
```

---

## 3. Canalización de publicación automática con GitHub Actions

El workflow de referencia es [`.github/workflows/release.yml`](https://github.com/shijianus/epocanvas-docs/blob/main/.github/workflows/release.yml); aquí no se copia el YAML completo. Se activa al enviar una etiqueta `v*`. Antes de crear la etiqueta, ejecute esta comprobación local; no escribe Releases en GitHub ni despliega el sitio:

```bash
pnpm run verify
```

1. El job `validate` usa permisos de solo lectura `contents: read` y ejecuta primero la verificación completa `pnpm run verify`.
2. Solo tras superar la validación, el job `publish` recibe permisos `contents: write` para crear o actualizar la Release de GitHub con `RELEASE_NOTES.md`.
3. Las releases existentes se actualizan de forma no destructiva, sin eliminarlas ni recrearlas. GitHub determina `Latest` según la versión de las releases estables; las versiones preliminares no se marcan como `Latest`. La insignia de versión del encabezado permite consultar el historial.

:::note
Este workflow solo crea o actualiza Releases de GitHub; no despliega automáticamente el sitio. Fusionar en `main` tampoco lo despliega. La publicación se hace con `pnpm run deploy` en local o con una integración Git del alojamiento configurada por separado; véase [Despliegue en Cloudflare Pages](/canvas/cloudflare/).
:::

---

## 4. Flujo de colaboración en el contenido

Cuando varias personas mantienen la documentación, se colabora siguiendo el flujo fijo "rama → revisión → fusión → publicación", que garantiza que el contenido en línea siempre se pueda compilar:

```text
Rama main (fuente de versiones; el sitio cambia solo tras un despliegue)
  │
  ├─ 1. Crear una rama de funcionalidad desde main   git checkout -b docs/new-guide
  ├─ 2. Escribir/modificar Markdown
  ├─ 3. Autocomprobación local                       pnpm run verify
  ├─ 4. Enviar la rama y abrir un Pull Request       activa la validación completa de CI
  ├─ 5. Fusionar en main tras la revisión aprobada   no despliega automáticamente el sitio
  └─ 6. Al publicar versión, crear la etiqueta v*    dispara la canalización de GitHub Release
```

### Puntos clave de la revisión de Pull Request

CI (`build.yml`) ejecuta `pnpm run verify`: pruebas, comprobaciones de configuración y tipos de Astro, compilación y comprobaciones de contenido y artefactos. El resultado visual sigue requiriendo revisión manual:

- **Validez de los enlaces**: que los enlaces internos y anclas nuevos funcionen al saltar; que los documentos con ruta modificada tengan su redirección registrada;
- **Efecto de renderizado**: que la sintaxis `:::` de los bloques de aviso y las anotaciones de los bloques de código se muestren correctamente en la página (el CI no comprueba el aspecto visual);
- **Correspondencia entre texto e imágenes**: que las capturas de pantalla nuevas tengan texto descriptivo y se vean con nitidez;
- **Convenciones de nomenclatura**: nombres de archivo en minúsculas con guiones, y `title` y `description` del Frontmatter completos.

### Reparto de tareas sugerido

| Rol | Responsabilidades |
| :--- | :--- |
| Autor de documentación | Escribir el contenido, autocomprobar en local, abrir el PR |
| Revisor | Verificar el efecto de renderizado y los enlaces, fusionar el código |
| Responsable de publicación | Crear las etiquetas de versión, mantener `RELEASE_NOTES.md`, sincronizar la insignia de versión de la barra de navegación |

---

## 5. Comprobaciones de compilación en CI

`.github/workflows/build.yml` ejecuta la validación completa en los envíos a `main` y en los Pull Requests. CI usa Node.js 22.23.4, fijado en `.node-version`, y pnpm 10.34.5. Ejecute la misma comprobación en local antes de confirmar cambios:

```bash
pnpm run verify
```
