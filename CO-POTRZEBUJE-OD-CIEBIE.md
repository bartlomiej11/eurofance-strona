# Co potrzebuję od Ciebie, żeby dokończyć stronę i sklep

Stan na dziś: **155 stron**, sklep z **41 produktami** w 8 kategoriach, działający koszyk (zapamiętuje zawartość w przeglądarce), formularze wyceny i kontaktowy, kalkulator, blog, encyklopedia, wideo i rolki, dane strukturalne i sitemap. Kontrola: 0 błędów, 0 ostrzeżeń.

Brakuje najważniejszego elementu sklepu: **zamówienia i płatności** (koszyk zbiera produkty, ale nie ma jeszcze kroku „zamawiam"). Poniżej lista decyzji i danych, które to odblokują.

---

## A. Decyzje, które musisz podjąć (bez nich nie ruszę dalej)

| # | Decyzja | Opcje | Dlaczego to blokuje pracę |
| --- | --- | --- | --- |
| A1 | Czy sklep ma sprzedawać online z płatnością, czy tylko zbierać zapytania? | a) pełny sklep z płatnością i wysyłką, b) koszyk = zapytanie o wycenę, c) mieszany: drobne elementy kupujesz od razu, ogrodzenia tylko na wycenę | Od tego zależy cała architektura koszyka, dostawy i regulaminu |
| A2 | Operator płatności | Przelewy24, Tpay, PayU, Stripe, Autopay | Potrzebuję konta i kluczy API (klucze wpisujesz sam, ja tylko podłączam) |
| A3 | Dostawa | kurier (DPD, InPost, DHL), transport własny, odbiór osobisty | Potrzebuję cennika dostaw i limitów wagi/wymiarów — przęsła 250 cm jadą inaczej niż furtka |
| A4 | Faktury | ręcznie, czy automatycznie (Fakturownia, inFakt, wFirma) | Przy automatycznych potrzebuję dostępu API |
| A5 | Formularze: gdzie mają trafiać zgłoszenia | e-mail, CRM (Pipedrive, Livespace), BaseLinker, arkusz Google, SMS | Wszystkie zapytania z formularzy, kalkulatora i koszyka trafiają w jedno miejsce |
| A6 | Sklep wysyła towar do konsumentów (B2C) czy tylko firmom (B2B)? | B2C / B2B / oba | B2C wymaga regulaminu z prawem odstąpienia 14 dni i formularza zwrotu — to musi być na stronie |

---

## B. Dane i dostępy, które musisz mi przekazać

### B1. Dane firmowe i prawne (potrzebne w stopce, regulaminie, fakturach)

| Pole | Twoja wartość |
| --- | --- |
| Pełna nazwa firmy (jak w CEIDG/KRS) | |
| NIP / REGON / KRS (jeśli spółka) | |
| Adres siedziby | |
| Adres produkcji i malarni | |
| Nazwa banku i numer konta | |
| Adres do zwrotów i reklamacji | |
| E-mail do zamówień i reklamacji | |
| Telefon do zamówień | |
| Czy jesteś czynnym podatnikiem VAT? | |

### B2. Produkty — uzupełnienie katalogu

Mam 41 produktów z nazwą, opisem, ceną i parametrami. Żeby sklep działał jak prawdziwy, potrzebuję dla każdego produktu:

| Pole | Uwagi |
| --- | --- |
| SKU / kod magazynowy | do faktur i stanów |
| Cena netto i brutto | oraz czy cena zawiera montaż |
| Stan magazynowy albo czas produkcji | „dostępne od razu" / „10 dni roboczych" |
| Minimalna ilość zamówienia | np. przęsła po 1 szt., ale podmurówka po 10 szt. |
| Warianty: wysokość, kolor RAL, szerokość | czy cena zależy od koloru? |
| Zawartość zestawu | np. przęsło + 2 słupki + obejmy + nakrętki |
| Waga i wymiary paczki | bez tego nie policzę kosztu dostawy |
| Zdjęcia 3–5 na produkt | najlepiej na jasnym tle i w realizacji |

Dodatkowo: **czego u Was nie da się kupić na sztuki** i musi iść tylko przez wycenę.

### B3. Analitika i marketing

| Narzędzie | Co potrzebuję |
| --- | --- |
| Google Analytics 4 | identyfikator pomiaru `G-XXXXXXX` |
| Google Ads | identyfikator konwersji i etykieta (jeśli prowadzisz kampanie) |
| Meta Pixel | identyfikator piksela (jeśli reklamy na Facebooku/Instagramie) |
| Google Search Console | dodanie weryfikacji domeny |
| Wizytówka Google | dokładny link z „Udostępnij" (podłączę do przycisku opinii) |
| Mapa ciepła / nagrania sesji | czy chcesz włączyć (np. Microsoft Clarity — darmowe) |

