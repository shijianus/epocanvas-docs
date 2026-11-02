---
title: FAQ & Fehlerbehebung
description: Checkliste für EpoCanvas Docs zu Fehlern beim lokalen Betrieb, nicht sichtbaren Dokumenten, fehlerhaft gerenderten Hinweisboxen, defekter Suche und dem Deployment auf Cloudflare Pages.
---

Wenn bei der Nutzung, beim Schreiben oder beim Deployment von **EpoCanvas Docs** etwas ungewöhnlich erscheint, schauen Sie hier zunächst nach dem passenden Fall. Die Probleme sind in der Reihenfolge „lokaler Start → Dokumentation schreiben → Suche → Deployment“ angeordnet; zu jedem Problem gibt es die Ursache und eine erprobte Lösung.

---

## 1. Probleme beim lokalen Start und bei der Installation

### Q1: `pnpm run dev` meldet, dass Port 4321 belegt ist

- **Ursache**: Ein früher gestarteter Entwicklungsserver hat sich nicht vollständig beendet, oder ein anderes Programm belegt Port 4321.
- **Lösung**: Mit einem anderen Port starten:

  ```bash
  pnpm run dev -- --port 4322
  ```

### Q2: Bei der Installation der Abhängigkeiten erscheint ein Fehler
- **Ursache**: Dieses Projekt verwendet den passthrough-Bilddienst und hängt nicht von Sharp ab. Prüfen Sie zuerst die genaue Terminalmeldung; häufig liegt die Node.js- oder pnpm-Version außerhalb der Projektvorgaben.
- **Lösung**: Verwenden Sie Node.js 22.20+ (22.x) oder Node.js 24.12+ und pnpm 10.34.5, behalten Sie `pnpm-lock.yaml` und installieren Sie reproduzierbar:
  ```bash
  pnpm install --frozen-lockfile
  ```

### Q3: `pnpm install` bricht mit `packages field missing or empty` ab

- **Ursache**: `pnpm-workspace.yaml` ist leer oder unvollständig formatiert; pnpm interpretiert die Datei als Workspace-Konfiguration und bricht mit Fehler ab.
- **Lösung**: Sicherstellen, dass die Datei das Feld `packages` enthält:

  ```yaml
  packages:
    - .
  ```

---

## 2. Probleme beim Schreiben und Rendern von Dokumenten

### Q4: Eine neue Markdown-Datei wurde angelegt, ist in der linken Seitenleiste aber nicht sichtbar

- **Ursache**: Das Seitenleisten-Verzeichnis wird von Hand deklariert; neue Dateien müssen in der Konfiguration registriert werden.
- **Lösung**: Öffnen Sie `astro.config.mjs` und ergänzen Sie in einer passenden Gruppe des `sidebar`-Arrays:

  ```javascript
  { label: 'Beschreibung der neuen Funktion', link: '/canvas/new-feature/' }
  ```

### Q5: Das Terminal meldet den Fehler `"title" is required`

- **Ursache**: Im Kopf der Markdown-Datei fehlt `title`, oder die drei einleitenden Bindestriche `---` sind nicht regelkonform formatiert.
- **Lösung**: Prüfen Sie das Frontmatter ganz oben in der Datei:

  ```yaml
  ---
  title: Dies ist der Artikeltitel
  description: Dies ist die Artikelbeschreibung
  ---
  ```

### Q6: Auf der Seite erscheinen zwei identische große Überschriften

