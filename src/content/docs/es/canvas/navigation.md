---
title: Navegación superior y enrutado de páginas
description: Configuración de la barra de navegación superior de EpoCanvas Docs, reglas de resaltado dinámico de la ruta actual, insignia de versión externa y configuración de redirecciones históricas.
---

La barra de navegación superior es la vía principal con la que el usuario se mueve entre las distintas secciones funcionales. **EpoCanvas Docs** centraliza todos los elementos de navegación en un único archivo de configuración: basta un cambio en un solo lugar para que surta efecto en todo el sitio, e incluye de serie un resaltado preciso de la página actual y un mecanismo de redirección de enlaces históricos.

---

## Centro de configuración de la navegación (`src/config/navigation.ts`)

Todos los botones de navegación superior se mantienen como un array declarativo en `src/config/navigation.ts`. Los campos de cada entrada se definen así:

```typescript
// Definición de las propiedades de una entrada de navegación
export interface NavItem {
  id: string; // identificador único
  labelKey: string; // nombre de la clave en el diccionario de traducciones multilingüe
  defaultLabel: string; // texto mostrado por defecto (como "首页", "产品说明")
  href: string; // enlace de destino o ruta relativa
  match?: (pathname: string) => boolean; // regla que decide si la página actual debe resaltar este botón
  badge?: string; // insignia de cápsula adicional (como el número de versión "v1.2.0")
  isExternal?: boolean; // indica si es un salto a una página externa (en ese caso se abre en una ventana nueva)
}
```

### Configuración oficial actual (extracto)

```typescript
export const navigationConfig: NavItem[] = [
  {
    id: 'home',
    labelKey: 'nav.home',
    defaultLabel: '首页',
    href: '/',
    match: (pathname: string) => pathname === '/' || pathname === '',
  },
  {
    id: 'docs',
    labelKey: 'nav.docs',
    defaultLabel: '产品说明',
    href: '/canvas/',
    match: (pathname: string) =>
      pathname === '/canvas' ||
      pathname === '/canvas/' ||
      pathname.includes('about') ||
      pathname.includes('layout') ||
      pathname.includes('search-engine') ||
      pathname.includes('i18n') ||
      pathname.includes('navigation'),
  },
  {
    id: 'quickstart',
    labelKey: 'nav.quickstart',
    defaultLabel: '快速上手',
    href: '/canvas/deployment/',
    match: (pathname: string) => pathname.includes('deployment'),
  },
  // Después siguen guide (normas de redacción), deploy (despliegue) y faq (preguntas frecuentes),
  // además de la entrada externa release que apunta a GitHub Releases
];
```

Para añadir o eliminar elementos de navegación solo hay que añadir o quitar entradas de este array; al guardar, el servidor de desarrollo local se actualiza en caliente automáticamente.

---

## Reglas de activación y resaltado dinámico

Si se hiciera una comprobación tan simple como `pathname.startsWith('/canvas')`, al visitar la página de "inicio rápido" `/canvas/deployment/` se encenderían a la vez los botones "descripción del producto" e "inicio rápido", lo que resultaría confuso.

Por eso cada elemento de navegación declara su ámbito de resaltado con una función `match`:

- Al visitar la portada `/`, solo el botón "portada" queda activo;
- Al visitar documentos habituales como `/canvas/layout/` o `/canvas/about/`, se activa el botón "descripción del producto";
- Al entrar en páginas cuya ruta contiene `deployment`, se activa de forma exclusiva el botón "inicio rápido";
- El botón activo lleva un fondo de cápsula en el color del theme, que contrasta claramente con los botones inactivos.

Al añadir una página de documentación nueva, recuerde incorporar la palabra clave de su ruta a la regla `match` del elemento de navegación correspondiente; de lo contrario, la barra superior no se resaltará correctamente.

---

## Enlaces externos e interacción con la insignia de versión

Si un elemento de navegación apunta a un sitio externo (por ejemplo, la página de Releases del repositorio de GitHub):

1. Configure `isExternal: true`;
2. El sistema añade automáticamente al enlace los atributos de seguridad `target="_blank" rel="noopener noreferrer"` y lo abre en una pestaña nueva;
3. Junto al texto aparece un pequeño icono de flecha diagonal hacia fuera (`↗`), que avisa al lector de que al hacer clic abandonará el sitio actual.

La insignia de versión (`badge: 'v1.2.0'`) se muestra como una cápsula dentro del botón; al publicar una versión nueva, recuerde actualizarla, tal como se detalla en [Gestión de versiones y flujos automatizados](/canvas/releases/).

---

## Reglas de redirección de páginas (`astro.config.mjs`)

En la evolución de un proyecto es inevitable ajustar las rutas de la documentación. Para que los enlaces antiguos guardados en los favoritos de los lectores no acaben en un 404, se puede registrar la correspondencia entre rutas antiguas y nuevas en la tabla `redirects` de `astro.config.mjs`:

```javascript
export default defineConfig({
  redirects: {
    // Tras renombrar semánticamente las rutas de las secciones del sitio,
    // los enlaces antiguos se conservan todos como redirecciones
    '/canvas/rule-engine': '/canvas/cloudflare',
    '/canvas/dns-setup': '/canvas/layout',
  },
});
```

Astro genera en tiempo de compilación páginas de salto automático para esas rutas: quien visite una dirección antigua llega sin problemas a la nueva, y el peso en los buscadores también se hereda.
