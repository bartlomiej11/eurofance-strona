# Jak przekazać zdjęcia, wideo i rolki

Ten plik opisuje, co i w jakiej formie wysłać, żebyśmy mogli od razu wpiąć materiały
w serwis bez zgadywania i bez poprawek. Materiały wysyłaj partiami (np. jeden folder
na jedną realizację), a my zajmiemy się kompresją, kadrowaniem i opisami.

## 1. Zdjęcia realizacji (najważniejsze)

Dla każdej realizacji potrzebujemy **3 do 6 zdjęć**. Wystarczy jeden folder na realizację
z krótkim opisem w nazwie lub w treści wiadomości.

Co podać przy każdej realizacji (to trafia w podpis zdjęcia, do galerii i do danych
strukturalnych, więc warto o to zadbać):

| Informacja | Przykład | Do czego służy |
| --- | --- | --- |
| Miejscowość | Legionowo | podpis zdjęcia, tekst SEO |
| System | panele 3D | filtry w galerii, kategoria |
| Kolor | RAL 7016 | opis, ułatwia klientowi wybór |
| Wymiary | 153 cm, 44 mb | konkret w podpisie, buduje zaufanie |
| Dodatki | brama przesuwna 4,5 m z napędem | opis i link do podobnej wyceny |
| Zdanie o realizacji | „Montaż w dwa dni, podmurówka 250x25.” | treść na stronie realizacji |

Zdjęcia, których szukamy w pierwszej kolejności:

1. **Hero** (1 zdjęcie) — szeroki kadr frontu posesji z ogrodzeniem i bramą, najlepiej
   w ciepłym świetle, bez ludzi i bez samochodów zasłaniających ogrodzenie.
2. **Karty oferty** (4 zdjęcia) — panelowe, palisadowe, brama, ogrodzenie przemysłowe.
   Po jednym reprezentatywnym zdjęciu na system, kadr poziomy.
3. **Galeria realizacji** (min. 8 zdjęć) — różne miasta i systemy, kadr poziomy.
4. **Sekcja o produkcji** (2–3 zdjęcia) — hala, malarnia proszkowa, spawanie, gotowe elementy.

### Formaty

- Pliki: JPG, PNG lub HEIC (HEIC też przyjmiemy, tylko przekonwertujemy).
- Rozdzielczość: minimalnie 1600 px na dłuższym boku, najlepiej 2000–2500 px.
- Orientacja: pozioma (pionowe zdjęcia wykorzystamy tylko w rolkach).
- Bez znaków wodnych, bez daty wypalonej na zdjęciu, bez filtrów Instagrama.
- Nie kadruj zdjęć „na sztywno” — lepiej wysłać oryginał, my przytniemy pod układ strony.

## 2. Wideo (filmy na stronie)

- Format: MP4 (H.264) albo MOV. Możemy przekonwertować, ale MP4 jest najszybsze.
- Rozdzielczość: 1920x1080 lub 3840x2160, orientacja pozioma.
- Długość: 30–120 sekund na film.
- Dźwięk: mile widziany (muzyka z licencją albo bez dźwięku — unikamy cudzej muzyki).
- Do każdego filmu potrzebujemy: tytuł, jedno zdanie opisu, miejscowość i system.
  Wtedy film dostaje prawidłowe dane VideoObject, czyli może pojawić się w Google.

## 3. Rolki (pionowe, sekcja „Rolki z realizacji”)

- Format: MP4 lub MOV, orientacja pionowa 9:16 (np. 1080x1920).
- Długość: 15–60 sekund, bez napisów wypalonych w obrazie (napisy możemy dodać sami).
- Do każdej rolki: tytuł i jedno zdanie opisu (np. „Brama przesuwna 4,5 m, napęd 24 V,
  programowanie pilotów przy kliencie”).

## 4. Nazewnictwo plików (ułatwia pracę, ale nie jest obowiązkowe)

Jeśli możesz, nazwij pliki tak:

```
hero-legionowo-panele-3d.jpg
oferta-panelowe.jpg
oferta-palisadowe.jpg
oferta-bramy.jpg
oferta-przemyslowe.jpg
realizacja-legionowo-panele-3d-01.jpg
realizacja-legionowo-panele-3d-02.jpg
produkcja-malarnia-01.jpg
rolka-brama-przesuwna-naped.mp4
wideo-montaz-palisady-legionowo.mp4
```

Nazwy plików też pracują na SEO (Google czyta je jako opis obrazka), dlatego warto
wpisać w nie miejscowość i system, a nie `IMG_2841`.

## 5. Co zrobimy po otrzymaniu materiałów