### B4. Hosting i domena

| Element | Co potrzebuję |
| --- | --- |
| Domena | jaka jest docelowa i czy już wykupiona |
| Hosting | dostawca, czy obsługuje PHP (formularze) i przekierowania `.htaccess` |
| Certyfikat SSL | czy jest wykupiony |
| Skrzynki e-mail | adresy, z których mają wychodzić potwierdzenia zamówień |
| Dostęp do DNS | czy Ty zmieniasz wpisy, czy ja mam dostać dostęp |

### B5. Materiały, których jeszcze nie mam

- Logo w wektorze (`SVG`, `AI` lub `PDF`) — mam tylko PNG, więc przy dużym rozmiarze traci ostrość.
- Prawdziwe zdjęcia realizacji aluminiowych i grzebieniowych (w aluminium mam na razie zdjęcia stalowe).
- Certyfikaty i atesty: gwarancja 5 lat, karta powłoki, atest na stal — jeśli macie, pokażę je jako plakietki zaufania.
- Realne opinie z Google do wyróżnienia na stronie (3–6 najlepszych, z imieniem i miastem).
- Zdjęcia zespołu, hali, malarni i ekip montażowych (podnoszą zaufanie bardziej niż zdjęcia stockowe).
- Paleta kolorów RAL, których najczęściej używacie (zrobię z tego próbnik z cenami).
- Cennik transportu: strefy, koszt palety, darmowa dostawa od jakiej kwoty.
- Regulamin sklepu, polityka prywatności, polityka zwrotów — jeśli masz swoje, użyję ich; jeśli nie, przygotuję szkic do zatwierdzenia przez Twojego prawnika.

---

## C. Co zrobię sam, bez Twojego udziału

| Zadanie | Efekt |
| --- | --- |
| Krok „Zamawiam" pod koszykiem | Formularz danych, wybór dostawy, podsumowanie, e-mail do Ciebie + potwierdzenie dla klienta |
| Filtrowanie i sortowanie w sklepie | Filtr po kategorii, cenie, wysokości, kolorze; sortowanie od najtańszych |
| Wyszukiwarka produktów | Podpowiedzi w trakcie pisania, wyniki z ceną i zdjęciem |
| Karta produktu | Warianty (wysokość, kolor, ilość), „dodaj do koszyka", „wycena z montażem", produkty powiązane |
| Porównywarka i schowek | Klient zapisuje produkty i porównuje parametry |
| Zdarzenia e-commerce | Dodanie do koszyka, rozpoczęcie zamówienia, zakup — podłączone pod GA4 i Ads |
| Usprawnienia UX | Szybsze ładowanie zdjęć, lepszy kalkulator, sticky CTA na telefonie, czytelniejszy koszyk |
| SEO produktów | Dane strukturalne `Product` z ceną i dostępnością, breadcrumbs, opisy pod frazy |
| Dostępność i Core Web Vitals | Kontrasty, klawiatura, `alt`, wymiary obrazów, opóźnione ładowanie wideo |
| Testy | Przejście całej ścieżki zakupu, walidacja formularzy, sprawdzenie na telefonie |

---

## D. Kolejność pracy, jaką proponuję

1. **Zamknięcie sklepu zakupowego** — krok zamówienia, dostawa, potwierdzenia (potrzebuję A1, A3, A5, B1, B2 w zakresie wag i wymiarów).
2. **Płatności online** — podłączenie operatora (potrzebuję A2).
3. **Karta produktu w wersji docelowej** — warianty, zestawy, produkty powiązane.
4. **Wyszukiwarka, filtry, porównywarka** — poprawa konwersji.
5. **Analityka i kampanie** — zdarzenia zakupowe (potrzebuję B3).
6. **Treści zaufania** — certyfikaty, prawdziwe opinie, zdjęcia zespołu (potrzebuję B5).
7. **Testy końcowe i publikacja** — na docelowym hostingu (potrzebuję B4).

---

## E. Skrót: 7 rzeczy, które odblokują najwięcej

1. Decyzja: **sklep z płatnością czy koszyk jako zapytanie** (punkt A1).
2. **Operator płatności** i gotowość konta (A2).
3. **Cennik dostaw** wraz z wagami i wymiarami paczek (A3 + B2).
4. **Dane firmowe do regulaminu i faktur** (B1).
5. **Adres, na który mają trafiać wszystkie zapytania** (A5).
6. **Identyfikatory analityki** GA4 i Ads (B3).
7. **Domena, hosting i dostęp do DNS** (B4).

Wszystko, czego nie musisz robić sam, zrobię ja. Wystarczy, że odpowiesz na punkty z sekcji E — resztę dopytam w trakcie.