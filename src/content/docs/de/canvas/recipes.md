---
title: Häufige Anpassungsrezepte
description: "Schnellreferenz für die häufigsten Anpassungen an EpoCanvas Docs: neue Dokumente, Navigationsschaltflächen, Oberflächensprachen, Themenfarben, Logo, Layoutmaße und Suchtexte – jeweils mit vollständigen Schritten."
---

Diese Seite fasst die häufigsten Anpassungswünsche in einer Schnellreferenz zusammen, die sich Schritt für Schritt abarbeiten lässt. Bei jedem Rezept ist die Änderungsstelle bis zur konkreten Datei angegeben; wer vorher die [Rendering-Regeln](/canvas/rendering/) und das [Komponentensystem](/canvas/components/) überfliegt, vermeidet Umwege.

---

## Rezept 1: Ein neues Dokument anlegen

1. Erstellen Sie unter `src/content/docs/canvas/` eine neue `.md`-Datei (Kleinbuchstaben mit Bindestrichen, z. B. `user-guide.md`);
2. Schreiben Sie am Dateianfang das Frontmatter:

   ```yaml
   ---
   title: Benutzerhandbuch
   description: Ein Satz, der den Inhalt beschreibt; erscheint in Suchergebnissen und auf Vorschaukarten.
   ---
   ```

3. Öffnen Sie `astro.config.mjs` und registrieren Sie die Datei in der Zielgruppe des `sidebar`-Arrays:

   ```javascript
   { label: 'Benutzerhandbuch', link: '/canvas/user-guide/' }
   ```

4. Prüfen Sie nach dem Speichern in der lokalen Vorschau, ob der Eintrag im linken Verzeichnis erscheint, und veröffentlichen Sie dann mit `pnpm run deploy`.

:::warning
Wer nur die Datei anlegt, ohne sie im `sidebar` zu registrieren, erhält eine erreichbare Seite ohne Eintrag im linken Verzeichnis – der häufigste Anfängerfehler.
:::

---

## Rezept 2: Eine neue Navigationsschaltfläche in der oberen Leiste anlegen

1. Öffnen Sie `src/config/navigation.ts` und ergänzen Sie einen Eintrag im `navigationConfig`-Array:

   ```typescript
   {
     id: 'blog',
     labelKey: 'nav.blog',
     defaultLabel: 'Blog',
     href: 'https://blog.epocanvas.com',
     isExternal: true,          // externe Links öffnen sich in einem neuen Fenster
   },
   ```

2. Öffnen Sie `src/utils/i18n.ts` und ergänzen Sie für `nav.blog` die Übersetzungseinträge für alle 10 Sprachen;
3. Nach dem Speichern erscheint die neue Schaltfläche sofort in der oberen Leiste; damit interne Links an der Navigationshervorhebung teilnehmen, konfigurieren Sie für sie eine `match`-Funktion.

---

## Rezept 3: Hervorhebungsregeln für Seiten anpassen

Wenn sich Seitenpfade geändert haben und die obere Leiste die falsche Schaltfläche hervorhebt, passen Sie die `match`-Funktion des betreffenden Eintrags in `navigation.ts` an:

```typescript
match: (pathname: string) =>
  pathname === '/canvas/' || pathname.includes('layout'),
```

Die Regel lautet: exakte Treffer haben Vorrang, `includes` dient als Auffangnetz. Die `match`-Funktionen mehrerer Schaltflächen dürfen sich nicht überschneiden, sonst werden zwei Schaltflächen gleichzeitig hervorgehoben.

---

## Rezept 4: Die Marken-Themenfarbe wechseln

1. Öffnen Sie `src/styles/custom.css`;
2. Ändern Sie das Farbtriplett der Hauptfarbe in beiden Blöcken, im hellen (`:root`) und im dunklen (`:root[data-theme='dark']`):

   ```css
   --sl-color-accent: #10b981;      /* Hauptfarbe: Schaltflächen, Auswahlzustände */
   --sl-color-accent-low: rgba(16, 185, 129, 0.1);  /* heller Hintergrund für ausgewählte Einträge */
   --sl-color-accent-high: #047857; /* Links und hervorgehobener Text */
   ```

