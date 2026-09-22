---
title: Schnellstart (in 3 Minuten starten)
description: EpoCanvas Docs – Vorbereitung der lokalen Umgebung, Installation der Abhängigkeiten, Start des lokalen Entwicklungsservers sowie eine Kurzübersicht der gängigen Arbeitsbefehle.
---

Um diese Dokumentations-Site zum Laufen zu bringen, gibt es zwei Wege – wählen Sie je nach Ziel einen davon:

- **Sie möchten sofort eine Site online sehen**: Keine Installation nötig – springen Sie direkt zum untenstehenden Abschnitt [Ein-Klick-Bereitstellung](#ein-klick-bereitstellung-mit-einem-klick-online), klicken Sie auf die Schaltfläche, und nach zwei Minuten haben Sie Ihre eigene Webadresse;
- **Sie möchten Dokumentation schreiben und Inhalte ändern**: Bringen Sie das Projekt zuerst gemäß [Vorbereitung](#vorbereitung) lokal zum Laufen, prüfen Sie Änderungen direkt an ihrer Wirkung und veröffentlichen Sie anschließend mit dem Bereitstellungsbefehl unter [Gängige Befehle](#gängige-entwicklungsbefehle-im-überblick).

---

## Ein-Klick-Bereitstellung: Mit einem Klick online

Die folgenden Schaltflächen sind die offiziellen „Bereitstellungs-Buttons" von Cloudflare, Vercel und Netlify. Nach dem Klick öffnet sich der Bereitstellungsassistent der jeweiligen Plattform; die Plattform klont dieses Repository automatisch unter Ihr eigenes GitHub-Konto und erledigt Cloud-Build und Veröffentlichung automatisch. Sie benötigen durchgängig nur ein GitHub-Konto; Node.js und pnpm müssen Sie nicht auf dem Rechner installieren, und Sie müssen keinen einzigen Befehl eingeben.

### Bereitstellung auf Cloudflare (empfohlen)

[![Auf Cloudflare bereitstellen](/images/canvas/deploy/badge-cloudflare.svg)](https://deploy.workers.cloudflare.com/?url=https://github.com/shijianus/epocanvas-docs)

Nach dem Klick auf die Schaltfläche führt der Assistent durch drei Schritte:

1. **Autorisierung und Anmeldung**: Melden Sie sich nacheinander bei GitHub und Cloudflare an. Beide bieten kostenlose Tarife; wer kein Konto hat, registriert sich direkt vor Ort;
2. **Repository klonen**: Cloudflare kopiert dieses Repository automatisch in Ihr GitHub-Konto; alle späteren Inhaltsänderungen erfolgen in Ihrem eigenen Repository;
3. **Konfiguration prüfen und bereitstellen**: Zum Schluss zeigt der Assistent eine Konfigurationsseite; prüfen Sie alles anhand der folgenden Tabelle und klicken Sie auf Deploy:

| Konfigurationselement | Standardvorgabe im Assistenten | Vorgehensweise |
| :--- | :--- | :--- |
| Repository-Name / Projektname | vorab ausgefüllt mit `epocanvas-docs` | Standard beibehalten |
| Build-Befehl | automatisch als `pnpm run build` dieses Repositorys erkannt | Standard beibehalten |
| Bereitstellungsbefehl | vorab ausgefüllt mit `pnpm run deploy` | **ändern in `npx wrangler deploy`** |

:::caution
Ändern Sie den Bereitstellungsbefehl unbedingt in `npx wrangler deploy`. Der vorab ausgefüllte Befehl `pnpm run deploy` ist der direkte Cloudflare-Pages-Upload-Befehl, den die Betreiber dieser Site für sich reserviert haben; er deployed auf einen fest hinterlegten Projektnamen und führt im Bereitstellungsablauf über die Schaltfläche direkt zu einer Fehlermeldung.
:::

Bei der ersten Bereitstellung erkennt Cloudflare, dass im Repository keine Workers-Konfigurationsdatei liegt, identifiziert die Site automatisch als statische Astro-Site und stellt in Ihrem Repository einen automatisch generierten Konfigurations-Pull-Request (PR) – mergen Sie ihn einfach; danach wird bei jedem Push automatisch gebaut und veröffentlicht. Vom Klick auf die Schaltfläche bis zur sichtbaren Webadresse vergehen bei reibungslosem Ablauf zwei bis drei Minuten.

Nach Abschluss der Bereitstellung weist Cloudflare eine öffentliche Adresse der Form `https://epocanvas-docs.<Ihre-Subdomain>.workers.dev` zu, mit HTTPS-Zertifikat. Möchten Sie Ihre eigene Domain verwenden, gehen Sie in der Konsole zu Workers & Pages → Ihr Projekt → **Settings** → **Domains & Routes** und fügen Sie sie dort hinzu. Die veröffentlichte Instanz lässt sich direkt vergleichen: die Standard-Domain von Pages [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev) und die eigene Domain [https://docs.epocanvas.com](https://docs.epocanvas.com).

### Bereitstellung auf Vercel und Netlify

Wer andere Plattformen gewohnt ist: Die beiden folgenden Schaltflächen erledigen dieselbe Aufgabe; beide Plattformen erkennen Astro-Projekte automatisch, Sie müssen keinerlei Build-Konfiguration manuell eintragen:

[![Mit Vercel bereitstellen](/images/canvas/deploy/badge-vercel.svg)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshijianus%2Fepocanvas-docs)

[![Auf Netlify bereitstellen](/images/canvas/deploy/badge-netlify.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/shijianus/epocanvas-docs)

- **Vercel**: Schaltfläche klicken → GitHub autorisieren → bei den Standardoptionen auf Deploy klicken. Anschließend erhalten Sie die Domain `epocanvas-docs.vercel.app`; der persönliche Hobby-Tarif ist kostenlos;
- **Netlify**: Schaltfläche klicken → GitHub verbinden → die Plattform klont das Repository automatisch und schließt den ersten Build ab. Anschließend erhalten Sie die Domain `epocanvas-docs.netlify.app`; das kostenlose Paket reicht aus.

:::note
Alle drei Schaltflächen funktionieren nach demselben Mechanismus: Das Repository wird in Ihr GitHub-Konto geklont und ein Continuous Deployment eingerichtet, bei dem ein Push des Codes automatisch neu baut und veröffentlicht. Wählen Sie einfach eine Plattform – eine doppelte Bereitstellung ist nicht nötig. Diese Site selbst wird per direktem Upload auf Cloudflare Pages gehostet (siehe [Bereitstellung auf Cloudflare Pages](/canvas/cloudflare/)); das beeinflusst den Weg über die Schaltflächen nicht – für eine statische Dokumentations-Site ist das Besuchserlebnis bei beiden Hosting-Arten identisch.
:::

---

## Vorbereitung

Die Ein-Klick-Bereitstellung eignet sich, um die Site zunächst zu veröffentlichen; das Schreiben und Ändern von Dokumenten erfolgt aber letztlich lokal. Wenn Sie selbst Inhalte schreiben möchten, stellen Sie bitte zuerst sicher, dass auf Ihrem Rechner die folgende grundlegende Entwicklungsumgebung installiert ist:

| Werkzeug | Empfohlene Version | Prüf-Befehl | Erläuterung |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.20.8` (empfohlen: 20.3+ oder 22 LTS) | `node -v` | Basisumgebung zum Ausführen von JavaScript und zum Bauen statischer Seiten |
| **pnpm** | `>= 9` (in CI-Umgebungen: 10) | `pnpm -v` | Empfohlener Paketmanager, schnelle Installation und sparsamer Speicherverbrauch |
| **Git** | neueste stabile Version | `git --version` | Für das Abrufen des Codes und die Versionsverwaltung |

:::tip
Falls `pnpm` auf Ihrem Rechner noch nicht installiert ist, können Sie es schnell global über das in Node.js enthaltene npm installieren:

```bash
npm install -g pnpm
```
:::

---

## In 3 Schritten lokal starten

### Schritt 1: Das Repository lokal klonen

Öffnen Sie ein Terminal und führen Sie die folgenden Befehle aus, um den Projektcode zu klonen und in den Projektordner zu wechseln:

```bash
git clone https://github.com/shijianus/epocanvas-docs.git
cd epocanvas-docs
```

### Schritt 2: Projektabhängigkeiten installieren

Führen Sie im Projektstammverzeichnis den Installationsbefehl aus:

```bash
pnpm install
```

pnpm lädt anhand der `pnpm-lock.yaml` automatisch die benötigten Frontend-Abhängigkeiten herunter, darunter Astro, Starlight und das Modul zur lokalen Bildverarbeitung; üblicherweise ist das nach einigen zehn Sekunden erledigt. Am Ende der Installation zeigt das Terminal die Gesamtzeit an:

```text
Done in 1m 3.2s using pnpm v9.15.9
```

### Schritt 3: Den lokalen Entwicklungsserver starten

Nach Abschluss der Abhängigkeitsinstallation führen Sie den Startbefehl aus:

```bash
pnpm run dev
```

Das Terminal gibt eine Ausgabe ähnlich der folgenden aus (beim ersten Start müssen Abhängigkeiten vorkompiliert werden, was einige Sekunden dauert):

```text
astro  v5.18.2  ready in 5152 ms

┃ Local    http://localhost:4321/
┃ Network  use --host to expose

watching for file changes...
```

Öffnen Sie nun `http://localhost:4321` im Browser – Sie sehen die vollständige Dokumentations-Site. Nach dem Speichern einer beliebigen `.md`-Datei lädt die Browserseite automatisch neu und zeigt den aktuellen Inhalt.

![Tatsächliches Rendering der Schnellstart-Seite auf dem lokalen Entwicklungsserver](/images/canvas/ui-quickstart.png)

*Abbildung: Tatsächliches Rendering von `http://localhost:4321/canvas/deployment/` – genau die Seite, die Sie gerade lesen.*

---

## Gängige Entwicklungsbefehle im Überblick

Beim täglichen Schreiben von Dokumentation oder der Pflege des Projekts verwendet man vor allem die folgenden Befehle:

| Befehl | Einsatzfall | Erläuterung |
| :--- | :--- | :--- |
| `pnpm run dev` | **Tägliches Schreiben** | Startet den lokalen Debug-Server mit Hot Reload (HMR). Nach dem Ändern einer beliebigen `.md`-Datei aktualisiert der Browser die Inhalte automatisch. |
| `pnpm run build` | **Build-Test** | Kompiliert lokal die vollständige statische Site und erzeugt im Verzeichnis `dist/` HTML, CSS sowie den Pagefind-Suchindex. |
| `pnpm run preview` | **Build-Ergebnis prüfen** | Startet lokal einen leichten Webserver für das `dist/`-Ergebnis, um vor der offiziellen Veröffentlichung Links und Styles zu prüfen. |
| `pnpm run deploy` | **Ein-Klick-Veröffentlichung** | Führt zuerst automatisch den Build aus und ruft dann das Wrangler-Werkzeug auf, um `dist/` in die Cloudflare-Pages-Produktionsumgebung zu pushen. |

Die vollständigen Veröffentlichungsschritte und Methoden zur Online-Verifikation finden Sie unter **[Bereitstellung auf Cloudflare Pages](/canvas/cloudflare/)**.

---

## Wo liegen die zentralen Konfigurationsdateien?

Wenn Sie grundlegende Informationen der Website ändern möchten, sind vor allem die folgenden Dateien relevant:

- **Websitename und Verzeichnismenü**: Ändern Sie `astro.config.mjs` im Stammverzeichnis. Dort lassen sich `title` (Site-Titel), `site` (Online-Domain) und `sidebar` (Verzeichnismenü links) anpassen.
- **Schaltflächen der oberen Navigationsleiste**: Ändern Sie `src/config/navigation.ts`. Dort können Schaltflächen wie „Startseite" oder „Produktbeschreibung" ergänzt oder entfernt sowie ihre Sprungziele geändert werden.
- **Seitenfarben und Schriftstile**: Ändern Sie `src/styles/custom.css`. Dort lassen sich die Designfarben im hellen und dunklen Design anpassen.
- **Neue Dokumente hinzufügen**: Legen Sie einfach eine `.md`-Datei im Verzeichnis `src/content/docs/canvas/` an und tragen Sie sie in die Seitenleiste ein; Details finden Sie im [Markdown-Leitfaden für Text und Formatierung](/canvas/markdown/).

---

## Nächste Schritte

Wenn der lokale Server erfolgreich läuft, können Sie Folgendes vertiefen:

- **[Seitenlayout und Leseerlebnis](/canvas/layout/)**: Details zum Layout von Kopfleiste, Seitenleiste und Haupttextoberfläche.
- **[Renderregeln im Detail](/canvas/rendering/)**: Verstehen, wie Markdown zur finalen Seite gerendert wird, und typische Formatierungsfallen vermeiden.
- **[Bereitstellung auf Cloudflare Pages](/canvas/cloudflare/)**: Die Dokumentation im Internet veröffentlichen und eine eigene Domain anbinden.
