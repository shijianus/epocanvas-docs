---
title: Despliegue en Cloudflare Pages
description: "Guía de Cloudflare Pages: subida con Wrangler, Git opcional, dominios y comprobaciones tras publicar."
---

Esta página explica cómo desplegar documentación estática en **Cloudflare Pages** según los scripts del repositorio. Las capturas son ejemplos existentes, no registros de despliegue o pruebas de esta candidata. Si difieren, siga la consola actual. El éxito de la verificación y del despliegue debe confirmarse en los registros y estados reales, no deducirse de esta guía.

---

## Preparación

### Qué necesita

| Aspecto | Detalle |
| :--- | :--- |
| **Cuenta de Cloudflare** | Regístrese gratis en [dash.cloudflare.com](https://dash.cloudflare.com/); el servicio Pages no requiere un plan de pago |
| **Compilación local completa** | Primero asegúrese de que `pnpm run verify` funciona y de que el directorio `dist/` se genera correctamente; ver [Inicio rápido](/canvas/deployment/) |
| **Node.js + pnpm** | Los comandos de despliegue dependen del entorno de desarrollo local; los requisitos de versión son los mismos que en el capítulo de inicio rápido |

### Cómo elegir entre los dos métodos de despliegue

![Rutas de subida local con Wrangler y compilación integrada con Git](/images/canvas/docs-deploy-compare.svg)

*Figura: compilación local y subida con Wrangler a la izquierda; compilación en la nube mediante Git a la derecha. El diagrama no acredita pruebas de estas rutas durante esta revisión.*

| Aspecto | Método 1: subida directa por línea de comandos | Método 2: compilación automática desde Git |
| :--- | :--- | :--- |
| Modo de operación | Ejecutar `pnpm run deploy` en local | El push de código a GitHub lo activa automáticamente |
| Dificultad de arranque | Baja, dos comandos | Media, requiere completar una configuración en la consola |
| Escenario adecuado | Primera publicación, mantenimiento por una sola persona, actualizaciones rápidas | Colaboración de varias personas, cuando se quiere "commit igual a publicación" |
| Comprobaciones | Verify completo antes de subir | Configurar verify completo en el comando de la nube |

:::tip
Elija Direct Upload o integración Git al crear el proyecto. No suponga que un proyecto de subida directa puede convertirse en uno integrado con Git; cree el proyecto adecuado al cambiar de ruta. Las subidas urgentes con Wrangler también deben superar las comprobaciones.
:::

:::tip[¿No quiere escribir comandos en absoluto?]
La página de [Inicio rápido](/canvas/deployment/) ofrece botones de despliegue con un clic de Cloudflare, Vercel y Netlify: un clic, autorizar la cuenta, confirmar la configuración, y el sitio de documentación se publica en tu propia cuenta en la nube; detalles en [Despliegue con un clic](/canvas/deployment/#despliegue-con-un-clic-publica-con-un-solo-botón). El botón de Cloudflare usa el alojamiento estático de Workers, una vía independiente del método Pages descrito en esta página; para un sitio de documentación estático la experiencia de acceso es la misma, basta con elegir una de las dos.
:::

---

## Método 1: subida directa desde la línea de comandos local (recomendado la primera vez)

Esta ruta compila en local y sube con Wrangler. `pnpm run deploy` apunta al proyecto `epocanvas-docs` de los mantenedores; no es un botón genérico que cualquier fork pueda reutilizar sin configuración.

### Paso 1: iniciar sesión en la cuenta de Cloudflare

El proyecto ya incluye Wrangler (la herramienta de línea de comandos oficial de Cloudflare); el primer uso requiere autorizar el inicio de sesión desde el navegador:

```bash
pnpm exec wrangler login
```

Al ejecutarlo, la terminal muestra `Opening a link in your default browser...`, el navegador abre la página de autorización de Cloudflare y, tras hacer clic en **Allow**, la terminal indica que el inicio de sesión fue correcto. Confirma el estado de la sesión con el siguiente comando:

```bash
pnpm exec wrangler whoami
```

:::caution
Se requiere una sesión o un token de Cloudflare con permisos válidos. Si falla la autenticación, compruebe `wrangler whoami`, la cuenta y los permisos. El texto del error puede variar según la versión.
:::

### Paso 2: compilar y subir con un solo comando

El proyecto incluye en `scripts/verify-release.mjs` un comando de publicación listo para usar:

Autorice con `pnpm exec wrangler login`. `scripts/verify-release.mjs` exige `main`, árbol limpio incluidos archivos sin seguimiento, upstream `origin/main` y HEAD igual al commit remoto real. `pnpm run deploy` ejecuta `pnpm run verify` completo, vuelve a comprobar Git y llama a Wrangler. El proyecto se define en el script; configure su propio destino antes de reutilizarlo.

```bash
pnpm run deploy
```

`pnpm run deploy` ejecuta configuración, tipos Astro, compilación, pruebas y comprobaciones de contenido/artefactos antes de subir. Para comprobar solo los requisitos use lo siguiente. Lee referencias Git remotas, pero no ejecuta la verificación completa, compilación ni subida. Un dry-run correcto no significa que las pruebas hayan pasado.

```bash
pnpm run deploy --dry-run
```

Wrangler muestra la URL tras una subida correcta. El script fija `--project-name epocanvas-docs --branch main`; compruebe que el proyecto existe en su cuenta y que la rama de producción es correcta.

### Paso 3: localizar su proyecto en la consola

Abra [dash.cloudflare.com](https://dash.cloudflare.com/) y, en el menú de la izquierda, haga clic en **Compute (Workers & Pages)** para ver la lista de proyectos. La siguiente imagen señala tres posiciones clave:

![Lista de proyectos de Workers & Pages en la consola de Cloudflare, con el acceso del menú lateral, el botón Create application y el proyecto epocanvas-docs señalados](/images/canvas/deploy/cf-01-projects-list.png)

*Figura: lista de proyectos de Workers & Pages. ① Acceso a Workers & Pages desde el menú de la izquierda; ② botón Create application para crear un proyecto nuevo; ③ nuestro proyecto `epocanvas-docs`, que muestra el dominio de acceso `epocanvas-docs.pages.dev` y la fecha del último despliegue.*

Haga clic en el nombre del proyecto para entrar en sus detalles; la pestaña **Deployments** muestra el historial completo de despliegues:

![Página de historial de despliegues del proyecto epocanvas-docs, con el dominio de producción, los registros de despliegue y su estado señalados](/images/canvas/deploy/cf-02-deployments.png)

*Figura: página de historial de despliegues. ① Nombre del proyecto; ② pestaña Deployments; ③ el dominio de producción tiene vinculados a la vez `docs.epocanvas.com` (dominio propio) y `epocanvas-docs.pages.dev` (dominio predeterminado); ④ cada registro de despliegue indica la rama y la información del commit; ⑤ estado y hora del despliegue.*

:::note
Solo una subida correcta genera un registro. Compruebe estado, rama, commit y dominio en Deployments. Un comando rechazado o una verificación fallida no actualiza el sitio.
:::

---

## Conocer la configuración de compilación de los proyectos de subida directa

Entra en la pestaña **Settings** para ver la diferencia entre un proyecto de subida directa y uno de Git:

![Página de configuración de compilación (Settings) del proyecto epocanvas-docs, donde la sección Git repository muestra que no hay conexión](/images/canvas/deploy/cf-03-settings.png)

*Figura: pestaña Settings. ① Acceso a Settings; ② la sección Git repository muestra Connect (sin conectar); los proyectos de subida directa no necesitan configuración de compilación desde Git, la compilación se realiza íntegramente en tu máquina local.*

:::tip
La subida directa evita la cola de compilación en la nube. La máquina necesita Node, pnpm, Git y credenciales adecuados; no tiene que ser siempre el mismo ordenador.
:::

---

## Método 2: conectar un repositorio Git para compilación automática (opcional)

Para compilar al hacer push, cree un proyecto Pages integrado con Git y conecte el repositorio. Lo siguiente es una guía de configuración, no una afirmación de que esta ruta esté activada o se haya probado ahora.

### Paso 1: entrar en el flujo de creación

En la página de lista de proyectos de Workers & Pages, haga clic en el botón **Create application** de la esquina superior derecha (ver la marca ② en la imagen del [paso 3 del método 1](#paso-3-localizar-su-proyecto-en-la-consola)) y elija la pestaña **Pages**.

### Paso 2: conectar el repositorio Git

1. En la pantalla de creación, elija **Connect to Git**;
2. Autorice a Cloudflare a acceder a su cuenta de GitHub;
3. En la lista de repositorios, seleccione el repositorio de documentación `epocanvas-docs`;
4. Haga clic en **Comenzar la configuración**.

### Paso 3: rellenar la configuración de compilación

En "Configurar compilación y despliegue", rellene la siguiente configuración:

| Parámetro | Valor |
| :--- | :--- |
| Preset de framework | `Astro` |
| Comando de compilación | `pnpm install --frozen-lockfile && pnpm run verify` |
| Directorio de salida | `dist` |
| Node.js | `22.23.4`, como en `.node-version` |
| pnpm | `10.34.5`, como en `packageManager` |

### Paso 4: verificar la compilación automática

Compruebe Node y pnpm en la nube, elija **Guardar y desplegar** y revise los registros de Deployments. Instalación, verificación completa y subida deben terminar correctamente. Los pushes posteriores dependen de la rama de producción y de la automatización configuradas. El éxito de GitHub CI por sí solo no despliega Pages.

:::caution
La página Settings de un proyecto con integración Git muestra además un bloque de configuración de compilación (preset de framework, comando de compilación, etc.), distinto de la interfaz de los [proyectos de subida directa](#conocer-la-configuración-de-compilación-de-los-proyectos-de-subida-directa); si no encuentra la configuración de compilación en Settings, significa que el proyecto actual es de subida directa, lo cual es normal.
:::

---

## Vincular un dominio propio

Cloudflare ofrece `<project-name>.pages.dev` y permite asociar un dominio propio. Los siguientes dominios son ejemplos; los plazos de DNS y certificados dependen del estado real.

### Paso 1: abrir la configuración de dominio propio

En la página de detalles del proyecto, haga clic en la pestaña **Custom domains** y después en **Set up a custom domain**:

![Página de dominios propios del proyecto epocanvas-docs, con docs.epocanvas.com ya vinculado y el SSL activo](/images/canvas/deploy/cf-04-domains.png)

*Figura: pestaña Custom domains. ① Acceso a la pestaña; ② botón Set up a custom domain; ③ `docs.epocanvas.com` ya vinculado, con estado Active y SSL enabled.*

### Paso 2: añadir el dominio y esperar a que surta efecto

1. Haga clic en **Set up a custom domain** e introduzca su subdominio (por ejemplo `docs.epocanvas.com`);
2. Si el DNS del dominio ya está gestionado en Cloudflare, el sistema añade automáticamente el registro CNAME; si el dominio está gestionado en otro proveedor, hay que añadir manualmente un registro CNAME que apunte a `<nombre-del-proyecto>.pages.dev`;
3. Espere la validación DNS y el certificado; pruebe el dominio cuando esté **Active**. Un número fijo de minutos no garantiza la finalización.

El certificado HTTPS lo emite y renueva Cloudflare automáticamente; no requiere solicitud ni configuración manual.

---

## Verificar el resultado del despliegue

### Comprobar el estado HTTP desde la línea de comandos

```bash
curl -sI https://epocanvas-docs.pages.dev
```

Ejemplo de respuesta (la fecha y el estado dependen de la solicitud real):

```text
HTTP/2 200
date: Fri, 11 Sep 2026 15:32:39 GMT
content-type: text/html; charset=utf-8
```

`200` solo confirma que esta URL respondió correctamente; no valida traducciones, recursos, búsqueda ni contenido reciente. Complete las comprobaciones siguientes en ambos dominios.

### Comprobación punto por punto en el navegador

| Comprobación | Resultado esperado |
| :--- | :--- |
| La portada y cualquier página de documentación abren | La página se renderiza completa, sin pantallas en blanco |
| Los cambios recientes ya surtieron efecto | El contenido de las secciones recién editadas se ve en línea |
| Búsqueda en todo el sitio con `Ctrl+K` | Encuentra los artículos más recientes (el índice se genera con la compilación) |
| Cambio entre tema claro y oscuro | El cambio funciona y se mantiene tras recargar |

---

## Problemas de despliegue habituales

### ¿El contenido en línea no se actualiza tras el despliegue?

Recarga forzada en el navegador (`Ctrl+F5` / `Cmd+Shift+R`) para descartar la caché; si sigue sin actualizarse, comprueba en la página Deployments de la consola la fecha del último registro y compara con el dominio de vista previa del despliegue usando `curl -sI`.

### ¿El dominio propio muestra un error de handshake SSL (Error 525)?

Revise la validación y el certificado en Custom domains; después DNS, proxy y detalles del error. No se limite a esperar unos minutos. Compare con el dominio `pages.dev`.

### ¿`pnpm run deploy` falla con `Project not found`?

Primero ejecuta `pnpm exec wrangler whoami` para confirmar que la sesión está iniciada; después verifica que el `--project-name` en `scripts/verify-release.mjs` coincida con el nombre del proyecto en la consola.

Para más comprobaciones, ver [Preguntas frecuentes y solución de problemas](/canvas/troubleshooting/).