3. Nach dem Speichern färben sich Schaltflächen, Hervorhebungen und Links auf der ganzen Site automatisch um. Ändern Sie nur eine Stelle, gerät die Farbabstimmung im jeweils anderen Design aus dem Gleichgewicht.

---

## Rezept 5: Logo austauschen

| Position | Datei | Zweck |
| :--- | :--- | :--- |
| Links in der oberen Leiste | `public/images/logo.svg` | Symbol in der oberen Leiste der Unterseiten; der Pfad ist in `logo.src` von `astro.config.mjs` konfiguriert |
| Großes Bild auf der Startseite | `src/assets/logo.svg` | Dekorationsbild rechts auf der Landingpage |

Ein gleichzeitiger Austausch an beiden Stellen wird empfohlen. Verwenden Sie für das Logo das SVG-Vektorformat; mit `logo.replacesTitle` auf `true` in `astro.config.mjs` blenden Sie den Titeltext aus und behalten nur das Symbol.

---

## Rezept 6: Layoutmaße anpassen

Die drei Layoutgrößen sind gebündelt am Anfang von `src/styles/custom.css` definiert:

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* Breite des linken Verzeichnisses */
  --sl-content-width: 60rem;    /* maximale Breite des Haupttextes */
  --sl-nav-height: 3.5rem;      /* Höhe der oberen Leiste */
}
```

:::caution
Die Breite der Verzeichnisspalte rechts steckt nicht in diesen Variablen; sie wird durch den Wert `20rem` in `src/components/starlight/TwoColumnContent.astro` gesteuert (auf sehr breiten Bildschirmen `21rem`). Wenn Sie die Breite der rechten Spalte anpassen, ändern Sie in derselben Datei auch synchron `max-width: calc(100% - 20rem)` im Haupttextbereich.
:::

---

## Rezept 7: Hinweistexte des Suchfelds ändern

Der Platzhalter des Suchfelds, Schaltflächenhinweise und andere Oberflächentexte stammen alle aus dem mehrsprachigen Wörterbuch in `src/utils/i18n.ts`. Öffnen Sie die Datei und ändern Sie Einträge wie `search.placeholder` in der zweistufigen Struktur „Sprache → Eintragsschlüssel“:

```typescript
// Dateipfad: src/utils/i18n.ts
export const UI_TRANSLATIONS = {
  'zh-CN': {
    'search.placeholder': '搜索文档与指令...',
    // ... weitere Einträge dieser Sprache
  },
  en: {
    'search.placeholder': 'Search documentation...',
    // ... weitere Einträge dieser Sprache
  },
  // die übrigen 8 Sprachen analog
};
```

Für übersprungene Sprachen wird automatisch der chinesische Standardwert als Fallback angezeigt, ohne Fehlermeldung. Nach dem Speichern ist die Änderung dank Hot Reload sofort in der lokalen Vorschau sichtbar; ein Build ist nicht nötig.

---

## Rezept 8: Verifizierungs-`<head>`-Tags für die Site ergänzen

Für die Anbindung an Dienste wie die Google Search Console müssen Verifizierungs-Tags in den `<head>` injiziert werden. Öffnen Sie `astro.config.mjs` und ergänzen Sie im `head`-Array der Starlight-Konfiguration:

```javascript
head: [
  // vorhandene favicon-Konfiguration ...
  {
    tag: 'meta',
    attrs: {
      name: 'google-site-verification',
      content: 'Verifizierungs-Zeichenkette',
    },
  },
],
```

Prüfen Sie nach dem Speichern und erneuten Deployment mit der Verifizierungsfunktion des jeweiligen Dienstes. Weitere Suchmaschinen-Einstellungen nach dem Go-live finden Sie unter [SEO & Performance-Optimierung](/canvas/seo/).

---

## Allgemeiner Prüfablauf nach Änderungen

Welche Anpassung Sie auch vornehmen: Prüfen Sie vor dem Commit in dieser Reihenfolge:

```bash
pnpm run dev      # 1. Ergebnis Seite für Seite im Browser ansehen
pnpm exec astro check && pnpm run build   # 2. Typprüfung + vollständiger Build
pnpm run preview  # 3. Build-Ergebnis in der Vorschau prüfen und erst dann veröffentlichen
```

Wie veröffentlicht wird, beschreibt [Veröffentlichung auf Cloudflare Pages](/canvas/cloudflare/).
