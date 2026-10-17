# Jak dodać filmiki i rolki, żeby pracowały na SEO

Dokument odpowiada na pytanie: w jaki sposób opublikować filmy i rolki z realizacji, żeby
wyciągnąć z nich maksimum w Google i żeby nie zaszkodziły szybkości strony.

## 1. Rekomendacja w skrócie

| Decyzja | Rozwiązanie | Dlaczego tak |
| --- | --- | --- |
| Gdzie trzymać pliki | **własny serwer, plik MP4** (`/media/wideo/`) | tylko plik pod własnym adresem pozwala podać `contentUrl` i wpis `video:content_loc`, a Google może go zaindeksować razem ze stroną |
| Czy dodatkowo YouTube | **tak, jako kanał wsparcia** (drugi upload) | YouTube daje drugą powierzchnię: wyszukiwarkę YouTube i szansę na wynik wideo w Google; osadzamy przez `youtube-nocookie` z fasadą, więc nie spowalnia i nie łamie zgód cookie |
| Gdzie osadzać | **osobna strona dla każdego filmu** (`/wideo/<adres>`) + strona zbiorcza `/wideo` | Google pokazuje wyniki wideo najchętniej, gdy film jest główną treścią strony, a nie dodatkiem w stopce |
| Plakat i rozmiary | miniatura JPG 1280×720 (wideo) i 1080×1920 (rolka), plik MP4 do 1920 px szerokości | mniejszy plik = szybsze pierwsze odtworzenie; plakat zastępuje film do momentu kliknięcia |
| Ładowanie | **fasada**: zdjęcie + przycisk, odtwarzacz powstaje po kliknięciu | film nie obciąża pierwszego wczytania strony (Core Web Vitals), a nagrywanie odtwarzacza nie blokuje LCP |
| Napisy i transkrypcja | plik `.vtt` + pełna transkrypcja w HTML na stronie filmu | tekst filmu jest indeksowalny, pomaga też w wyszukiwaniu głosowym i w odpowiedziach AI |
| Rolki | sekcja na `/wideo` + osobna strona dla najlepszych | rolki mają mniejszą wartość w wyszukiwarce niż filmy poziome, ale budują czas na stronie i dowód społeczny; warto je równolegle wrzucać na Instagram, TikToka i YouTube Shorts z linkiem do strony |

Krótko: **plik MP4 u siebie + strona dla każdego filmu + VideoObject + mapa witryny wideo + transkrypcja**,
a YouTube jako dodatek, nie jako jedyne miejsce publikacji.

## 2. Co już jest gotowe na stronie

Zbudowaliśmy kompletne zaplecze, więc po otrzymaniu plików wystarczy uzupełnić jeden plik danych.

| Element | Gdzie w projekcie | Co daje |
| --- | --- | --- |
| Baza filmów i rolek | `src/data/media.json` | jedno źródło: tytuł, opis, miasto, system, kolor, wymiary, długość, plakat, pliki, napisy, momenty, transkrypcja |
| Strona zbiorcza | `/wideo` | pokazuje filmy i rolki, dopóki nie ma materiałów, jest wyłączona z indeksowania |
| Strona filmu | `/wideo/<adres>` | film jako główna treść: odtwarzacz, momenty, transkrypcja, tabela szczegółów, wycena, powiązane filmy |
| Znaczniki wideo | `src/lib/jsonld.js` (`videoObject`, `videoList`, `videoPage`) | `VideoObject` z `name`, `thumbnailUrl`, `uploadDate`, `duration`, `contentUrl`, `hasPart` (momenty), `contentLocation` |
| Mapa witryny wideo | `src/pages/sitemap.xml.js` | wpisy `video:video` z miniaturą, tytułem, opisem, plikiem, długością i datą publikacji |
| Odtwarzacz | `src/components/VideoPlayer.astro` + `src/scripts/ui.js` | fasada, leniwe ładowanie, napisy VTT, klikanie w momenty, zdarzenia `video_play` i `video_moment` w GTM |
| Cache plików | `public/.htaccess` | MP4, WebM i VTT trzymane rok w przeglądzie i obsługa przewijania (`Accept-Ranges`) |

## 3. Krok po kroku: dodanie kolejnego filmu

1. Wrzuć pliki do katalogów:
   - poziome: `public/media/wideo/` (`nazwa.mp4`, `nazwa.jpg`, opcjonalnie `nazwa.vtt`),
   - pionowe: `public/media/rolki/`.
2. Skompresuj wideo przed wgraniem: MP4 (H.264), 1920×1080, `-crf 23`, `-movflags +faststart`;
   celuj w 3–8 MB na minutę filmu. Rolki: 1080×1920, 1–4 MB.
3. Dopisz wpis w `src/data/media.json` (sekcja `videos` albo `reels`). Wzór jest w pliku,
   w polu `_przyklad_wideo`, wraz z opisem każdego pola.
