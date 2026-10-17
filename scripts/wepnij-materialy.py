#!/usr/bin/env python3
"""
Wpina materialy klienta (zdjecia i filmy z ogrodzenia-frontowe.pl) w dane serwisu.

Uruchomienie po scripts/przetworz-materialy.py:
    python3 scripts/wepnij-materialy.py

Zmienia:
    src/data/gallery.json                  - dodaje 32 zdjecia realizacji (tag: frontowe)
    src/data/media.json                    - dodaje 4 filmy z realizacji
    src/data/pages/ogrodzenia-frontowe.json - zdjecie naglowka i galeria realnych zdjec
    src/data/pages/realizacje.json         - zdjecie naglowka
    src/data/pages/home.json               - zdjecie naglowka, galeria i sekcja z filmem
"""
from __future__ import annotations

import csv
import json
import pathlib

CSV_MAPOWANIE = pathlib.Path('raport/frontowe-mapowanie.csv')

# Zdjecia, ktore trafiaja do sekcji realizacji na stronie glownej (numery zrodlowe).
NA_GLOWNA = [12, 13, 4, 43, 46, 38, 33, 47]

# Grupy podpisow: numer zrodlowy -> (podpis, tekst alternatywny)
GRUPA_ZALUZJE = ([1, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
                  33, 34, 35, 36, 39, 40, 42, 44],
                 'Ogrodzenie frontowe: słupki z kamienia łupanego, przęsła żaluzjowe w antracycie',
                 'Ogrodzenie frontowe ze słupkami z kamienia łupanego i przęsłami żaluzjowymi w antracycie')
GRUPA_GRZEBIEN = ([27, 29, 30, 31, 38, 43, 46, 47],
                  'Ogrodzenie frontowe grzebieniowe: kamienne słupki i poziome profile',
                  'Ogrodzenie frontowe grzebieniowe z kamiennymi słupkami i poziomymi profilami')

FILMY = [
    {
        'slug': 'ogrodzenie-frontowe-grzebieniowe',
        'kind': 'wideo',
        'name': 'Ogrodzenie frontowe grzebieniowe z bramą wjazdową',
        'description': 'Poziome profile grzebieniowe w czerni między słupkami z kamienia, '
                       'brama wjazdowa i furtka w jednej linii ogrodzenia.',
        'system': 'Ogrodzenia frontowe',
        'uploadDate': '2026-10-13',
        'duration': 'PT0M48S',
        'width': 1024,
        'height': 576,
        'poster': '/media/wideo/ogrodzenie-frontowe-grzebieniowe.jpg',
        'sources': [{'src': '/media/wideo/ogrodzenie-frontowe-grzebieniowe.mp4', 'type': 'video/mp4'}],
        'captions': '',
        'youtube': '',
        'keyMoments': [],
        'transcript': '',
        'tags': ['frontowe', 'bramy-przesuwne'],
    },
    {
        'slug': 'ogrodzenie-frontowe-zaluzjowe',
        'kind': 'wideo',
        'name': 'Ogrodzenie frontowe żaluzjowe ze słupkami z kamienia',
        'description': 'Przęsła żaluzjowe w antracycie między słupkami z kamienia łupanego, '
                       'z bramą i furtką, na gotowej podmurówce.',
        'system': 'Ogrodzenia frontowe',
        'uploadDate': '2026-10-13',
        'duration': 'PT0M29S',
        'width': 1024,
        'height': 576,
        'poster': '/media/wideo/ogrodzenie-frontowe-zaluzjowe.jpg',
        'sources': [{'src': '/media/wideo/ogrodzenie-frontowe-zaluzjowe.mp4', 'type': 'video/mp4'}],
        'captions': '',
        'youtube': '',
        'keyMoments': [],
        'transcript': '',
        'tags': ['frontowe'],
    },
    {
        'slug': 'ogrodzenie-frontowe-slupki-tynkowane',
        'kind': 'wideo',
        'name': 'Ogrodzenie frontowe ze słupkami tynkowanymi',
        'description': 'Słupki i murki frontowe tynkowane na biało, przygotowane pod bramę '
                       'wjazdową i furtkę.',
        'system': 'Ogrodzenia frontowe',
        'uploadDate': '2026-10-13',
        'duration': 'PT0M28S',
        'width': 1024,
        'height': 576,
        'poster': '/media/wideo/ogrodzenie-frontowe-slupki-tynkowane.jpg',
        'sources': [{'src': '/media/wideo/ogrodzenie-frontowe-slupki-tynkowane.mp4', 'type': 'video/mp4'}],
        'captions': '',
        'youtube': '',
        'keyMoments': [],
        'transcript': '',
        'tags': ['frontowe'],
    },
    {
        'slug': 'slupki-frontowe-domofon',
        'kind': 'wideo',
        'name': 'Słupek frontowy z domofonem i skrzynką na listy',
        'description': 'Murowany słupek frontowy wykończony tynkiem, z domofonem i skrzynką '
                       'na listy obok furtki.',
        'system': 'Ogrodzenia frontowe',
        'uploadDate': '2026-10-13',
        'duration': 'PT0M13S',
        'width': 1024,
        'height': 576,
        'poster': '/media/wideo/slupki-frontowe-domofon.jpg',
        'sources': [{'src': '/media/wideo/slupki-frontowe-domofon.mp4', 'type': 'video/mp4'}],
        'captions': '',
        'youtube': '',
        'keyMoments': [],
        'transcript': '',
        'tags': ['frontowe', 'furtki'],
    },
]

