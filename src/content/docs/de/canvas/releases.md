---
title: Versionsverwaltung & automatisierte Workflows
description: Benennungsregeln für Versionsnummern in EpoCanvas Docs, der standardmäßige Release-Ablauf für Versionsupdates und die automatisierte Release-Pipeline mit GitHub Actions.
---

Damit Leser jederzeit wissen, welcher Produktversion das aktuelle Dokument entspricht, und damit das Team die Änderungshistorie geordnet nachverfolgen kann, verwendet **EpoCanvas Docs** semantische Versionsnummern und einen festen Release-Ablauf.

---

## 1. Regeln für semantische Versionsnummern (SemVer)

Die Versionsnummer folgt dem Format `vHauptversion.Nebenversion.Revision` (aktuell `v1.3.1`):

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
## [v1.2.1] - 2026-09-14

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

Maßgeblich ist [`.github/workflows/release.yml`](https://github.com/shijianus/epocanvas-docs/blob/main/.github/workflows/release.yml); das vollständige YAML wird hier nicht kopiert. Ein Push eines `v*`-Tags löst den Workflow aus. Vor dem Taggen können Sie lokal diesen Prüfaufruf ausführen; er schreibt keine GitHub Releases und führt kein Deployment aus:

```bash
pnpm run verify
```

1. Der Job `validate` verwendet ausschließlich Leserechte (`contents: read`) und führt zuerst die vollständige Prüfung `pnpm run verify` aus.
2. Erst nach erfolgreicher Validierung erhält der Job `publish` die Berechtigung `contents: write`, um ein GitHub Release anhand von `RELEASE_NOTES.md` anzulegen oder zu aktualisieren.
3. Bestehende Releases werden ohne Löschen und Neuanlegen aktualisiert. GitHub bestimmt `Latest` für stabile Releases anhand der Version; Vorabversionen werden nicht als `Latest` markiert. Das Versionsabzeichen im Header führt zum Versionsarchiv.

:::note
Dieser Workflow erstellt oder aktualisiert nur GitHub Releases; er veröffentlicht die Website nicht automatisch. Auch ein Merge nach `main` führt kein Deployment aus. Veröffentlicht wird lokal mit `pnpm run deploy` oder über eine separat eingerichtete Git-Integration des Hosters; siehe [Bereitstellung auf Cloudflare Pages](/canvas/cloudflare/).
:::

---

## 4. Zusammenarbeit am Inhalt

Pflegen mehrere Personen die Dokumentation, arbeitet das Team nach dem festen Ablauf „Branch → Review → Merge → Release", damit die Live-Inhalte jederzeit durch einen Build laufen:

```text
main-Branch (Veröffentlichungsquelle; die Website ändert sich erst nach einem Deployment)
  │
  ├─ 1. Feature-Branch von main abzweigen        git checkout -b docs/new-guide
  ├─ 2. Markdown schreiben/ändern
  ├─ 3. lokale Selbstprüfung                     pnpm run verify
  ├─ 4. Branch pushen und Pull Request öffnen    löst die vollständige CI-Prüfung aus
  ├─ 5. nach erfolgreichem Review nach main mergen   kein automatisches Live-Deployment
  └─ 6. bei Bedarf einen v*-Tag setzen           löst die GitHub-Release-Pipeline aus
```

### Prüfpunkte für Pull-Request-Reviews

Die CI (`build.yml`) führt `pnpm run verify` aus: Tests, Konfigurationsprüfungen, Astro-Typprüfungen, Build sowie Inhalts- und Ausgabeprüfungen. Das Erscheinungsbild muss weiterhin manuell geprüft werden:

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

`.github/workflows/build.yml` führt bei Pushes nach `main` und bei Pull Requests die vollständige Prüfung aus. Die CI verwendet Node.js 22.20.0 aus `.node-version` und pnpm 10.34.5. Führen Sie vor dem Commit lokal dieselbe Selbstprüfung aus:

```bash
pnpm run verify
```
