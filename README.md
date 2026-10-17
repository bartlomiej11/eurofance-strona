# Eurofance.pl: strona producenta ogrodzeń

Statyczna strona i sklep katalogowy producenta ogrodzeń, bram i konstrukcji stalowych Eurofance (Maków Mazowiecki).
Cała treść, ceny i dane firmy są w plikach JSON w katalogu `src/data`, więc zmiany nie wymagają pracy programisty.

## Szybki start

```bash
npm install          # instalacja zależności (Astro)
npm run dev          # podgląd lokalny na http://localhost:4321
npm run build        # budowanie do katalogu dist/ (plus porządkowanie adresów)
npm run sprawdz      # kontrola linków, metadanych, tokenów i danych strukturalnych
npm run fonty        # ponowne pobranie krojów Inter do public/fonts
npm run obrazki      # wygenerowanie obrazków zastępczych dla nowych ścieżek /images/...
```

Wynikiem `npm run build` jest gotowy do wgrania katalog `dist/` (145 stron HTML, obrazy, fonty, `sitemap.xml`, `robots.txt`, `llms.txt`, skrypt formularza `api/wyslij.php`).

## Struktura projektu

```
src/
  data/                     wszystkie treści i dane
    site.json               dane firmy: telefon, e-mail, godziny, gwarancja, statystyki, GTM, endpoint formularzy
    prices.json             jedno miejsce z cenami (tokeny używane w całym serwisie)
    nav.json                struktura menu
    products.json           41 produktów sklepu z parametrami i cenami
    gallery.json            realizacje (podpisy: miasto, system, kolor, wymiar) i filtry galerii
    reviews.json            opinie klientów (do podmiany na prawdziwe opinie Google)
    cities.json             8 miast dla stron lokalnych
    hero-variants.json      warianty nagłówka dla kampanii płatnych
    calculator.json         liczby do kalkulatora ogrodzenia
    pages/*.json            35 stron ofertowych, lokalnych i firmowych
    blog/posts/*.json       27 poradników
    blog/encyklopedia/*.json 14 haseł encyklopedii
    blog/categories.json    18 kategorii bloga
  components/               komponenty widoku (Hero, LeadForm, Calculator, Gallery, Faq, Blocks i inne)
  layouts/Base.astro        nagłówek dokumentu, GTM, dane strukturalne, wspólne elementy
  lib/                      logika treści: tk.js (tokeny), content.js, jsonld.js
  pages/                    trasy: catch-all dla stron z JSON, blog, sklep, sitemap, robots, llms
  scripts/                  JavaScript klienta: formularze, kalkulator, galeria, koszyk, śledzenie
  styles/                   global.css i fonts.css (fonty lokalne)
public/                     pliki kopiowane bez zmian: .htaccess, api/wyslij.php, fonty, obrazy
scripts/                    skrypty pomocnicze (postbuild, kontrola, fonty, obrazki, metadane)
raport/                     raport kontroli i lista adresów URL
```

## Jak działa podmiana cen

W treści nigdy nie wpisuje się ceny na sztywno. Zamiast tego używa się tokenu, na przykład `od {panel_3d_mb} za mb`.
Podczas budowania `src/lib/tk.js` zamienia token na wartość z `src/data/prices.json`, a tokeny firmowe (`{telefon}`, `{gwarancja}`, `{czas_montazu}`) na wartości z `src/data/site.json`.

Efekt: zmiana jednej liczby w `prices.json` aktualizuje cenę na wszystkich stronach, w tytułach, w danych strukturalnych i w pliku `llms.txt`.

## Dokumentacja dla klienta

- [DOKUMENTACJA-WDROZENIE.md](DOKUMENTACJA-WDROZENIE.md): wgranie na hosting, domena, HTTPS, formularze, analityka, Search Console.
- [GDZIE-ZMIENIC-CENY-I-DANE.md](GDZIE-ZMIENIC-CENY-I-DANE.md): wszystkie miejsca do samodzielnej edycji.
- [PRZEKIEROWANIA-301.md](PRZEKIEROWANIA-301.md): lista przekierowań ze starej strony i instrukcja uzupełnienia.
- [RAPORT-ZGODNOSCI-Z-BRIEFEM.md](RAPORT-ZGODNOSCI-Z-BRIEFEM.md): co zostało zrobione, co wymaga materiałów od klienta.
- [raport/lista-url.md](raport/lista-url.md): pełna lista 145 adresów.
- [raport/kontrola.md](raport/kontrola.md): wynik automatycznej kontroli jakości.

## Wymagania serwera

Dowolny hosting obsługujący pliki statyczne i PHP 8 (do formularza). Wymagane `mod_rewrite` i `mod_headers` w Apache, konfiguracja jest w `public/.htaccess`.

## Styl wizualny

Serwis utrzymany jest w ciemnej, fotograficznej oprawie premium: czarne sekcje
przeplatane jasnymi, cienka typografia, karty fotograficzne i sekcje pełnej szerokości.
Założenia i paleta są opisane w `raport/kierunek-wizualny.md`, a wszystkie reguły
stylu znajdują się w jednym pliku `src/styles/global.css`.

Nowe komponenty odpowiadające za układ premium:

- `src/components/PhotoCards.astro` — siatka kart fotograficznych z podpisem,
- `src/components/PhotoBand.astro` — sekcja pełnej szerokości ze zdjęciem i tekstem,
- `src/components/StatsBar.astro` — liczby i statystyki firmy.

## Materiały klienta

- `JAK-DOSTARCZYC-ZDJECIA-I-WIDEO.md` — co i w jakiej formie wysłać, żeby wpiąć zdjęcia,
  filmy i rolki w serwis.
- Logotyp i ikony: `public/images/logo.png` (nagłówek, stopka), `logo-dark.png` (dane
  strukturalne), `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `og-default.jpg`
  oraz `public/favicon-32.png` i `public/favicon-16.png`.

## Wideo i rolki

- `SEO-WIDEO-I-ROLKI.md` — jak publikować filmy i rolki, żeby pracowały na SEO
  (hosting pliku, VideoObject, mapa witryny wideo, transkrypcje, rola YouTube i social mediów).
- `src/data/media.json` — jedno źródło filmów i rolek; każdy wpis generuje stronę `/wideo/<adres>`,
  dane strukturalne, wpis w mapie witryny i kafelek w sekcji rolek.
- `src/components/VideoPlayer.astro` — odtwarzacz z fasadą (film ładuje się po kliknięciu),
  napisami, kluczowymi momentami i transkrypcją.
- `/wideo` — strona zbiorcza; do czasu dodania pierwszego filmu pozostaje wyłączona z indeksowania.