SEKCJA_FILM = {
    'type': 'video',
    'eyebrow': 'Wideo z realizacji',
    'title': 'Zobacz gotowy front w ruchu',
    'name': 'Ogrodzenie frontowe grzebieniowe z bramą wjazdową',
    'poster': '/media/wideo/ogrodzenie-frontowe-grzebieniowe.jpg',
    'alt': 'Ogrodzenie frontowe grzebieniowe z kamiennymi słupkami i bramą wjazdową',
    'url': '/media/wideo/ogrodzenie-frontowe-grzebieniowe.mp4',
}


def wczytaj(sciezka: str):
    return json.loads(pathlib.Path(sciezka).read_text(encoding='utf-8'))


def zapisz(sciezka: str, dane) -> None:
    pathlib.Path(sciezka).write_text(
        json.dumps(dane, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def mapowanie() -> dict[int, str]:
    with CSV_MAPOWANIE.open(encoding='utf-8') as f:
        return {int(wiersz['numer_zrodlowy']): wiersz['plik_w_serwisie'] for wiersz in csv.DictReader(f)}


def pozycja(numer: int) -> tuple[str, str]:
    if numer in GRUPA_GRZEBIEN[0]:
        return GRUPA_GRZEBIEN[1], GRUPA_GRZEBIEN[2]
    return GRUPA_ZALUZJE[1], GRUPA_ZALUZJE[2]


def element_galerii(numer: int, plik: str) -> dict:
    podpis, alt = pozycja(numer)
    return {
        'image': f'/images/frontowe/{plik}',
        'caption': podpis,
        'alt': alt,
        'tags': ['frontowe'],
    }


def main() -> None:
    mapa = mapowanie()
    print(f'zdjec w mapowaniu: {len(mapa)}')

    # 1. Galeria realizacji
    galeria = wczytaj('src/data/gallery.json')
    znane = {i['image'] for i in galeria['items']}
    dodane = 0
    for numer in sorted(mapa):
        element = element_galerii(numer, mapa[numer])
        if element['image'] in znane:
            continue
        galeria['items'].append(element)
        dodane += 1
    zapisz('src/data/gallery.json', galeria)
    print(f'gallery.json: dodano {dodane} zdjec, razem {len(galeria["items"])}')

    # 2. Filmy
    media = wczytaj('src/data/media.json')
    media['videos'] = FILMY
    zapisz('src/data/media.json', media)
    print(f'media.json: {len(FILMY)} filmow')

    # 3. Strona ogrodzen frontowych
    frontowe = wczytaj('src/data/pages/ogrodzenia-frontowe.json')
    frontowe['heroImage'] = '/images/frontowe/hero-frontowe.jpg'
    for blok in frontowe['blocks']:
        if blok['type'] == 'gallery':
            blok['items'] = [element_galerii(n, mapa[n]) for n in sorted(mapa)]
            blok['intro'] = ('Zdjęcia z naszych realizacji ogrodzeń frontowych: słupki z kamienia '
                             'lub tynkowane, przęsła żaluzjowe i grzebieniowe, bramy i furtki.')
    zapisz('src/data/pages/ogrodzenia-frontowe.json', frontowe)
    print('ogrodzenia-frontowe.json: nowy naglowek i 32 zdjecia w galerii')

    # 4. Strona realizacji
    realizacje = wczytaj('src/data/pages/realizacje.json')
    realizacje['heroImage'] = '/images/frontowe/hero-realizacje.jpg'
    zapisz('src/data/pages/realizacje.json', realizacje)
    print('realizacje.json: nowy naglowek')

    # 5. Strona glowna
    home = wczytaj('src/data/pages/home.json')
    home['heroImage'] = '/images/frontowe/hero-glowna.jpg'
    nowe = []
    for blok in home['blocks']:
        if blok['type'] == 'gallery':
            blok['items'] = [element_galerii(n, mapa[n]) for n in NA_GLOWNA if n in mapa]
            blok['intro'] = ('Zdjęcia z naszych realizacji: system, kolor i szczegóły montażu. '
                             'Pełna galeria jest na stronie realizacji.')
        if blok['type'] == 'reels':
            nowe.append(SEKCJA_FILM)
            continue
        nowe.append(blok)
    home['blocks'] = nowe
    zapisz('src/data/pages/home.json', home)
    print('home.json: nowy naglowek, 8 zdjec w realizacjach, sekcja z filmem zamiast rolek')


if __name__ == '__main__':
    main()