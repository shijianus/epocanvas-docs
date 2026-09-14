---
title: Despliegue en Cloudflare Pages
description: "Tutorial ilustrado completo para publicar EpoCanvas Docs: subida directa con la línea de comandos de Wrangler, compilación automática desde Git y vinculación de dominio propio, con capturas de pantalla reales de la consola en cada paso."
---

Una vez redactada la documentación, hay que publicarla en Internet para que el equipo y los usuarios puedan acceder a ella. **EpoCanvas Docs** recomienda alojarlo en **Cloudflare Pages**: no hace falta comprar un servidor ni configurar Nginx; basta con subir los archivos estáticos y se obtiene automáticamente el certificado HTTPS. Este propio sitio (`docs.epocanvas.com`) se publicó con el método de este artículo, y todas las capturas de pantalla de la consola siguientes provienen de un despliegue real.

---

## Preparación

### Qué necesita

| Aspecto | Detalle |
| :--- | :--- |
| **Cuenta de Cloudflare** | Regístrese gratis en [dash.cloudflare.com](https://dash.cloudflare.com/); el servicio Pages no requiere un plan de pago |
| **Compilación local completa** | Primero asegúrese de que `pnpm run build` funciona y de que el directorio `dist/` se genera correctamente; ver [Inicio rápido](/canvas/deployment/) |
| **Node.js + pnpm** | Los comandos de despliegue dependen del entorno de desarrollo local; los requisitos de versión son los mismos que en el capítulo de inicio rápido |

### Cómo elegir entre los dos métodos de despliegue

![Diagrama comparativo de las dos vías de despliegue en Cloudflare Pages: a la izquierda subida directa local desde la línea de comandos (la que usa este sitio), a la derecha compilación automática desde el repositorio Git (recomendada para trabajo en equipo)](/images/canvas/docs-deploy-compare.svg)

*Figura: comparación de las dos rutas de despliegue en Cloudflare Pages. A la izquierda, compilación en la propia máquina y subida directa al edge con Wrangler (la realmente adoptada por este sitio); a la derecha, compilación automática en la nube activada por un Webhook de GitHub.*

| Aspecto | Método 1: subida directa por línea de comandos | Método 2: compilación automática desde Git |
| :--- | :--- | :--- |
| Modo de operación | Ejecutar `pnpm run deploy` en local | El push de código a GitHub lo activa automáticamente |
| Dificultad de arranque | Baja, dos comandos | Media, requiere completar una configuración en la consola |
| Escenario adecuado | Primera publicación, mantenimiento por una sola persona, actualizaciones rápidas | Colaboración de varias personas, cuando se quiere "commit igual a publicación" |
| Adoptado por este sitio | ✅ Sí (se puede verificar en la consola) | No activado; se puede añadir en cualquier momento |

:::tip
Ambos métodos pueden coexistir: usar la compilación automática desde Git en el día a día y, para corregir errores con urgencia, usar `pnpm run deploy` en local para sobrescribir y publicar directamente.
:::

:::tip[¿No quiere escribir comandos en absoluto?]
La página de [Inicio rápido](/canvas/deployment/) ofrece botones de despliegue con un clic de Cloudflare, Vercel y Netlify: un clic, autorizar la cuenta, confirmar la configuración, y el sitio de documentación se publica en tu propia cuenta en la nube; detalles en [Despliegue con un clic](/canvas/deployment/#despliegue-con-un-clic-publica-con-un-solo-botón). El botón de Cloudflare usa el alojamiento estático de Workers, una vía independiente del método Pages descrito en esta página; para un sitio de documentación estático la experiencia de acceso es la misma, basta con elegir una de las dos.
:::

---

## Método 1: subida directa desde la línea de comandos local (recomendado la primera vez)

En este método la compilación se hace en local y se sube directamente a Cloudflare; es el método de despliegue **que este sitio utiliza realmente**.

### Paso 1: iniciar sesión en la cuenta de Cloudflare

El proyecto ya incluye Wrangler (la herramienta de línea de comandos oficial de Cloudflare); el primer uso requiere autorizar el inicio de sesión desde el navegador:

```bash
npx wrangler login
```

Al ejecutarlo, la terminal muestra `Opening a link in your default browser...`, el navegador abre la página de autorización de Cloudflare y, tras hacer clic en **Allow**, la terminal indica que el inicio de sesión fue correcto. Confirma el estado de la sesión con el siguiente comando:

```bash
npx wrangler whoami
```

:::caution
Si ejecuta el despliegue sin iniciar sesión, la terminal mostrará `You are not authenticated. Please run 'wrangler login'.` y no se realizará ningún despliegue.
:::

### Paso 2: compilar y subir con un solo comando

El proyecto incluye en `package.json` un comando de publicación listo para usar:

```bash
pnpm run deploy
```

Equivale a ejecutar dos pasos en secuencia: primero `astro build` compila todo el sitio al directorio `dist/` y genera el índice de búsqueda, y luego `wrangler pages deploy dist` sube el resultado directamente a Cloudflare. La salida real de la fase de compilación es la siguiente:

```text
00:06:22 [build] 15 page(s) built in 18.73s
00:06:22 [build] Complete!
```

Al terminar la subida, Wrangler muestra la dirección de vista previa de ese despliegue. En el primer despliegue, Wrangler pregunta interactivamente el nombre del proyecto; basta con pulsar Enter para usar el `epocanvas-docs` ya predefinido en `package.json`.

### Paso 3: localizar su proyecto en la consola

Abra [dash.cloudflare.com](https://dash.cloudflare.com/) y, en el menú de la izquierda, haga clic en **Compute (Workers & Pages)** para ver la lista de proyectos. La siguiente imagen señala tres posiciones clave:

![Lista de proyectos de Workers & Pages en la consola de Cloudflare, con el acceso del menú lateral, el botón Create application y el proyecto epocanvas-docs señalados](/images/canvas/deploy/cf-01-projects-list.png)

*Figura: lista de proyectos de Workers & Pages. ① Acceso a Workers & Pages desde el menú de la izquierda; ② botón Create application para crear un proyecto nuevo; ③ nuestro proyecto `epocanvas-docs`, que muestra el dominio de acceso `epocanvas-docs.pages.dev` y la fecha del último despliegue.*

Haga clic en el nombre del proyecto para entrar en sus detalles; la pestaña **Deployments** muestra el historial completo de despliegues:

![Página de historial de despliegues del proyecto epocanvas-docs, con el dominio de producción, los registros de despliegue y su estado señalados](/images/canvas/deploy/cf-02-deployments.png)

*Figura: página de historial de despliegues. ① Nombre del proyecto; ② pestaña Deployments; ③ el dominio de producción tiene vinculados a la vez `docs.epocanvas.com` (dominio propio) y `epocanvas-docs.pages.dev` (dominio predeterminado); ④ cada registro de despliegue indica la rama y la información del commit; ⑤ estado y hora del despliegue.*

:::note
Cada vez que ejecuta `pnpm run deploy` se añade un registro al inicio de la lista, que se convierte automáticamente en la versión de producción actual. El historial se conserva en la lista, de modo que ante cualquier problema se puede volver atrás en cualquier momento.
:::

---

## Conocer la configuración de compilación de los proyectos de subida directa

Entra en la pestaña **Settings** para ver la diferencia entre un proyecto de subida directa y uno de Git:

![Página de configuración de compilación (Settings) del proyecto epocanvas-docs, donde la sección Git repository muestra que no hay conexión](/images/canvas/deploy/cf-03-settings.png)

*Figura: pestaña Settings. ① Acceso a Settings; ② la sección Git repository muestra Connect (sin conectar); los proyectos de subida directa no necesitan configuración de compilación desde Git, la compilación se realiza íntegramente en tu máquina local.*

:::tip
Esto explica también la ventaja de la subida directa: el entorno de compilación es su propio ordenador y no depende de la cola de compilación de Cloudflare; la contrapartida es que cada actualización debe ejecutarse desde el ordenador donde se hace el despliegue.
:::

---

## Método 2: conectar un repositorio Git para compilación automática (opcional)

Si quiere que "hacer commit equivalga a publicar automáticamente", puede conectar el proyecto a un repositorio de GitHub para que Cloudflare lo compile automáticamente en la nube.

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
| Comando de compilación | `pnpm run build` |
| Directorio de salida de la compilación | `dist` |

### Paso 4: verificar la compilación automática

Haga clic en **Guardar y desplegar** y Cloudflare completará automáticamente la primera compilación. A partir de entonces, cada push de código a la rama `main` hará que Cloudflare descargue, compile y publique automáticamente. El registro de compilación de cada despliegue se puede consultar haciendo clic en el despliegue correspondiente en la pestaña **Deployments** del proyecto.

:::caution
La página Settings de un proyecto con integración Git muestra además un bloque de configuración de compilación (preset de framework, comando de compilación, etc.), distinto de la interfaz de los [proyectos de subida directa](#conocer-la-configuración-de-compilación-de-los-proyectos-de-subida-directa); si no encuentra la configuración de compilación en Settings, significa que el proyecto actual es de subida directa, lo cual es normal.
:::

---

## Vincular un dominio propio

El dominio `xxx.pages.dev` que Cloudflare asigna por defecto se puede usar directamente; vincular su propio dominio (por ejemplo `docs.epocanvas.com`) solo lleva unos minutos.

### Paso 1: abrir la configuración de dominio propio

En la página de detalles del proyecto, haga clic en la pestaña **Custom domains** y después en **Set up a custom domain**:

![Página de dominios propios del proyecto epocanvas-docs, con docs.epocanvas.com ya vinculado y el SSL activo](/images/canvas/deploy/cf-04-domains.png)

*Figura: pestaña Custom domains. ① Acceso a la pestaña; ② botón Set up a custom domain; ③ `docs.epocanvas.com` ya vinculado, con estado Active y SSL enabled.*

### Paso 2: añadir el dominio y esperar a que surta efecto

1. Haga clic en **Set up a custom domain** e introduzca su subdominio (por ejemplo `docs.epocanvas.com`);
2. Si el DNS del dominio ya está gestionado en Cloudflare, el sistema añade automáticamente el registro CNAME; si el dominio está gestionado en otro proveedor, hay que añadir manualmente un registro CNAME que apunte a `<nombre-del-proyecto>.pages.dev`;
3. Espere a que se emita el certificado (normalmente entre 2 y 5 minutos); cuando el estado cambie a **Active** (como en el punto ③ de la imagen anterior), el sitio ya será accesible con el nuevo dominio.

El certificado HTTPS lo emite y renueva Cloudflare automáticamente; no requiere solicitud ni configuración manual.

---

## Verificar el resultado del despliegue

### Comprobar el estado HTTP desde la línea de comandos

```bash
curl -sI https://epocanvas-docs.pages.dev
```

Resultado real devuelto:

```text
HTTP/2 200
date: Fri, 11 Sep 2026 15:32:39 GMT
content-type: text/html; charset=utf-8
```

Ver `200` significa que el sitio está en buen estado. Tras vincular el dominio propio, repita la prueba con la URL de su propio dominio.

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

La emisión del certificado necesita entre 2 y 5 minutos para hacerse efectiva globalmente; espera y recarga forzada. Mientras tanto, se puede acceder primero con el dominio predeterminado `xxx.pages.dev`.

### ¿`pnpm run deploy` falla con `Project not found`?

Primero ejecuta `npx wrangler whoami` para confirmar que la sesión está iniciada; después verifica que el `--project-name` del script `deploy` de `package.json` coincida con el nombre del proyecto en la consola.

Para más comprobaciones, ver [Preguntas frecuentes y solución de problemas](/canvas/troubleshooting/).
