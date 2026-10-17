#!/usr/bin/env python3
"""
Przepakowuje rolki wgrane przez klienta na botkama.pl do wersji webowych i wpina je w serwis.

Pliki z serwera maja 21-50 Mb/s i 48-126 MB (materialy 4K), wiec nie nadaja sie do odtwarzania
na stronie. Skrypt robi z nich MP4 1080x1920 po ok. 2-3 Mb/s, generuje plakaty i wpina je
w src/data/media.json oraz w sekcje rolek na stronie glownej.

Wejscie:  /home/ubuntu/rolki-zrodlo/*.mp4
Wyjscie:  public/media/rolki/<slug>.mp4 + <slug>.jpg

Uruchomienie:
    python3 scripts/rolki-z-serwera.py
"""
from __future__ import annotations

import json
import pathlib
import shutil
import subprocess
import sys

ZRODLO = pathlib.Path('/home/ubuntu/rolki-zrodlo')
OUT = pathlib.Path('public/media/rolki')

# (plik zrodlowy, slug, tytul H1, opis, tytul SEO, tagi w galerii)
ROLKI = [
    ('KONTROLER_AREK.mp4', 'inspektor-ogrodzen-o-realizacji',
     'Arkadiusz Wrzosek, inspektor ds. ogrodzeń, o realizacji na budowie',
     'Nasz inspektor ds. ogrodzeń pokazuje na budowie, jak wygląda realizacja ogrodzenia '
     'i na co zwracamy uwagę przy montażu.',
     'Inspektor ogrodzeń o montażu | Eurofance', ['frontowe']),
    ('najnizszacenawpolsce.mp4', 'cena-i-jakosc-ogrodzen',
     'Cena i jakość ogrodzeń: o czym warto pamiętać',
     'Krótko o tym, jak wygląda nasza oferta i co składa się na jakość ogrodzenia '
     'poza samą ceną.',
     'Cena i jakość ogrodzeń | Eurofance', ['panelowe']),
    ('reklama_1_eurofance.mp4', 'kompleksowa-realizacja-ogrodzen',
     'Kompleksowa realizacja ogrodzeń w Eurofance',
     'Ogrodzenia, bramy, furtki i montaż w jednym miejscu, z własnej produkcji '
     'i własną malarnią proszkową.',
     'Kompleksowa realizacja ogrodzeń | Eurofance', ['frontowe']),
    ('reklama_3_eurofance.mp4', 'szybka-wycena-i-terminy',
     'Szybka wycena i dostępne terminy montażu',
     'Jak szybko dostajesz wycenę z montażem i na kiedy możemy zaplanować realizację.',
     'Szybka wycena i terminy montażu | Eurofance', ['panelowe']),
]

CRF = 24                # jakosc obrazu
MAXRATE = '2800k'       # limit pasma - pilnuje, zeby rolka byla lekka
AUDIO = '128k'
UPLOAD_DATE = '2026-10-13'


def iso(dlugosc: float) -> str:
    s = int(round(dlugosc))
    return f'PT{s // 60}M{s % 60}S'


def dlugosc_pliku(sciezka: pathlib.Path) -> float:
    wynik = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(sciezka)],
        capture_output=True, text=True, check=True)
    return float(wynik.stdout.strip())


def przepakuj(zrodlo: pathlib.Path, slug: str) -> float:
    mp4 = OUT / f'{slug}.mp4'
    plakat = OUT / f'{slug}.jpg'
    subprocess.run([
        'ffmpeg', '-v', 'error', '-y', '-i', str(zrodlo),
        '-vf', 'scale=1080:1920:flags=lanczos',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', str(CRF),
        '-maxrate', MAXRATE, '-bufsize', '5600k', '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart', '-c:a', 'aac', '-b:a', AUDIO, str(mp4),
    ], check=True)
    subprocess.run([
        'ffmpeg', '-v', 'error', '-y', '-ss', '2', '-i', str(mp4),
        '-frames:v', '1', '-q:v', '3', str(plakat),
    ], check=True)
    return dlugosc_pliku(mp4)


def main() -> int:
    if shutil.which('ffmpeg') is None:
        print('brak ffmpeg')
        return 1
    OUT.mkdir(parents=True, exist_ok=True)

    wpisy = []
    for plik, slug, nazwa, opis, seo, tagi in ROLKI:
        zrodlo = ZRODLO / plik
        if not zrodlo.exists():
            print(f'  brak pliku {plik}, pomijam')
            continue
        dlugosc = przepakuj(zrodlo, slug)
        rozmiar = (OUT / f'{slug}.mp4').stat().st_size / (1024 * 1024)
        print(f'  {slug}.mp4: {rozmiar:.1f} MB, {dlugosc:.1f} s (zrodlo {zrodlo.stat().st_size // 1048576} MB)')
        wpisy.append({
            'slug': slug, 'kind': 'rolka', 'name': nazwa, 'description': opis,
            'seoTitle': seo, 'system': 'Ogrodzenia i bramy', 'uploadDate': UPLOAD_DATE,
            'duration': iso(dlugosc), 'width': 1080, 'height': 1920,
            'poster': f'/media/rolki/{slug}.jpg',
            'sources': [{'src': f'/media/rolki/{slug}.mp4', 'type': 'video/mp4'}],
            'captions': '', 'youtube': '', 'keyMoments': [], 'transcript': '', 'tags': tagi,
        })

    media = json.loads(pathlib.Path('src/data/media.json').read_text(encoding='utf-8'))
    media['reels'] = wpisy
    pathlib.Path('src/data/media.json').write_text(
        json.dumps(media, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'media.json: {len(wpisy)} rolek')

    home = json.loads(pathlib.Path('src/data/pages/home.json').read_text(encoding='utf-8'))
    sekcja = {
        'type': 'reels',
        'eyebrow': 'Rolki',
        'title': 'Zobacz nas w krótkich materiałach',
        'intro': 'Krótkie rolki z budowy i z naszej codziennej pracy. Kliknij, żeby obejrzeć '
                 'z dźwiękiem na stronie materiału.',
        'ctaText': 'Chcę wycenę takiego ogrodzenia',
        'items': [{'name': w['name'], 'description': w['description'],
                   'poster': w['poster'], 'url': f"/wideo/{w['slug']}"} for w in wpisy],
    }
    bloki = [b for b in home['blocks'] if b['type'] != 'reels']
    if wpisy:
        # sekcja rolek zaraz po sekcji z filmem
        indeks = next((i for i, b in enumerate(bloki) if b['type'] == 'video'), len(bloki) - 1)
        bloki.insert(indeks + 1, sekcja)
    home['blocks'] = bloki
    pathlib.Path('src/data/pages/home.json').write_text(
        json.dumps(home, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('home.json: sekcja rolek dodana')
    return 0


if __name__ == '__main__':
    sys.exit(main())