#!/usr/bin/env python3
"""
Przetwarza materialy klienta (zdjecia z ogrodzenia-frontowe.pl oraz filmy MP4)
na pliki gotowe do publikacji w serwisie.

Wejscie:  /home/ubuntu/zrodlo/foto/            (pobrane zdjecia i filmy z drugiej strony)
Wyjscie:  public/images/frontowe/              (zdjecia 1080x800, hero 16:9)
          public/media/wideo/                  (filmy MP4 + miniatury JPG 16:9)
          raport/frontowe-mapowanie.csv        (mapowanie nowych nazw na oryginaly)

Uruchomienie:
    python3 scripts/przetworz-materialy.py
"""
from __future__ import annotations

import csv
import json
import pathlib
import re
import shutil
import subprocess
import sys

from PIL import Image, ImageFilter

ZRODLO = pathlib.Path('/home/ubuntu/zrodlo/foto')
FOTO_OUT = pathlib.Path('public/images/frontowe')
WIDEO_OUT = pathlib.Path('public/media/wideo')
RAPORT = pathlib.Path('raport/frontowe-mapowanie.csv')

# Zdjecia wybrane do publikacji (numer z nazwy pliku zrodlowego).
# Odrzucone: kadry z gruntem, rurami, niedokonczonymi murami i ujeciami detali
# bez wartosci ofertowej (2, 3, 7, 20-26, 28, 32, 37, 41, 45, 48, 49, 50).
WYBRANE = [1, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
           27, 29, 30, 31, 33, 34, 35, 36, 38, 39, 40, 42, 43, 44, 46, 47]

# Zdjecia na naglowki stron (numer zrodlowy, nazwa docelowa).
HERO = {12: 'hero-glowna.jpg', 13: 'hero-frontowe.jpg'}

# Filmy: numer z nazwy WhatsApp, docelowa nazwa, czas trwania, opis kadru.
FILMY = [
    ('0118', 'ogrodzenie-frontowe-zaluzjowe', 28.6,
     'Przęsła żaluzjowe w antracycie ze słupkami z kamienia łupanego.'),
    ('0122', 'ogrodzenie-frontowe-slupki-tynkowane', 28.0,
     'Słupki i murki frontowe tynkowane na biało, przygotowane pod bramę i furtkę.'),
    ('0125', 'slupki-frontowe-domofon', 12.8,
     'Słupek frontowy z domofonem i skrzynką na listy.'),
    ('0165', 'ogrodzenie-frontowe-grzebieniowe', 48.0,
     'Ogrodzenie grzebieniowe z kamiennymi słupkami i bramą wjazdową.'),
]

PROG_JAKOSCI = 80          # jakosc JPEG dla zdjec
SZEROKOSC_HERO = 1080      # hero: 1080 x 608 (16:9) bez powiekszania
CRF = 25                   # jakosc H.264 dla filmow


def zdjecie_zrodlowe(numer: int) -> pathlib.Path:
    return ZRODLO / f'Ogrodzenia-frontowe-EuroFance-{numer}.jpg'


def wyostrz(im: Image.Image) -> Image.Image:
    return im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=58, threshold=3))


def przetworz_zdjecia() -> list[tuple[str, int]]:
    FOTO_OUT.mkdir(parents=True, exist_ok=True)
    mapowanie: list[tuple[str, int]] = []
    for indeks, numer in enumerate(WYBRANE, start=1):
        zrodlo = zdjecie_zrodlowe(numer)
        if not zrodlo.exists():
            print(f'  brak pliku: {zrodlo.name}, pomijam')
            continue
        im = Image.open(zrodlo).convert('RGB')
        # Siatka galerii i karty nie potrzebuja pelnych 1080 px, a plik jest o polowe lzejszy.
        if im.size[0] > 900:
            im = im.resize((900, round(im.size[1] * 900 / im.size[0])), Image.LANCZOS)
        im = wyostrz(im)
        nazwa = f'frontowe-{indeks:02d}.jpg'
        im.save(FOTO_OUT / nazwa, 'JPEG', quality=PROG_JAKOSCI, optimize=True, progressive=True)
        mapowanie.append((nazwa, numer))
    print(f'zdjecia: {len(mapowanie)} plikow w {FOTO_OUT}')
    return mapowanie


