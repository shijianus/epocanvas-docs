---
title: Renderregeln im Detail
description: "Vollständige Renderregeln von EpoCanvas Docs: die Pipeline vom Markdown-File bis zur fertigen Seite sowie alle Konventionen zu Frontmatter, Überschriften, Hinweisboxen, Codeblöcken, Bildern und Links."
---

Diese Seite erklärt die Renderregeln von **EpoCanvas Docs** vollständig: welche Verarbeitungsschritte ein Markdown-File durchläuft, wie jede Syntax gerendert wird und welche Syntax nicht unterstützt wird. Lesen Sie sie einmal durch, bevor Sie Dokumente schreiben – damit vermeiden Sie die allermeisten Satz- und Layoutprobleme.

---

## Renderpipeline: von der .md-Datei bis zur fertigen Seite

![Schemadarstellung der Markdown-Renderpipeline von EpoCanvas Docs: der vollständige 5-Schritte-Ablauf vom Scannen des Markdown-Quelltexts über das GFM-AST-Parsing und die Codehervorhebung bis zur Layoutmontage mit 7 angepassten Komponenten sowie der Erzeugung von statischem HTML und Pagefind-Index](/images/canvas/docs-render-pipeline.svg)

*Abbildung: Der 5-Schritte-Ablauf der Markdown-Renderpipeline. Die Schritte werden beim Build in dieser Reihenfolge ausgeführt; das Build-Ergebnis besteht aus rein statischen Dateien, es entsteht kein Laufzeit-Overhead durch ein Client-Framework.*

Von der Speicherung bis zur Anzeige beim Leser durchläuft ein Markdown-File die folgenden fünf Schritte:

1. **Inhalte einsammeln**: Beim Start oder Build von Astro wird das Verzeichnis `src/content/docs/` durchsucht, jede `.md`-/`.mdx`-Datei wird als Inhaltseintrag registriert und das Frontmatter wird geprüft (fehlt `title`, gibt es sofort einen Fehler).
2. **Markdown kompilieren**: Der Haupttext wird vom Markdown-Compiler (inklusive GFM-Erweiterungen) in HTML umgewandelt. Erweiterte Syntax wie Tabellen, Aufgabenlisten und Durchstreichung wird in diesem Schritt wirksam.
3. **Codeblöcke hervorheben**: Alle Code-Fences werden von Expressive Code verarbeitet und zu Codeblöcken mit Syntaxhervorhebung, Titelleiste, Zeilennummern und Kopieren-Button ausgebaut.
4. **Seitenlayout anwenden**: Das kompilierte HTML wird in das Seitengerüst von Starlight eingesetzt – Kopfnavigation, linke Seitenleiste und rechte Gliederung „Auf dieser Seite" werden von den angepassten Komponenten unter `src/components/starlight/` gerendert.
5. **Index und statische Dateien erzeugen**: Bei `pnpm run build` durchläuft Pagefind alle erzeugten Seiten und extrahiert den Volltextindex; das reine HTML im `dist/`-Verzeichnis lässt sich direkt auf jedem statischen Server hosten.

:::note
Der oben beschriebene Ablauf wird einmalig beim Build abgeschlossen. Nach dem Onlinegang der Website ist kein Server beteiligt; alle Interaktionen (Suche, Design-Umschalter, Sprachwechsel) laufen im Browser.
:::

---

## Frontmatter-Regeln

- `title` ist ein **Pflichtfeld**; fehlt es, bricht der Build mit `InvalidInputError` ab;
- `description` sollte ausgefüllt werden; sie erscheint in Suchmaschinen-Ergebnissen und auf Vorschaukarten beim Teilen;
- das Frontmatter muss ein gültiger YAML-Block ganz am Dateianfang sein; die drei Striche (`---`) sind unverzichtbar.

---

## Überschriften-Regeln

| Regel | Erläuterung |
| :--- | :--- |
| Im Haupttext keine Überschrift erster Ordnung `#` schreiben | Der `title` aus dem Frontmatter wird bereits als großer Seitentitel gerendert; schreibt der Haupttext zusätzlich ein `#`, gibt es zwei große Titel |
| Haupttext ab Überschrift zweiter Ordnung `##` | `##` und `###` landen automatisch in der rechten Gliederung „Auf dieser Seite" |
| `####` und darunter nicht im Inhaltsverzeichnis | Tiefere Ebenen werden nur im Stil des Haupttexts gerendert |
| Aus Überschriftentext entsteht ein Anker | Bei chinesischen Überschriften ist der Anker der chinesische Text selbst, z. B. `#标题规则` |

---

## Hinweisbox-Regeln (Asides)

Hinweisboxen nutzen die Dreifach-Doppelpunkt-Syntax von Starlight und unterstützen 4 Typen:

```markdown
:::note
Ergänzende Hinweise.
:::

:::tip
Kleine Tipps für mehr Effizienz.
:::

:::caution
Risiken, denen Aufmerksamkeit gebührt, oder leicht fehleranfällige Aktionen.
:::

:::danger
Warnungen mit hohem Risiko wie Datenverlust oder nicht rückgängig zu machende Aktionen.
:::
```

