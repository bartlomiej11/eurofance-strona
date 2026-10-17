# Przekierowania 301

Ten dokument zbiera zasady przekierowań wdrożone w pliku `public/.htaccess` oraz miejsce na listę adresów ze starej strony.
Lista adresów starej strony jest w pliku klienta `eurofance-struktura-url.xlsx` (zakładka „Wszystkie adresy”) oraz w pliku `eurofance-struktura-url-301.htaccess`. Te pliki nie były dostępne podczas budowania strony, dlatego poniższa tabela jest szablonem do uzupełnienia.

## 1. Zasady działające automatycznie

| Zasada | Przykład | Wynik |
| --- | --- | --- |
| http na https | `http://eurofance.pl/kontakt` | 301 na `https://eurofance.pl/kontakt` |
| www na bez www | `https://www.eurofance.pl/kontakt` | 301 na `https://eurofance.pl/kontakt` |
| strona ofertowa z ukośnikiem | `/ogrodzenia-panelowe/` | 301 na `/ogrodzenia-panelowe` |
| strona ofertowa z rozszerzeniem | `/ogrodzenia-panelowe.html` | 301 na `/ogrodzenia-panelowe` |
| blog bez ukośnika | `/blog/ile-kosztuje-brama-przesuwna-w-2026` | 301 na `/blog/ile-kosztuje-brama-przesuwna-w-2026/` |
| blog z ukośnikiem | `/blog/ile-kosztuje-brama-przesuwna-w-2026/` | 200 |
| strona sklepu obok katalogu produktów | `/sklep` | 200, obsługuje plik `sklep.html` (katalog `/sklep` zawiera karty produktów i nie ma własnego `index.html`) |
| adres nieistniejący | `/cokolwiek` | 404 ze stroną `/404` |

Zasady te są w sekcjach 1 do 7 pliku `.htaccess`. Nie wymagają uzupełnienia.

## 2. Przekierowania wpisane na start

Te reguły są już w `.htaccess`. Są oparte na rekomendacjach z briefu (wpisy bloga, które zabierają frazy stronom ofertowym) oraz na przykładach ze starej struktury.

| Stary adres | Nowy adres | Powód |
| --- | --- | --- |
| /blog/ile-kosztuje-ogrodzenie-panelowe | /ogrodzenia-panelowe | dwie strony o cenie konkurują, cennik jest na stronie ofertowej |
| /blog/ogrodzenie-panelowe-cena | /ogrodzenia-panelowe | jak wyżej |
| /blog/brama-przesuwna-cena | /bramy-wjazdowe-przesuwne | cennik bram na stronie ofertowej |
| /blog/podmurowka-cena | /podmurowki-betonowe | cennik podmurówek na stronie ofertowej |
| /blog/malowanie-proszkowe-cena | /malarnia-proszkowa | cennik usługi na stronie malarni |
| /ogrodzenia-panelowe-3d | /ogrodzenia-panelowe | stary adres zostaje przekierowaniem, nie może go zająć nowa strona |
| /ogrodzenia-panelowe-2d | /ogrodzenia-panelowe | jak wyżej |
| /ploty-panelowe | /ogrodzenia-panelowe | synonim, jedna strona docelowa |
| /bramy-przesuwne | /bramy-wjazdowe-przesuwne | nowy adres strony ofertowej |
| /bramy-skrzydlowe | /bramy-wjazdowe-skrzydlowe | nowy adres strony ofertowej |
| /ogrodzenia | /oferta | stary adres kategorii zbiorczej |

## 3. Szablon listy do uzupełnienia z pliku klienta

Uzupełnij tabelę na podstawie zakładki „Wszystkie adresy” oraz pliku `eurofance-struktura-url-301.htaccess`, a następnie dodaj reguły `Redirect 301` w sekcji „Przekierowania 301 ze starej strony” w `.htaccess`.

| Stary adres | Nowy adres | Powód decyzji | Status |
| --- | --- | --- | --- |
| / | / | strona główna bez zmian | gotowe |
| /blog/... (wpisy z decyzją ZOSTAJE, 48 sztuk) | bez zmian | wpisy zostają | do przeniesienia 1:1 |
| /blog/... (wpisy z decyzją 301) | wskazana strona ofertowa | wpis zabiera frazę ofercie | do uzupełnienia |
| /blog/... (wpisy DO DECYZJI, 56 sztuk) | do decyzji po analizie w Search Console | brak danych o ruchu | do decyzji |
| /blog/page/N | /blog/ albo najbliższa strona kategorii | stronicowanie bez wartości | do uzupełnienia |
| /kategoria/... | /blog/kategoria/... | zmiana struktury bloga | do uzupełnienia |
| /produkt/... | /sklep/... | zmiana struktury sklepu | do uzupełnienia |
| /index.php, /strona.php | / | stare pliki PHP | do uzupełnienia |
| /oferta-2019, /cennik-2020 i podobne | najbliższa strona ofertowa | stare kampanie | do uzupełnienia |

## 4. Jak zdobyć listę adresów starej strony

1. Z pliku klienta: `eurofance-struktura-url.xlsx`, zakładki „Wszystkie adresy” i „Blog zostaje czy 301”.
2. Z Google Search Console: raport „Skuteczność”, filtr strony z ruchem, eksport adresów z ostatnich 16 miesięcy.
3. Z pliku `eurofance-struktura-url-301.htaccess`, jeśli klient go dostarczy.
4. Z narzędzia do mapowania: Crawl starej strony (na przykład Screaming Frog) i eksport listy adresów zwracających 200.

## 5. Zasady, których trzeba pilnować

1. Każde przekierowanie ma prowadzić do celu w jednym kroku, bez łańcuchów `A → B → C`.
2. Nowy adres strony nie może zajmować starego adresu z listy przekierowań. Przykład: `/ogrodzenia-panelowe-3d` przekierowuje na `/ogrodzenia-panelowe` i musi pozostać przekierowaniem.
3. Przekierowania dodajemy w dniu startu nowej strony, nie wcześniej.
4. Adresy zwracające 404 po wdrożeniu sprawdzamy w Search Console i przekierowujemy, jeśli miały ruch.
5. Zamiast przekierowania warto czasem przenieść treść: jeśli stary wpis ma ruch i dobrą treść, lepiej włączyć ją do strony ofertowej jako sekcję i dopiero wtedy dać 301.

## 6. Weryfikacja po wdrożeniu

1. Sprawdź dziesięć losowych starych adresów: narzędziem do sprawdzania nagłówków HTTP (`curl -I`) lub w przeglądarce w trybie deweloperskim.
   ```bash
   curl -I https://eurofance.pl/bramy-przesuwne
   ```
   Oczekiwany wynik: `HTTP/1.1 301` i `Location: https://eurofance.pl/bramy-wjazdowe-przesuwne`.
2. Sprawdź, czy nowe adresy zwracają 200, a nie 301.
3. Sprawdź wersje z ukośnikiem i bez: `/ogrodzenia-panelowe/` ma zwracać 301 na `/ogrodzenia-panelowe`, a `/blog/kontakt` na `/blog/kontakt/`.
4. Po dwóch tygodniach przejrzyj w Search Console raport „Indeksowanie stron” i sekcję „Strona z przekierowaniem”. Wszystkie wpisy powinny mieć jasny cel.
5. Sprawdź, czy mapa witryny nie zawiera adresów przekierowanych. Lista adresów jest w `raport/lista-url.md`.
