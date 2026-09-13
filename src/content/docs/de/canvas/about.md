---
title: Was ist das
description: "Lesen Sie zuerst diesen Artikel: EpoCanvas Docs ist das offizielle Dokumentationsprojekt von EpoCanvas. Diese Seite klärt, was es ist, in welchem Verhältnis es zum Code-Repository steht, welchen Zweck es genau erfüllt und wo welche Leserinnen und Leser am besten einsteigen."
---

**EpoCanvas Docs ist das offizielle Dokumentationsprojekt des EpoCanvas-Projekts**. Frei formuliert: Dieses Repository liefert die „Dokumentation" selbst aus – die gesamte Website, die Sie gerade betrachten, ist sein Endprodukt. Im Repository gibt es keinen Funktionscode anderer Software; das „Produkt", das Sie suchen, ist genau diese Dokumentations-Site.

---

## Was bedeutet „Dokumentationsprojekt"?

Der Begriff hat zwei Bedeutungen, die gleichzeitig gelten:

1. **Es ist ein Handbuch.** Die Inhalte drehen sich um „Was ist es, wie benutzt man es, wie passt man es an, wie bringt man es online": Wie bedient man die Leseoberfläche, wie schreibt man neue Dokumente, wo wird die Konfiguration geändert, wie lautet der Bereitstellungsbefehl. Es gibt nur ein Ziel – wer EpoCanvas in der Hand hat, soll nicht überall herumfragen müssen, sondern allein anhand der Dokumentation zum Ziel kommen.
2. **Es ist zugleich ein direkt lauffähiges Website-System.** Klonen Sie das Repository lokal und führen Sie die beiden Befehle `pnpm install` und `pnpm run dev` aus – schon erhalten Sie genau die Site, die Sie vor sich sehen. Der gesamte Code basiert auf Astro 5 und Starlight, steht unter der MIT-Lizenz und lässt sich komplett übernehmen und zur Dokumentations-Site Ihres eigenen Projekts umbauen.

Ein leicht übersehbares Merkmal: **Jede Funktion, die diese Dokumentation beschreibt, nutzen Sie in diesem Moment selbst.** Das dreispaltige Leselayout, die Site-weite Suche mit `Strg + K`, der Sprachwechsel in 10 Sprachen oben rechts – die Dokumentation beschreibt die Fähigkeiten, die diese Site selbst umsetzt; beim Lesen können Sie alles direkt ausprobieren und verifizieren.

---

## Welchen Zweck es genau erfüllt

Nach Leserrollen gegliedert übernimmt dieses Dokumentationsprojekt drei Aufgaben:

| Wer Sie sind | Was es für Sie tun kann | Wo Sie am besten beginnen |
| :--- | :--- | :--- |
| **Leserin oder Leser, die nur etwas nachschlagen wollen** | Nachschlagen, wie eine Funktion benutzt wird oder wie sich ein Fehler beheben lässt | Suchfeld in der Kopfzeile oder Site-weite Suche mit `Strg + K`, direkt zum passenden Kapitel springen |
| **Entwicklerin oder Entwickler, die eine eigene Dokumentations-Site aufbauen wollen** | Liefert einen vollständig lauffähigen Quellcode einer Dokumentations-Site samt Bereitstellungsprozess | Produktüberblick → Schnellstart → Bereitstellung |
| **Autorinnen und Autoren, die Dokumentation mitgestalten** | Legt fest, wo Dateien abgelegt werden, wie Formate geschrieben werden, wie Bilder platziert und Inhalte veröffentlicht werden | Die drei Kapitel in der Gruppe „Dokumentation schreiben und Inhalte verwalten" |

In einem Satz: **Nutzerinnen und Nutzer sollen alles verstehen, Entwicklerinnen und Entwickler alles übernehmen können, und Autorinnen und Autoren einen verlässlichen Leitfaden haben.**

---

## Welche Inhalte dieses Projekt umfasst

Die Seitenleiste ist in fünf Gruppen gegliedert; jede beantwortet eine Frage:

- **Produktüberblick und Einstieg**: Was ist das eigentlich? Wie bringe ich es lokal zum Laufen?
- **Kernfunktionen und Nutzungsleitfäden**: Wie genau bedient man Leseoberfläche, Suche, Mehrsprachigkeit und Navigation?
- **Dokumentation schreiben und Inhalte verwalten**: Wie schreibt man neue Dokumente? Welche Regeln gelten für Markdown-Formatierung und Rendering?
- **Konfiguration und Weiterentwicklung**: Wo werden Site-Titel, Navigationsmenü und Designfarben geändert? Wie passt man Komponenten an?
- **Veröffentlichung und Betrieb**: Wie veröffentlicht man online, bindet eine Domain an, macht SEO und Versionsverwaltung?

Jeder Artikel ist einzeln nachschlagbar; Sie müssen nicht der Reihe nach alles lesen.

---

## Zwei häufige Missverständnisse

**Missverständnis 1: „Das ist die Anleitung zu irgendeiner Software – die Software selbst suche ich woanders."**
In diesem Repository liegt ausschließlich der Quellcode der Dokumentations-Site, kein Code anderer Software; erklärt wird tatsächlich der Betrieb, die Anpassung und die Bereitstellung genau dieses Dokumentationssystems.

**Missverständnis 2: „Das ist eine Nur-Lese-Website – heruntergeladen nützt sie mir nichts."**
Ganz im Gegenteil: Der Quellcode ist auf GitHub vollständig offen, lokal genügen zwei Befehle zum Ausführen; ihn als Vorlage zur Dokumentations-Site des eigenen Projekts umzubauen, ist genau einer der vorgesehenen Einsatzzwecke.

---

## Nächste Schritte

- Möchten Sie eine vollständige Einführung in Produktpositionierung, Kernfunktionen und Technologie-Entscheidungen? Lesen Sie **[Produktüberblick & Kernwerte](/canvas/)**.
- Möchten Sie die Site sofort lokal zum Laufen bringen? Lesen Sie **[Schnellstart (in 3 Minuten starten)](/canvas/deployment/)**.
- Suchen Sie nur eine konkrete Frage? Nutzen Sie direkt das Suchfeld in der Kopfzeile oder die Suche mit `Strg + K`.