Zusätzlich kann hinter dem Typ ein eigener Titel stehen: `:::tip[Installation beschleunigen]`.

:::caution
Beachten Sie zwei häufige Missverständnisse:

- Die GitHub-typische Blockquote-Syntax `> [!TIP]` wird **nicht unterstützt**; `[!TIP]` erscheint dann als normaler Text in der Blockquote;
- `:::important` und `:::warning` sind **keine gültigen Typen**; es gibt zwar keinen Fehler, aber sie werden stillschweigend als normaler Absatz gerendert.

Beim Migrieren alter Dokumente: `> [!NOTE]` → `:::note`, `> [!WARNING]` → `:::caution`, `> [!CAUTION]` → `:::danger`.
:::

![Tatsächliches Rendering der vier farbigen Hinweisboxen](/images/canvas/ui-markup-examples.png)

*Abbildung: So sehen die vier Hinweisboxen nach der oben beschriebenen Syntax tatsächlich aus; Ausschnitt aus der Seite [Hinweisboxen, Codeblöcke & Diagramme](/canvas/syntax/).*

---

## Codeblock-Regeln

Code-Fences (drei Backticks) werden von Expressive Code gerendert und unterstützen die folgenden Annotationen (hinter den Backticks in der ersten Zeile):

| Schreibweise | Wirkung | Beispiel |
| :--- | :--- | :--- |
| Sprachkennzeichnung | bestimmt das Schema der Syntaxhervorhebung | <code>```ts</code> |
| `title="..."` | zeigt eine Titelleiste mit Dateinamen | <code>```ts title="src/config/site.ts"</code> |
| `{2}` / `{2-4}` | hebt die angegebenen Zeilen hervor | <code>```ts {2}</code> |
| `lang="diff"` oder `diff` | stellt hinzugefügte und entfernte Zeilen rot-grün gegenüber | <code>```diff</code> |
| Terminal-Sprachen wie `bash` / `sh` | rendert mit einem Rand im Terminal-Stil | <code>```bash</code> |

Alle Codeblöcke erhalten automatisch einen Kopieren-Button; der Codetext wird von Pagefind in den Suchindex aufgenommen, sodass Leser Stichwörter aus dem Code direkt finden können.

---

## Bild-Regeln

- Bilder liegen einheitlich unter `public/images/canvas/` und werden mit absolutem Pfad eingebunden: `![Beschreibung](/images/canvas/ui-docs-reading.png)`;
- Architektur- und Ablaufdiagramme verwenden das Vektorformat `.svg`, Screenshots der Oberfläche komprimierte `.png`-Dateien;
- der Beschreibungstext ist Pflicht: Er ist der Alternativtext, falls das Bild nicht lädt, und die Grundlage für barrierefreien Zugang;
- **die aktuelle Version bringt kein Mermaid-Diagrammrendering mit**: Der ` ```mermaid `-Fence zeigt den Quelltext nur als gewöhnlichen Codeblock an. Brauchen Sie ein Flussdiagramm, exportieren Sie es vorher mit einem Tool wie mermaid.live als SVG und fügen es als Bild ein.

---

## Link-Regeln

- **Interne Links**: Vollständige Pfade verwenden, beginnend und endend mit `/`, z. B. `/canvas/deployment/`. Wird ein Dokumentpfad geändert, ist der alte Pfad in der `redirects`-Tabelle in `astro.config.mjs` als Weiterleitung einzutragen;
- **Anker-Links**: `/canvas/rendering/#codeblock-regeln` springt direkt zu einem Abschnitt dieser Seite;
- **Externe Links**: einfach die vollständige URL angeben; im Haupttext erscheinen sie in Themenfarbe.

---

## Weitere Rendering-Verhalten

| Syntax | Renderergebnis |
| :--- | :--- |
| `**fett**`, `*kursiv*`, `~~durchgestrichen~~` | die jeweiligen Textstile |
| `Inline-Code` | Pille mit Monospace-Schrift in Themenfarbe |
| <kbd>Ctrl</kbd>+<kbd>K</kbd>-Schreibweise | Tastensymbole im Tastenkappen-Stil |
| GFM-Tabellen | Datentabellen mit Rahmen und Hervorhebung beim Überfahren |
| `- [x]`-Aufgabenlisten | sichtbare Ankreuzfelder (deaktiviert) |
| `[^Name]`-Fußnoten | hochgestellte Nummer im Haupttext + Fußnotenliste am Seitenende, mit Klicksprung in beide Richtungen |
| Markdown-Blockquote `>` | vertikale Linie in Themenfarbe links + heller Hintergrund |
| Trennlinie `---` | schmale Trennlinie über die volle Breite des Haupttextbereichs |

:::tip
Wenn Sie unsicher sind, wie eine Syntax gerendert wird, ist der zuverlässigste Weg: `pnpm run dev` starten, einen kurzen Abschnitt in ein Testdokument schreiben, das Ergebnis im Browser mit eigenen Augen prüfen und die Syntax erst danach offiziell einsetzen.
:::
