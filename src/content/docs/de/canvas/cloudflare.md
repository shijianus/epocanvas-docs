---
title: Veröffentlichung auf Cloudflare Pages
description: "Komplett illustrierte Anleitung zur Veröffentlichung von EpoCanvas Docs: Direktupload per Wrangler-Befehlszeile, automatischer Build über Git und das Anbinden einer eigenen Domain – jeder Schritt mit echten Dashboard-Screenshots."
---

Sobald die Dokumentation geschrieben ist, muss sie ins Internet, damit Team und Nutzer darauf zugreifen können. **EpoCanvas Docs** empfiehlt das Hosting auf **Cloudflare Pages**: kein Serverkauf, keine Nginx-Konfiguration; die statischen Dateien werden direkt hochgeladen, und das HTTPS-Zertifikat gibt es automatisch. Diese Site selbst (`docs.epocanvas.com`) wurde genau mit der hier beschriebenen Methode veröffentlicht; alle folgenden Dashboard-Screenshots stammen aus dem echten Deployment-Prozess.

---

## Vorbereitung

### Was Sie brauchen

| Punkt | Erläuterung |
| :--- | :--- |
| **Cloudflare-Konto** | Kostenlos registrieren unter [dash.cloudflare.com](https://dash.cloudflare.com/); für Pages ist kein kostenpflichtiger Tarif nötig |
| **Lokal ein vollständiger Build** | Zuerst `pnpm run build` durchlaufen lassen und prüfen, dass das Verzeichnis `dist/` korrekt entsteht; siehe [Schnellstart](/canvas/deployment/) |
| **Node.js + pnpm** | Die Deployment-Befehle hängen von der lokalen Entwicklungsumgebung ab; die Versionsanforderungen entsprechen dem Kapitel Schnellstart |

### Wie wählt man zwischen den beiden Deployment-Varianten

![Gegenüberstellung der beiden Cloudflare-Pages-Deployment-Wege: links Direktupload per Befehlszeile vom lokalen Rechner (von dieser Site genutzt), rechts automatischer Build aus dem Git-Repository (empfohlen für Teamarbeit)](/images/canvas/docs-deploy-compare.svg)

*Abbildung: Vergleich der beiden Deployment-Wege bei Cloudflare Pages. Links wird lokal gebaut und anschließend mit Wrangler direkt an den Edge übertragen (so ist es auf dieser Site tatsächlich umgesetzt), rechts löst ein GitHub-Webhook den automatischen Build in der Cloud aus.*

| Vergleichspunkt | Variante 1: Direktupload per Befehlszeile | Variante 2: Automatischer Build über Git |
| :--- | :--- | :--- |
| Vorgehen | lokal `pnpm run deploy` ausführen | Code nach GitHub pushen löst automatisch aus |
| Einstiegshürde | niedrig, zwei Befehle | mittel, einmalige Konfiguration im Dashboard nötig |
| Passende Situation | erster Go-live, Einzelbetrieb, schnelle Updates | Zusammenarbeit im Team, gewünscht ist „Commit heißt live“ |
| Von dieser Site genutzt | ✅ Ja (im Dashboard nachprüfbar) | nicht aktiviert, jederzeit nachrüstbar |

:::tip
Beide Varianten können nebeneinander bestehen: im Alltag der automatische Build über Git, bei dringenden Fehlerbehebungen der lokale `pnpm run deploy`, der die Live-Version direkt überschreibt.
:::

:::tip[Gar keine Befehle eintippen?]
Auf der Seite [Schnellstart](/canvas/deployment/) gibt es Ein-Klick-Deployment-Schaltflächen für Cloudflare, Vercel und Netlify: einmal klicken, Konto autorisieren, Konfiguration bestätigen – und die Dokumentationsseite ist in Ihrem eigenen Cloud-Konto veröffentlicht; Details unter [One-Click-Deployment](/canvas/deployment/#一键部署点一个按钮就上线). Die Cloudflare-Schaltfläche nutzt dabei das Workers Static Hosting und ist ein eigenständiger Weg neben der auf dieser Seite beschriebenen Pages-Variante; für eine statische Dokumentationsseite ist das Zugriffsverhalten identisch, wählen Sie einfach einen der beiden Wege.
:::

---

## Variante 1: Direktupload über die lokale Befehlszeile (für den ersten Deployment empfohlen)

Bei dieser Variante wird lokal gebaut und direkt zu Cloudflare hochgeladen; sie ist die **auf dieser Site tatsächlich eingesetzte** Methode.

### Schritt 1: Beim Cloudflare-Konto anmelden

Wrangler (das offizielle Cloudflare-Befehlszeilenwerkzeug) ist im Projekt bereits enthalten; bei der ersten Nutzung erfolgt die Anmeldung per Browser-Autorisierung:

```bash
npx wrangler login
```

Danach zeigt das Terminal `Opening a link in your default browser...`; der Browser öffnet die Cloudflare-Autorisierungsseite, und nach einem Klick auf **Allow** meldet das Terminal den erfolgreichen Login. Den Anmeldestatus prüfen Sie mit:

```bash
npx wrangler whoami
```

:::caution
Führen Sie das Deployment ohne vorherige Anmeldung aus, meldet das Terminal `You are not authenticated. Please run 'wrangler login'.`; es wird dann nichts deployed.
:::

### Schritt 2: Build und Upload mit einem Befehl

Das Projekt enthält in `package.json` einen vorkonfigurierten Veröffentlichungsbefehl:

```bash
pnpm run deploy
```

Er entspricht zwei Schritten in Folge: Zuerst kompiliert `astro build` die gesamte Site in das Verzeichnis `dist/` und erzeugt den Suchindex; anschließend überträgt `wrangler pages deploy dist` das Ergebnis direkt zu Cloudflare. Die echte Ausgabe der Build-Phase sieht so aus:

```text
00:06:22 [build] 15 page(s) built in 18.73s
00:06:22 [build] Complete!
```

Nach dem Upload gibt Wrangler die Vorschau-Adresse dieses Deployments aus. Beim ersten Deployment fragt Wrangler interaktiv nach dem Projektnamen; bestätigen Sie einfach mit der Eingabetaste, um den in `package.json` hinterlegten Namen `epocanvas-docs` zu übernehmen.

### Schritt 3: Ihr Projekt im Dashboard finden

Öffnen Sie [dash.cloudflare.com](https://dash.cloudflare.com/) und klicken Sie im linken Menü auf **Compute (Workers & Pages)**; dort erscheint die Projektliste. Die folgende Abbildung markiert drei zentrale Stellen:

![Projektliste unter Workers & Pages im Cloudflare-Dashboard, mit Markierungen für den Menüeintrag links, die Schaltfläche Create application und das Projekt epocanvas-docs](/images/canvas/deploy/cf-01-projects-list.png)

*Abbildung: Projektliste unter Workers & Pages. ① Zugang über das linke Menü zu Workers & Pages; ② die Schaltfläche Create application legt ein neues Projekt an; ③ unser Projekt `epocanvas-docs` mit der Zugriffsdomain `epocanvas-docs.pages.dev` und dem Zeitpunkt des letzten Deployments.*

Ein Klick auf den Projektnamen öffnet die Projektdetails; der Tab **Deployments** zeigt die vollständige Deployment-Historie:

![Deployment-Historie des Projekts epocanvas-docs mit Markierungen für die Produktionsdomain, die Deployment-Einträge und den Status](/images/canvas/deploy/cf-02-deployments.png)

*Abbildung: Seite der Deployment-Historie. ① Projektname; ② Tab Deployments; ③ die Produktionsdomain ist gleichzeitig mit `docs.epocanvas.com` (eigene Domain) und `epocanvas-docs.pages.dev` (Standarddomain) verbunden; ④ jeder Deployment-Eintrag zeigt Branch und Commit-Information; ⑤ Status und Deployment-Zeitpunkt.*

:::note
Jede Ausführung von `pnpm run deploy` ergänzt oben in der Liste einen neuen Deployment-Eintrag, der automatisch zur aktuellen Produktionsversion wird. Die Historie bleibt in der Liste erhalten; bei Problemen lässt sich jederzeit ein Rollback durchführen.
:::

---

## Die Build-Konfiguration von Direktupload-Projekten verstehen

Im Tab **Settings** zeigt sich der Unterschied zwischen Direktupload-Projekten und Git-Projekten:

![Seite Settings mit der Build-Konfiguration des Projekts epocanvas-docs; im Feld Git repository wird keine Verbindung angezeigt](/images/canvas/deploy/cf-03-settings.png)

*Abbildung: Tab Settings. ① Zugang zu Settings; ② im Feld Git repository steht Connect (nicht verbunden) – ein Direktupload-Projekt braucht keine Git-Build-Konfiguration, der Build erfolgt vollständig auf Ihrem lokalen Rechner.*

:::tip
Das erklärt zugleich den Vorteil des Direktuploads: Die Build-Umgebung ist Ihr eigener Rechner und hängt nicht von der Cloudflare-Build-Warteschlange ab; der Preis dafür ist, dass jede Aktualisierung auf genau dem Rechner ausgeführt werden muss, der auch deployed.
:::

---

## Variante 2: Automatischer Build über ein verbundenes Git-Repository (optional)

Wenn „Commit heißt automatisch live“ gelten soll, verbinden Sie das Projekt mit einem GitHub-Repository; Cloudflare baut dann automatisch in der Cloud.

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
| Build-Befehl | `pnpm run build` |
| Build-Ausgabeverzeichnis | `dist` |

### Schritt 4: Den automatischen Build prüfen

Klicken Sie auf **Save and Deploy**; Cloudflare erledigt den ersten Build automatisch. Danach holt, baut und veröffentlicht Cloudflare bei jedem Push auf den Zweig `main` von selbst. Das Build-Protokoll jedes Deployments sehen Sie, indem Sie im Tab **Deployments** des Projekts den entsprechenden Eintrag anklicken.

:::caution
Auf der Settings-Seite eines Git-Projekts erscheint zusätzlich ein Block mit der Build-Konfiguration (Framework-Preset, Build-Befehl usw.); das unterscheidet sich von der Ansicht eines [Direktupload-Projekts](#die-build-konfiguration-von-direktupload-projekten-verstehen) – wenn Sie unter Settings keine Build-Konfiguration finden, handelt es sich um ein Direktupload-Projekt, was völlig normal ist.
:::

---

## Eigene Domain anbinden

Die von Cloudflare automatisch vergebene Domain `xxx.pages.dev` lässt sich direkt verwenden; die eigene Domain (z. B. `docs.epocanvas.com`) anzubinden dauert nur wenige Minuten.

### Schritt 1: Die Einstellungen für eigene Domains öffnen

Klicken Sie in den Projektdetails auf den Tab **Custom domains** und dann auf **Set up a custom domain**:

![Seite Custom domains des Projekts epocanvas-docs; docs.epocanvas.com ist angebunden und SSL ist aktiv](/images/canvas/deploy/cf-04-domains.png)

*Abbildung: Tab Custom domains. ① Zugang zum Tab; ② Schaltfläche Set up a custom domain; ③ die angebundene `docs.epocanvas.com` mit dem Status Active und SSL enabled.*

### Schritt 2: Domain hinzufügen und auf die Aktivierung warten

1. Klicken Sie auf **Set up a custom domain** und geben Sie Ihre Subdomain ein (z. B. `docs.epocanvas.com`);
2. Liegt das DNS der Domain bereits bei Cloudflare, fügt das System den CNAME-Eintrag automatisch hinzu; bei extern gehosteten Domains müssen Sie von Hand einen CNAME-Eintrag ergänzen, der auf `<Projektname>.pages.dev` zeigt;
3. Warten Sie auf die Zertifikatsausstellung (üblich 2–5 Minuten); sobald der Status **Active** ist (wie ③ in der Abbildung oben), ist die Seite über die neue Domain erreichbar.

Das HTTPS-Zertifikat stellt Cloudflare automatisch aus und erneuert es; ein manueller Antrag oder eine manuelle Konfiguration ist nicht nötig.

---

## Das Deployment-Ergebnis prüfen

### HTTP-Status über die Befehlszeile prüfen

```bash
curl -sI https://epocanvas-docs.pages.dev
```

Das echte Ergebnis der Antwort:

```text
HTTP/2 200
date: Fri, 11 Sep 2026 15:32:39 GMT
content-type: text/html; charset=utf-8
```

Ein `200` zeigt an, dass die Site gesund ist. Nach dem Anbinden der eigenen Domain wiederholen Sie den Test mit Ihrer eigenen URL.

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

Die Zertifikatsausstellung braucht 2–5 Minuten, bis sie weltweit wirksam ist; warten Sie kurz und laden Sie danach neu. In der Zwischenzeit erreichen Sie die Site über die Standarddomain `xxx.pages.dev`.

### `pnpm run deploy` bricht mit `Project not found` ab?

Führen Sie zuerst `npx wrangler whoami` aus, um die Anmeldung zu bestätigen; prüfen Sie dann, ob `--project-name` im `deploy`-Skript von `package.json` exakt dem Projektnamen im Dashboard entspricht.

Weitere Punkte zur Fehlersuche finden Sie unter [FAQ & Fehlerbehebung](/canvas/troubleshooting/).
