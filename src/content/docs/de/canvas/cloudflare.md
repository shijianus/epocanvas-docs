---
title: Veröffentlichung auf Cloudflare Pages
description: "Cloudflare-Pages-Anleitung: Wrangler-Upload, optionale Git-Integration, Domains und Prüfungen nach dem Deployment."
---

Diese Seite beschreibt das Deployment statischer Dokumentation auf **Cloudflare Pages** anhand der Repository-Scripte. Screenshots sind vorhandene Beispiele, keine Deployment- oder Testprotokolle dieses Kandidaten. Bei Abweichungen gilt das aktuelle Dashboard. Ob Prüfungen und Veröffentlichung gelungen sind, zeigen nur die tatsächlichen Protokolle und Zustände.

---

## Vorbereitung

### Was Sie brauchen

| Punkt | Erläuterung |
| :--- | :--- |
| **Cloudflare-Konto** | Kostenlos registrieren unter [dash.cloudflare.com](https://dash.cloudflare.com/); für Pages ist kein kostenpflichtiger Tarif nötig |
| **Lokal ein vollständiger Build** | Zuerst `pnpm run verify` durchlaufen lassen und prüfen, dass das Verzeichnis `dist/` korrekt entsteht; siehe [Schnellstart](/canvas/deployment/) |
| **Node.js + pnpm** | Die Deployment-Befehle hängen von der lokalen Entwicklungsumgebung ab; die Versionsanforderungen entsprechen dem Kapitel Schnellstart |

### Wie wählt man zwischen den beiden Deployment-Varianten

![Lokaler Wrangler-Upload und Git-integrierter Build](/images/canvas/docs-deploy-compare.svg)

*Abbildung: links lokaler Build und Wrangler-Upload, rechts durch Git ausgelöster Cloud-Build. Das Diagramm belegt keine Tests dieser Wege während dieser Überarbeitung.*

| Vergleichspunkt | Variante 1: Direktupload per Befehlszeile | Variante 2: Automatischer Build über Git |
| :--- | :--- | :--- |
| Vorgehen | lokal `pnpm run deploy` ausführen | Code nach GitHub pushen löst automatisch aus |
| Einstiegshürde | niedrig, zwei Befehle | mittel, einmalige Konfiguration im Dashboard nötig |
| Passende Situation | erster Go-live, Einzelbetrieb, schnelle Updates | Zusammenarbeit im Team, gewünscht ist „Commit heißt live“ |
| Prüfungen | Vollständiges verify vor dem Upload | Vollständiges verify als Cloud-Build konfigurieren |

:::tip
Wählen Sie beim Erstellen Direct Upload oder Git-Integration. Gehen Sie nicht davon aus, dass ein Direct-Upload-Projekt direkt in ein Git-Projekt umgewandelt werden kann; erstellen Sie beim Wechsel ein passendes Projekt. Auch dringende Wrangler-Uploads müssen die Prüfungen bestehen.
:::

:::tip[Gar keine Befehle eintippen?]
Auf der Seite [Schnellstart](/canvas/deployment/) gibt es Ein-Klick-Deployment-Schaltflächen für Cloudflare, Vercel und Netlify: einmal klicken, Konto autorisieren, Konfiguration bestätigen – und die Dokumentationsseite ist in Ihrem eigenen Cloud-Konto veröffentlicht; Details unter [One-Click-Deployment](/canvas/deployment/#ein-klick-bereitstellung-mit-einem-klick-online). Die Cloudflare-Schaltfläche nutzt dabei das Workers Static Hosting und ist ein eigenständiger Weg neben der auf dieser Seite beschriebenen Pages-Variante; für eine statische Dokumentationsseite ist das Zugriffsverhalten identisch, wählen Sie einfach einen der beiden Wege.
:::

---

## Variante 1: Direktupload über die lokale Befehlszeile (für den ersten Deployment empfohlen)

Hier wird lokal gebaut und mit Wrangler hochgeladen. `pnpm run deploy` zielt auf das Maintainer-Projekt `epocanvas-docs`; es ist kein allgemeiner Deployment-Knopf für beliebige Forks.

### Schritt 1: Beim Cloudflare-Konto anmelden

Wrangler (das offizielle Cloudflare-Befehlszeilenwerkzeug) ist im Projekt bereits enthalten; bei der ersten Nutzung erfolgt die Anmeldung per Browser-Autorisierung:

```bash
pnpm exec wrangler login
```

Danach zeigt das Terminal `Opening a link in your default browser...`; der Browser öffnet die Cloudflare-Autorisierungsseite, und nach einem Klick auf **Allow** meldet das Terminal den erfolgreichen Login. Den Anmeldestatus prüfen Sie mit:

```bash
pnpm exec wrangler whoami
```

:::caution
Eine gültige Cloudflare-Anmeldung oder Token-Berechtigung ist nötig. Prüfen Sie bei Fehlern `wrangler whoami`, Konto und Projektberechtigungen. Der genaue Fehlertext kann je nach Version variieren.
:::

### Schritt 2: Build und Upload mit einem Befehl

Das Projekt enthält in `scripts/verify-release.mjs` einen vorkonfigurierten Veröffentlichungsbefehl:

Melden Sie sich mit `pnpm exec wrangler login` an. `scripts/verify-release.mjs` verlangt `main`, einen sauberen Arbeitsbaum einschließlich ungetrackter Dateien, Upstream `origin/main` und HEAD gleich dem tatsächlichen Remote-Commit. `pnpm run deploy` führt vollständiges `pnpm run verify` aus, prüft Git erneut und ruft dann Wrangler auf. Konfigurieren Sie vor der Wiederverwendung Ihr eigenes Zielprojekt im Script.

```bash
pnpm run deploy
```

`pnpm run deploy` prüft Konfiguration, Astro-Typen, Build, Tests und Inhalte/Artefakte vor dem Upload. Für die Vorbedingungen allein dient der folgende Befehl. Er liest Remote-Git-Referenzen, führt aber weder vollständige Verifikation noch Build oder Upload aus. Ein erfolgreicher Dry-Run bedeutet nicht, dass Tests bestanden wurden.

```bash
pnpm run deploy --dry-run
```

Wrangler gibt die URL nach erfolgreichem Upload aus. Das Script setzt `--project-name epocanvas-docs --branch main`; prüfen Sie, ob das Projekt im Konto existiert und der Produktionsbranch stimmt.

### Schritt 3: Ihr Projekt im Dashboard finden

Öffnen Sie [dash.cloudflare.com](https://dash.cloudflare.com/) und klicken Sie im linken Menü auf **Compute (Workers & Pages)**; dort erscheint die Projektliste. Die folgende Abbildung markiert drei zentrale Stellen:

![Projektliste unter Workers & Pages im Cloudflare-Dashboard, mit Markierungen für den Menüeintrag links, die Schaltfläche Create application und das Projekt epocanvas-docs](/images/canvas/deploy/cf-01-projects-list.png)

*Abbildung: Projektliste unter Workers & Pages. ① Zugang über das linke Menü zu Workers & Pages; ② die Schaltfläche Create application legt ein neues Projekt an; ③ unser Projekt `epocanvas-docs` mit der Zugriffsdomain `epocanvas-docs.pages.dev` und dem Zeitpunkt des letzten Deployments.*

Ein Klick auf den Projektnamen öffnet die Projektdetails; der Tab **Deployments** zeigt die vollständige Deployment-Historie:

![Deployment-Historie des Projekts epocanvas-docs mit Markierungen für die Produktionsdomain, die Deployment-Einträge und den Status](/images/canvas/deploy/cf-02-deployments.png)

*Abbildung: Seite der Deployment-Historie. ① Projektname; ② Tab Deployments; ③ die Produktionsdomain ist gleichzeitig mit `docs.epocanvas.com` (eigene Domain) und `epocanvas-docs.pages.dev` (Standarddomain) verbunden; ④ jeder Deployment-Eintrag zeigt Branch und Commit-Information; ⑤ Status und Deployment-Zeitpunkt.*

:::note
Nur ein erfolgreicher Upload erzeugt einen Eintrag. Prüfen Sie Status, Branch, Commit und Domain in Deployments. Ein abgewiesener Befehl oder eine fehlgeschlagene Prüfung aktualisiert die Website nicht.
:::

---

## Die Build-Konfiguration von Direktupload-Projekten verstehen

Im Tab **Settings** zeigt sich der Unterschied zwischen Direktupload-Projekten und Git-Projekten:

![Seite Settings mit der Build-Konfiguration des Projekts epocanvas-docs; im Feld Git repository wird keine Verbindung angezeigt](/images/canvas/deploy/cf-03-settings.png)

*Abbildung: Tab Settings. ① Zugang zu Settings; ② im Feld Git repository steht Connect (nicht verbunden) – ein Direktupload-Projekt braucht keine Git-Build-Konfiguration, der Build erfolgt vollständig auf Ihrem lokalen Rechner.*

:::tip
Direktupload vermeidet die Cloud-Build-Warteschlange. Der Rechner benötigt passende Node-, pnpm-, Git-Versionen und Zugangsdaten; es muss nicht stets derselbe Computer sein.
:::

---

## Variante 2: Automatischer Build über ein verbundenes Git-Repository (optional)

Für Builds per Push erstellen Sie ein Git-integriertes Pages-Projekt und verbinden das Repository. Dies ist eine Konfigurationsanleitung, keine Bestätigung, dass der Weg aktiviert oder hier getestet wurde.

### Schritt 1: Den Erstellungsablauf öffnen

Klicken Sie in der Projektliste unter Workers & Pages oben rechts auf **Create application** (siehe Markierung ② in der Abbildung zu [Schritt 3](#schritt-3-ihr-projekt-im-dashboard-finden) von Variante 1) und wählen Sie den Tab **Pages**.

### Schritt 2: Das Git-Repository verbinden

1. Wählen Sie im Erstellungsdialog **Connect to Git**;
2. autorisieren Sie Cloudflare für den Zugriff auf Ihr GitHub-Konto;
3. wählen Sie in der Repository-Liste das Dokumentations-Repository `epocanvas-docs`;
4. klicken Sie auf **Begin setup**.

### Schritt 3: Die Build-Konfiguration ausfüllen

Tragen Sie unter „Set up builds and deployments“ die folgende Konfiguration ein:

| Konfigurationsfeld | Einzutragender Wert |
| :--- | :--- |
| Framework-Preset | `Astro` |
| Build-Befehl | `pnpm install --frozen-lockfile && pnpm run verify` |
| Ausgabeverzeichnis | `dist` |
| Node.js | `22.23.4`, wie in `.node-version` |
| pnpm | `10.34.5`, wie in `packageManager` |

### Schritt 4: Den automatischen Build prüfen

Prüfen Sie Node und pnpm in der Cloud, wählen Sie **Save and Deploy** und lesen Sie die Deployments-Protokolle. Installation, vollständige Verifikation und Upload müssen gelingen. Spätere Pushes richten sich nach Produktionsbranch und Automatisierungseinstellungen. Ein erfolgreicher GitHub-CI-Lauf allein deployed Pages nicht.

:::caution
Auf der Settings-Seite eines Git-Projekts erscheint zusätzlich ein Block mit der Build-Konfiguration (Framework-Preset, Build-Befehl usw.); das unterscheidet sich von der Ansicht eines [Direktupload-Projekts](#die-build-konfiguration-von-direktupload-projekten-verstehen) – wenn Sie unter Settings keine Build-Konfiguration finden, handelt es sich um ein Direktupload-Projekt, was völlig normal ist.
:::

---

## Eigene Domain anbinden

Cloudflare stellt `<project-name>.pages.dev` bereit; eine eigene Domain ist ebenfalls möglich. Die folgenden Domains sind Beispiele. DNS- und Zertifikatslaufzeiten hängen vom tatsächlichen Zustand ab.

### Schritt 1: Die Einstellungen für eigene Domains öffnen

Klicken Sie in den Projektdetails auf den Tab **Custom domains** und dann auf **Set up a custom domain**:

![Seite Custom domains des Projekts epocanvas-docs; docs.epocanvas.com ist angebunden und SSL ist aktiv](/images/canvas/deploy/cf-04-domains.png)

*Abbildung: Tab Custom domains. ① Zugang zum Tab; ② Schaltfläche Set up a custom domain; ③ die angebundene `docs.epocanvas.com` mit dem Status Active und SSL enabled.*

### Schritt 2: Domain hinzufügen und auf die Aktivierung warten

1. Klicken Sie auf **Set up a custom domain** und geben Sie Ihre Subdomain ein (z. B. `docs.epocanvas.com`);
2. Liegt das DNS der Domain bereits bei Cloudflare, fügt das System den CNAME-Eintrag automatisch hinzu; bei extern gehosteten Domains müssen Sie von Hand einen CNAME-Eintrag ergänzen, der auf `<Projektname>.pages.dev` zeigt;
3. Warten Sie auf DNS-Prüfung und Zertifikat und testen Sie die Domain bei Status **Active**. Eine feste Minutenzahl garantiert keinen Abschluss.

Das HTTPS-Zertifikat stellt Cloudflare automatisch aus und erneuert es; ein manueller Antrag oder eine manuelle Konfiguration ist nicht nötig.

---

## Das Deployment-Ergebnis prüfen

### HTTP-Status über die Befehlszeile prüfen

```bash
curl -sI https://epocanvas-docs.pages.dev
```

Beispielantwort (Datum und Status hängen von der tatsächlichen Anfrage ab):

```text
HTTP/2 200
date: Fri, 11 Sep 2026 15:32:39 GMT
content-type: text/html; charset=utf-8
```

`200` bestätigt nur eine erfolgreiche Antwort dieser URL, nicht korrekte Übersetzungen, Ressourcen, Suche oder aktuelle Inhalte. Führen Sie die weiteren Prüfungen auf beiden Domains aus.

### Einzelne Punkte im Browser bestätigen

| Prüfpunkt | Erwartetes Ergebnis |
| :--- | :--- |
| Startseite und beliebige Dokumentseiten öffnen sich | Seite rendert vollständig, kein weißer Bildschirm |
| Frisch geänderte Inhalte sind wirksam | der gerade bearbeitete Abschnitt ist online sichtbar |
| `Ctrl+K` Suche auf der gesamten Site | die neuesten Artikel sind auffindbar (der Index entsteht mit dem Build) |
| Umschaltung helles/dunkles Design | Umschaltung funktioniert und bleibt nach dem Neuladen erhalten |

---

## Häufige Deployment-Probleme

### Die Inhalte online wurden nach dem Deployment nicht aktualisiert?

Zwingen Sie den Browser zum Neuladen (`Ctrl+F5` / `Cmd+Shift+R`), um den Cache auszuschließen; bleibt es dabei, prüfen Sie im Dashboard auf der Deployments-Seite den Zeitpunkt des neuesten Eintrags und vergleichen Sie mit `curl -sI` über die Deployment-Vorschau-Domain.

### Die eigene Domain meldet einen SSL-Handshake-Fehler (Error 525)?

Prüfen Sie Domainvalidierung und Zertifikat in Custom domains, anschließend DNS, Proxy und Fehlerdetails. Warten Sie nicht nur einige Minuten, sondern vergleichen Sie mit `pages.dev`.

### `pnpm run deploy` bricht mit `Project not found` ab?

Führen Sie zuerst `pnpm exec wrangler whoami` aus, um die Anmeldung zu bestätigen; prüfen Sie dann, ob `--project-name` in `scripts/verify-release.mjs` exakt dem Projektnamen im Dashboard entspricht.

Weitere Punkte zur Fehlersuche finden Sie unter [FAQ & Fehlerbehebung](/canvas/troubleshooting/).