1. Obróbka: kompresja do JPEG/WebP, przycięcie do proporcji sekcji, wersje dla telefonu.
2. Podmiana plików w `public/images/premium/` i `public/media/` bez zmian w kodzie.
3. Uzupełnienie podpisów, altów i danych strukturalnych (ImageObject, VideoObject).
4. Dopisanie nowych pozycji do galerii, realizacji i sekcji rolek w plikach treści.
5. Ponowny build, kontrola jakości i publikacja nowej paczki wdrożeniowej.

## 6. Prawa do materiałów

Zdjęcia i filmy publikujemy pod nazwą firmy, więc potrzebujemy Twojego potwierdzenia,
że masz do nich prawa i zgody osób, które są na nich widoczne (jeżeli ktoś jest
rozpoznawalny). Muzykę w filmach najlepiej zostawić firmową albo bez dźwięku.

## 7. Co dokładnie robimy z plikami wideo (gotowe zaplecze)

Serwis ma już przygotowaną obsługę filmów i rolek, więc po otrzymaniu plików wystarczy
uzupełnić jeden plik danych: `src/data/media.json`. Szczegóły techniczne i strategię
opisuje `SEO-WIDEO-I-ROLKI.md`, a poniżej najkrótsza wersja.

Co dostajesz z każdego filmu:

- osobną stronę `eurofance.pl/wideo/<adres>` z odtwarzaczem, szczegółami realizacji,
  kluczowymi momentami (klikalne znaczniki czasu), transkrypcją i wezwaniem do wyceny,
- dane strukturalne `VideoObject` (tytuł, miniatura, długość, data publikacji, plik), czyli
  szansę na wynik wideo w Google,
- wpis w mapie witryny z rozszerzeniem `video:video`,
- zdarzenia `video_play` i `video_moment` w Google Tag Manager, żebyś widział, które filmy
  są naprawdę oglądane,
- cache ustawiony na rok i obsługę przewijania pliku po stronie serwera.

Katalogi na pliki (wystarczy wgrać):

```
public/media/wideo/nazwa.mp4     # filmy poziome
public/media/wideo/nazwa.jpg     # miniatura 16:9
public/media/wideo/nazwa.vtt     # opcjonalne napisy
public/media/rolki/nazwa.mp4     # rolki pionowe
public/media/rolki/nazwa.jpg     # miniatura 9:16
```

Przykładowy wpis w `src/data/media.json` (pełny wzór z opisem pól jest w tym pliku):

```json
{
  "slug": "montaz-palisady-legionowo",
  "kind": "wideo",
  "name": "Montaż palisady w Legionowie",
  "description": "Palisada pionowa 153 cm w kolorze RAL 7016, 44 mb ogrodzenia zamontowane w jeden dzień.",
  "city": "Legionowo",
  "system": "Ogrodzenia palisadowe",
  "color": "RAL 7016",
  "dimensions": "153 cm, 44 mb",
  "uploadDate": "2026-10-12",
  "duration": "PT1M12S",
  "poster": "/media/wideo/montaz-palisady-legionowo.jpg",
  "sources": [{ "src": "/media/wideo/montaz-palisady-legionowo.mp4", "type": "video/mp4" }],
  "keyMoments": [
    { "label": "Wytyczenie linii ogrodzenia", "startOffset": 0 },
    { "label": "Montaż słupków", "startOffset": 24 }
  ],
  "transcript": "<p>Krótki opis tego, co dzieje się w filmie.</p>"
}
```

Uwaga: dopóki w `media.json` nie ma żadnego filmu, strona `eurofance.pl/wideo` istnieje,
ale jest wyłączona z indeksowania (żeby nie pokazywać pustej strony w Google). Po dodaniu
pierwszego filmu włącza się sama.

## 8. Jeśli pliki zostaną na innym serwerze

Nie ma przeszkody, żeby filmy leżały poza hostingiem strony. Wystarczy, że prześlesz same linki
wraz z opisem. Obsługujemy trzy warianty:

- **plik MP4 pod bezpośrednim adresem HTTPS** (własny VPS, CDN, S3, Cloudflare R2, Bunny) —
  podajemy go jako `contentUrl` i wpis `video:content_loc`,
- **YouTube lub Vimeo** — wystarczy pełny link albo samo ID filmu; miniaturę pobieramy
  automatycznie z YouTube, a odtwarzacz działa w trybie bez ciasteczek,
- **plik u nas na hostingu** — nadal najprościej, jeśli hosting ma miejsce i transfer.

Nie zadziałają natomiast linki z Google Drive, Dropboxa, OneDrive, WeTransfer i podobnych usług
(dlaczego — patrz `SEO-WIDEO-I-ROLKI.md`, sekcja 9). Podsumowując, wystarczy przesłać listę w formacie:

```
link - tytuł filmu - miejscowość - system - kolor - wymiary - długość (mm:ss) - jedno zdanie opisu
```

Miniatura i tak najlepiej, żeby powstała u nas z klatki filmu albo z Twojego zdjęcia —
wtedy podglądy w Google i w social mediach są spójne z resztą serwisu.
