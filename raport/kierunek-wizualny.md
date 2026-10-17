# Kierunek wizualny: ciemny premium

Dokument opisuje styl, który został wdrożony w serwisie Eurofance na życzenie klienta
(„strona ma być premium i wizualnie przypominać front strony https://palisada.pl/”).

## Co było punktem odniesienia

Strona palisada.pl zbudowana jest wokół:

- niemal czarnego tła (nagłówek, hero, sekcje fotograficzne, stopka),
- bardzo jasnej, cienkiej typografii z dużymi nagłówkami i małą interlinią,
- małych, rozstrzelonych wersalików jako etykiet nad nagłówkiem sekcji,
- szerokich kart fotograficznych z zaokrąglonymi narożnikami, ciemnym gradientem
  i podpisem w dolnej części karty,
- sekcji pełnej szerokości ze zdjęciem w tle i tekstem na nim,
- liczb i statystyk jako elementu budującego zaufanie,
- minimalnej liczby ozdobników: brak ramek, brak cieni poza delikatnym uniesieniem karty.

## Co zastosowaliśmy u nas

| Element palisada.pl | Odpowiednik w Eurofance |
| --- | --- |
| Czarne tło sekcji | `.section--dark`, `.section--graphite`, `.band` |
| Cienkie duże nagłówki | `h1` waga 300, `h2` waga 300, `letter-spacing: -0.03em` |
| Etykiety wersalikami | komponent `.eyebrow` nad każdym `h2` |
| Karty fotograficzne z podpisem | `.photo-card` (sekcja „Nasze systemy ogrodzeń i bram”) |
| Sekcja pełnej szerokości ze zdjęciem | komponent `PhotoBand.astro` (sekcja o produkcji) |
| Liczby i statystyki | komponent `StatsBar.astro` (12 lat, 3200 realizacji, 6 ekip, 180 km) |
| Zaokrąglone przyciski | `.btn` z promieniem 999 px |
| Ciemny nagłówek i stopka | `.site-header`, `.site-footer` na kolorze `#0c0f11` |

Czerwień marki `#E80C0C` pozostała zarezerwowana dla przycisków kontaktu (telefon,
wycena), więc konwersja nadal jest widoczna na ciemnym tle.

## Paleta

- `--ink #0c0f11` — główne tło ciemnych sekcji
- `--ink-2 #14181b`, `--ink-3 #1d2226` — tła kart i podniesionych warstw
- `--paper #ffffff`, `--paper-2 #f6f7f8` — sekcje jasne i tabele
- `--muted #6c747b` (na jasnym), `--muted-on-dark #98a1a8` (na ciemnym)
- `--red #e80c0c` — wyłącznie przyciski kontaktu

## Typografia

- Krój: Inter (hostowany lokalnie, subset latin + latin-ext).
- Nagłówki: waga 300–500, ujemny tracking, duże rozmiary (`clamp`).
- Tekst: 16,5–17 px, interlinia 1,65.
- Etykiety: 0,72 rem, `letter-spacing: 0.22em`, wersaliki.

## Zdjęcia

Serwis używa zdjęć z katalogu `public/images/premium/`:

- `hero.jpg` — hero strony głównej (21:9),
- `panelowe.jpg`, `palisadowe.jpg`, `bramy.jpg`, `przemyslowe.jpg` — karty oferty (3:2),
- `band-front.jpg` — sekcja o produkcji (21:9),
- `realizacja-1.jpg`, `realizacja-2.jpg`, `realizacja-3.jpg` — galeria realizacji (4:3),
- `malarnia.jpg` — zapas na stronę malarni (4:3).

Wszystkie są zoptymalizowane do formatu JPEG (jakość 82, progresywny), łącznie około 3 MB.

> Uwaga wdrożeniowa: zdjęcia są przygotowane na etapie projektowania i pokazują docelowy
> styl. Przed publikacją należy podmienić je na rzeczywiste fotografie realizacji klienta,
> zachowując te same nazwy plików i proporcje. Instrukcja podmiany jest w pliku
> `GDZIE-ZMIENIC-CENY-I-DANE.md`.

## Zasady, których warto nie łamać

1. Czerwień tylko dla kontaktu (telefon, wycena, WhatsApp). Nie używać jej do ozdoby.
2. Na ciemnym tle nigdy nie kłaść ciemnego tekstu — używamy `--text-on-dark` i `--muted-on-dark`.
3. Nagłówek sekcji zawsze z etykietą `.eyebrow` i maksymalnie dwiema liniami.
4. Karty fotograficzne muszą mieć ciemny gradient na dole, inaczej podpis traci czytelność.
5. Sekcje ciemne przeplatać jasnymi — cała strona w czerni męczy i pogarsza czytelność cenników.

## Szlif premium (warstwa druga i trzecia)

Po pierwszym wdrożeniu kierunku dopracowaliśmy detale, które decydują o odbiorze „premium”.
Wszystko siedzi w `src/styles/global.css`, w sekcjach oznaczonych komentarzem `SZLIF PREMIUM`,
więc można to łatwo przeglądać i modyfikować bez szukania po całym pliku.

**Rytm i typografia**

- jednolity odstęp sekcji sterowany zmienną `--section-y` (od 56 do 104 px w zależności od ekranu),
- nagłówki z `text-wrap: balance`, akapity z `text-wrap: pretty` — brak „wiszących” pojedynczych słów,
- rozmiary nagłówków i tekstu wiodącego oparte o `clamp()`, więc skalują się płynnie,
- etykieta sekcji z czerwoną kreską po lewej (`.eyebrow::before`), spójna na całej stronie,
- zaznaczanie tekstu w kolorze marki (`::selection`).

**Zdjęcie w hero**

- trzystopniowa mgła: mocny górny pas pod nagłówkiem, jaśniejszy środek (zdjęcie pozostaje czytelne),
  ciemny dół pod przyciskami, plus winieta po lewej stronie pod tekstem,
- delikatny cień pod nagłówkiem i tekstem wiodącym, żeby biały tekst był czytelny na każdym zdjęciu,
- wysokość hero do 86% ekranu na desktopie,
- panel formularza jako szklana tafla z mocniejszym rozmyciem i wewnętrznym rozświetleniem krawędzi.

**Pasek zaufania**

- kapsułki o równej wysokości, bez zawijania napisu w środku,
- gwiazdki w kolorze złotym, pozostałe plakietki w szkle.

**Karty i tabele**

- karty oferty: uniesienie o 6 px, cień, powiększenie zdjęcia w tle, animacja strzałki,
- karty fotograficzne: cień bazowy, uniesienie przy najechaniu, głębszy gradient pod podpisem,
  większy tytuł, wyróżniona linia ceny ze strzałką,
- tabele: zaokrąglony kontener z cieniem, nagłówek w ciemnym grafitcie, podświetlenie wiersza
  pod kursorem, liczby w kolumnie cen z równymi szerokościami cyfr (`tabular-nums`).

**Statystyki, przyciski, nagłówek**

- liczby w sekcji „Eurofance w liczbach” większe, cienkie, z separatorami kolumn na desktopie,
- czerwony przycisk z subtelnym gradientem i poświatą, uniesienie przy najechaniu,
- nagłówek po przewinięciu strony przyciemnia się, rozmywa tło i dostaje cień (`.is-scrolled`),
- linki w stopce z animowanym podkreśleniem zamiast pełnego podkreślenia.

**Ruch i dostępność**

- delikatne wejście kart i sekcji (przesunięcie 16 px i rozjaśnienie) uruchamiane dopiero, gdy element
  wchodzi w widok; elementy widoczne od razu przy wczytaniu nie animują się, więc nic nie miga,
- animacje wyłączają się przy `prefers-reduced-motion: reduce`,
- widoczny obrys klawiatury (`:focus-visible`) na wszystkich elementach interaktywnych,
- etykiety i kapsułki mają wysokość co najmniej 44 px w miejscach dotykowych.

### Gdzie to podkręcić

| Co | Zmienna lub reguła | Efekt |
| --- | --- | --- |
| Odstępy sekcji | `--section-y` | luźniej lub ciaśniej w pionie |
| Szerokość treści | `--container` | szerszy lub węższy układ |
| Kolor marki | `--red` | zmiana akcentu (przyciski kontaktu, kreska etykiety) |
| Tło ciemnych sekcji | `--ink`, `--ink-2`, `--ink-3` | głębokość czerni |
| Skala nagłówków | reguły `h1`, `h2` w sekcji szlifu | wielkość typografii |
| Animacje wejścia | funkcja `initReveal()` w `src/scripts/ui.js` | które elementy się pojawiają i jak szybko |
