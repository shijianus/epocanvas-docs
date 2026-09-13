---
title: Hinweisboxen, Codeblöcke & Diagramme
description: "Praktische Verwendung und tatsächliches Rendering in EpoCanvas Docs: 4 farbige Hinweisboxen, Codeblock-Titelleisten und Zeilenhervorhebung, diff-Vergleiche und das Einfügen von Diagrammen."
---

Gute technische Dokumentation braucht neben klaren Texten auch auffällige Hervorhebungen, sauber formatierte Codebeispiele und auf einen Blick verständliche Schaubilder. Alle Beispiele auf dieser Seite sind tatsächlich wirksame Syntax – was Sie sehen, ist das Renderergebnis; diese Seite ist selbst ein lebendes Beispiel.

---

## 1. Vier farbige Hinweisboxen

Hinweisboxen verwenden die Dreifach-Doppelpunkt-Syntax: Sie beginnen mit `:::Typ`, enden mit `:::` und dazwischen steht der Inhalt. Diese Website basiert auf Starlight und unterstützt die vier Typen **note, tip, caution und danger**.

### Syntax und tatsächliche Wirkung im Vergleich

:::note
**note (Ergänzung)**: für Hintergrundwissen, ergänzende Designdetails oder Hinweise auf Voraussetzungen.
:::

:::tip
**tip (Praxistipp)**: für Kniffe und Best Practices, die die Arbeit effizienter machen.
:::

:::caution
**caution (Achtung)**: weist auf mögliche Kompatibilitätskonflikte, potenzielle Fehler oder besonders sorgfältig auszuführende Schritte hin.
:::

:::danger
**danger (Gefahr)**: die höchste Warnstufe für Datenverlust, das Überschreiben von Produktivumgebungen oder nicht rückgängig zu machende Aktionen.
:::

### In Hinweisboxen passt beliebiger Inhalt

Innerhalb einer Hinweisbox können Listen, Codeblöcke, Tabellen und weitere Syntax verwendet werden:

:::tip[Installation beschleunigen]
Abhängigkeiten mit pnpm zu installieren ist deutlich schneller als mit npm:

```bash
npm install -g pnpm
```
:::

:::caution
Zwei häufige, unwirksame Schreibweisen – bitte vermeiden:

- die GitHub-typische Blockquote-Syntax `> [!NOTE]` wird nicht unterstützt und erscheint unverändert als gewöhnliche Blockquote;
- `:::important` und `:::warning` sind **keine von dieser Website unterstützten Typen**; es gibt keinen Fehler, aber sie werden stillschweigend als normaler Absatz ohne jede Hinweisbox-Formatierung gerendert.

Beim Migrieren aus GitHub-Dokumenten bitte `> [!NOTE]` zu `:::note`, `> [!WARNING]` zu `:::caution` und `> [!CAUTION]` zu `:::danger` umschreiben.
:::

---

## 2. Erweiterte Codeblock-Formatierung

### 2.1 Dateinamen-Titel und Hervorhebung bestimmter Zeilen

Tragen Sie in der ersten Zeile des Code-Fences `title="Dateipfad"` ein und heben Sie wichtige Zeilen mit `{Zeilennummer}` hervor:

````markdown
```typescript title="src/config/site.ts" {2}
export const siteConfig = {
  name: 'EpoCanvas Docs', // diese Zeile wird mit hervorgehobenem Hintergrund betont
  version: '1.2.0',
};
```
````

**Renderergebnis:**

```typescript title="src/config/site.ts" {2}
export const siteConfig = {
  name: 'EpoCanvas Docs',
  version: '1.2.0',
};
```

### 2.2 Code-Differenzen (diff)

Bei Konfigurations-Upgrades oder Refactorings macht die Sprache `diff` Änderungen auf einen Blick sichtbar: Zeilen mit `-` erscheinen als gelöscht, Zeilen mit `+` als neu hinzugefügt:

````markdown
```diff
  export default defineConfig({
-   site: 'http://localhost:3000',
+   site: 'https://docs.epocanvas.com',
  });
```
````

**Renderergebnis:**

```diff
  export default defineConfig({
-   site: 'http://localhost:3000',
+   site: 'https://docs.epocanvas.com',
  });
```

### 2.3 Terminal-Befehle

Terminal-Sprachen wie `bash`, `sh` oder `powershell` werden mit einem dunklen Rahmen im Terminal-Stil gerendert:

```bash
pnpm run build
```

---

## 3. Wie fügt man Diagramme ein?

Die aktuelle Version **bringt kein Rendering von Textdiagrammen wie Mermaid mit**. Ein direkt geschriebener ` ```mermaid `-Fence zeigt den Quelltext nur als gewöhnlichen Codeblock an und erzeugt keine Grafik.

Empfohlenes Vorgehen: Das Diagramm in einem Tool wie [mermaid.live](https://mermaid.live) schreiben und als **SVG-Vektorgrafik** exportieren, unter `public/images/canvas/` speichern und mit der Bild-Syntax einfügen. So wurden auch das Architekturdiagramm und das Sprachwechsel-Flussdiagramm dieser Website erstellt:

![Schemadarstellung der Systemarchitektur](/images/canvas/docs-architecture.svg)

*Abbildung: Als SVG-Bild eingefügtes Architekturdiagramm – bleibt bei beliebigem Zoomen scharf.*

Soll Mermaid-Quelltext wirklich direkt zu einer Grafik gerendert werden, müssen Sie ein zusätzliches Rendering-Plugin (z. B. `rehype-mermaid`) ins Projekt aufnehmen. Das gehört zur sekundären Eigenentwicklung – bitte erst die Wartungskosten abschätzen und dann einführen.

---

## 4. Weitere praktische Formatierungen

- Inline-Code: `pnpm run dev` wird in Monospace-Schrift in Themenfarbe gerendert;
- Tasten: <kbd>Ctrl</kbd> + <kbd>K</kbd> wird im Tastenkappen-Stil gerendert;
- Aufgabenlisten:

```markdown
- [x] Syntaxhervorhebung unterstützt
- [x] Kopieren mit einem Klick unterstützt
- [ ] Eingebautes Mermaid-Rendering (geplant)
```

Gerendert werden Listeneinträge mit angekreuztem Zustand.

### 4.1 Fußnoten

Wenn Sie Quellen oder ergänzende Anmerkungen kennzeichnen möchten, können Sie die GFM-Fußnoten-Syntax verwenden:

````markdown
Der statische Index wird von Pagefind beim Build erzeugt[^pagefind].

[^pagefind]: [Pagefind-Dokumentation](https://pagefind.app/) – lokale Suchbibliothek für statische Websites.
````

**Renderergebnis:** Am Ende des Haupttexts erscheint eine hochgestellte Sprungmarke mit Nummer[^pagefind-demo]; ein Klick scrollt weich zur Fußnotenliste am Seitenende.

[^pagefind-demo]: Dies ist genau die Fußnote, die am Ende dieser Seite gerendert wird.

Wer Hinweisboxen, Code-Annotationen und Schaubilder gezielt einsetzt, macht technische Dokumentation deutlich angenehmer zu lesen und professioneller. Die vollständigen Syntaxkonventionen finden Sie in **[Renderregeln im Detail](/canvas/rendering/)**.
