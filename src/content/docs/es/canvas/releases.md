---
title: Gestión de versiones y flujos automatizados
description: Convención de numeración de versiones de EpoCanvas Docs, pasos estándar para publicar una versión nueva y la canalización de publicación automática con GitHub Actions.
---

Para que el lector sepa con claridad "a qué versión del producto corresponde la documentación actual" y para que el equipo pueda seguir el historial de cambios de forma ordenada, **EpoCanvas Docs** adopta números de versión semánticos y un flujo de publicación fijo.

---

## 1. Reglas del versionado semántico (SemVer)

El número de versión sigue el formato `v mayor.menor.parche` (actualmente `v1.3.0`):

| Tipo de cambio | Ejemplo | Situación que lo activa |
| :--- | :--- | :--- |
| **Versión mayor (Major)** | `v2.0.0` | Reestructuración importante del sistema de documentación (como actualizar la versión principal de Astro o cambiar por completo el diseño). |
| **Versión menor (Minor)** | `v1.2.0` | Funciones de envergadura: nuevos capítulos de documentación, nuevos idiomas, actualización del sistema de diseño, etc. |
| **Revisión (Patch)** | `v1.2.1` | Cambios pequeños: corregir erratas, actualizar ejemplos de código, ajustar detalles de estilo, etc. |

---

## 2. Los 3 pasos estándar para publicar una versión nueva

### Paso 1: registrar las notas de la versión (`RELEASE_NOTES.md`)

Escriba en `RELEASE_NOTES.md`, en la raíz del proyecto, el contenido de esta actualización; ese archivo se usa como texto descriptivo del GitHub Release:

```markdown
## [v1.2.1] - 2026-09-14

### Correcciones
- Se corrige una errata en un comando de la sección de despliegue.
- Se actualizan las capturas de pantalla de la interfaz a la versión más reciente.
```

### Paso 2: actualizar el número de versión de package.json

La insignia de versión de la barra de navegación ya está vinculada automáticamente al campo `version` de `package.json`, que actúa como fuente única de verdad (Single Source of Truth) de la versión de todo el sitio. Actualice el número de versión en `package.json` (o ejecute `pnpm version patch`) y la insignia de la barra superior se sincronizará sola con la versión más reciente, sin necesidad de modificar nada a mano en varios sitios:

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

El proyecto trae preconfigurado en `.github/workflows/release.yml` un flujo de publicación automática, cuyo contenido real es el siguiente:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'   # se activa automáticamente al enviar etiquetas que empiezan por v

permissions:
  contents: write

jobs:
  release:
    name: Publish GitHub Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Create GitHub Release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          TAG_NAME="${{ github.ref_name }}"
          echo "Publishing release for tag: ${TAG_NAME}"
          # 同名 release 已存在时（例如重新推送 tag，或 tag 删除后旧 release 转为草稿）先删掉，再按当前 RELEASE_NOTES.md 重新发布
          gh release delete "${TAG_NAME}" --yes 2>/dev/null || true
          gh release create "${TAG_NAME}" \
            --title "EpoCanvas Docs ${TAG_NAME}" \
            --notes-file RELEASE_NOTES.md \
            --latest
```

Tras enviar la etiqueta `v1.2.1`, GitHub arranca la canalización automáticamente:

1. Extrae el código del repositorio;
2. Con `RELEASE_NOTES.md` como descripción, crea la versión oficial en la página **Releases** del repositorio y la marca como latest;
3. El lector puede hacer clic en la insignia de versión de la barra superior para consultar el archivo de todas las versiones anteriores.

:::note
Esta canalización solo se encarga de crear el GitHub Release; **no ejecuta el despliegue del sitio**. La actualización en línea la realiza la compilación automática por Git de Cloudflare Pages (o un `pnpm run deploy` local); ambos procesos son independientes entre sí, tal como se detalla en [Despliegue en Cloudflare Pages](/canvas/cloudflare/).
:::

---

## 4. Flujo de colaboración en el contenido

Cuando varias personas mantienen la documentación, se colabora siguiendo el flujo fijo "rama → revisión → fusión → publicación", que garantiza que el contenido en línea siempre se pueda compilar:

```text
Rama main (siempre publicable, corresponde al sitio en línea)
  │
  ├─ 1. Crear una rama de funcionalidad desde main   git checkout -b docs/new-guide
  ├─ 2. Escribir/modificar Markdown
  ├─ 3. Autocomprobación local                       pnpm exec astro check && pnpm run build
  ├─ 4. Enviar la rama y abrir un Pull Request       dispara la compilación de CI
  ├─ 5. Fusionar en main tras la revisión aprobada   dispara el despliegue automático en línea
  └─ 6. Al publicar versión, crear la etiqueta v*    dispara la canalización de GitHub Release
```

### Puntos clave de la revisión de Pull Request

El CI (`build.yml`) solo garantiza que "la compilación pasa"; los siguientes puntos requieren revisión humana:

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

El repositorio tiene configurado `.github/workflows/build.yml`, que en cada envío a la rama `main` y en cada Pull Request ejecuta automáticamente la instalación de dependencias y una compilación completa, para detectar a tiempo problemas de compilación como enlaces rotos o errores de Frontmatter. Ejecutar la misma comprobación en local antes de enviar evita que el CI falle después del push:

```bash
pnpm exec astro check && pnpm run build
```
