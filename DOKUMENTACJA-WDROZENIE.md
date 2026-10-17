# Instrukcja wdrożenia strony Eurofance

Dokument opisuje krok po kroku, jak wgrać stronę na hosting, uruchomić formularze, podłączyć analitykę i zgłosić stronę do wyszukiwarek.
Kolejność kroków ma znaczenie: najpierw test na subdomenie, potem przekierowania, na końcu zgłoszenie do Google.

## 1. Przygotowanie paczki

1. Na komputerze z Node.js 22 uruchom w katalogu projektu:
   ```bash
   npm install
   npm run fonty        # pobiera kroje Inter do public/fonts
   npm run obrazki      # tworzy obrazki zastępcze dla ścieżek z danych
   npm run build        # buduje stronę do katalogu dist/
   npm run sprawdz      # kontrola: linki, metadane, tokeny, dane strukturalne
   ```
2. Sprawdź wynik `npm run sprawdz`. Powinno być `Bledy: 0`. Ostrzeżenia opisują tylko zalecenia.
3. Zawartość katalogu `dist/` (nie sam katalog) to paczka do wgrania na serwer.

## 2. Wgranie na hosting

1. Wgraj zawartość `dist/` do katalogu publicznego (`public_html`, `www` albo `httpdocs`) przez FTP/SFTP lub panel hostingu.
2. Upewnij się, że wgrany został także plik `.htaccess` (jest ukryty, w klientach FTP trzeba włączyć pokazywanie plików ukrytych).
3. Nadaj katalogowi `api/dane` prawa zapisu (755, w razie potrzeby 775). Katalog tworzy się automatycznie przy pierwszym zgłoszeniu z formularza.
4. Ustaw wersję PHP na 8.0 lub nowszą w panelu hostingu.
5. Sprawdź, czy działa przekierowanie na HTTPS i czy certyfikat SSL jest aktywny dla domeny i dla `www`.

## 3. Test przed publikacją

1. W `src/data/site.json` ustaw `"noindex": true`, zbuduj stronę ponownie i wgraj. Dzięki temu wersja testowa nie trafi do Google.
2. Otwórz na subdomenie:
   - stronę główną,
   - stronę ofertową, na przykład `/ogrodzenia-panelowe`,
   - stronę lokalną, na przykład `/ogrodzenia-panelowe-warszawa`,
   - wpis bloga, na przykład `/blog/ile-kosztuje-brama-przesuwna-w-2026/`,
   - kartę produktu, na przykład `/sklep/panel-ogrodzeniowy-3d-153-7016`,
   - `/sitemap.xml`, `/robots.txt`, `/llms.txt`,
   - formularz: wyślij testowe zgłoszenie i sprawdź, czy e-mail dotarł oraz czy w `api/dane/` powstał plik CSV.
3. Sprawdź na telefonie pasek dolny (Zadzwoń, WhatsApp, Wycena) i formularz w trzech krokach.
4. Uruchom test szybkości (PageSpeed Insights) i sprawdź, czy LCP jest poniżej 2,5 s. Obrazki zastępcze są bardzo lekkie, więc wynik po podmianie zdjęć może się zmienić.

## 4. Publikacja

1. W `src/data/site.json` ustaw `"noindex": false`, zbuduj i wgraj ponownie.
2. Wgraj plik przekierowań: uzupełnij `PRZEKIEROWANIA-301.md` i dodaj reguły do `.htaccess`, a następnie wgraj `.htaccess` ponownie.
3. Sprawdź losowo dziesięć starych adresów ze starej strony i upewnij się, że prowadzą do nowych stron jednym skokiem (bez łańcucha przekierowań).

## 5. Formularz i powiadomienia

1. Otwórz `public/api/wyslij.php` i ustaw:
   - `ODBIORCY`: adresy e-mail, na które mają trafiać zgłoszenia,
   - `NADAWCA`: adres nadawcy w domenie eurofance.pl (poprawia dostarczalność),
   - `WEBHOOK`: adres webhooka CRM, jeśli jest używany (pusty wyłącza przekazywanie).
2. Sprawdź, czy hosting pozwala na wysyłkę poczty przez funkcję `mail()`. Jeśli nie, użyj SMTP: najprościej podmienić `mail()` na wywołanie SMTP przez bibliotekę PHPMailer albo przekierować zgłoszenia webhookiem do CRM.
3. Każde zgłoszenie jest zapisywane w `api/dane/zgloszenia-RRRR-MM.csv`. Katalog zabezpieczony plikiem `.htaccess` (brak dostępu z przeglądarki). Kopie zapasowe tego katalogu warto pobierać raz w miesiącu.
4. W formularzu działa pole pułapkowe `firma_x` oraz limit 6 zgłoszeń z jednego adresu IP na 15 minut.

