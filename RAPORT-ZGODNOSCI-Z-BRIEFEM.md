# Raport zgodności z briefem

Podsumowanie tego, co zostało wykonane, oraz lista materiałów, które musi dostarczyć klient przed startem.
Numeracja sekcji odpowiada wsadowi `wsad-eurofance-manus-kompletny.md`.

## 1. Zasady globalne, 1A układ adresów, 1B technologia

| Wymaganie | Stan | Gdzie sprawdzić |
| --- | --- | --- |
| Domena bez www, http i www przekierowują 301 na https | gotowe | `public/.htaccess`, sekcje 1 i 2 |
| Strony ofertowe bez ukośnika, blog z ukośnikiem | gotowe | `public/.htaccess`, sekcje 3 i 4, oraz `scripts/postbuild.mjs` |
| Strona statyczna, szybka, bez zależności od zewnętrznych fontów | gotowe | Astro, output statyczny, fonty Inter w `public/fonts` |
| Fonty hostowane lokalnie, `font-display: swap` | gotowe | `src/styles/fonts.css` |
| Obrazki z atrybutami `width`, `height`, `loading`, `decoding` | gotowe | `src/components/SmartImage.astro` |
| Kompresja, cache, nagłówki bezpieczeństwa | gotowe | `public/.htaccess`, sekcje kompresji i cache |
| Adresy starej strony zwracają 200 albo 301 w jednym kroku | do uzupełnienia listą klienta | `PRZEKIEROWANIA-301.md` |
| `sitemap.xml`, `robots.txt`, `llms.txt` | gotowe | `dist/sitemap.xml`, `dist/robots.txt`, `dist/llms.txt` |

## 2. 1C konwersja

| Wymaganie | Stan |
| --- | --- |
| Telefon w nagłówku, w pasku mobilnym i w stopce | gotowe |
| Pasek mobilny: Zadzwoń, WhatsApp, Wycena | gotowe, `src/components/MobileBar.astro` |
| Formularz wielokrokowy, warianty: standard, szybki, front, b2b, malowanie, kalkulator | gotowe, `src/components/LeadForm.astro` |
| Zapis wpisanych danych między podstronami (sessionStorage) | gotowe, `src/scripts/forms.js` |
| Walidacja telefonu, e-maila, zgody RODO | gotowe |
| Wysyłka bez przeładowania, potem `/dziekujemy` z konwersją | gotowe |
| Zdarzenia: `form_start`, `form_step`, `form_submit`, `form_error`, `phone_click`, `whatsapp_click`, `cta_click`, `calculator_lead` | gotowe, `src/scripts/tracking.js` |
| UTM, `gclid`, strona wejścia i wysłania w zgłoszeniu | gotowe |
| Limit zgłoszeń z jednego IP i pole pułapkowe | gotowe, `public/api/wyslij.php` |
| Turnstile | przygotowane pole na klucz, wymaga decyzji klienta |
| Zapis zgłoszeń do CSV | gotowe |

## 3. 1D design, 1E wideo i zdjęcia

| Wymaganie | Stan |
| --- | --- |
| Paleta, typografia, przyciski, karty, tabele | gotowe, `src/styles/global.css` |
| Hero z odpowiedzią pod nagłówkiem i formularzem | gotowe |
| Galeria z filtrami i przyciskiem wyceny przy zdjęciu | gotowe |
| Sekcja rolek pionowych z danymi VideoObject | gotowe, `src/components/Reels.astro` |
| Prawdziwe zdjęcia realizacji i rolki | do dostarczenia przez klienta, obecnie obrazki zastępcze |

## 4. Sekcja 2 menu i struktura

Menu w `src/data/nav.json`: cztery grupy rozwijane (Ogrodzenia, Bramy i furtki, Sklep z elementami, Firma) i trzy pozycje najwyższego poziomu (Realizacje, Kalkulator, Kontakt). Wszystkie adresy w menu mają odpowiadające strony.

## 5. Sekcje 4 do 7 strony

