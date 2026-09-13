---
title: Diseño de página y experiencia de lectura
description: Descripción del diseño de tres columnas de EpoCanvas Docs, detalles de interacción de cada zona de la interfaz, modos claro y oscuro del theme y experiencia responsive en distintos dispositivos.
---

Para ofrecer a los lectores una experiencia de lectura cómoda y eficiente, **EpoCanvas Docs** adopta un diseño de página clásico y claro de tres columnas. Al leer artículos largos, el lector puede saber en todo momento "dónde se encuentra dentro del sitio" y "qué sección del artículo está leyendo".

---

## Descripción de las zonas de la interfaz

Al abrir cualquier documento, la página se divide en cuatro zonas funcionales principales:

![Diagrama anotado de la interfaz de lectura de tres columnas de EpoCanvas Docs: ① barra de navegación superior ② índice izquierdo ③ cuerpo central ④ índice de la página](/images/canvas/ui-layout-annotated.png)

*Figura: diagrama anotado del diseño de tres columnas, tomando como ejemplo la página «Reglas de renderizado en detalle». ① barra de navegación global superior; ② índice de categorías a la izquierda; ③ zona de lectura del cuerpo central; ④ esquema de "índice de esta página" a la derecha. Las cuatro zonas se señalan en la imagen con bordes y números.*

![Diagrama de las zonas del diseño de EpoCanvas Docs](/images/canvas/docs-layout-3tier.svg)

*Figura: esquema estructural del diseño de tres columnas, con el nombre y la función de cada zona.*

### 1. Barra de navegación global superior (Header)

Se sitúa en la parte superior de la página, fija y flotante; permanece visible al hacer scroll hacia abajo y tiene una altura de `3.5rem`. La barra superior contiene, de izquierda a derecha, los siguientes elementos (véase el diagrama anotado inferior):

![Primer plano anotado de los elementos de la barra superior: ① Logo ② cuadro de búsqueda ③ navegación principal ④ insignia de versión ⑤ cambio de idioma ⑥ cambio de theme ⑦ GitHub ⑧ Telegram](/images/canvas/ui-topnav-annotated.png)

*Figura: primer plano anotado de los elementos de la barra superior. ① logo y nombre del sitio; ② cuadro de búsqueda global; ③ grupo de botones de navegación principal; ④ insignia de versión; ⑤ selector de idioma; ⑥ conmutador de theme claro y oscuro; ⑦ acceso al repositorio de GitHub; ⑧ acceso a la comunidad de Telegram.*

- **Logo y título del sitio (①)**: a la izquierda se muestran el icono de EpoCanvas y el nombre del proyecto; al hacer clic se vuelve rápidamente a la portada del sitio de documentación.
- **Cuadro de búsqueda global (②)**: escriba palabras clave en el cuadro para buscar directamente en el contenido de la página actual; pulse `Ctrl+K` / `Cmd+K` para abrir la ventana de búsqueda de todo el sitio; véase [Búsqueda de texto completo y atajos de teclado](/canvas/search-engine/).
- **Botones de navegación principal (③)**: ofrecen enlaces de acceso rápido a funciones habituales como "Portada", "Descripción del producto" e "Inicio rápido"; la sección actual se resalta automáticamente.
- **Insignia de versión (④)**: muestra el número de versión de publicación correspondiente a la documentación actual (por ejemplo, `v1.2.0`); al hacer clic se puede consultar el registro detallado de cambios en GitHub.
- **Selector de idioma (⑤)**: al hacer clic en el botón de idioma se despliegan 10 idiomas disponibles; al elegir uno se salta a la versión del mismo artículo en el idioma de destino, cambiando a la vez la navegación, la barra lateral y el cuerpo del texto.
- **Conmutador de theme claro y oscuro (⑥)**: ofrece un icono de sol/luna para alternar entre el modo claro y el modo oscuro.
- **GitHub y Telegram (⑦⑧)**: los iconos de la derecha enlazan respectivamente al repositorio de código abierto y a la comunidad técnica.

### 2. Índice de categorías izquierdo (Sidebar)