4. Podaj `keyMoments` z sekundami — te punkty pojawiają się jako klikalne znaczniki na stronie
   i jako `Clip` w danych strukturalnych, które Google potrafi pokazać w wynikach wideo.
5. Wklej `transcript` (tekst wypowiedzi albo opis tego, co widać i co jest montowane).
6. Uruchom `npm run build` i `node scripts/sprawdz.mjs`. Wpis pojawi się w mapie witryny
   razem z rozszerzeniem `video:video`, a strona filmu dostanie znaczniki `VideoObject`.
7. Wyślij nowy `sitemap.xml` w Google Search Console (Wpisy → Mapy witryny) i sprawdź raport
   „Wideo” w Search Console po kilku dniach.

## 4. Wymagania Google dla wyników wideo

Minimum, które musi być spełnione na stronie z filmem:

- `name` (tytuł filmu) — mamy,
- `thumbnailUrl` — mamy, plakat JPG,
- `uploadDate` — mamy,
- `contentUrl` (MP4 pod własnym adresem) albo `embedUrl` — mamy oba warianty,
- film dostępny bez logowania i bez opłaty — tak,
- strona filmu indeksowalna i niezablokowana w `robots.txt` — tak (robots dopuszcza też boty AI).

Dodatkowo warto (i mamy):

- `duration` w formacie ISO 8601 (`PT1M12S`),
- `description` — opis, który pokazuje się w wynikach,
- `hasPart` z momentami (`Clip`),
- `transcript` — tekst filmu,
- `contentLocation` (miejscowość realizacji) i `about` (system ogrodzenia),
- rozszerzenie `video:video` w mapie witryny.

## 5. Rolki: jak je wykorzystać

Rolki rzadko wygrywają w wyszukiwarce jako samodzielne wyniki, ale są mocne w trzech rolach:

1. **Czas na stronie i dowód społeczny** — sekcja rolek na `/wideo` i na stronie realizacji.
2. **Pionowy format pod social** — ten sam plik publikuj na Instagramie, TikToku i jako YouTube Shorts,
   w opisie zawsze link `eurofance.pl/wideo/<adres>` (buduje ruch markowy i profil linków).
3. **Wejście na stronę filmu** — każda rolka ma u siebie kafelek „Zobacz pełny film”, co prowadzi
   użytkownika do strony z transkrypcją i wyceną.

Czego nie robić z rolkami:

- nie osadzaj ich przez wtyczkę Instagrama ani TikToka — te ramki ładują ciężkie skrypty,
  są puste dla robotów wyszukiwarek i pogarszają Core Web Vitals,
- nie wrzucaj ich jako jedynego materiału na stronie bez tekstu — dodaj co najmniej dwa zdania
  opisu i dane realizacji.

## 6. Czego unikać przy wideo

- **Autoodtwarzanie z dźwiękiem** — psuje wrażenia i pogarsza wskaźniki. Nasz odtwarzacz startuje tylko po kliknięciu.
- **YouTube w sekcji hero** — ramka YouTube dociąża pierwsze wczytanie i potrafi zepsuć LCP. Film umieszczamy niżej, a w hero zdjęcie.
- **Pliki bez `faststart`** — bez tej flagi przeglądarka najpierw pobiera cały plik, zanim zacznie odtwarzać.
- **Brak transkryptu** — tracisz tekst, który mógłby rankować na frazy typu „montaż bramy przesuwnej krok po kroku”.
- **Pliki większe niż 100 MB i nagrania 4K w całości** — wystarczy 1080p, 4K tylko wtedy, gdy naprawdę potrzebny.
- **Muzyka bez licencji** — ryzyko roszczeń, a dla strony to niepotrzebne obciążenie prawne.
- **Znaki wodne aplikacji** („Made with…”) — obniżają odbiór premium.

## 7. Jak zmierzyć efekt

1. **Google Search Console** → raport „Wideo”: liczby wyświetleń i kliknięć stron z filmami,
   błędy indeksowania wideo (jeżeli się pojawią, wskazują brakujący `thumbnailUrl` albo `uploadDate`).
2. **Test wyników złożonych** (Rich Results Test) dla adresu strony filmu — sprawdzenie znaczników `VideoObject`.
3. **Tag Assistant / Podgląd GTM** — zdarzenia `video_play` i `video_moment` pokazują, które filmy
   faktycznie są odtwarzane i w którym miejscu ludzie przestają oglądać.
4. **Search Console → Skuteczność**: frazy z „wideo”, „montaż”, „jak zamontować” po 2–4 tygodniach od publikacji.

## 8. Checklist przed publikacją filmu