| Strona | Stan |
| --- | --- |
| `/` strona główna | gotowe: kafle, tabela cen, kalkulator, dlaczego producent, kroki, realizacje, rolki, opinie, lokalizacje, FAQ, formularz |
| `/ogrodzenia-panelowe` | gotowe: 10 sekcji, tabele cen i parametrów, kalkulator, FAQ, poradniki |
| `/ogrodzenia-frontowe` | gotowe: 10 sekcji z gotowej treści briefu, w tym zestawy, tanie ogrodzenie frontowe, dobór do domu, przepisy, FAQ |
| `/bramy-wjazdowe` | gotowe, strona zbiorcza z porównaniem typów |
| `/bramy-wjazdowe-przesuwne` | gotowe: ceny, teleskopowa, z furtką, bez przeciwwagi, napęd, miejsce na cofnięcie |
| `/bramy-wjazdowe-skrzydlowe` | gotowe: jedno i dwuskrzydłowe, słupy bramowe, napęd |
| `/furtki-panelowe` | gotowe, w tym elektrozaczep, samozamykacz, zamek |
| `/podmurowki-betonowe` | gotowe: cztery wymiary, obudowa, ceowniki, beton B-25, montaż, alternatywy |
| `/ogrodzenia-palisadowe` | gotowe: pionowa, pozioma, brama i furtka, profile, porównanie z panelem |
| `/ogrodzenia-nowoczesne` | gotowe: wzory, galeria, kolory, ceny |
| `/ogrodzenia-metalowe` | gotowe |
| `/ogrodzenia-budowlane` | gotowe |
| `/bramy-i-ogrodzenia-przemyslowe` | gotowe, konwersja B2B z formularzem przetargowym |
| `/malarnia-proszkowa` | gotowe: cennik, piaskowanie, maksymalne wymiary, kolory, przygotowanie elementów, czas realizacji |
| `/paleta-ral` | gotowe |
| `/konstrukcje-stalowe` | gotowe, z informacją o normie EN 1090 jako wymaganiu rynkowym |
| `/panele-ogrodzeniowe` | gotowe, sprzedaż na sztuki z odróżnieniem od strony kompletnych ogrodzeń |
| `/przesla-ogrodzeniowe` | gotowe |
| `/slupki-ogrodzeniowe` | gotowe |
| `/ogrodzenia-grzebieniowe` | gotowe |
| `/ogrodzenia-zaluzjowe` | gotowe |
| `/automatyka-do-bram` | gotowe |
| `/kalkulator-ogrodzenia` | gotowe: kalkulator, rozbicie ceny, przykładowe wyceny, FAQ |
| `/bezplatna-wycena` | gotowe: formularz na pierwszym ekranie, co dostaniesz, kroki po wysłaniu |
| `/kontakt` | gotowe: telefon, WhatsApp, e-mail, adres produkcji, godziny, mapa po kliknięciu, formularz |
| `/dziekujemy` | gotowe, noindex, zdarzenie konwersji |
| `/koszyk`, `/szukaj`, `/404`, `/polityka-prywatnosci` | gotowe |
| `/sklep` i 41 kart produktów | gotowe |

Uwaga o sekcji 7.17: strony `/ogrodzenia-grzebieniowe`, `/ogrodzenia-zaluzjowe` i `/automatyka-do-bram` powstały zgodnie z warunkiem „jeśli w ofercie”, ponieważ klient potwierdził produkcję grzebienia i żaluzji oraz montaż napędów. Jeśli któraś z tych usług nie jest prowadzona, wystarczy usunąć plik strony i wpis w `nav.json`.

## 6. Sekcja 8 dane strukturalne

