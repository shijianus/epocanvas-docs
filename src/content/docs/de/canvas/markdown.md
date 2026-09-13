---
title: Markdown-Leitfaden für Text und Formatierung
description: "EpoCanvas Docs – Ablagekonventionen für Dokumentdateien, Anforderungen an die Frontmatter-Kopfmetadaten sowie die vollständige Liste aller unterstützten Formate: Schreibweise und echtes Renderergebnis von grundlegendem Markdown und erweiterter Syntax im Vergleich."
---

In **EpoCanvas Docs** lassen sich Dokumente mühelos hinzufügen oder bearbeiten. Der gesamte Haupttext wird in Standard-**Markdown** geschrieben – wer Markdown beherrscht, kann sofort bei der Verfassung und Pflege der Dokumentation mitmachen.

Diese Seite enthält die vollständige Liste der von der Site unterstützten Formate: Abschnitt 3 listet die grundlegenden Markdown-Formate einzeln auf, Abschnitt 4 die zusätzlich unterstützten Erweiterungen der Site. Zu jedem Punkt finden Sie die Gegenüberstellung von „So schreibt man es" und „So sieht es gerendert aus" – was Sie hier sehen, sind echte Renderergebnisse.

---

## 1. Wo liegen die Dokumentdateien?

Alle Dokumentdateien liegen im Verzeichnis `src/content/docs/` des Projekts:

```text
src/content/docs/
├── index.mdx          # Startseite der Website
├── canvas/            # Kernkapitel der Dokumentation (vereinfachtes Chinesisch, Standardsprache)
│   ├── index.md       # Produktüberblick
│   ├── deployment.md  # Schnellstart
│   ├── layout.md      # Seitenlayout
│   ├── ...            # weitere Dokumente
└── en/ ja/ ...        # Übersetzungen in den anderen 9 Sprachen, Verzeichnisstruktur entspricht exakt der chinesischen Version
```

- **Anforderungen an Dateinamen**: Verwenden Sie Kleinbuchstaben und Bindestriche (z. B. `quickstart-guide.md`), keine chinesischen Zeichen und keine Leerzeichen. Der Dateiname bestimmt den Zugriffspfad: `canvas/deployment.md` entspricht `/canvas/deployment/`.
- **Dateiendung**: In der Regel genügt eine reine `.md`-Datei; wenn Sie in einem Artikel interaktive Komponenten einbetten möchten (wie das Kartenraster auf der Startseite), verwenden Sie das `.mdx`-Format.
- **In der Seitenleiste registrieren**: Nach dem Anlegen einer neuen Datei müssen Sie sie im `sidebar`-Array in `astro.config.mjs` eintragen, sonst erscheint sie nicht im Verzeichnis links.
- **Übersetzungen in anderen Sprachen**: Die Übersetzungen anderer Sprachen liegen im Verzeichnis `src/content/docs/<Sprache>/`; die Unterverzeichnisstruktur entspricht exakt der chinesischen Version (z. B. entspricht `en/canvas/deployment.md` dem Schnellstart der englischen Version). Seiten ohne vorhandene Übersetzung zeigen automatisch den chinesischen Inhalt als Fallback an.

---

## 2. Wie schreibt man die Kopf-Metadaten (Frontmatter)?

Ganz oben muss jedes Markdown-Dokument einen YAML-Metadatenblock enthalten, der von drei Bindestrichen `---` umschlossen ist:

```yaml
---
title: Schnellstart (in 3 Minuten starten)
description: EpoCanvas Docs – Leitfaden zur Vorbereitung der lokalen Umgebung, zur Installation der Abhängigkeiten und zum Start des Servers.
---
```

### Bedeutung der Felder

| Feldname | Pflicht? | Bedeutung |
| :--- | :--- | :--- |
| `title` | **Pflicht** | Haupttitel des Artikels. Wird als große Überschrift oben auf der Seite gerendert und dient zugleich als Titel des Browser-Tabs. |
| `description` | empfohlen | Kurzzusammenfassung des Artikels. Wird für Suchergebnisse im Browser und als Beschreibungstext von Social-Media-Vorschaukarten verwendet. |
| `template` | nur für die Startseite | Bei `splash` wird das Landingpage-Template ohne Seitenleiste verwendet. |