Se sitúa a la izquierda de la página (con un ancho de `16.5rem`, unos 264 píxeles) y muestra todos los capítulos de la documentación según una jerarquía lógica:

- **Grupos plegables**: la documentación se organiza en grupos como "Descripción general del producto e inicio" y "Funciones principales y guía de uso"; al hacer clic en el nombre del grupo se expande o se contrae.
- **Resaltado de la página actual**: el artículo que se está leyendo se resalta en el menú izquierdo con un fondo de cápsula en el color del theme.
- **Memoria de la posición de scroll**: al saltar de un artículo a otro, la posición de la barra de scroll de la barra lateral se mantiene y no vuelve al principio.

### 3. Zona central de lectura (Main Content)

Se sitúa en el centro de la pantalla y es la zona principal que aloja el contenido de la documentación técnica:

- **Título de la página y fecha de actualización**: en la parte superior del cuerpo se muestran el título del artículo (tomado del campo `title` del Frontmatter) y la fecha de "última actualización", para valorar la vigencia del contenido.
- **Ancho de lectura adecuado**: el ancho máximo de la zona del cuerpo está limitado a `60rem`, para evitar que en monitores muy anchos una línea de texto sea demasiado larga y se pierda el hilo de la lectura.
- **Enlaces de paginación al pie**: al final de cada documento se generan automáticamente los enlaces "anterior" y "siguiente", para leer de forma continua según el orden de la barra lateral.
- **Botón de copiar bloques de código**: cada bloque de código tiene un botón de copiar en su esquina superior derecha, que copia el código original con un solo clic.

### 4. Esquema del artículo a la derecha (Table of Contents)

Se sitúa a la derecha del cuerpo del texto:

- **Extracción automática de encabezados**: al renderizar la página, el sistema analiza automáticamente los encabezados de nivel 2 (`##`) y de nivel 3 (`###`) del documento actual y genera el "índice de esta página".
- **Resaltado que sigue la lectura**: durante la lectura, a medida que la página se desplaza hacia abajo, el esquema resalta automáticamente la sección que se está leyendo.
- **Salto suave al hacer clic**: al hacer clic en cualquier subtítulo del esquema, la página se desplaza suavemente hasta el párrafo correspondiente y actualiza el ancla en la barra de direcciones (por ejemplo, `#descripción-de-las-zonas-de-la-interfaz`), lo que facilita copiar y compartir.

---

## Modo claro y modo oscuro

EpoCanvas Docs ofrece dos themes, claro y oscuro; ambas paletas se definen íntegramente mediante variables CSS en `src/styles/custom.css`:

- **Según la preferencia del sistema**: al abrir la página por primera vez, el sitio detecta la configuración de claro/oscuro del sistema operativo y muestra el theme correspondiente.
- **Cambio manual con memoria**: el botón de cambio de theme de la barra superior permite alternar manualmente; la elección se guarda en el LocalStorage del navegador y sigue vigente la próxima vez que se abra.

![Aspecto de la interfaz de lectura en modo claro](/images/canvas/ui-theme-light.png)

*Figura: aspecto del mismo sitio en modo claro (tomando como ejemplo la página de inicio rápido).*

---

## Adaptación responsive en móviles y tabletas

En pantallas de distintos tamaños, como móviles o tabletas, la página ajusta automáticamente su diseño para adaptarse al tamaño de la pantalla:

| Tipo de dispositivo | Ancho de pantalla | Comportamiento del diseño |
| :--- | :--- | :--- |
| **Escritorio de pantalla ancha / portátil** | `>= 1152px` | Se muestra completo el diseño estándar de tres columnas (menú izquierdo + cuerpo central + esquema derecho). |
| **Tableta / ventana estrecha** | `768px ~ 1152px` | El esquema derecho se oculta y se mantiene el diseño de dos columnas con navegación izquierda y cuerpo. |
| **Teléfono inteligente** | `< 768px` | Las barras laterales se contraen por completo y el cuerpo se muestra a todo el ancho. Al pulsar el botón de menú de la barra superior se desliza el cajón de la barra lateral. |

Tanto si se usa un monitor ultrapanorámico como si se consulta puntualmente desde el móvil, la experiencia de lectura resulta natural y cómoda.