| Wymaganie | Stan |
| --- | --- |
| Organization, LocalBusiness, ContactPoint | gotowe, `src/lib/jsonld.js` |
| Product i Offer dla kart produktów | gotowe |
| FAQPage tam, gdzie jest FAQ | gotowe |
| BreadcrumbList | gotowe |
| Service dla stron lokalnych i malarni | gotowe |
| Article dla poradników, DefinedTerm dla encyklopedii | gotowe |
| ImageGallery dla realizacji | gotowe |
| Weryfikacja JSON-LD w kontroli jakości | gotowe, `scripts/sprawdz.mjs` |
| Adres, godziny i współrzędne z jednego pliku | gotowe, `src/data/site.json` |

## 7. Sekcja 9 kanibalizacja, sekcja 11 cytowania w AI

- Poradniki nie powtarzają w tytułach fraz ofertowych. W pierwszym akapicie każdego wpisu jest link do właściwej strony ofertowej.
- Strony ofertowe mają akapit odpowiedzi z ceną i liczbą, blok kluczowych faktów i prawdziwe tabele HTML, żeby były łatwe do cytowania przez modele.
- `llms.txt` zawiera opis firmy, dane kontaktowe, ceny orientacyjne i listę najważniejszych adresów.
- `robots.txt` wpuszcza GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot i Google-Extended.

## 8. Sekcja 10 strony lokalne

Osiem stron lokalnych: Warszawa, Ciechanów, Przasnysz, Legionowo, Płock, Siedlce, Białystok, Włocławek.
Każda ma własny akapit, sekcję realizacji, tabelę kosztu i czasu dostawy, listę okolicznych miejscowości, cztery pytania lokalne i formularz. Brak fikcyjnych nazw klientów.

## 9. Czego brakuje przed startem (sekcja 13)

| Element | Dlaczego jest potrzebny |
| --- | --- |
| Lista adresów starej strony i plik `eurofance-struktura-url-301.htaccess` | do uzupełnienia przekierowań 301 |
| Prawdziwe zdjęcia realizacji i rolki | obecnie obrazki zastępcze, do podmiany w `public/images/realizacje` |
| Prawdziwe opinie z wizytówki Google | plik `src/data/reviews.json` zawiera osiem opinii przykładowych |
| Identyfikator kontenera GTM | pole `tracking.gtm` w `src/data/site.json` |
| Adres webhooka CRM i decyzja o SMTP | `public/api/wyslij.php` |
| Decyzja o Cloudflare Turnstile | pole `tracking.turnstileSiteKey` |
| Zdjęcia i imiona osób z obsługi klienta | sekcja kontaktu |
| Potwierdzenie cen „od” i gwarancji | plik `src/data/prices.json`, `site.json` |
| Potwierdzenie zasad płatności i dostawy w sklepie | sekcja sklepu |
| Akceptacja tekstów o przepisach | strony frontowe, wysokość ogrodzenia, ogrodzenia budowlane |
| Sprawdzenie polityki prywatności przez osobę od RODO | `src/pages/polityka-prywatnosci.astro` |

## 10. Sekcja 14 co oddajemy

- Kod źródłowy projektu (ZIP) z instrukcją uruchomienia i budowania: `README.md`.
- Gotowy zbudowany katalog `dist/` (145 stron) do wgrania na hosting.
- Lista wszystkich adresów: `raport/lista-url.md`.
- Lista miejsc do zmiany cen, telefonu, tekstów nagłówków pod kampanie i danych produktów: `GDZIE-ZMIENIC-CENY-I-DANE.md`.
- Instrukcja wdrożenia: `DOKUMENTACJA-WDROZENIE.md`.
- Raport kontroli jakości: `raport/kontrola.md`.

## 11. Wynik automatycznej kontroli

Ostatnie uruchomienie `npm run sprawdz`:

- stron: 145,
- linków wewnętrznych sprawdzonych: 141,
- obrazków sprawdzonych: 52,
- błędy: 0,
- ostrzeżenia: 0.

Zakres kontroli: istnienie każdego linku wewnętrznego, istnienie każdego obrazka, brak niepodmienionych tokenów cen, brak zakazanych znaków `—` i `–`, długość tytułów i opisów, obecność jednego nagłówka H1, `rel="canonical"`, poprawność JSON-LD i obecność kontenera GTM.