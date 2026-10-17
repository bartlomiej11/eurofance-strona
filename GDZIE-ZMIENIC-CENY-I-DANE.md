# Gdzie zmienić ceny, dane firmy i treści

Wszystkie liczby i dane są w plikach JSON w katalogu `src/data`. Po zmianie uruchom `npm run build` i wgraj nowy katalog `dist/`.
Po każdej zmianie warto uruchomić `npm run sprawdz`, żeby upewnić się, że nie powstał martwy link ani zbyt krótki opis.

## 1. Ceny: `src/data/prices.json`

To jedyne miejsce, w którym wpisuje się kwoty. W treści stron używa się tokenów w nawiasach klamrowych, na przykład `od {panel_3d_mb} za mb z montażem`.

Struktura pliku:

```json
{
  "updated": "październik 2026",
  "values": { "panel_3d_mb": "210 zł", "panel_2d_mb": "175 zł", "..." : "..." },
  "examples": { "dzialka_20m": "6 400 zł", "..." : "..." }
}
```

- `values`: ceny jednostkowe, używane w cennikach, tytułach i danych strukturalnych.
- `examples`: gotowe wyceny przykładowe, używane w kalkulatorze, na stronie głównej i w poradnikach.
- `updated`: data aktualizacji cennika, pokazywana w stopkach cenników i w pliku `llms.txt`.

Po zmianie ceny sprawdź, czy nowa wartość nie wydłużyła za bardzo tytułu strony: `npm run sprawdz` pokaże ostrzeżenie, jeśli tytuł przekracza 80 znaków.

## 2. Dane firmy: `src/data/site.json`

| Pole | Co zawiera |
| --- | --- |
| `phone` | numer w trzech postaciach: wyświetlany, do linku `tel:`, skrócony |
| `whatsapp` | numer i adres bazowy `wa.me` |
| `email` | adres do formularzy i stopki |
| `address` | adres produkcji (ulica, kod, miasto, współrzędne) |
| `hours` | godziny otwarcia w trzech wariantach |
| `warranty` | wartość gwarancji używana jako `{gwarancja}` |
| `googleRating` | ocena i liczba opinii (`{ocena}`, `{liczba_opinii}`) |
| `stats` | lata, realizacje, ekipy, czas odpowiedzi, produkcji, montażu, pomiaru, dostawy |
| `clients` | logotypy i nazwy klientów w pasku zaufania |
| `tracking` | identyfikator GTM, GA4, konwersja Google Ads, klucz Turnstile |
| `forms` | adres skryptu wysyłki, adresy odbiorców, adres strony podziękowania |
| `noindex` | `true` blokuje indeksowanie wersji testowej |

## 3. Cennik i produkty sklepu: `src/data/products.json`

Każdy produkt ma cenę w dwóch postaciach:

- `price`: tekst z tokenem, na przykład `"od {panel_3d_szt}"`, widoczny na stronie,
- `priceValue`: liczba, na przykład `320`, używana w kalkulatorze, koszyku i sortowaniu.

Zmieniając cenę, popraw oba pola, żeby koszyk i kalkulator liczyły spójnie. Pozostałe pola produktu: `name`, `description`, `unit`, `sku`, `params` (tabela parametrów), `faq`.

## 4. Strony: `src/data/pages/*.json`

Każda strona to jeden plik. Nazwa pliku to adres strony, na przykład `ogrodzenia-panelowe.json` daje `/ogrodzenia-panelowe`.

Najważniejsze pola:

- `title`, `metaDescription`: tytuł i opis w Google (opis docelowo 140 do 160 znaków),
- `h1`, `answer`: nagłówek i akapit odpowiedzi pod nagłówkiem (z ceną i konkretem),
- `category`: kategoria zgłoszenia z formularza,
- `heroImage`, `heroCta`, `variantKey`: nagłówek strony,
- `blocks`: sekcje strony w kolejności. Typy bloków: `keyfacts`, `products`, `priceTable`, `table`, `text`, `steps`, `calculator`, `gallery`, `reels`, `reviews`, `faq`, `links`, `tiles`, `note`, `ctaBar`, `form`, `callback`, `trust`.

Dodanie nowej strony: skopiuj istniejący plik, zmień `slug` (musi być taki sam jak nazwa pliku), treść i bloki, a następnie dodaj adres do `src/data/nav.json`, jeśli ma być w menu.

## 5. Blog i encyklopedia

