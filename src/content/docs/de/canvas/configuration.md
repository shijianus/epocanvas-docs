---
title: Site-Konfiguration & Stil-Anpassung
description: Leitfaden zur Bearbeitung der zentralen Konfigurationsdateien von EpoCanvas Docs, Anpassung des Seitenleisten-Menüs, Austausch des Markenlogos und Festlegung der Themenfarben.
---

Wenn Sie **EpoCanvas Docs** als Dokumentationsseite für Ihr eigenes Team verwenden oder den Seitentitel, das Logo, die Verzeichnisstruktur und die Themenfarben anpassen möchten, stellt dieses Kapitel die gängigen Anpassungspunkte vor. Nach dem Speichern aller Konfigurationsänderungen aktualisiert sich der lokale Entwicklungsserver automatisch per Hot Reload, und die Änderungen sind sofort im Browser sichtbar.

---

## 1. Grundlegende Site-Informationen (`astro.config.mjs`)

Die Datei `astro.config.mjs` im Projektstammverzeichnis ist die Hauptkonfigurationsdatei der gesamten Dokumentationsseite. Die Optionen mit direktem Bezug zu den Site-Informationen sind unten aufgeführt (die Kommentare geben an, wann eine Änderung sinnvoll ist):

```javascript
export default defineConfig({
  // Produktions-Domain der Site, wirkt sich auf SEO-Links und die Sitemap-Generierung aus
  site: 'https://docs.epocanvas.com',

  integrations: [
    starlight({
      // Titel der Website, wird im Browser-Tab und in der oberen Leiste angezeigt
      title: 'EpoCanvas Docs',
      // Beschreibung der Site, wird für Suchmaschinen-Snippets verwendet
      description: 'EpoCanvas 全栈技术、架构与产品运维指南',

      // Bildpfad des Logos links in der oberen Leiste
      logo: {
        src: './public/images/logo.svg',
        replacesTitle: false, // auf true setzen, um nur das Logo anzuzeigen und den Titeltext auszublenden
      },

      // Link zum GitHub-Repository oben rechts
      social: {
        github: 'https://github.com/shijianus/epocanvas-docs',
      },

      // Einstiegspunkt für das eigene Stylesheet
      customCss: ['./src/styles/custom.css'],

      // Seitenleisten-Verzeichnis (siehe nächster Abschnitt)
      sidebar: [/* ... */],
    }),
  ],

  // Umleitungstabelle für alte Pfade, um defekte Links zu verhindern
  redirects: { '/mail': '/canvas/' },
});
```

---

## 2. Wie ändert man das Menü der linken Seitenleiste?

Das Kategorienverzeichnis auf der linken Seite wird über das `sidebar`-Array in der Starlight-Konfiguration von `astro.config.mjs` gesteuert:

```javascript
sidebar: [
  // Gruppe eins: Produktureinblick
  {
    label: '产品概览与入门',       // Name der Gruppe
    items: [
      { label: '产品简介与核心价值', link: '/canvas/' },
      { label: '快速上手 (3分钟运行)', link: '/canvas/deployment/' },
    ],
  },
  // Gruppe zwei: Hier können Sie eigene Fachgruppen ergänzen
  {
    label: '用户指南',
    items: [
      { label: '账号注册与登录', link: '/canvas/login/' },
    ],
  },
];
```

- **`label`**: Der in der Seitenleiste angezeigte Kategorien- oder Artikelname; er darf vom `title` im Frontmatter abweichen (z. B. mit einer kürzeren Anzeigebezeichnung);
- **`link`**: Der Zugriffspfad des Artikels, entsprechend der Dateiposition unter `src/content/docs/`.

:::warning
Eine neu angelegte `.md`-Datei erscheint erst im linken Verzeichnis, wenn sie im `sidebar`-Array registriert wurde. Dateien nur anzulegen, ohne sie zu registrieren, ist der häufigste Anfängerfehler.
:::

---

## 3. Eigene Marken- und Themenfarben (`src/styles/custom.css`)

Alle Farben der Site werden über CSS-Variablen gesteuert, die in `src/styles/custom.css` definiert sind. Am Dateianfang stehen die Variablen des hellen Designs; der Block `:root[data-theme='dark']` enthält die Variablen des dunklen Designs:

```css
:root {
  /* Marken-Hauptfarbe (helles Design) */
  --sl-color-accent: #2563eb;
  --sl-color-accent-low: rgba(37, 99, 235, 0.08);  /* heller Hintergrund für ausgewählte Einträge */
  --sl-color-accent-high: #1d4ed8;                  /* Links und hervorgehobener Text */

  /* Seitenhintergrund und Trennlinien */
  --sl-color-bg: #ffffff;
  --sl-color-hairline: #e2e8f0;
}

:root[data-theme='dark'] {
  /* Im dunklen Design werden dieselben Variablen verwendet, nur die Farbwerte werden ersetzt */
  --sl-color-accent: #3b82f6;
  --sl-color-accent-low: rgba(59, 130, 246, 0.12);
  --sl-color-accent-high: #60a5fa;

  --sl-color-bg: #0b0f19;
  --sl-color-hairline: #1e293b;
}
```

Wenn Sie die Hauptfarbe der gesamten Site zum Beispiel in ein kräftiges Grün ändern möchten, ersetzen Sie `--sl-color-accent` in beiden Blöcken (hell und dunkel) durch einen `#10b981`-Farbwert; Schaltflächen, Auswahlzustände und Links färben sich automatisch synchron um.

Auch die Layoutmaße sind zentral am Anfang dieser Datei definiert:

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* Breite des linken Verzeichnisses */
  --sl-content-width: 60rem;    /* maximale Breite des Haupttextes */
  --sl-nav-height: 3.5rem;      /* Höhe der oberen Leiste */
}
```

---

## 4. Logo der Site austauschen

1. Bereiten Sie eine Vektorgrafik Ihres Markenlogos vor (empfohlen wird `.svg`, ein sauberes `.png` ist ebenfalls möglich);
2. Speichern Sie sie überschreibend als `public/images/logo.svg` (das große Bild auf der Startseite liegt in `src/assets/logo.svg`);
3. Laden Sie den Browser neu; das Symbol in der oberen Leiste und auf der Startseite wird automatisch ausgetauscht.

:::tip
Die beiden Logos haben unterschiedliche Zwecke: `public/images/logo.svg` wird in der oberen Leiste verwendet, `src/assets/logo.svg` als großes Dekorationsbild rechts auf der Startseite. Ein gleichzeitiger Austausch wird empfohlen.
:::