:::tip
Falls Sie beim Schreiben `title` vergessen, gibt Astro beim Build eine deutliche Fehlermeldung im Terminal aus und nennt den Dateinamen; ergänzen Sie das Feld einfach gemäß dem Hinweis.
:::

---

## 3. Grundlegende Markdown-Formate im Überblick

Diese Site rendert Standard-Markdown mit GFM-Erweiterungen; alle folgenden Formate werden unterstützt. Sehen Sie sich zuerst die Übersicht an und danach die einzelnen Schreibweisen mit ihren Renderergebnissen:

| Format | Kurze Schreibweise | Verwendung |
| :--- | :--- | :--- |
| Überschriften | `## Abschnittsüberschrift` | Gliedert die Kapitelstruktur; wird automatisch in das Inhaltsverzeichnis rechts aufgenommen |
| Absätze und Zeilenumbrüche | Leerzeile trennt Absätze | Grundbaustein des Haupttexts |
| Fett / Kursiv / Durchgestrichen | `**fett**` `*kursiv*` `~~durchgestrichen~~` | Betont wichtige Textstellen |
| Inline-Code | `` `Befehl` `` | Markiert Befehle, Dateinamen, Tastenkürzel |
| Tasten | `<kbd>Strg</kbd>` | Tastendarstellung im Tastenkappen-Stil |
| Ungeordnete / geordnete Listen | `- Punkt` / `1. Punkt` | Listet gleichrangige Inhalte oder Schritte auf |
| Aufgabenlisten | `- [x] erledigt` | Checkliste mit Kontrollkästchen |
| Zitatblock | `> zitiertes Wortlaut` | Zitiert Originaltexte, ergänzt Randnotizen |
| Codeblock | von drei Backticks umschlossen | Mehrzeiliger Code, mit Highlighting und Kopier-Button |
| Tabelle | durch senkrechte Striche in Spalten geteilt | Parameter-gegenüberstellungen, Datenaufzählungen |
| Link | `[Text](Adresse)` | Springt zu anderen Seiten der Site oder zu externen Websites |
| Bild | `![Beschreibung](Pfad)` | Fügt Screenshots und Architekturdiagramme ein |
| Trennlinie | `---` | Trennt große Abschnitte |

### 3.1 Überschriftenebenen

Schreiben Sie im Haupttext **keine Überschrift erster Ordnung (`#`)** – der `title` aus dem Frontmatter wird bereits automatisch als große Seitenüberschrift gerendert; ein weiteres `#` im Text würde zu zwei großen Überschriften auf der Seite führen. Die Abschnittsebenen beginnen mit Überschriften zweiter Ordnung (`##`):

```markdown
## Überschrift zweiter Ordnung (Kapitel)

### Überschrift dritter Ordnung (Abschnitt)
```

**Renderergebnis**: Genau die Seite, die Sie gerade lesen, ist ein fertiges Beispiel – „3. Grundlegende Markdown-Formate im Überblick" ist eine Überschrift zweiter Ordnung, der vorliegende Abschnitt „3.1 Überschriftenebenen" eine Überschrift dritter Ordnung; beide erscheinen im Inhaltsverzeichnis „Auf dieser Seite" rechts. Überschriften vierter Ordnung (`####`) erhalten nur den Haupttext-Stil und kommen nicht mehr ins Verzeichnis – geeignet für kleine Unterabschnitte, die nicht ins Inhaltsverzeichnis aufgenommen werden sollen.

### 3.2 Absätze und Zeilenumbrüche

Markdown trennt Absätze durch Leerzeilen – hier tappen Einsteiger am leichtesten:

```markdown
Dies ist der erste Absatz; zwischen den beiden Sätzen wurde nur einmal die Entertaste gedrückt,
deshalb bleiben sie nach dem Rendering im selben Absatz.

Diese Zeile ist durch eine Leerzeile vom Vorangehenden getrennt und wird nach dem Rendering zu einem neuen Absatz.

Diese Zeile endet mit einem Backslash\
deshalb beginnt die folgende Zeile tatsächlich in einer neuen Zeile.
```

**Renderergebnis:**

Dies ist der erste Absatz; zwischen den beiden Sätzen wurde nur einmal die Entertaste gedrückt,
deshalb bleiben sie nach dem Rendering im selben Absatz.

Diese Zeile ist durch eine Leerzeile vom Vorangehenden getrennt und wird nach dem Rendering zu einem neuen Absatz.

Diese Zeile endet mit einem Backslash\
deshalb beginnt die folgende Zeile tatsächlich in einer neuen Zeile.

Zusammengefasst: **Ein einzelnes Enter = neuer Zeilenumbruch im Quellcode, aber kein neuer Absatz**; für einen neuen Absatz eine Leerzeile einfügen; für einen erzwungenen Umbruch innerhalb des Absatzes einen Backslash oder zwei Leerzeichen am Zeilenende verwenden.

### 3.3 Textbetonung und Inline-Styles

```markdown
Das ist **fett**, das ist *kursiv*, das ist ***fett kursiv***, das ist ~~durchgestrichen~~.

Mit Inline-Code markieren Sie Befehle und Dateinamen: Führen Sie `pnpm run dev` aus, um den Entwicklungsserver zu starten.

Tastenkürzel mit HTML-Tags: <kbd>Ctrl</kbd> + <kbd>K</kbd> öffnet die Site-weite Suche.
```

**Renderergebnis:**

Das ist **fett**, das ist *kursiv*, das ist ***fett kursiv***, das ist ~~durchgestrichen~~.

Mit Inline-Code markieren Sie Befehle und Dateinamen: Führen Sie `pnpm run dev` aus, um den Entwicklungsserver zu starten.

Tastenkürzel mit HTML-Tags: <kbd>Ctrl</kbd> + <kbd>K</kbd> öffnet die Site-weite Suche.

### 3.4 Listen und Aufgabenlisten

```markdown
Ungeordnete Liste, Unterpunkte um zwei Leerzeichen eingerückt:
- Kernfunktion eins
- Kernfunktion zwei
  - Unterfunktion von zwei
  - eine weitere Unterfunktion von zwei

Geordnete Liste:
1. Schritt 1: Node.js installieren
2. Schritt 2: Das Repository klonen
3. Schritt 3: Den Entwicklungsserver starten

Aufgabenliste:
- [x] Syntax-Highlighting unterstützt
- [x] Ein-Klick-Kopieren unterstützt
- [ ] offene Aufgabe
```

**Renderergebnis:**

Ungeordnete Liste, Unterpunkte um zwei Leerzeichen eingerückt:

- Kernfunktion eins
- Kernfunktion zwei
  - Unterfunktion von zwei
  - eine weitere Unterfunktion von zwei

Geordnete Liste:

1. Schritt 1: Node.js installieren
2. Schritt 2: Das Repository klonen
3. Schritt 3: Den Entwicklungsserver starten

Aufgabenliste:

- [x] Syntax-Highlighting unterstützt
- [x] Ein-Klick-Kopieren unterstützt
- [ ] offene Aufgabe

### 3.5 Zitatblöcke

```markdown
> Dies ist ein Zitat. Es eignet sich für Originalauszüge, Hintergrundinformationen oder Randnotizen.
> Mehrere aufeinanderfolgende Zeilen stehen im selben Zitatblock.

> > In einem Zitat lässt sich auch weiter verschachteln.

> Auch Listen können in einem Zitat stehen:
>
> - erster Punkt
> - zweiter Punkt
```

**Renderergebnis:**

> Dies ist ein Zitat. Es eignet sich für Originalauszüge, Hintergrundinformationen oder Randnotizen.
> Mehrere aufeinanderfolgende Zeilen stehen im selben Zitatblock.

> > In einem Zitat lässt sich auch weiter verschachteln.

