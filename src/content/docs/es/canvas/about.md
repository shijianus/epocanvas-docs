---
title: Qué es esto
description: "Lea primero este artículo: EpoCanvas Docs es el proyecto de documentación oficial de EpoCanvas. Esta página aclara qué es, qué relación tiene con el repositorio de código, para qué sirve exactamente y por dónde debería empezar a leer cada tipo de lector."
---

**EpoCanvas Docs es el proyecto de documentación oficial del proyecto EpoCanvas**. Dicho sin rodeos: lo que entrega este repositorio es la propia "documentación"; el sitio entero que está navegando ahora mismo es su producto final. En el repositorio no hay código funcional de ningún otro software: el "producto" que busca es este sitio de documentación.

---

## Qué significa "proyecto de documentación"

El término tiene dos significados, y ambos se cumplen a la vez:

1. **Es un manual.** El contenido gira en torno a "qué es, cómo se usa, cómo se modifica y cómo se publica": cómo manejar la interfaz de lectura, cómo redactar nuevos documentos, dónde se cambia la configuración y cuáles son los comandos de despliegue. Tiene un único propósito: que quien reciba EpoCanvas no tenga que andar preguntando por ahí y pueda hacer las cosas siguiendo la documentación.
2. **Es también un sistema de sitio web que se puede ejecutar directamente.** Clone el repositorio en local, ejecute los dos comandos `pnpm install` y `pnpm run dev`, y obtendrá exactamente el sitio que tiene delante. Todo el código está basado en Astro 5 y Starlight, se publica bajo licencia MIT y puede llevarse entero para convertirlo en el sitio de documentación de su propio proyecto.

Hay además una característica que suele pasar desapercibida: **cada función que describe esta documentación la está usando usted mismo en este momento**. El layout de lectura en tres columnas, la búsqueda en todo el sitio con `Ctrl + K`, el cambio in situ entre 10 idiomas en la esquina superior derecha: lo que la documentación explica son las capacidades que este propio sitio implementa, y basta con leer y probar para comprobarlo.

---

## Para qué sirve exactamente

Según el papel de cada lector, este proyecto de documentación cumple tres funciones:

| Quién es usted | En qué le ayuda | Dónde se recomienda empezar |
| :--- | :--- | :--- |
| **Lector que solo busca información** | Consultar cómo se usa una función o cómo se resuelve un error | Cuadro de búsqueda de la barra superior o búsqueda en todo el sitio con `Ctrl + K`, y saltar directamente al capítulo correspondiente |
| **Desarrollador que quiere montar su propio sitio de documentación** | Ofrece el código fuente completo y funcional de un sitio de documentación y su flujo de despliegue | Introducción al producto → Inicio rápido → Despliegue |
| **Redactor que participa en la documentación** | Establece dónde se guardan los archivos, cómo se escribe el formato, dónde se colocan las imágenes y cómo se publica | Los tres capítulos del grupo "Redacción de documentación y gestión de contenidos" |

En una frase: **que el usuario lo entienda, que el desarrollador pueda llevárselo y que el redactor tenga un camino claro que seguir.**

---

## Qué contiene este proyecto

La barra lateral se divide en cinco grupos, y cada uno responde a una pregunta:

- **Visión general del producto e inicio**: ¿qué es esto? ¿Cómo se ejecuta en local?
- **Funciones principales y guías de uso**: ¿cómo se usan exactamente la interfaz de lectura, la búsqueda, el multilingüismo y la navegación?
- **Redacción de documentación y gestión de contenidos**: ¿cómo se escribe un documento nuevo? ¿Qué reglas hay para el formato y el renderizado de Markdown?
- **Configuración y personalización**: ¿dónde se cambian el título del sitio, el menú de navegación y los colores del tema? ¿Cómo se modifican los componentes?
- **Publicación y despliegue**: ¿cómo publicar en línea, vincular un dominio, hacer SEO y gestionar versiones?

Cada artículo funciona por sí solo como referencia; no hace falta leerlo todo en orden.

---

## Dos malentendidos habituales

**Malentendido uno: "Esto es el manual de un software y yo busco ese software."**
Este repositorio solo contiene el código fuente del sitio de documentación; no hay código de ningún otro software. Lo que la documentación explica en realidad es el propio uso, la personalización y el despliegue de este sistema de sitio de documentación.

**Malentendido dos: "Es un sitio de solo lectura, bajarlo no sirve de mucho."**
Al contrario: el código fuente está totalmente abierto en GitHub, se ejecuta en local con dos comandos, y usarlo como plantilla para convertirlo en el sitio de documentación de su propio proyecto es, precisamente, uno de los usos para los que está diseñado.

---

## Siguientes pasos

- Si quiere ver la presentación completa del posicionamiento del producto, sus funciones principales y la elección tecnológica, lea **[Descripción del producto y valor clave](/canvas/)**.
- Si quiere ejecutar el sitio en local de inmediato, lea **[Inicio rápido (en marcha en 3 minutos)](/canvas/deployment/)**.
- Si solo busca un tema concreto, use directamente el cuadro de búsqueda de la barra superior o `Ctrl + K` con las palabras clave.
