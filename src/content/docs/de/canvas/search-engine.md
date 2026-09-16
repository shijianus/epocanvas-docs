---
title: Volltextsuche & Tastenkürzel
description: "Anleitung zur Suche mit zwei Modi in EpoCanvas Docs: die Suche innerhalb der Seite über die Kopfzeile und der sitewide-Suchdialog per Ctrl+K sowie der lokale statische Index-Mechanismus."
---

Beim Arbeiten mit umfangreicher technischer Dokumentation ist es entscheidend, gewünschte Konfigurationsoptionen oder Parameter schnell zu finden. **EpoCanvas Docs** enthält eine **Suche mit zwei Modi**: Das Suchfeld in der Kopfzeile lokalisiert Inhalte schnell innerhalb der aktuellen Seite, während der `Ctrl+K`-Dialog alle Dokumente der gesamten Website durchsucht. Beide Suchvarianten laufen vollständig lokal im Browser ab, benötigen keinerlei Backend-Dienste und funktionieren daher auch, wenn die Website in einem Intranet ohne Internetzugang betrieben wird.

---

## Wann verwendet man welche Suche?

| Situation | Welcher Modus | Bedienung |
| :--- | :--- | :--- |
| Sie wissen, dass sich eine Textstelle im **aktuellen Artikel** befindet | Suche innerhalb der Seite | Einfach auf das Suchfeld in der Kopfzeile klicken und ein Stichwort eingeben |
| Sie wissen nicht, **in welchem Artikel** der Inhalt steht, und suchen sitewide | Suche über die gesamte Website | `Ctrl + K` drücken (auf dem Mac `Cmd + K`) |

---

## Suche innerhalb der Seite: das Suchfeld in der Kopfzeile

Klicken Sie auf das Suchfeld in der Mitte der Kopfzeile (Lupen-Symbol) und geben Sie direkt ein Stichwort ein:

![Beschriftete Darstellung der Suche innerhalb der Seite in der Kopfzeile: ① Eingabefeld ② Trefferzähler ③ vor/zurück-Navigation ④ Löschen ⑤ Hervorhebung auf der Seite](/images/canvas/ui-inpage-search.png)

*Abbildung: Beschriftete Darstellung nach der Eingabe von „部署" („Bereitstellung") in das Suchfeld der Kopfzeile. ① Eingabefeld in der Kopfzeile; ② Trefferzähler (z. B. `1/26`); ③ Buttons für vorheriger/nächster Treffer; ④ Löschen-Button; ⑤ alle Treffer im Text der aktuellen Seite werden automatisch hervorgehoben.*

### Stichwort eingeben

Unterstützt werden deutsche Begriffe (z. B. „Bereitstellung", „Komponente"), englische Wörter sowie Codeschnipsel (z. B. `pnpm`, `astro.config.mjs`). Während der Eingabe werden alle passenden Textstellen auf der aktuellen Seite sofort mit hervorgehobenem Hintergrund markiert, und die Seite scrollt automatisch zum ersten Treffer.

### Zwischen Treffern navigieren

- Mit <kbd>Enter</kbd> oder einem Klick auf den nach unten zeigenden Pfeil springen Sie zum nächsten Treffer;
- mit <kbd>Shift + Enter</kbd> oder einem Klick auf den nach oben zeigenden Pfeil gelangen Sie zum vorherigen Treffer;
- im Suchfeld läuft live ein Fortschrittszähler im Format `N/M` (z. B. `3/9`), sodass Sie Ihren Lesefortschritt jederzeit im Blick behalten.

### Suche löschen und Seite wiederherstellen

Drücken Sie <kbd>Esc</kbd> oder klicken Sie auf die Schaltfläche `×`, um alle Hervorhebungen zu entfernen und die Seite in ihren Originalzustand zurückzuversetzen.

---

## Suche über die gesamte Website: der Ctrl+K-Dialog

Unabhängig davon, auf welcher Seite Sie sich gerade befinden: Drücken Sie das Tastenkürzel <kbd>Ctrl</kbd> + <kbd>K</kbd> (auf dem Mac <kbd>Cmd</kbd> + <kbd>K</kbd>) oder klicken Sie auf das `Ctrl K`-Abzeichen rechts neben dem Suchfeld – dann öffnet sich in der Bildschirmmitte der Dialog für die sitewide-Suche:

![Beschriftete Darstellung des sitewide-Suchdialogs: ① Auslöser-Abzeichen ② Sucheingabefeld ③ Ergebnisliste ④ Leiste mit Tastenkürzeln](/images/canvas/ui-search-modal.png)

*Abbildung: Beschriftete Darstellung nach der Eingabe von „部署" („Bereitstellung") in den Dialog. ① das `Ctrl K`-Abzeichen rechts neben dem Suchfeld (auch per Klick öffnet sich der Dialog); ② Sucheingabefeld; ③ nach Dokumenten gruppierte Ergebnisliste mit hervorgehobenen Treffern; ④ Hinweisleiste mit Tastenkürzeln am unteren Rand.*

### Stichwort eingeben

Unterstützt werden deutsche Begriffe (z. B. „Bereitstellung", „Komponente"), englische Wörter sowie Codeschnipsel (z. B. `pnpm`, `astro.config.mjs`). Treffer im Titel werden ganz oben einsortiert.

### Ergebnisliste durchsehen

Die Ergebnisse sind nach Dokumenten gruppiert; jeder Eintrag zeigt den Dokumenttitel, den betreffenden Abschnitt sowie eine Kontextvorschau mit dem Stichwort, wobei Treffer hervorgehoben sind. Ein Klick auf den Gruppentitel klappt die Treffer des jeweiligen Dokuments auf oder zu.

### Den gesamten Ablauf per Tastatur erledigen

- <kbd>↑</kbd> <kbd>↓</kbd>: Auswahl zwischen den Ergebnissen bewegen;
- <kbd>Enter</kbd>: ausgewähltes Ergebnis öffnen und zum betreffenden Abschnitt springen;
- <kbd>Esc</kbd>: Dialog schließen.

Die Maus brauchen Sie dabei nicht.

---

## Warum ist die Suche so schnell?

![Vergleichsdiagramm der Suchmechanismen von EpoCanvas Docs: links die Suche innerhalb der Seite in der Kopfzeile (DOM-Durchlauf mit Hervorhebung, Live-Zähler und weiches Scrollen), rechts der sitewide-Suchdialog (per Ctrl+K aufgerufen, sekundenschnelles Matching über einen von Pagefind WASM im Speicher gehaltenen invertierten Index)](/images/canvas/docs-search-flow.svg)

*Abbildung: Vergleich der Funktionsweise beider Suchmodi. Links die schnelle Stichwortlokalisierung innerhalb der Seite über die Kopfzeile, rechts die sitewide Suche auf Basis des statischen Pagefind-WASM-Index; beide laufen vollständig lokal im Browser.*

Bei vielen Websites muss die Dokumentensuche Anfragen an eine Datenbank auf einem entfernten Server schicken; bei schlechter Netzverbindung dreht sich dann nur der Ladeindikator.

EpoCanvas Docs setzt auf eine lokale statische Suchlösung mit **Pagefind**:

1. **Index beim Build extrahieren**: Beim Ausführen von `pnpm run build` erfasst das System automatisch den Inhalt jedes Dokuments und erzeugt eine Reihe komprimierter statischer Index-Shard-Dateien.
2. **Bedarfsgesteuerter, sparsamer Download**: Bei der Eingabe im Suchfeld lädt der Browser nur die Index-Shards für die jeweiligen Zeichen (mit wenigen bis wenigen Dutzend KB sehr klein).
3. **Sofortiges Matching lokal**: Treffer und Sortierung entstehen vollständig lokal im Browser; dadurch entfällt die Netzwerk-Latenz, und die Suche funktioniert auch in einem Intranet ohne Internetzugang in vollem Umfang.

---

## Praktische Tipps für die Suche

- **Begriffe aufteilen**: Für präzisere Ergebnisse können Sie mehrere Wörter durch Leerzeichen getrennt eingeben (z. B. `Cloudflare Domain`).
- **Zuerst im Titel suchen**: Dokument- und Abschnittstitel haben in der Sortierung das höchste Gewicht; Ergebnisse, deren Titel das Stichwort enthält, stehen ganz oben.
- **Einschränkung im Entwicklungsmodus**: Der sitewide-Index wird nur beim Build erzeugt; im Entwicklungsserver (`pnpm run dev`) lädt der `Ctrl+K`-Dialog den Index nicht, die sitewide Suche ist dort nicht benutzbar. Um die Suche zu testen, führen Sie `pnpm run build` und danach `pnpm run preview` aus. Die Suche innerhalb der Seite ist davon nicht betroffen.
