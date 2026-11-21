# Seminar-Island · Lernlauncher für das Kolloquium Pädagogik & Pädagogische Psychologie

Seminar-Island ist ein Lernlauncher für die mündliche Prüfung (Kolloquium) in Pädagogik und Pädagogischer Psychologie, Schwerpunkt **Unterrichtsplanung**.
Alles läuft direkt im Browser, ohne Anmeldung und ohne Server. Der Lernstand bleibt lokal im Browser gespeichert. Auf Wunsch lässt sich der Launcher als App installieren und offline nutzen.

**Klären · Entscheiden · Gestalten · Evaluieren**

## Inhalt

| Bereich | Datei | Worum es geht |
|---|---|---|
| Start | `index.html` | Launcher mit Prüfungs-Countdown, Tagesplan „Heute dran“, Fortschritt, Lernstand-Export, Anzeige-Einstellungen und App-Installation |
| Lernen | `lernen/unterrichtsplanung.html` | Interaktiver Lernpfad in 14 Stationen mit Übungen, Prüfungsfällen und Selbsttest |
| Lernen | `lernen/spickzettel.html` | Der Schwerpunkt auf zwei A4-Seiten, druckfertig bzw. als PDF speicherbar |
| Lernen | `lernen/glossar.html` | Rund 80 Fachbegriffe mit Suche, Querverweisen, Abfragemodus und „Als Lernkarte“ |
| Lernen | `spiele/orakel-der-schwerpunkte.html` | Themenüberblick, Selbsteinschätzung und Lernplan |
| Training | `training/kolloquium-simulator.html` | Probe-Kolloquium: Fall, Timer, Prüfer-Nachfragen, Selbstcheck, Musterantwort; Modus „Teil 2 intensiv“ mit Nachfragen und Lücken-Wiederholung |
| Training | `training/formulierungshilfe.html` | Satzbausteine fürs Kolloquium mit Vorlesefunktion, Lückentext und Sprech-Trainer |
| Training | `zertifikat.html` | Druckbares Fortschritts-Zertifikat mit Rang aus allen Spielen und Trainings |
| Training | `training/lernkarten.html` | Karteikasten nach Leitner (ca. 110 Karten + eigene Karten) |
| Spiel | `spiele/hafenstadt-didaktika.html` | Point-and-Click-Adventure zur Unterrichtsplanung mit Reffi, Finale bei Herrn Eisele; Speedrun-Modus und Bestenliste |
| Spiel | `spiele/querbezug-detektiv.html` | Noir-Krimi in acht Akten: Spuren mit Theorien aus Pädagogik und Päd. Psychologie verbinden |
| Spiel | `spiele/seminar-island-adventure.html` | Lernadventure quer durch alle Themen |
| Skripte | `skripte/*.pdf` | Ausführliche Lernskripte als PDF |
| App | `manifest.webmanifest`, `sw.js`, `version.json`, `icons/` | Installation als App, Offline-Modus und Hinweis auf neue Versionen |
| Gemeinsam | `assets/app.js`, `assets/music.js`, `assets/fonts/` | Geräteerkennung, Vollbild, Schriftgröße, Kontrast, Bewegung reduzieren; im Browser erzeugte Musik und Soundkulisse; lokal eingebundene Schriften (SIL Open Font License) |

## Veröffentlichen mit GitHub Pages

1. Auf GitHub ein neues Repository anlegen (z. B. `seminar-island`), öffentlich.
2. Den **Inhalt** dieses Ordners hochladen (per „Add file → Upload files“ per Drag & Drop oder mit Git):
   ```bash
   git init
   git add .
   git commit -m "Seminar-Island"
   git branch -M main
   git remote add origin https://github.com/<dein-name>/seminar-island.git
   git push -u origin main
   ```
3. Im Repository: **Settings → Pages → Build and deployment → Source: „Deploy from a branch“**, Branch `main`, Ordner `/ (root)` → **Save**.
4. Nach ein bis zwei Minuten ist die Seite erreichbar unter
   `https://<dein-name>.github.io/seminar-island/`

Die Datei `.nojekyll` sorgt dafür, dass GitHub die Dateien unverändert ausliefert.

## Als App installieren und offline nutzen

Sobald der Launcher online liegt (z. B. über GitHub Pages), kann er installiert werden:

- **Chrome/Edge (PC, Android):** Button „Jetzt installieren“ im Launcher oder im Browser-Menü „App installieren“.
- **iPhone/iPad:** In Safari auf „Teilen“ → „Zum Home-Bildschirm“.

Beim ersten Aufruf speichert der Service Worker (`sw.js`) alle Seiten und Skripte im Browser. Danach funktioniert alles auch ohne Internet. Er lädt immer zuerst aus dem Netz und nur ohne Verbindung aus dem Speicher – eine korrigierte Fassung kommt also sofort bei allen an. Liegt eine neuere Version online, zeigt der Launcher „Neu laden“ an.