> Auch Listen können in einem Zitat stehen:
>
> - erster Punkt
> - zweiter Punkt

:::note
Der Zitatblock ist lediglich ein schlichter Stil und **kann Hinweisboxen nicht ersetzen**. Wenn Sie auffällige farbige Hinweise benötigen, verwenden Sie die Hinweisbox-Syntax aus Abschnitt 4.1.
:::

### 3.6 Codeblöcke

Umschließen Sie den Code mit drei Backticks und geben Sie nach den Backticks der ersten Zeile die Sprache an – schon erhalten Sie Syntax-Highlighting; jeder Codeblock bringt rechts von sich einen Ein-Klick-Kopier-Button mit:

````markdown
```js
export function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
```
````

**Renderergebnis:**

```js
export function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
```

Das Sprachkürzel bestimmt das Highlighting; gängige Kürzel wie `js`, `ts`, `bash`, `json`, `yaml`, `html`, `css` und `python` werden alle unterstützt. Terminale Sprachen wie `bash` werden mit einem dunklen Terminal-Rand gerendert:

```bash
pnpm run build
```

Weiterführende Einsatzmöglichkeiten wie Dateinamen-Titel und das Hervorheben bestimmter Zeilen finden Sie in Abschnitt 4.2.

### 3.7 Tabellen

In der Trennlinie unter der Kopfzeile steuern Doppelpunkte die Ausrichtung (Doppelpunkt links = linksbündig, auf beiden Seiten = zentriert, rechts = rechtsbündig):

```markdown
| Befehl | Parameter | Beschreibung |
| :--- | :---: | ---: |
| `astro dev` | `--host` | Beispiel für Linksbündigkeit |
| `astro build` | keine | Beispiel für Zentrierung |
| `astro preview` | `--port` | Beispiel für Rechtsbündigkeit |
```

**Renderergebnis:**

| Befehl | Parameter | Beschreibung |
| :--- | :---: | ---: |
| `astro dev` | `--host` | Beispiel für Linksbündigkeit |
| `astro build` | keine | Beispiel für Zentrierung |
| `astro preview` | `--port` | Beispiel für Rechtsbündigkeit |

:::tip
Ist der Tabelleninhalt zu breit, müssen Sie nichts von Hand anpassen: Die Site versieht Tabellen automatisch mit einer horizontalen Scrollleiste, sodass sie auch auf dem Handy vollständig lesbar sind.
:::

### 3.8 Links

```markdown
Interner Link: [Schnellstart](/canvas/deployment/)

Externer Link: [Astro-Website](https://astro.build)

Anker auf dieser Seite: [Zum Abschnitt „Tabellen" springen](#37-tabellen)

Automatischer Link: <https://github.com/shijianus/epocanvas-docs>
```

**Renderergebnis:**

Interner Link: [Schnellstart](/canvas/deployment/)