- Poradniki: `src/data/blog/posts/*.json`. Pola: `title`, `metaDescription`, `excerpt`, `datePublished`, `dateModified`, `datePublishedLabel`, `categories`, `contentHtml`, `faq`, `cta`, `ctaEnd`, `relatedOffer`.
- Hasła: `src/data/blog/encyklopedia/*.json`. Pola: `title`, `metaDescription`, `excerpt`, `answer`, `contentHtml`, `relatedOffer`, `updated`.
- Kategorie: `src/data/blog/categories.json` (nazwa, opis, kolejność).

Nowy wpis pojawia się automatycznie w indeksie bloga, w kategoriach, na stronie `/blog/` i w mapie witryny.

## 6. Zdjęcia realizacji: `src/data/gallery.json` oraz `public/images`

1. Wgraj zdjęcia do `public/images/realizacje/` w formacie WebP lub AVIF, najlepiej do 200 KB i szerokości 1200 px.
2. W `gallery.json` zaktualizuj pola `image`, `caption` (miasto, system, kolor, wymiar) i `alt`.
3. Pliki zastępcze SVG możesz zostawić dla pozostałych pozycji, ale przed publikacją podmień je na zdjęcia.

Podpisy zdjęć są jednocześnie tekstem alternatywnym, dlatego warto w nich trzymać miasto, system i kolor.

## 7. Opinie klientów: `src/data/reviews.json`

Plik zawiera osiem przykładowych opinii. Przed publikacją podmień je na prawdziwe opinie z wizytówki Google, zachowując pola: `author`, `city`, `date`, `rating`, `text`. Nie zmieniaj struktury pliku.

## 8. Strony lokalne: `src/data/cities.json` i pliki `ogrodzenia-panelowe-*.json`

`cities.json` przechowuje dla każdego miasta: odległość od produkcji, czas dostawy, koszt transportu, czas dojazdu ekipy, listę okolicznych miejscowości i akapit wstępny.
Pliki stron lokalnych mają własne sekcje realizacji, tabelę dostawy i pytania lokalne.

Dodanie miasta: dopisz wpis w `cities.json`, skopiuj plik strony lokalnej, zmień `slug`, `city`, `h1`, tytuł, opisy i sekcje lokalne, a następnie dodaj link w `src/data/pages/home.json` w bloku „Gdzie montujemy” oraz w stopce.

## 9. Menu: `src/data/nav.json`

Grupy menu i pozycje najwyższego poziomu. Adresy są płaskie, bez ukośnika na końcu (`/ogrodzenia-panelowe`), a blog z ukośnikiem (`/blog/`).
Grupa bez adresu jest tylko etykietą rozwijaną.

## 10. Warianty nagłówka dla kampanii: `src/data/hero-variants.json`

Plik zawiera zestawy nagłówków i wezwań do działania. Nowy wariant dodaj jako kolejny klucz, a ruch kieruj na adres z parametrem, na przykład `/ogrodzenia-panelowe?variant=front`.

## 11. Kalkulator: `src/data/calculator.json`

Współczynniki i ceny jednostkowe używane przez kalkulator ogrodzenia. Zmieniając ceny w `prices.json`, sprawdź, czy wartości w `calculator.json` nadal są spójne.

## 12. Formularze: `src/data/site.json` i `public/api/wyslij.php`

- Adres wysyłki: `forms.endpoint` (domyślnie `/api/wyslij.php`).
- Adres strony podziękowania: `forms.thanksUrl` (domyślnie `/dziekujemy`).
- Odbiorcy zgłoszeń i webhook CRM: na początku `public/api/wyslij.php`.
- Pola formularzy i ich kolejność: `src/components/LeadForm.astro`.

## 13. Kolejność pracy przy zmianach

1. Zmień dane w pliku JSON.
2. Uruchom `npm run build`.
3. Uruchom `npm run sprawdz` i sprawdź `raport/kontrola.md`.
4. Wgraj nowy katalog `dist/` na serwer.
5. Zachowaj kopię paczki z datą.

## Jak podmienić zdjęcia na własne fotografie realizacji

Zdjęcia leżą w katalogu `public/images/premium/`. Wystarczy podmienić plik, zachowując
nazwę i proporcje — nie trzeba nic zmieniać w kodzie ani w plikach treści.