def przetworz_hero() -> None:
    for numer, nazwa in HERO.items():
        zrodlo = zdjecie_zrodlowe(numer)
        if not zrodlo.exists():
            print(f'  brak hero: {zrodlo.name}')
            continue
        im = Image.open(zrodlo).convert('RGB')
        szer, wys = im.size
        docelowa_wys = round(szer * 9 / 16)
        gora = max(0, (wys - docelowa_wys) // 2)
        im = im.crop((0, gora, szer, gora + docelowa_wys))
        im = im.resize((SZEROKOSC_HERO, round(SZEROKOSC_HERO * 9 / 16)), Image.LANCZOS)
        im = wyostrz(im)
        im.save(FOTO_OUT / nazwa, 'JPEG', quality=86, optimize=True, progressive=True)
        print(f'hero: {nazwa} ({im.size[0]}x{im.size[1]})')


def przetworz_filmy() -> list[dict]:
    WIDEO_OUT.mkdir(parents=True, exist_ok=True)
    if shutil.which('ffmpeg') is None:
        print('brak ffmpeg, pomijam filmy')
        return []
    wpisy = []
    for numer, slug, dlugosc, opis in FILMY:
        zrodlo = ZRODLO / f'VID-20260505-WA{numer}.mp4'
        if not zrodlo.exists():
            print(f'  brak filmu: {zrodlo.name}')
            continue
        mp4 = WIDEO_OUT / f'{slug}.mp4'
        plakat = WIDEO_OUT / f'{slug}.jpg'
        subprocess.run([
            'ffmpeg', '-v', 'error', '-y', '-i', str(zrodlo),
            '-vf', 'scale=1024:576:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow',
            '-crf', str(CRF), '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
            '-c:a', 'aac', '-b:a', '96k', str(mp4),
        ], check=True)
        subprocess.run([
            'ffmpeg', '-v', 'error', '-y', '-ss', '2', '-i', str(mp4),
            '-frames:v', '1', '-q:v', '4', str(plakat),
        ], check=True)
        rozmiar = mp4.stat().st_size / (1024 * 1024)
        print(f'film: {slug}.mp4 ({rozmiar:.1f} MB) + plakat {plakat.name}')
        wpisy.append({
            'slug': slug,
            'kind': 'wideo',
            'name': opis,
            'duration_s': dlugosc,
        })
    return wpisy


def iso(dlugosc: float) -> str:
    sekundy = int(round(dlugosc))
    return f'PT{sekundy // 60}M{sekundy % 60}S'


def main() -> int:
    print('--- zdjecia ---')
    mapowanie = przetworz_zdjecia()
    print('--- naglowki stron ---')
    przetworz_hero()
    print('--- filmy ---')
    filmy = przetworz_filmy()

    RAPORT.parent.mkdir(parents=True, exist_ok=True)
    with RAPORT.open('w', newline='', encoding='utf-8') as f:
        pisarz = csv.writer(f)
        pisarz.writerow(['plik_w_serwisie', 'numer_zrodlowy', 'adres_zrodlowy'])
        for nazwa, numer in mapowanie:
            pisarz.writerow([nazwa, numer,
                             f'https://ogrodzenia-frontowe.pl/wp-content/uploads/2026/05/'
                             f'Ogrodzenia-frontowe-EuroFance-{numer}.jpg'])
    print(f'raport: {RAPORT}')

    if filmy:
        print('--- gotowe wpisy filmow (do src/data/media.json) ---')
        for w in filmy:
            print(json.dumps({
                'slug': w['slug'],
                'kind': 'wideo',
                'name': w['name'],
                'duration': iso(w['duration_s']),
                'width': 1024,
                'height': 576,
                'poster': f"/media/wideo/{w['slug']}.jpg",
                'sources': [{'src': f"/media/wideo/{w['slug']}.mp4", 'type': 'video/mp4'}],
            }, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    sys.exit(main())