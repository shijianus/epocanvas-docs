---
title: Inicio rápido (en marcha en 3 minutos)
description: "EpoCanvas Docs: preparación del entorno local, instalación de dependencias, arranque del servicio de desarrollo local y consulta rápida de los comandos de uso habitual."
---

Hay dos caminos para poner en marcha este sitio de documentación; elija uno según su objetivo:

- **Solo quiere ver un sitio en línea cuanto antes**: no necesita instalar nada; salte directamente a la sección de [despliegue con un clic](#despliegue-con-un-clic-publica-con-un-solo-botón) más abajo, pulse el botón y en dos minutos tendrá su propia dirección web;
- **Quiere escribir documentación o modificar el contenido**: primero ponga el proyecto en marcha en local siguiendo [Preparativos](#preparativos), edite y compruebe el resultado a la vez, y cuando termine publíquelo con el comando de despliegue de la sección de [comandos habituales](#comandos-de-desarrollo-habituales).

---

## Despliegue con un clic: publica con un solo botón

Los siguientes botones son los "botones de despliegue" oficiales de Cloudflare, Vercel y Netlify. Al pulsarlos se abre el asistente de despliegue de la plataforma correspondiente: la plataforma clona automáticamente este repositorio en su propia cuenta de GitHub y luego completa por su cuenta la compilación y la publicación en la nube. Durante todo el proceso solo hace falta una cuenta de GitHub; no hay que instalar Node.js ni pnpm en el ordenador, ni escribir ningún comando.

### Despliegue en Cloudflare (recomendado)

[![Deploy to Cloudflare](/images/canvas/deploy/badge-cloudflare.svg)](https://deploy.workers.cloudflare.com/?url=https://github.com/shijianus/epocanvas-docs)

Tras pulsar el botón, el asistente sigue tres pasos:

1. **Autorización e inicio de sesión**: inicie sesión primero en GitHub y luego en Cloudflare. Ambos tienen planes gratuitos; si no tiene cuenta, regístrese en el momento;
2. **Clonado del repositorio**: Cloudflare copia automáticamente este repositorio a su cuenta de GitHub; a partir de ahí, todas las modificaciones de contenido se hacen en su propio repositorio;
3. **Confirmar la configuración y desplegar**: al final el asistente muestra una página de configuración; compruébela según la tabla siguiente y pulse Deploy:

| Elemento de configuración | Qué muestra el asistente por defecto | Qué hacer |
| :--- | :--- | :--- |
| Nombre de repositorio / proyecto | Rellenado previamente con `epocanvas-docs` | Mantener el valor predeterminado |
| Comando de compilación | Detectado automáticamente como el `pnpm run build` de este repositorio | Mantener el valor predeterminado |
| Comando de despliegue | Rellenado previamente con `pnpm run deploy` | **Cambiarlo a `npx wrangler deploy`** |

:::caution
Cambie sin falta el comando de despliegue a `npx wrangler deploy`. El `pnpm run deploy` predefinido es el comando de subida directa a Cloudflare Pages reservado a quienes mantienen este sitio: despliega a un nombre de proyecto fijado en el código y dará error directamente en el flujo de despliegue por botón.
:::

En el primer despliegue, Cloudflare detecta que el repositorio no tiene archivo de configuración de Workers, identifica automáticamente que se trata de un sitio estático Astro y abre en su repositorio un Pull Request (PR) con la configuración generada automáticamente: basta con fusionarlo; a partir de entonces, cada push se compila y se publica automáticamente. Si todo va bien, desde pulsar el botón hasta ver la dirección web pasan dos o tres minutos.

Una vez terminado el despliegue, Cloudflare asigna una dirección pública de la forma `https://epocanvas-docs.<su-subdominio>.workers.dev`, con certificado HTTPS incluido. Para usar su propio dominio, entre en la consola en Workers & Pages → su proyecto → **Settings** → **Domains & Routes** y añádalo.

### Despliegue en Vercel y Netlify

Si prefiere otras plataformas, los dos botones siguientes hacen lo mismo: ambas plataformas detectan automáticamente los proyectos Astro y no hay que rellenar manualmente ninguna configuración de compilación:

[![Deploy with Vercel](/images/canvas/deploy/badge-vercel.svg)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshijianus%2Fepocanvas-docs)

[![Deploy to Netlify](/images/canvas/deploy/badge-netlify.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/shijianus/epocanvas-docs)

- **Vercel**: pulse el botón → autorice GitHub → mantenga las opciones predeterminadas y pulse Deploy. Al terminar obtiene el dominio `xxx.vercel.app`, gratuito con el plan Hobby personal;
- **Netlify**: pulse el botón → conecte GitHub → la plataforma clona el repositorio automáticamente y realiza la primera compilación. Al terminar obtiene el dominio `xxx.netlify.app`; el plan gratuito es suficiente.

:::note
Los tres botones funcionan igual: clonan el repositorio en su cuenta de GitHub y configuran el despliegue continuo de modo que "cada push de código reconstruye y publica el sitio automáticamente". Con usar una sola plataforma basta; no hace falta desplegar varias veces. Este sitio en sí se aloja con el método de subida directa a Cloudflare Pages (véase [Despliegue en Cloudflare Pages](/canvas/cloudflare/)), camino que no interfiere con los botones anteriores; para un sitio de documentación estático, la experiencia de acceso que ve el lector es la misma con ambos métodos de alojamiento.
:::

---

## Preparativos

El despliegue con un clic sirve para "publicar primero el sitio", pero redactar y modificar la documentación siempre se hace en local. Si piensa escribir contenido, compruebe primero que su ordenador tiene instalados los siguientes entornos de desarrollo básicos:

| Herramienta | Versión recomendada | Comando de comprobación | Descripción |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.14.1` (se recomienda la 20 LTS) | `node -v` | Entorno base para ejecutar JavaScript y compilar las páginas estáticas |
| **pnpm** | `>= 9` (en CI se usa la 10) | `pnpm -v` | Gestor de paquetes recomendado: instala rápido y ahorra espacio en disco |
| **Git** | Última versión estable | `git --version` | Se usa para descargar el código y gestionar las versiones |

:::tip
Si su ordenador aún no tiene instalado `pnpm`, puede instalarlo globalmente de forma rápida con el npm que trae el propio Node.js:

```bash
npm install -g pnpm
```
:::

---

## 3 pasos para ponerlo en marcha en local

### Paso 1: clonar el repositorio de código en local

Abra una terminal (Terminal) y ejecute los siguientes comandos para clonar el código del proyecto y entrar en su carpeta:

```bash
git clone https://github.com/shijianus/epocanvas-docs.git
cd epocanvas-docs
```

### Paso 2: instalar las dependencias del proyecto

En la raíz del proyecto, ejecute el comando de instalación:

```bash
pnpm install
```

pnpm descarga automáticamente las dependencias de frontend necesarias según `pnpm-lock.yaml`, incluidos Astro, Starlight y el módulo de procesamiento local de imágenes; normalmente termina en unas decenas de segundos. Al acabar, la terminal muestra el tiempo total empleado:

```text
Done in 1m 3.2s using pnpm v9.15.9
```

### Paso 3: iniciar el servidor local de desarrollo y previsualización

Terminada la instalación de las dependencias, ejecute el comando de arranque:

```bash
pnpm run dev
```

La terminal mostrará una salida parecida a esta (el primer arranque precompila las dependencias y tarda unos segundos):

```text
astro  v5.18.2  ready in 5152 ms

┃ Local    http://localhost:4321/
┃ Network  use --host to expose

watching for file changes...
```

Abra ahora el navegador y visite `http://localhost:4321` para ver el sitio de documentación completo. Tras modificar y guardar cualquier archivo `.md`, la página del navegador se refresca sola para mostrar el contenido más reciente.

![Aspecto real de la página de inicio rápido en el servidor de desarrollo local](/images/canvas/ui-quickstart.png)

*Figura: resultado real del renderizado de `http://localhost:4321/canvas/deployment/`, es decir, la página que está leyendo ahora mismo.*

---

## Comandos de desarrollo habituales

Al redactar documentación o mantener el proyecto en el día a día, se usan sobre todo estos comandos:

| Comando | Caso de uso | Descripción detallada |
| :--- | :--- | :--- |
| `pnpm run dev` | **Redacción diaria de documentos** | Inicia el servicio local de depuración con recarga en caliente (HMR). Tras modificar cualquier archivo `.md`, el navegador se actualiza automáticamente con el nuevo contenido. |
| `pnpm run build` | **Compilación de prueba** | Compila por completo todas las páginas estáticas del sitio en local y genera en el directorio `dist/` el HTML, el CSS y el índice de búsqueda de Pagefind. |
| `pnpm run preview` | **Previsualizar el resultado de la compilación** | Arranca en local un servidor web ligero que sirve el contenido de `dist/`, para comprobar que los enlaces y los estilos funcionan antes de la publicación definitiva. |
| `pnpm run deploy` | **Publicación en línea con un clic** | Ejecuta primero la build de forma automática y luego usa la herramienta Wrangler para subir `dist/` al entorno de producción en línea de Cloudflare Pages. |

Para los pasos completos de publicación y los métodos de verificación en línea, lea **[Despliegue en Cloudflare Pages](/canvas/cloudflare/)**.

---

## ¿Dónde están los archivos de configuración principales?

Si necesita cambiar la información básica del sitio, fíjese sobre todo en estos archivos:

- **Nombre del sitio y menú del índice**: edite el `astro.config.mjs` de la raíz. Ahí puede modificar el `title` (título del sitio), el `site` (dominio en línea) y el `sidebar` (menú del índice de la izquierda).
- **Botones de la barra de navegación superior**: edite `src/config/navigation.ts`. Ahí puede añadir o quitar botones como "Inicio" o "Descripción del producto" y sus rutas de destino.
- **Colores de página y estilos tipográficos**: edite `src/styles/custom.css`. Ahí puede ajustar los colores del tema en los modos claro y oscuro.
- **Añadir un documento nuevo**: cree directamente un archivo `.md` en el directorio `src/content/docs/canvas/` y regístrelo en la barra lateral; los detalles están en la [Guía de redacción y formato en Markdown](/canvas/markdown/).

---

## Siguientes pasos

Con el servicio local funcionando correctamente, puede seguir profundizando:

- **[Diseño de página y experiencia de lectura](/canvas/layout/)**: conocer los detalles del layout de la barra superior, la barra lateral y la interfaz del cuerpo del texto.
- **[Reglas de renderizado en detalle](/canvas/rendering/)**: entender cómo se convierte Markdown en la página final y evitar tropiezos con la sintaxis de formato.
- **[Despliegue en Cloudflare Pages](/canvas/cloudflare/)**: publicar la documentación en Internet y vincular un dominio propio.