- **Ursache**: Im Haupttext wurde zusätzlich eine `#`-Überschrift erster Ordnung geschrieben. Der `title` aus dem Frontmatter wird bereits als große Überschrift gerendert; ein weiteres `#` im Haupttext führt zwangsläufig zur Verdopplung.
- **Lösung**: Entfernen Sie die `#`-Überschrift im Haupttext; Abschnitte beginnen mit `##`. Die vollständigen Regeln finden Sie unter [Details zu den Rendering-Regeln](/canvas/rendering/#überschriften-regeln).

### Q7: `> [!TIP]` wurde geschrieben, aber die Hinweisbox färbt sich nicht und der Text erscheint unverändert

- **Ursache**: Die GitHub-Stil-Syntax `> [!TIP]` für Zitatblöcke wird nicht unterstützt; der Markdown-Compiler erkennt sie nicht.
- **Lösung**: Verwenden Sie stattdessen die Dreifach-Doppelpunkt-Syntax:

  ```markdown
  :::tip
  Das ist die korrekte Schreibweise.
  :::
  ```

### Q8: Eingefügte Bilder erscheinen als defektes Bild

- **Ursache**: Der Bildpfad ist falsch geschrieben, oder das Bild liegt nicht im statischen Verzeichnis `public/`.
- **Lösung**:
  1. Bestätigen Sie, dass das Bild unter `public/images/canvas/ui-docs-reading.png` gespeichert ist;
  2. Verwenden Sie beim Einbinden einen absoluten Pfad beginnend mit `/`: `![Beschreibung](/images/canvas/ui-docs-reading.png)`; schreiben Sie keinen relativen Pfad wie `../public/...`.

---

## 3. Probleme mit der Suchfunktion

### Q9: Beim lokalen Debuggen mit `pnpm dev` findet die globale Suche den frisch geschriebenen Artikel nicht

- **Ursache**: Die sitewide Suche hängt vom Pagefind-Index ab, der nur beim Build erzeugt wird; im Entwicklungsmodus lädt der `Ctrl+K`-Dialog den Index nicht (nach dem Öffnen fehlt das Eingabefeld), die sitewide Suche ist dort nicht verfügbar. Das ist vorgesehenes Framework-Verhalten, kein Defekt der Site.
- **Lösung**: Nach einem vollständigen Build mit dem Vorschau-Server prüfen:

  ```bash
  pnpm run build
  pnpm run preview
  ```

  Die Suche innerhalb der Seite über die obere Leiste ist von dieser Einschränkung nicht betroffen; während der Entwicklung können Sie damit die Inhalte der aktuellen Seite direkt auffinden.

### Q10: Bei `Ctrl+K` öffnet sich das Suchfenster nicht

- **Ursache**: Manche Eingabemethoden, Zwischenablage-Werkzeuge oder Screenshot-Programme belegen selbst `Ctrl+K` / `Cmd+K`.
- **Lösung**: Klicken Sie direkt auf das kleine `Ctrl K`-Abzeichen rechts im Suchfeld; auch damit öffnet sich das Suchfenster für die gesamte Site.

---

## 4. Deployment-Probleme mit Cloudflare Pages

### Q11: Die frisch angebundene eigene Domain meldet einen SSL-Handshake-Fehler (Error 525)

- **Ursache**: Damit Cloudflare ein Universal-SSL-Zertifikat für die neue Domain ausstellt, vergehen 2–5 Minuten, bis es weltweit wirksam ist.
- **Lösung**: Ein paar Minuten warten und dann den Browser-Cache umgehend neu laden (`Ctrl+F5` / `Cmd+Shift+R`); in der Zwischenzeit erreichen Sie die Site über die Standarddomain `<Projektname>.pages.dev`, die jederzeit funktioniert.

### Q12: `pnpm run deploy` bricht mit `Project not found` ab

- **Ursache**: Der Parameter `--project-name` im Deployment-Befehl stimmt nicht mit dem Projektnamen im Cloudflare-Dashboard überein; möglicherweise ist der lokale Rechner auch nicht angemeldet.
- **Lösung**:
  1. Führen Sie zuerst `npx wrangler whoami` aus, um die Anmeldung zu bestätigen;
  2. Gleichen Sie den Projektnamen im Cloudflare-Dashboard ab und passen Sie falls nötig den Parameter `--project-name` in `scripts/verify-release.mjs` an.

einmal `npx wrangler login` zur Anmeldung ausführen, danach `pnpm run deploy`. Das Deployment übernimmt `scripts/verify-release.mjs`. Das Skript lehnt andere Branches als `main`, einen Arbeitsbaum mit Änderungen sowie einen HEAD ab, der nicht dem tatsächlichen Commit von `origin/main` auf dem Remote entspricht. Vor Wrangler läuft `pnpm run verify`. Der Projektname steht in diesem Skript, nicht in `package.json`.

---

## 5. Lokale Selbstprüfung vor dem Commit

Führen Sie vor dem Push zu GitHub die einheitliche Selbstprüfung aus: Tests, Konfigurationsprüfungen, Astro-Typprüfungen, Build sowie Inhalts- und Ausgabeprüfungen:

```bash
pnpm run verify
```

Alle Schritte von `pnpm run verify` müssen bestehen und der Befehl muss mit Code 0 enden. Einzelne Meldungen wie `0 errors` oder `Complete!` bedeuten noch nicht, dass die gesamte Prüfung abgeschlossen ist. Die CI (`build.yml`) führt dieselben Prüfungen aus; das Erscheinungsbild muss weiterhin manuell geprüft werden.