| Plik | Gdzie się pokazuje | Zalecany rozmiar | Proporcja |
| --- | --- | --- | --- |
| `hero.jpg` | duże zdjęcie na górze strony głównej | 2200 x 950 px | 21:9 |
| `panelowe.jpg` | karta „Ogrodzenia panelowe” | 1400 x 933 px | 3:2 |
| `palisadowe.jpg` | karta „Ogrodzenia palisadowe” | 1400 x 933 px | 3:2 |
| `bramy.jpg` | karta „Bramy wjazdowe” | 1400 x 933 px | 3:2 |
| `przemyslowe.jpg` | karta „Ogrodzenia przemysłowe” | 1400 x 933 px | 3:2 |
| `band-front.jpg` | sekcja „Robimy to sami” | 2200 x 950 px | 21:9 |
| `realizacja-1.jpg` | pierwsze zdjęcie w galerii realizacji | 1400 x 1050 px | 4:3 |
| `realizacja-2.jpg` | drugie zdjęcie w galerii realizacji | 1400 x 1050 px | 4:3 |
| `realizacja-3.jpg` | trzecie zdjęcie w galerii realizacji | 1400 x 1050 px | 4:3 |
| `malarnia.jpg` | zdjęcie zapasowe do strony malarni | 1400 x 1050 px | 4:3 |

Zasady, które warto zachować:

1. Zapisz zdjęcie jako JPEG, jakość około 80–85, bez znaków wodnych i daty na zdjęciu.
2. Trzymaj się proporcji z tabeli — inne proporcje zostaną przycięte w kadrowaniu `object-fit: cover`.
3. Nie wstawiaj zdjęć większych niż 2500 px szerokości, żeby nie spowalniać strony.
4. Podmieniając zdjęcie w galerii, zaktualizuj też podpis w `src/data/pages/home.json`
   (pole `caption`: miasto, system, kolor, wymiar) — podpis jest ważny dla SEO i dla klienta.

## Jak podmienić logotyp

Logotyp leży w `public/images/`. Wystarczy nadpisać plik, zachowując nazwę i proporcje.

| Plik | Gdzie się pokazuje | Format i uwagi |
| --- | --- | --- |
| `logo.png` | nagłówek i stopka (ciemne tło) | biały logotyp, przezroczyste tło, proporcja 300:113 |
| `logo-dark.png` | dane strukturalne dla Google | ciemna wersja logotypu na przezroczystym tle |
| `apple-touch-icon.png` | ikona przy zapisie strony na telefonie | 180 x 180 px, znak na ciemnym tle |
| `icon-192.png`, `icon-512.png` | ikony PWA i podglądy | znak na ciemnym tle |
| `og-default.jpg` | domyślny podgląd przy udostępnianiu linku | 1200 x 630 px, zdjęcie z logotypem |
| `../favicon-32.png`, `../favicon-16.png` | favikona w karcie przeglądarki | znak na przezroczystym tle |

Zasady:

1. Wysyłaj logotyp w jak największej rozdzielczości (np. 1200 px szerokości) — my
   zmniejszymy go bez utraty jakości.
2. Potrzebujemy dwóch wersji: jasnej (na ciemne tło) i ciemnej (na białe tło).
   Jeśli masz tylko jedną, drugą przygotujemy automatycznie.
3. Ikony (favikona, Apple) budujemy ze znaku bez napisu — sam znak czyta się lepiej
   w małym rozmiarze niż cały logotyp z tekstem.
4. Nie zmieniaj nazw plików, wtedy nie trzeba nic poprawiać w kodzie strony.

## Zdjęcia i filmy z realizacji (materiał z drugiej strony)

Zdjęcia i filmy pochodzą z serwisu `ogrodzenia-frontowe.pl` (Twoja druga strona) i zostały
przetworzone do wersji webowych. Wszystko da się odtworzyć dwoma skryptami:

```
python3 scripts/przetworz-materialy.py   # zdjęcia 900 px, nagłówki 16:9, filmy MP4 + miniatury
python3 scripts/wepnij-materialy.py      # wpina zdjęcia i filmy w dane serwisu
```

| Co | Gdzie leży | Jak zmienić |
| --- | --- | --- |
| Zdjęcia realizacji | `public/images/frontowe/frontowe-01..32.jpg` | podmiana pliku o tej samej nazwie |
| Nagłówki stron | `public/images/frontowe/hero-glowna.jpg`, `hero-frontowe.jpg`, `hero-realizacje.jpg` | lista `HERO` w skrypcie |
| Które zdjęcia publikujemy | lista `WYBRANE` w `scripts/przetworz-materialy.py` | numery z nazw plików źródłowych |
| Mapowanie nazw na oryginały | `raport/frontowe-mapowanie.csv` | plik informacyjny |
| Filmy | `public/media/wideo/*.mp4` + miniatury `.jpg` | lista `FILMY` w skrypcie |
| Opisy filmów i tytuły SEO | `src/data/media.json` | edycja ręczna |

