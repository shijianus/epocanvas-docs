---
title: Obere Navigation & Seitenrouting
description: Konfiguration der oberen Navigationsleiste in EpoCanvas Docs, dynamische Regeln zur Pfadhervorhebung, externe Links und Versionsabzeichen sowie Einrichtung von Weiterleitungen alter Adressen.
---

Die obere Navigationsleiste ist der Hauptweg, über den Nutzer zwischen den einzelnen Funktionsbereichen wechseln. **EpoCanvas Docs** verwaltet alle Navigationseinträge zentral in einer Konfigurationsdatei: eine Änderung genügt, und sie wirkt sitewide. Zudem bringt sie eine präzise Hervorhebung der aktuellen Seite und einen Mechanismus für Weiterleitungen alter Links mit.

---

## Zentrale der Navigationskonfiguration (`src/config/navigation.ts`)

Alle Buttons der oberen Navigation werden in `src/config/navigation.ts` als deklaratives Array gepflegt. Die Felder eines Eintrags sind wie folgt definiert:

```typescript
// Eigenschaftsdefinition eines Navigationseintrags
export interface NavItem {
  id: string; // eindeutige Kennung
  labelKey: string; // Schlüsselname im mehrsprachigen Übersetzungswörterbuch
  defaultLabel: string; // standardmäßig angezeigter Text (z. B. „Startseite", „Produkt")
  href: string; // Sprunglink oder relativer Pfad
  match?: (pathname: string) => boolean; // Regel, die entscheidet, ob der Button auf der aktuellen Seite hervorgehoben werden soll
  badge?: string; // zusätzlich angezeigtes kleines Pillen-Abzeichen (z. B. Versionsnummer "v1.2.0")
  isExternal?: boolean; // ob es ein Sprung zu einer externen Website ist (dann in neuem Fenster geöffnet)
}
```

### Aktuelle offizielle Konfiguration (Auszug)

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
  // Außerdem folgen noch guide (Schreibregeln), deploy (Bereitstellung) und faq (häufige Fragen)
  // sowie der externe Eintrag release mit Verweis auf die GitHub Releases
];
```

Navigationseinträge hinzuzufügen oder zu entfernen erfordert nur das Anlegen bzw. Löschen eines Eintrags in diesem Array; nach dem Speichern aktualisiert der lokale Entwicklungsserver automatisch per Hot Reload.

---

## Dynamische Aktivierung und Hervorhebungsregeln

Würde man nur `pathname.startsWith('/canvas')` prüfen, leuchteten beim Aufruf der Schnelleinstieg-Seite `/canvas/deployment/` sowohl der Button „Produkt" als auch der Button „Schnellstart" zugleich – eine verwirrende Situation.

Deshalb deklariert jeder Navigationseintrag mit einer `match`-Funktion seinen eigenen Hervorhebungsbereich:

- Beim Aufruf der Startseite `/` ist nur der Button „Startseite" aktiv;
- beim Aufruf regulärer Dokumente wie `/canvas/layout/` oder `/canvas/about/` wird der Button „Produkt" aktiviert;
- bei Seiten unter dem Pfad `deployment` wird ausschließlich der Button „Schnellstart" aktiviert;
- aktivierte Buttons erhalten einen pillenförmigen Hintergrund in Themenfarbe und heben sich so klar von inaktiven Buttons ab.

Wenn Sie neue Dokumentseiten anlegen, denken Sie daran, das Pfad-Schlüsselwort in die `match`-Regel des zuständigen Navigationseintrags aufzunehmen – sonst hebt die Kopfzeile die Seite nicht korrekt hervor.

---

## Externe Links und das Versionsabzeichen

Zeigt ein Navigationseintrag auf eine externe Website (z. B. die Releases-Seite des GitHub-Repositorys):

1. konfigurieren Sie `isExternal: true`;
2. versieht das System den Link automatisch mit den Sicherheitseigenschaften `target="_blank" rel="noopener noreferrer"` und öffnet ihn in einem neuen Tab;
3. erscheint neben dem Text ein kleines, nach außen geneigtes Pfeilsymbol (`↗`), das darauf hinweist, dass man die aktuelle Website beim Klicken verlässt.

Das Versionsabzeichen (`badge: 'v1.2.0'`) wird als Pille im Button angezeigt; denken Sie bei einem neuen Release daran, es mitzupflegen. Details siehe [Versionsverwaltung & automatisierte Workflows](/canvas/releases/).

---

## Weiterleitungsregeln (`astro.config.mjs`)

Im Lauf der Projektentwicklung werden Dokumentpfade zwangsläufig geändert. Damit alte Links in den Lesezeichen der Leser nicht auf 404 laufen, tragen Sie die Zuordnung zwischen alten und neuen Pfaden in der `redirects`-Tabelle in `astro.config.mjs` ein:

```javascript
export default defineConfig({
  redirects: {
    // Nach dem semantischen Umbenennen der Kapitelpfade bleiben alle alten Links als Weiterleitung erhalten
    '/canvas/rule-engine': '/canvas/cloudflare',
    '/canvas/dns-setup': '/canvas/layout',
  },
});
```

Astro erzeugt beim Build für diese Pfade automatische Weiterleitungsseiten; wer eine alte Adresse aufruft, wird sanft zur neuen Adresse geführt, und auch das Suchmaschinen-Ranking wird vererbt.