## 6. Analityka i kampanie

1. W `src/data/site.json` wklej identyfikator kontenera GTM w polu `tracking.gtm` (obecnie `GTM-XXXXXXX`).
2. W GTM utwórz tagi na zdarzenia wysyłane przez stronę: `form_start`, `form_step`, `form_submit`, `form_error`, `calculator_start`, `calculator_lead`, `phone_click`, `whatsapp_click`, `cta_click`, `gallery_quote`, `search`, `scroll_90`, `video_play`.
3. Zdarzenie `form_submit` zawiera `form_type` (rodzaj formularza), `cta` (miejsce na stronie), `kategoria` oraz zamaskowany telefon i e-mail. Do Google Ads użyj konwersji na `form_submit` i na `phone_click`.
4. Na stronie `/dziekujemy` wysyłane jest zdarzenie `conversion` z parametrem `value`, gotowe do podłączenia jako konwersja.
5. Jeśli używasz Cloudflare Turnstile, wklej klucz w `tracking.turnstileSiteKey` i dodaj weryfikację po stronie serwera w `api/wyslij.php`.
6. Aby zmienić nagłówek dla kampanii płatnej, dopisz wariant w `src/data/hero-variants.json` i przekieruj ruch na adres z parametrem, na przykład `/ogrodzenia-panelowe?variant=brama`.

## 7. Zgłoszenie do wyszukiwarek

1. W Google Search Console dodaj domenę (weryfikacja przez rekord DNS).
2. Zgłoś `https://eurofance.pl/sitemap.xml`.
3. Sprawdź narzędzie „Sprawdzenie adresu URL” dla pięciu najważniejszych stron i poproś o indeksację.
4. W Bing Webmaster Tools dodaj stronę i zgłoś mapę witryny.
5. Wizytówkę Google (Google Business Profile) uzupełnij o adres produkcji, godziny i link do strony.
6. Po dwóch tygodniach sprawdź w GSC raport „Indeksowanie stron” i raport „Przekierowania”. Popraw strony oznaczone jako „Zaindeksowano, ale nie wysłano” lub „Strona z przekierowaniem”.

## 8. Weryfikacja po wdrożeniu (lista kontrolna)

- [ ] Strona główna, strony ofertowe, strony lokalne, blog, sklep otwierają się bez błędów 404.
- [ ] Adresy bez ukośnika na końcu działają (`/ogrodzenia-panelowe`), adresy bloga z ukośnikiem również (`/blog/.../`).
- [ ] Adres `www` przekierowuje na wersję bez `www`, a `http` na `https`.
- [ ] Formularz wysyła zgłoszenie, e-mail dociera, wpis pojawia się w CSV.
- [ ] Zdarzenia widoczne w GTM w trybie podglądu, konwersje podłączone w Google Ads.
- [ ] `sitemap.xml`, `robots.txt` i `llms.txt` dostępne publicznie.
- [ ] Prawdziwe zdjęcia realizacji wgrane w miejsce obrazków zastępczych.
- [ ] Opinie w `reviews.json` podmienione na prawdziwe opinie z wizytówki Google.
- [ ] Polityka prywatności i zgody w formularzach sprawdzone przez osobę odpowiedzialną za RODO.
- [ ] Teksty o przepisach (ogrodzenia frontowe, wysokość ogrodzenia, ogrodzenia budowlane) zatwierdzone przez klienta.
- [ ] Kopia zapasowa starej strony i starego pliku przekierowań zapisana przed publikacją.

## 9. Kopie zapasowe i aktualizacje

1. Zawartość `dist/` po każdej zmianie zachowuj jako kopię z datą, na przykład `eurofance-2026-10-12.zip`.
2. Zmiany w treści rób w plikach JSON, nie w plikach HTML w `dist/`.
3. Po każdej zmianie uruchamiaj `npm run build` i `npm run sprawdz`, a raport z `raport/kontrola.md` zachowuj razem z paczką.

## 10. Kontakt techniczny

- Produkcja i dane firmy: ul. Młodzianowo 58, 06-200 Maków Mazowiecki.
- Telefon: +48 579 775 729, WhatsApp: +48 533 354 967, e-mail: zamowienia@eurofance.pl.