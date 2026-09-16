---
title: Seitenlayout & Leseerlebnis
description: Design des dreispaltigen Seitenlayouts von EpoCanvas Docs, Interaktionsdetails der einzelnen Oberflächenbereiche sowie helles/dunkles Design und responsives Verhalten auf verschiedenen Geräten.
---

Um Leser ein angenehmes und effizientes Leseerlebnis zu bieten, setzt **EpoCanvas Docs** auf ein klassisches, übersichtliches dreispaltiges Seitenlayout. Beim Lesen langer Artikel behalten Sie jederzeit den Überblick darüber, wo Sie sich auf der gesamten Website befinden und welchen Abschnitt des aktuellen Artikels Sie gerade lesen.

---

## Aufteilung der Oberfläche im Überblick

Öffnen Sie ein beliebiges Dokument, unterteilt sich die Seite in vier Hauptbereiche:

![EpoCanvas Docs – beschriftete Darstellung der dreispaltigen Leseoberfläche: ① obere Navigationsleiste ② linkes Inhaltsverzeichnis ③ zentraler Haupttext ④ Inhaltsverzeichnis dieser Seite](/images/canvas/ui-layout-annotated.png)

*Abbildung: Beschriftete Darstellung des dreispaltigen Layouts am Beispiel der Seite „Renderregeln im Detail". ① globale Navigationsleiste oben; ② links das Kategorienverzeichnis; ③ in der Mitte der Haupttextbereich; ④ rechts die Gliederung „Auf dieser Seite". Die vier Bereiche sind in der Abbildung durch Rahmen und Nummern gekennzeichnet.*

![EpoCanvas Docs – Schemadarstellung der Layoutbereiche](/images/canvas/docs-layout-3tier.svg)

*Abbildung: Schematische Darstellung des dreispaltigen Layouts mit Namen und Aufgaben der einzelnen Bereiche.*

### 1. Globale Navigationsleiste oben (Header)

Sie befindet sich ganz oben auf der Seite, ist fixiert und bleibt beim Herunterscrollen stets sichtbar; ihre Höhe beträgt `3.5rem`. Von links nach rechts enthält die Kopfzeile die folgenden Elemente (siehe beschriftete Abbildung unten):

![Beschriftete Nahaufnahme der Kopfzeilenelemente: ① Logo ② Suchfeld ③ Hauptnavigation ④ Versionsabzeichen ⑤ Sprachwechsel ⑥ Design-Umschalter ⑦ GitHub ⑧ Telegram](/images/canvas/ui-topnav-annotated.png)

*Abbildung: Beschriftete Nahaufnahme der Kopfzeilenelemente. ① Logo und Website-Name; ② globales Suchfeld; ③ Button-Gruppe der Hauptnavigation; ④ Versionsabzeichen; ⑤ Sprachumschalter; ⑥ Umschalter für helles/dunkles Design; ⑦ Einstieg zum GitHub-Repository; ⑧ Einstieg zur Telegram-Community.*

- **Website-Logo und Titel (①)**: Links werden das EpoCanvas-Symbol und der Projektname angezeigt; ein Klick führt schnell zurück zur Startseite der Dokumentation.
- **Globales Suchfeld (②)**: Geben Sie im Feld Stichwörter ein, um Inhalte der aktuellen Seite direkt zu finden; mit `Ctrl+K` / `Cmd+K` öffnen Sie den sitewide-Suchdialog. Details siehe [Volltextsuche & Tastenkürzel](/canvas/search-engine/).
- **Buttons der Hauptnavigation (③)**: Schnellzugriffslinks zu häufig genutzten Bereichen wie „Startseite", „Produkt" und „Schnellstart"; der aktuell aufgerufene Bereich wird automatisch hervorgehoben.
- **Versionsabzeichen (④)**: Zeigt die Release-Versionsnummer des aktuellen Dokuments an (z. B. `v1.2.0`); ein Klick öffnet den detaillierten Änderungsverlauf auf GitHub.
- **Sprachumschalter (⑤)**: Ein Klick auf den Sprach-Button entfaltet 10 verfügbare Sprachen; nach der Auswahl gelangen Sie zur Version desselben Artikels in der Zielsprache – Navigation, Seitenleiste und Haupttext werden gemeinsam umgestellt.
- **Umschalter für helles/dunkles Design (⑥)**: Ein Sonne/Mond-Symbol schaltet zwischen hellem und dunklem Design um.
- **GitHub und Telegram (⑦⑧)**: Die Symbole rechts führen zum Open-Source-Repository bzw. zur technischen Community.

### 2. Kategorienverzeichnis links (Seitenleiste)

Es befindet sich auf der linken Seite (Breite `16.5rem`, rund 264 Pixel) und zeigt alle Dokumentkapitel in logischer Hierarchie:

- **Gruppen auf- und zuklappen**: Die Dokumente sind in Gruppen wie „Produktüberblick und Einstieg" oder „Kernfunktionen und Anleitungen" organisiert; ein Klick auf den Gruppennamen klappt die Gruppe auf oder zu.
- **Hervorhebung der aktuellen Seite**: Der gerade gelesene Artikel wird im linken Menü mit einer Hervorhebung in Themenfarbe (pillenförmiger Hintergrund) markiert.
- **Gemerkte Scrollposition**: Beim Wechsel von einem Artikel zum anderen bleibt die Scrollposition der linken Seitenleiste unverändert und springt nicht nach oben zurück.

### 3. Haupttextbereich in der Mitte (Main Content)

Er befindet sich in der Bildschirmmitte und ist der zentrale Bereich, der den Inhalt der technischen Dokumentation trägt:

- **Seitentitel und Aktualisierungsdatum**: Am Anfang des Haupttexts stehen der Artikelstitel (aus dem Frontmatter-Feld `title`) sowie das Datum „Zuletzt aktualisiert", damit Sie die Aktualität des Inhalts einschätzen können.
- **Angenehme Lesebreite**: Die Haupttextspalte ist auf maximal `60rem` begrenzt, damit auf sehr breiten Monitoren keine überlangen Zeilen entstehen und Sie beim Lesen die Zeile nicht verlieren.
- **Blätterlinks am Seitenende**: Am Ende jedes Dokuments werden automatisch Links „Zurück" und „Weiter" erzeugt, damit Sie in der Reihenfolge der Seitenleiste weiterlesen können.
- **Kopieren-Button für Codeblöcke**: Jeder Codeblock hat oben rechts einen Kopieren-Button, mit dem sich der Code mit einem Klick im Original kopieren lässt.

### 4. Artikelgliederung rechts (Table of Contents)

Sie befindet sich rechts vom Haupttext:

- **Automatisch erfasste Überschriften**: Beim Rendern der Seite parst das System automatisch die Überschriften zweiter (`##`) und dritter Ebene (`###`) des aktuellen Dokuments und erzeugt daraus das Inhaltsverzeichnis „Auf dieser Seite".
- **Mitlaufende Hervorhebung**: Während des Lesens hebt die Gliederung beim Herunterscrollen automatisch den aktuell gelesenen Abschnitt hervor.
- **Weiches Springen per Klick**: Ein Klick auf einen beliebigen Unterpunkt der Gliederung scrollt weich zum entsprechenden Absatz und aktualisiert den Anker in der Adressleiste (z. B. `#aufteilung-der-oberfläche-im-überblick`), was das Kopieren und Teilen erleichtert.

---

## Helles und dunkles Design

EpoCanvas Docs stellt sowohl ein helles als auch ein dunkles Design bereit; beide Farbschemata sind vollständig über CSS-Variablen in `src/styles/custom.css` definiert:

- **Systemeinstellung folgen**: Beim ersten Öffnen der Website erkennt sie die Hell-/Dunkel-Einstellung des Betriebssystems und zeigt das entsprechende Design an.
- **Manuelles Umschalten mit Speicherung**: Über den Design-Umschalter in der Kopfzeile können Sie manuell umschalten; die Auswahl wird im LocalStorage des Browsers gespeichert und bleibt beim nächsten Öffnen erhalten.

![Leseoberfläche im hellen Design](/images/canvas/ui-theme-light.png)

*Abbildung: Darstellung derselben Website im hellen Design (am Beispiel der Schnellstart-Seite).*

---

## Responsives Verhalten auf Smartphones und Tablets

Auf Bildschirmen unterschiedlicher Größe – etwa Smartphones oder Tablets – passt die Seite ihr Layout automatisch an die Bildschirmbreite an:

| Gerätetyp | Bildschirmbreite | Layoutverhalten |
| :--- | :--- | :--- |
| **Breitbild-Desktop / Laptop** | `>= 1152px` | Vollständiges dreispaltiges Standardlayout (linke Navigation + mittiger Haupttext + rechte Gliederung). |
| **Tablet / schmales Fenster** | `800px ~ 1152px` | Die rechte Gliederung wird ausgeblendet; linke Navigation und Haupttext bleiben als zweispaltiges Layout erhalten. |
| **Smartphone** | `< 800px` | Beide Seitenleisten sind eingeklappt, der Haupttext wird in voller Breite angezeigt. Über den Menü-Button in der Kopfzeile lässt sich die Seitenleiste als Drawer ausklappen. |

Ob auf einem Ultrabreitbild-Monitor oder beim kurzzeitigen Nachschlagen auf dem Smartphone – das Leseerlebnis bleibt stets natürlich und angenehm.