## Vollbild und Geräte

Die Spiele erkennen, ob sie auf PC/Laptop, Tablet oder Smartphone laufen, und passen die Spielfläche an den Bildschirm an. Beim ersten Klick bzw. Antippen wechseln sie automatisch in den Vollbildmodus (abschaltbar im Launcher unter „Anzeige & Barrierefreiheit“). Taste **F** oder der Button ⛶ schaltet Vollbild um. Auf dem Handy erscheint im Hochformat der Hinweis, das Gerät zu drehen. Auf dem iPhone gibt es kein Browser-Vollbild – dort am besten als App zum Home-Bildschirm hinzufügen.

## Lernstand sichern

Im Launcher unter **Lernstand & App** lässt sich der gesamte Fortschritt (Lernpfad, Lernkarten, Simulator, Spielstände, Prüfungstermin) als Datei exportieren und auf einem anderen Gerät oder in einem anderen Browser wieder importieren.

## Lokal nutzen

Einfach `index.html` doppelklicken. Alle Seiten funktionieren auch ohne Server; alle Schriften liegen im Ordner `assets/fonts`.
Hinweis: Der gemeinsame Fortschritt im Launcher funktioniert am zuverlässigsten über GitHub Pages oder einen lokalen Webserver, weil manche Browser bei `file://`-Adressen den Speicher pro Datei trennen. App-Installation und Offline-Modus funktionieren nur online.

## Sicherheit

- **Keine fremden Server:** Keine CDNs, keine Web-Fonts von Google, kein Tracking. Alles, was die Seiten brauchen, liegt in diesem Ordner.
- **Content-Security-Policy** in jeder Seite (als `<meta>`-Tag): Die Seiten dürfen nur Dateien von der eigenen Adresse laden und nichts an andere Server schicken (`connect-src 'self'`). Formulare, Plugins und `<base>`-Tags sind gesperrt.
- **Inline-Skripte nur mit Prüfsumme:** Bei allen neuen Seiten sind nur die eigenen Skripte über ihre SHA-256-Prüfsumme erlaubt. Die beiden älteren Einzeldatei-Spiele (Seminar-Island-Adventure, Orakel) dürfen Inline-Code nutzen, können wegen der CSP aber ebenfalls nichts nachladen oder abschicken.
- **Referrer-Policy** `strict-origin-when-cross-origin`: Bei Klicks auf externe Links wird keine vollständige Adresse weitergegeben.
- **Daten werden geprüft:** Gespeicherte Spielstände und importierte Lernstände werden vor der Verwendung geprüft und vor der Anzeige maskiert. Ein Import akzeptiert nur bekannte Bereiche mit gültigem Inhalt.
- **Seiten nicht von Hand ändern:** Die Dateien hier werden von einem Build-Skript erzeugt, das die Prüfsummen einsetzt. Eine Änderung direkt in einer Seite (auch im GitHub-Webeditor) macht die Prüfsumme ungültig, und das betroffene Skript läuft nicht mehr.

### Repository-Einstellungen auf GitHub

1. **Settings → Pages → Enforce HTTPS** einschalten.
2. **Settings → Rules → Rulesets** (bzw. **Branches**) für `main`: **Block force pushes** und **Restrict deletions** anhaken. So lässt sich die Seite nicht samt Verlauf ersetzen oder löschen; alte Fassungen bleiben unter **Commits** wiederherstellbar.
3. **Settings → Collaborators:** nur Personen eintragen, die wirklich mitarbeiten.
4. Nur den **Inhalt** dieses Ordners hochladen – nichts anderes aus dem Projekt.

## Datenschutz

- Keine Anmeldung, kein Tracking, keine Datenübertragung an die Betreiber.
- Beim Aufruf über GitHub Pages protokolliert GitHub technisch bedingt die IP-Adresse. Wer den Launcher z. B. an einer Schule einsetzt, sollte das mit der zuständigen Stelle (Datenschutzbeauftragte) klären. Weil keine Seite fremde Server anspricht, lässt sich der Ordner unverändert auch auf jeden anderen statischen Webspace legen.
- Fortschritt, Prüfungstermin, eigene Lernkarten, Spielstände und die Bestenliste liegen nur im `localStorage` deines Browsers.
- Die optionale Sprachaufnahme im Simulator bleibt im Browser und wird nirgendwohin gesendet.

## Hinweise

Lernmaterial zur Prüfungsvorbereitung, keine offiziellen Seminarunterlagen. Fachbeispiele (überwiegend aus der Elektrotechnik) dienen der Veranschaulichung. Inhaltliche Grundlage sind u. a. das Planungsinstrument nach Zumsteg u. a., Klafki, das Berliner Modell, Anderson & Krathwohl, Krathwohl/Bloom/Masia, Ziener, Grell & Grell, Mühlhausen und Helmke.
Die Karikaturen und Namen der Figuren werden mit Einverständnis der abgebildeten Personen verwendet.
