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

### Q2: Bei der Installation der Abhängigkeiten erscheint ein Kompilierungsfehler des Sharp-Moduls

- **Ursache**: Sharp ist das zugrunde liegende C++-Modul für die Bildkompression zur Build-Zeit; nach einer Node.js-Versionsänderung kann der alte Cache nicht mehr kompatibel sein.
- **Lösung**: Abhängigkeiten bereinigen und neu installieren:

  ```bash
  rm -rf node_modules pnpm-lock.yaml
  pnpm install
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
  1. Bestätigen Sie, dass das Bild unter `public/images/canvas/your-pic.png` gespeichert ist;
  2. Verwenden Sie beim Einbinden einen absoluten Pfad beginnend mit `/`: `![Beschreibung](/images/canvas/your-pic.png)`; schreiben Sie keinen relativen Pfad wie `../public/...`.

---

## 3. Probleme mit der Suchfunktion

### Q9: Beim lokalen Debuggen mit `pnpm dev` findet die globale Suche den frisch geschriebenen Artikel nicht

- **Ursache**: Das Suchfenster für die gesamte Site hängt vom Pagefind-Index ab, und dieser entsteht nur bei `pnpm run build`; der Entwicklungsserver baut den Index zum Erhalt der Hot-Reload-Geschwindigkeit nicht in Echtzeit neu auf.
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
  2. Gleichen Sie den Projektnamen im Cloudflare-Dashboard ab und passen Sie falls nötig den Parameter `--project-name` im `deploy`-Skript von `package.json` an.

---

## 5. Lokale Selbstprüfung vor dem Commit

Vor dem Push zu GitHub führen Sie die folgenden Befehle für eine vollständige Selbstprüfung aus (Typprüfung + vollständiger Build):

```bash
pnpm exec astro check && pnpm run build
```

Wenn `astro check` `0 errors` ausgibt und der Build mit `Complete!` endet, sind die Dokumente frei von Syntaxfehlern und können bedenkenlos committet werden. Die CI des Repositorys (`build.yml`) führt nach dem Push denselben Build aus; wer lokal zuerst durchkommt, vermeidet ein CI-Fehlschlagen.
