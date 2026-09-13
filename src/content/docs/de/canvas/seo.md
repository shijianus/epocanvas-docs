---
title: SEO & Performance-Optimierung
description: Die in EpoCanvas Docs eingebauten SEO-Fähigkeiten (Meta-Tags, Open Graph, Sitemap, robots.txt) und Performance-Mechanismen sowie wie man die Site bei Suchmaschinen anmeldet.
---

Dokumentation ist für Menschen geschrieben – Voraussetzung dafür ist, dass sie gefunden wird und schnell öffnet. **EpoCanvas Docs** bringt auf der Build-Ebene einen Satz sofort einsatzbereiter SEO-Fähigkeiten und Performance-Mechanismen mit. Diese Seite erklärt, worum es sich jeweils handelt, wie man sie überprüft und welche wenigen Schritte nach dem Go-live noch zu erledigen sind.

---

## Eingebaute SEO-Fähigkeiten

Alle folgenden Fähigkeiten greifen automatisch zur Build-Zeit und brauchen keine zusätzliche Konfiguration:

| Fähigkeit | Umsetzung | Prüfmethode |
| :--- | :--- | :--- |
| Seitentitel | `<title>Artikeltitel \| EpoCanvas Docs</title>`, aus dem Frontmatter | Seitenquelltext ansehen oder Browser-Tab |
| Seitenbeschreibung | `<meta name="description">`, aus dem `description` im Frontmatter | Quelltext ansehen |
| Open-Graph-Tags | `og:title`, `og:type`, `og:url`, `og:locale`, `og:description`; zeigen beim Teilen in sozialen Plattformen eine Karte | Link in einen Chat einfügen und die Vorschau ansehen |
| Canonical-Link | pro Seite wird automatisch `<link rel="canonical">` erzeugt, mit Verweis auf die Hauptdomain | Quelltext ansehen |
| Sitemap | bei jedem Build entsteht automatisch `sitemap-index.xml` | `/sitemap-index.xml` aufrufen |
| robots.txt | im Projekt liegt `public/robots.txt` bei; lässt alle Crawler zu und deklariert den Ort der Sitemap | `/robots.txt` aufrufen |

:::tip
`title` und `description` im Frontmatter sind das Hauptmaterial für die Anzeige in Suchmaschinen. Achten Sie beim Schreiben von Dokumenten unbedingt auf eine kurze, treffsichere `description` – das ist die wichtigste Einzelmaßnahme für SEO.
:::

### Canonical und Spiegeldomain

Die Hauptdomain der Site ist `docs.epocanvas.com`; die `<site>`-Konfiguration entspricht ihr, und der Canonical-Link sowie `og:url` jeder Seite zeigen auf die Hauptdomain. Selbst wenn die Inhalte gleichzeitig über die Spiegel-Adresse `epocanvas-docs.pages.dev` erreichbar sind, rechnen Suchmaschinen die Wertigkeit der Hauptdomain zu und stufen nichts als doppelten Inhalt ein.

---

## Performance-Mechanismen

### Reine statische Ausgabe, kein Framework zur Laufzeit

Das Build-Ergebnis ist reines HTML + CSS. Seitennavigation, Lesen und die hervorhebende Scrollverfolgung des Inhaltsverzeichnisses erfordern keinen Download irgendeines Frontend-Frameworks (Laufzeitgröße von React/Vue usw.: null); nur interaktive Komponenten wie Suche, Design-Umschaltung und Sprachumschaltung laden bei Bedarf wenige Skripte nach. Das Rendering des ersten Bildschirms wartet nicht auf JavaScript; auch auf schwachen Verbindungen und leistungsschwachen Geräten läuft alles flüssig.

### Bildkompression zur Build-Zeit

Statische Ressourcen, die über `public/` eingebunden werden, liefert beim Deployment das CDN aus; in der Build-Werkzeugkette ist das Bildverarbeitungsmodul sharp enthalten, das die Möglichkeit für eine spätere eingebaute Bildoptimierung zur Build-Zeit offenhält. Die aktuelle Konvention schreibt vor, Screenshot-Breiten bei etwa 1440 Pixel zu halten und für Schaubilder vorrangig SVG zu verwenden – so wird das Bildvolumen an der Quelle begrenzt.

### Bedarfsgesteuertes Laden des Suchindex

Pagefind erzeugt bei `pnpm run build` stark komprimierte Index-Segmente. Leserinnen und Leser laden beim Öffnen einer Seite keinerlei Index herunter; erst wer die Suche auf der gesamten Site wirklich nutzt, zieht der Browser passend zum Suchbegriff die entsprechenden Segmente nach (wenige KB bis einige zehn KB) – ohne Auswirkung auf die Geschwindigkeit des ersten Bildschirms.

### Wie Sie die Performance überprüfen

1. Öffnen Sie in den Browser-Entwicklertools den **Network**-Bereich, laden Sie die Seite neu und sehen Sie sich das übertragene Volumen des ersten Bildschirms an;
2. Führen Sie in einem Chrome-Inkognito-Fenster einen **Lighthouse**-Audit durch (Kategorie Performance) und prüfen Sie die Punktzahl;
3. Kontrollieren Sie mit `curl -sI https://docs.epocanvas.com`, ob CDN-Caching-Strategien wie `Cache-Control` in den Antwortheadern wirksam sind.

---

## Drei Dinge, die nach dem Go-live sinnvoll sind

Nach dem abgeschlossenen Deployment (siehe [Veröffentlichung auf Cloudflare Pages](/canvas/cloudflare/)) empfiehlt sich folgende Reihenfolge:

### 1. Die Sitemap bei der Google Search Console einreichen

1. Öffnen Sie die [Google Search Console](https://search.google.com/search-console) und legen Sie die Ressource `docs.epocanvas.com` an;
2. Verifizieren Sie den Domänenbesitz gemäß Anleitung über einen DNS-TXT-Eintrag (liegt die Domain bei Cloudflare, geht das in wenigen Minuten);
3. Reichen Sie unter „Sitemaps“ im linken Menü `https://docs.epocanvas.com/sitemap-index.xml` ein.

### 2. Den Indexierungserfolg prüfen

Eine Woche nach dem Go-live suchen Sie bei Google mit `site:docs.epocanvas.com` und bestätigen, dass die Artikel indexiert sind; im Bericht „Seiten“ der Search Console kontrollieren Sie, ob die Anzahl der indexierten Seiten der Zahl der Dokumente entspricht.

### 3. Regelmäßig tote Links prüfen

Nach Dokument-Überarbeitungen oder umbenannten Pfaden können alte, von fremden Seiten verlinkte URLs ins Leere führen. Sehen Sie im Bericht „Seiten“ der Search Console unter „Nicht gefunden (404)“ nach und ergänzen Sie in der `redirects`-Tabelle von `astro.config.mjs` Umleitungen für stark frequentierte, ungültig gewordene Pfade.

:::caution
Die Spiegeldomain `epocanvas-docs.pages.dev` dient nur als Reserve-Zugang; der Canonical-Link stellt bereits sicher, dass Suchmaschinen nur die Hauptdomain indexieren. Verbreiten Sie die Spiegel-Adresse nicht aktiv außerhalb der Site, damit Leser nicht eine Domain als Lesezeichen speichern, die Sie nicht unter Kontrolle haben.
:::