Externer Link: [Astro-Website](https://astro.build)

Anker auf dieser Seite: [Zum Abschnitt „Tabellen" springen](#37-tabellen)

Automatischer Link: <https://github.com/shijianus/epocanvas-docs>

Konventionen beim Schreiben:

- **Interne Links** verwenden vollständige Pfade, die mit `/` beginnen und enden (z. B. `/canvas/deployment/`); schreiben Sie keine relativen Pfade;
- **Anker** sind die aus dem Überschriftentext abgeleiteten IDs – der Anker einer Überschrift ergibt sich unmittelbar aus ihrem Text (Satzzeichen entfernt, Leerzeichen durch Bindestriche ersetzt); kopieren Sie die Adresse aus der Adresszeile des Browsers, um einen Link mit Anker zu erhalten;
- Der Linktext sollte das Ziel klar benennen – schreiben Sie nicht „hier klicken".

### 3.9 Bilder und Bildunterschriften

Legen Sie alle für die Dokumentation benötigten Bild-Assets gesammelt im Verzeichnis `public/images/canvas/` ab und referenzieren Sie sie mit absoluten Pfaden, die mit `/` beginnen:

```markdown
![Tatsächliches Rendering der Schnellstart-Seite auf dem lokalen Entwicklungsserver](/images/canvas/ui-quickstart.png)

*Abbildung: Der kursiv gesetzte Text in der Zeile direkt unter dem Bild wird als Bildunterschrift angezeigt.*
```

**Renderergebnis:**

![Tatsächliches Rendering der Schnellstart-Seite auf dem lokalen Entwicklungsserver](/images/canvas/ui-quickstart.png)

*Abbildung: Tatsächliches Rendering der Schnellstart-Seite, hier nur zur Demonstration.*

**Bildkonventionen**:

- **Architektur- und Flussdiagramme**: Als `.svg`-Vektorgrafik speichern; beim Vergrößern auf Handys und hochauflösenden Displays bleibt alles scharf. Die Architekturdiagramme dieser Site liegen unter `public/images/canvas/docs-*.svg`.
- **Oberflächen-Screenshots**: Als komprimierte `.png` speichern, etwa 1440 Pixel breit; laden Sie keine Originaldateien mit mehreren zehn Megabyte direkt hoch.
- **Beschreibung ist Pflicht**: Der Text in `![ ]` wird als Alt-Text des Bildes gerendert; beschreiben Sie den Bildinhalt sorgfältig und lassen Sie das Feld nicht leer.

Prüfen Sie nach dem Einfügen eines Bildes **unbedingt das tatsächliche Rendering im Browser** und reichen Sie die Änderung erst ein, wenn der Pfad stimmt und das Bild korrekt angezeigt wird.

### 3.10 Trennlinien

Drei oder mehr Bindestriche in einer eigenen Zeile werden als Trennlinie gerendert und gliedern große Abschnitte:

```markdown
Der vorangehende Inhalt ist abgeschlossen.

---

Hier beginnt ein neues Thema.
```

**Renderergebnis:**

Der vorangehende Inhalt ist abgeschlossen.

---

Hier beginnt ein neues Thema.

:::caution
Oberhalb einer Trennlinie muss eine Leerzeile bleiben. Ein `---` direkt in der Zeile unter Text wird als „alternative Überschrift-Schreibweise" interpretiert und rendert die darüberliegende Textzeile als große Überschrift.
:::

---

## 4. Erweiterte Formate: Zusatzsyntax dieser Site

Die folgenden Formate sind Erweiterungen, die diese Site zusätzlich zum Standard-Markdown unterstützt; sie werden von der Rendering-Engine bereitgestellt (Starlight-Hinweisboxen und Expressive Code).

### 4.1 Vier farbige Hinweisboxen

Hinweisboxen verwenden die Dreifach-Doppelpunkt-Syntax: Sie beginnen mit `:::Typ` und enden mit `:::` in einer eigenen Zeile; es gibt vier Typen mit jeweils eigener Farbe und eigenem Icon:

:::note
**note (ergänzende Hinweise)**: Hintergrundwissen, Design-Details, Voraussetzungen.
:::

:::tip
**tip (praktische Tipps)**: Effizienztricks und Best Practices.
:::

:::caution
**caution (Warnung)**: Fehleranfällige Operationen und potenzielle Kompatibilitätsprobleme.
:::

:::danger
**danger (Gefahr)**: Nicht umkehrbare Operationen wie Datenverlust oder das Überschreiben der Produktivumgebung.
:::

Ein Titel lässt sich frei festlegen, indem man ihn in eckigen Klammern hinter den Typ schreibt:

````markdown
:::tip[Installation beschleunigen]
Die Installation der Abhängigkeiten mit pnpm ist deutlich schneller als mit npm:

```bash
npm install -g pnpm
```
:::
````

**Renderergebnis:**

:::tip[Installation beschleunigen]
Die Installation der Abhängigkeiten mit pnpm ist deutlich schneller als mit npm:

```bash
npm install -g pnpm
```
:::

Innerhalb einer Hinweisbox können Sie weiterhin Listen, Codeblöcke, Tabellen und jede andere Formatierung verwenden; weitere Beispiele finden Sie unter [Beispiele für Hinweisboxen, Codeblöcke und Diagramme](/canvas/syntax/).

### 4.2 Dateinamen-Titel und Zeilen-Highlighting in Codeblöcken

Markieren Sie in der ersten Zeile des Code-Fence `title="Dateipfad"`, um eine Titelleiste anzuzeigen, und `{Zeilennummern}`, um wichtige Zeilen hervorzuheben; mehrere Zeilennummern werden durch Kommas getrennt:

````markdown
```typescript title="src/config/site.ts" {2,4}
export const siteConfig = {
  name: 'EpoCanvas Docs', // ← hervorgehobene Zeile
  version: '1.0.0',
  locale: 'zh-CN',        // ← hervorgehobene Zeile
};
```
````

**Renderergebnis:**

```typescript title="src/config/site.ts" {2,4}
export const siteConfig = {
  name: 'EpoCanvas Docs',
  version: '1.0.0',
  locale: 'zh-CN',
};
```

### 4.3 diff-Vergleich von Änderungen

Mit der Sprache `diff` zeigen Sie Konfigurationsänderungen: Zeilen, die mit `-` beginnen, werden als gelöscht dargestellt, Zeilen mit `+` als neu hinzugefügt:

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

### 4.4 Fußnoten

Wenn Sie Quellenangaben oder ergänzende Hinweise markieren möchten, verwenden Sie die GFM-Fußnotensyntax:

````markdown
Der Site-weite Suchindex wird von Pagefind beim Build erzeugt[^pf].

[^pf]: [Pagefind-Offizielle Dokumentation](https://pagefind.app/) – eine lokale Suchbibliothek für statische Sites.
````

**Renderergebnis:** Im Haupttext erscheint eine hochgestellte Sprungmarke mit Nummer[^md-page]; ein Klick springt sanft zum zugehörigen Fußnoteneintrag am Seitenende.

[^md-page]: Genau das ist die Fußnote, die am Ende dieser Seite gerendert wird – egal an welcher Stelle im Text eine Fußnote steht, sie wird gesammelt ganz unten auf der Seite zusammengeführt.

### 4.5 Nicht unterstützte und fehleranfällige Schreibweisen auf einen Blick

Die folgenden Schreibweisen sind auf anderen Plattformen verbreitet, funktionieren auf dieser Site aber **nicht** oder nicht wie erwartet; vermeiden Sie sie beim Schreiben von Dokumentation gleich von vornherein:

| Fehleranfällige Schreibweise | Tatsächliches Verhalten | Korrekte Alternative |
| :--- | :--- | :--- |
| <code>```mermaid</code>-Fence | Zeigt den Quelltext als normalen Codeblock an, erzeugt keine Grafik | In mermaid.live als SVG exportieren und als Bild einfügen |
| `> [!NOTE]` GitHub-Hinweissyntax | Wird als normaler Zitatblock gerendert | Stattdessen `:::note` schreiben |
| `:::warning` / `:::important` | Wird stillschweigend als normaler Absatz gerendert, ohne Hinweisbox-Stil | Stattdessen `:::caution` schreiben |
| Überschrift erster Ordnung `#` im Haupttext | Die Seite erhält zwei große Überschriften | `#` entfernen; der Haupttext beginnt mit `##` |
| Zeilenumbruch mit nur einem Enter | Die beiden Zeilen werden zu einer zusammengeführt | Mit Leerzeile absätzen oder am Zeilenende einen Backslash setzen |

---

## 5. Weiterführendes

- Möchten Sie die vollständige Render-Pipeline von Markdown von der Datei bis zur Seite und alle Konventionen kennen? Lesen Sie **[Renderregeln im Detail](/canvas/rendering/)**.
- Möchten Sie Hinweisboxen, Codeblöcke, Fußnoten und weitere Syntax gebündelt auf einer „lebenden Beispielseite" sehen? Lesen Sie **[Beispiele für Hinweisboxen, Codeblöcke und Diagramme](/canvas/syntax/)**.
