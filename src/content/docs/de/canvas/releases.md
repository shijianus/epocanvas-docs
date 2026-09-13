---
title: Versionsverwaltung & automatisierte Workflows
description: Benennungsregeln für Versionsnummern in EpoCanvas Docs, der standardmäßige Release-Ablauf für Versionsupdates und die automatisierte Release-Pipeline mit GitHub Actions.
---

Damit Leser jederzeit wissen, welcher Produktversion das aktuelle Dokument entspricht, und damit das Team die Änderungshistorie geordnet nachverfolgen kann, verwendet **EpoCanvas Docs** semantische Versionsnummern und einen festen Release-Ablauf.

---

## 1. Regeln für semantische Versionsnummern (SemVer)

Die Versionsnummer folgt dem Format `vHauptversion.Nebenversion.Revision` (aktuell `v1.2.0`):

| Änderungsart | Beispiel | Auslösender Anlass |
| :--- | :--- | :--- |
| **Hauptversion (Major)** | `v2.0.0` | Größere Überarbeitung des Dokumentationssystems (z. B. Upgrade der Astro-Hauptversion oder vollständiger Austausch des Layouts). |
| **Nebenversion (Minor)** | `v1.2.0` | Größere Funktionen wie neue Dokumentkapitel, eine zusätzliche Sprache oder ein Upgrade des Designsystems. |
| **Revision (Patch)** | `v1.2.1` | Kleine Änderungen wie Korrekturen von Tippfehlern, aktualisierte Codebeispiele oder kleine Stil-Anpassungen. |

---

## 2. Der standardmäßige 3-Schritte-Ablauf für einen neuen Release

### Schritt 1: Änderungsprotokoll festhalten (`RELEASE_NOTES.md`)

Beschreiben Sie in `RELEASE_NOTES.md` im Projektstammverzeichnis den Inhalt dieses Updates; diese Datei dient als Release-Beschreibung des GitHub Release:

```markdown
## [v1.2.1] - 2026-09-18

### Behoben
- Tippfehler in einem Befehl des Bereitstellungskapitels korrigiert.
- Oberflächen-Screenshots auf die neueste Version aktualisiert.
```

### Schritt 2: Versionsnummer in package.json aktualisieren

Das Versionsabzeichen in der Navigationsleiste ist bereits automatisch mit dem `version`-Feld in `package.json` verknüpft und bildet als Single Source of Truth die sitewide Versionsquelle ab. Aktualisieren Sie die Versionsnummer in `package.json` (oder führen Sie `pnpm version patch` aus), und das Abzeichen in der Kopfzeile gleicht sich automatisch an die neueste Version an – ein manuelles Nachpflegen an mehreren Stellen entfällt:

```json
{
  "name": "epocanvas-docs",
  "version": "1.2.1"
}
```

### Schritt 3: Code committen und Git-Tag setzen

```bash
# 1. alle Änderungen committen
git add .
git commit -m "chore(release): bump version to v1.2.1"
git push origin main

# 2. den passenden Versionstag setzen und pushen
git tag v1.2.1
git push origin v1.2.1
```

---

## 3. Automatisierte Release-Pipeline mit GitHub Actions

Das Projekt enthält in `.github/workflows/release.yml` einen vorbereiteten automatisierten Release-Workflow mit folgendem Inhalt:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'   # wird automatisch ausgelöst, wenn ein Tag, der mit v beginnt, gepusht wird

permissions:
  contents: write

jobs:
  release:
    name: Publish GitHub Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Create GitHub Release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          TAG_NAME="${{ github.ref_name }}"
          echo "Publishing release for tag: ${TAG_NAME}"
          gh release create "${TAG_NAME}" \
            --title "EpoCanvas Docs ${TAG_NAME}" \
            --notes-file RELEASE_NOTES.md \
            --latest
```

Nach dem Push des Tags `v1.2.1` startet GitHub die Pipeline automatisch:

1. der Repository-Code wird ausgecheckt;
2. mit `RELEASE_NOTES.md` als Beschreibung wird auf der **Releases**-Seite des Repositorys der offizielle Release angelegt und als latest markiert;
3. Leser klicken auf das Versionsabzeichen in der Kopfzeile und sehen das Archiv aller früheren Versionen.

:::note
Diese Pipeline legt nur das GitHub Release an und **stellt die Website nicht bereit**. Die Aktualisierung der Live-Website übernimmt der automatische Git-Build von Cloudflare Pages (oder lokal `pnpm run deploy`); beide Vorgänge hängen nicht voneinander ab. Details siehe [Bereitstellung auf Cloudflare Pages](/canvas/cloudflare/).
:::

---

## 4. Zusammenarbeit am Inhalt

Pflegen mehrere Personen die Dokumentation, arbeitet das Team nach dem festen Ablauf „Branch → Review → Merge → Release", damit die Live-Inhalte jederzeit durch einen Build laufen:

```text
main-Branch (immer veröffentlichbar, entspricht der Live-Website)
  │
  ├─ 1. Feature-Branch von main abzweigen        git checkout -b docs/new-guide
  ├─ 2. Markdown schreiben/ändern
  ├─ 3. lokale Selbstprüfung                     pnpm exec astro check && pnpm run build
  ├─ 4. Branch pushen und Pull Request öffnen    löst den CI-Build aus
  ├─ 5. nach erfolgreichem Review nach main mergen   löst die automatische Live-Bereitstellung aus
  └─ 6. bei Bedarf einen v*-Tag setzen           löst die GitHub-Release-Pipeline aus
```

### Prüfpunkte für Pull-Request-Reviews

Die CI (`build.yml`) stellt nur sicher, dass der Build durchläuft; die folgenden Punkte müssen von Menschen geprüft werden:

- **Linkgültigkeit**: Springen neu hinzugefügte interne Links und Anker korrekt? Ist für Dokumente mit geändertem Pfad eine Weiterleitung eingetragen?
- **Rendering**: Werden die `:::`-Syntax der Hinweisboxen und die Codeblock-Annotationen auf der Seite korrekt angezeigt? (Die CI prüft nichts Visuelles.)
- **Bild-Text-Bezug**: Haben neue Screenshots eine Beschreibung und sind sie scharf?
- **Namenskonventionen**: Dateinamen kleingeschrieben mit Bindestrich, `title` und `description` im Frontmatter vollständig.

### Empfohlene Aufgabenverteilung

| Rolle | Zuständigkeit |
| :--- | :--- |
| Dokumentautor | Inhalte schreiben, lokal prüfen, PR anlegen |
| Reviewer | Rendering und Links kontrollieren, Code mergen |
| Release-Verantwortlicher | Versionstags setzen, `RELEASE_NOTES.md` pflegen, das Versionsabzeichen in der Navigationsleiste abgleichen |

---

## 5. CI-Build-Prüfung

Das Repository ist mit `.github/workflows/build.yml` konfiguriert: Bei jedem Push auf den `main`-Branch und in jedem Pull Request werden automatisch die Abhängigkeiten installiert und ein vollständiger Build ausgeführt, sodass Probleme wie tote Links oder Frontmatter-Fehler schon zur Buildzeit sichtbar werden. Führen Sie dieselbe Prüfung vor dem Commit lokal aus, dann schlägt die CI nach dem Push nicht fehl:

```bash
pnpm exec astro check && pnpm run build
```