Zdjęcia są na razie podpisane opisem systemu (np. „słupki z kamienia łupanego, przęsła żaluzjowe
w antracycie”), bo drugi serwis nie zawierał danych o miejscowości, kolorze RAL i wymiarach.
Gdy je uzupełnisz, wystarczy dopisać je w `src/data/gallery.json` i w blokach galerii na stronach
`src/data/pages/ogrodzenia-frontowe.json` oraz `src/data/pages/home.json`.

Uwaga o prawach: materiał pochodzi z Twojego własnego serwisu, więc nie ma przeszkód, żeby go
przenieść. Po wdrożeniu nowej strony warto zadbać o przekierowania ze starych adresów zdjęć,
żeby nie zostały w indeksie jako osobne wyniki (patrz `PRZEKIEROWANIA-301.md`).

## Zdjęcia z realizacji z archiwów 1.zip i 2.zip

Oba archiwa zawierały ten sam zestaw zdjęć (2.zip to duplikat), razem 57 unikalnych plików.
Do serwisu weszło 17 najlepszych; reszta to kadry z gruntem, rurami i niedokończonymi murami.

```
python3 scripts/realizacje-z-archiwum.py   # przetwarza zdjęcia i wpina je w dane serwisu
```

| Co | Gdzie leży |
| --- | --- |
| Zdjęcia realizacji | `public/images/realizacje/foto-01..17.jpg` |
| Nagłówki stron kategorii | `public/images/realizacje/hero-bramy.jpg`, `hero-panelowe.jpg`, `hero-podmurowki.jpg` |
| Które zdjęcia publikujemy i z jakimi tagami | słownik `WYBRANE` w skrypcie |
| Mapowanie na pliki źródłowe | `raport/realizacje-mapowanie.csv` |

Nagłówki trafiły na strony: bramy przesuwne (brama z furtką i podjazdem), ogrodzenia panelowe
(ogród grzebieniowy z kamiennym słupkiem), podmurówki betonowe (mur z bloczków łupanych).
## Rolki z serwera botkama.pl

Rolki były wgrane na `botkama.pl` jako pliki 48-126 MB (materiał 4K 2160x3840, 21-50 Mb/s).
Takie pliki nie nadają się do odtwarzania na stronie, dlatego zostały przepakowane do
1080x1920, ok. 2,8 Mb/s i dołączone do serwisu w `public/media/rolki/`
(z 393 MB zrobiło się 29 MB).

```
python3 scripts/rolki-z-serwera.py   # przetwarza pliki z /home/ubuntu/rolki-zrodlo i wpina rolki w serwis
```

| Co | Gdzie leży |
| --- | --- |
| Pliki rolek | `public/media/rolki/<slug>.mp4` (4 rolki) |
| Plakaty 1080x1920 | `public/media/rolki/<slug>.jpg` |
| Tytuły, opisy i tagi rolek | `src/data/media.json`, sekcja `reels` |
| Sekcja rolek na stronie głównej | `src/data/pages/home.json`, blok `reels` |

Podmiana rolki: wrzuć nowy plik do `/home/ubuntu/rolki-zrodlo/` pod tą samą nazwą i uruchom
skrypt ponownie, albo podmień sam plik w `public/media/rolki/` zachowując nazwę.

Gdybyś chciał zostawić rolki na zewnętrznym serwerze (np. żeby nie zajmowały miejsca na hostingu
strony), w `src/data/media.json` w polu `sources` wystarczy wpisać pełny adres
`https://botkama.pl/nazwa-pliku.mp4`. Warto wtedy najpierw wgrać na ten serwer wersje
przepakowane (te z `public/media/rolki/`), bo oryginalne pliki są zbyt ciężkie do odtwarzania.
## Ceny ogrodzeń aluminiowych (nowa podstrona)

Podstrona `/ogrodzenia-aluminiowe` korzysta z tokenów w `src/data/prices.json`:

| Token | Znaczenie | Wartość startowa |
| --- | --- | --- |
| `aluminium_mb` | ogrodzenie aluminiowe panelowe, za mb z montażem | 450 zł |
| `aluminium_palisada_mb` | ogrodzenie aluminiowe na wzór palisady, za mb | 520 zł |
| `przeslo_aluminium_szt` | przęsło aluminiowe 250 x 153 cm, za sztukę | 690 zł |
| `brama_aluminium_przesuwna` | brama przesuwna aluminiowa 4 m | 5 900 zł |
| `brama_aluminium_skrzydlowa` | brama skrzydłowa aluminiowa 4 m | 4 800 zł |
| `furtka_aluminium` | furtka aluminiowa 1 m z montażem | 1 600 zł |

Treść strony: `src/data/pages/ogrodzenia-aluminiowe.json`. Pozycja w menu: `src/data/nav.json`, grupa „Ogrodzenia".