- [ ] plik MP4 1080p z `+faststart`, do 8 MB na minutę,
- [ ] plakat JPG 1280×720 (wideo) albo 1080×1920 (rolka), bez napisów wypalonych w obrazie,
- [ ] wpis w `src/data/media.json` z tytułem, opisem, miastem, systemem, kolorem i wymiarami,
- [ ] `keyMoments` z sekundami,
- [ ] `transcript` w HTML,
- [ ] napisy `.vtt` (jeżeli w filmie ktoś mówi),
- [ ] `npm run build` bez błędów i `node scripts/sprawdz.mjs` z zerem błędów,
- [ ] film wysłany też na YouTube i social z linkiem do strony filmu,
- [ ] `sitemap.xml` zgłoszony w Search Console.

## 9. Wariant: filmy trzymane na innym serwerze (linki zewnętrzne)

Tak, to działa i jest w pełni obsłużone — sprawdziliśmy trzy warianty na zbudowanej stronie.
Zasada jest jedna: **treść ma zostać na stronie, plik może leżeć gdzie indziej.**

| Sposób | Co wpisujemy w danych | Co dostaje Google | Kiedy wybrać |
| --- | --- | --- | --- |
| Własny plik MP4 na naszym hostingu | `sources: [{ src: "/media/wideo/plik.mp4" }]` | `contentUrl` + `content_loc` | gdy hosting ma miejsce i transfer, a filmów jest kilkanaście |
| Plik MP4 na zewnętrznym serwerze (CDN, VPS, S3, R2, Bunny) | `sources: [{ src: "https://cdn.twojadomena.pl/plik.mp4" }]` | `contentUrl` + `content_loc` (adres zewnętrzny) | gdy nie chcesz obciążać hostingu strony lub masz już duży transfer na CDN |
| YouTube albo Vimeo | `youtube: "https://youtu.be/ID"` (pełny link lub samo ID) | `embedUrl` + `player_loc`; miniaturę pobieramy automatycznie z YouTube | najtaniej i najszybciej, gdy filmów jest dużo albo mają być też w social mediach |

W każdym wariancie tytuł, opis, miasto, system, wymiary, momenty i transkrypcja zostają na Twojej
stronie — i to one w dużej mierze decydują o wyniku w wyszukiwarce, a nie plik.

### Czego użyć NIE można

Te linki wyglądają jak „link do filmu”, ale nie nadają się i najprawdopodobniej nie odtworzą się na stronie:

- **Google Drive, Dropbox, OneDrive** — brak stałego adresu pliku i brak obsługi przewijania
  (`Range`), a przy większym ruchu konto zostaje zablokowane za nadużycie transferu,
- **WeTransfer, Sendspace i inne usługi wysyłkowe** — linki wygasają,
- **Instagram, TikTok, Facebook** — nie da się z nich pobrać pliku ani osadzić odtwarzacza,
  który widzi robot wyszukiwarki,
- **chmury z ochroną przed hotlinkiem** — odtwarzacz dostanie komunikat błędu zamiast filmu.

### Wymagania dla zewnętrznego hostingu

1. Adres **HTTPS** i bezpośredni plik kończący się `.mp4` (albo `.webm`).
2. Obsługa **HTTP Range** — bez tego nie da się przewijać filmu i psuje to wrażenia.
3. Brak blokad dla robotów Google (`robots.txt` hostingu musi dopuszczać Googlebota).
4. Stała nazwa pliku — podmiana nazwy zepsuje wszystkie wpisy i mapę witryny.
5. Miniatura (plakat) zostaje u nas w `public/media/` — to obrazek strony, więc musi być lokalny
   dla szybkości i danych strukturalnych. Wyjątek: YouTube, gdzie miniaturę pobieramy z jego serwera.

### Rachunek transferu

Minuta filmu 1080p to około 5–8 MB. Dwadzieścia filmów to ~150 MB leżące na serwerze,
ale liczy się transfer: 30 000 odtworzeń sześciominutowego filmu to około 180 GB miesięcznie.
Jeśli hosting ma limit (typowy plan 100–200 GB), przy popularnych filmach lepiej wybrać YouTube
albo CDN z płatnością za transfer. Metodyka zalecana przez nas: **rolki i krótkie klipy u siebie,
dłuższe filmy na YouTube** (z fasadą, więc strona nie traci na szybkości).

### Co nam podać

Wystarczy lista w dowolnej formie, na przykład:

```
https://youtu.be/ABC123 - Montaż palisady w Legionowie - Legionowo - palisadowe - RAL 7016 - 153 cm, 44 mb - 1:12 - "Palisada pionowa, montaż w jeden dzień"
https://cdn.eurofance.pl/wideo/brama-przesuwna-plock.mp4 - Brama przesuwna 4,5 m w Płocku - Płock - bramy przesuwne - RAL 7016 - 4,5 m - 2:05
```

Z takiej listy uzupełniamy `src/data/media.json` i publikujemy. Jeśli masz napisy `.vtt` albo
transkrypcje — dołącz, podniosą wartość strony filmu.
