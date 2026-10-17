#!/usr/bin/env python3
"""
Przetwarza zdjecia z realizacji przyslane przez klienta (1.zip i 2.zip) i wpina je w serwis.

Wejscie:  /home/ubuntu/realizacje-klienta/zbior1/*  (zbior2 to duplikat, wiec go pomijamy)
Wyjscie:  public/images/realizacje/foto-01..17.jpg  (zdjecia 900 px)
          public/images/realizacje/hero-*.jpg        (naglowki stron kategorii, 16:9)
          raport/realizacje-mapowanie.csv            (mapowanie na pliki zrodlowe)

Uruchomienie:
    python3 scripts/realizacje-z-archiwum.py
"""
from __future__ import annotations

import csv
import glob
import json
import pathlib
import re
import sys

from PIL import Image, ImageFilter

ZRODLO = pathlib.Path('/home/ubuntu/realizacje-klienta')
OUT = pathlib.Path('public/images/realizacje')
RAPORT = pathlib.Path('raport/realizacje-mapowanie.csv')

# numer w indeksie arkusza -> (tagi w galerii, podpis, tekst alternatywny)
WYBRANE: dict[int, tuple[list[str], str, str]] = {
    4:  (['frontowe'], 'Ogrodzenie z profili drewnopodobnych między słupkami z kamienia',
         'Ogrodzenie z poziomych profili drewnopodobnych między kamiennymi słupkami'),
    6:  (['bramy-przesuwne', 'furtki', 'frontowe'], 'Brama przesuwna z furtką i przęsłami, podjazd z kostki',
         'Brama przesuwna z furtką i przęsłami przy podjeździe z kostki brukowej'),
    12: (['panelowe'], 'Czarne przęsła żaluzjowe wzdłuż ulicy, dom jednorodzinny w tle',
         'Czarne przęsła żaluzjowe wzdłuż ulicy przy domu jednorodzinnym'),
    16: (['panelowe', 'frontowe'], 'Ogrodzenie grzebieniowe z kamiennym słupkiem i żywopłotem',
         'Ogrodzenie grzebieniowe z kamiennym słupkiem i żywopłotem od strony drogi'),
    22: (['panelowe'], 'Długie ogrodzenie grzebieniowe od strony drogi',
         'Długie ogrodzenie grzebieniowe biegnące wzdłuż drogi'),
    27: (['panelowe', 'frontowe'], 'Jasne przęsła między słupkami z kamienia, trawnik i podjazd',
         'Jasne przęsła między słupkami z kamienia przy trawniku i podjeździe'),
    31: (['panelowe'], 'Ciemne przęsła żaluzjowe wzdłuż elewacji domu',
         'Ciemne przęsła żaluzjowe wzdłuż elewacji domu jednorodzinnego'),
    32: (['panelowe'], 'Zbliżenie: przęsła żaluzjowe i słupki tynkowane',
         'Zbliżenie na przęsła żaluzjowe i słupki tynkowane ogrodzenia'),
    35: (['podmurowki'], 'Mur z bloczków łupanych na podmurówce, trawnik',
         'Mur ogrodzeniowy z bloczków łupanych na podmurówce betonowej'),
    42: (['podmurowki'], 'Mur z bloczków łupanych wzdłuż ogrodzenia',
         'Mur z bloczków łupanych wzdłuż linii ogrodzenia'),
    46: (['panelowe', 'frontowe'], 'Dom z ogrodzeniem i podjazdem z kostki',
         'Dom jednorodzinny z ogrodzeniem i podjazdem z kostki brukowej'),
    47: (['frontowe', 'palisadowe'], 'Zestaw frontowy: brama i przęsła na skarpie',
         'Zestaw frontowy z bramą i przęsłami na skarpie przy nowym domu'),
    49: (['bramy-skrzydlowe'], 'Brama skrzydłowa z poziomych profili, widok na podjazd',
         'Brama skrzydłowa z poziomych profili z widokiem na podjazd'),
    51: (['bramy-skrzydlowe', 'panelowe'], 'Brama skrzydłowa i przęsła panelowe na działce',
         'Brama skrzydłowa i przęsła panelowe na działce'),
    52: (['bramy-skrzydlowe'], 'Brama skrzydłowa przy domu z podjazdem',
         'Brama skrzydłowa przy domu z podjazdem'),
    56: (['panelowe'], 'Czarne panele przy białej elewacji, podjazd',
         'Czarne panele ogrodzeniowe przy białej elewacji domu'),
    57: (['podmurowki'], 'Podmurówka betonowa 250x25 pod ogrodzenie panelowe',
         'Podmurówka betonowa 250x25 pod ogrodzenie panelowe'),
}

# naglowki stron kategorii: numer -> (nazwa pliku, strona w danych)
HERO = {
    6: ('hero-bramy.jpg', 'src/data/pages/bramy-wjazdowe-przesuwne.json'),
    16: ('hero-panelowe.jpg', 'src/data/pages/ogrodzenia-panelowe.json'),
    35: ('hero-podmurowki.jpg', 'src/data/pages/podmurowki-betonowe.json'),
}

# galeria na stronie glownej: 4 nowe zdjecia + 4 wczesniejsze frontowe (bez powtorzen z naglowkami)
GLOWNA_NOWE = [16, 6, 22, 31]
GLOWNA_FRONTOWE = ['frontowe-18.jpg', 'frontowe-25.jpg', 'frontowe-30.jpg', 'frontowe-32.jpg']

PROG_JAKOSCI = 80


def zrodla() -> list[pathlib.Path]:
    """Unikalne zdjecia w kolejnosci indeksu (zbior2 to duplikat zbior1)."""
    pliki = sorted(p for p in glob.glob(str(ZRODLO / 'zbior1' / '*'))
                   if p.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')))
    return [pathlib.Path(p) for p in pliki]


def wyostrz(im: Image.Image) -> Image.Image:
    return im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=58, threshold=3))


def przygotuj_zdjecie(sciezka: pathlib.Path, szerokosc: int) -> Image.Image:
    im = Image.open(sciezka).convert('RGB')
    if im.size[0] > szerokosc:
        im = im.resize((szerokosc, round(im.size[1] * szerokosc / im.size[0])), Image.LANCZOS)
    return wyostrz(im)


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    pliki = zrodla()
    print(f'zdjec w zbiorze zrodlowym: {len(pliki)}')

    mapowanie: list[tuple[str, int, str]] = []
    for indeks, (numer, (tagi, podpis, alt)) in enumerate(sorted(WYBRANE.items()), start=1):
        zrodlo = pliki[numer - 1]
        nazwa = f'foto-{indeks:02d}.jpg'
        przygotuj_zdjecie(zrodlo, 900).save(OUT / nazwa, 'JPEG', quality=PROG_JAKOSCI,
                                            optimize=True, progressive=True)
        mapowanie.append((nazwa, numer, zrodlo.name))
        print(f'  {nazwa} <- {zrodlo.name}  [{", ".join(tagi)}]')

    for numer, (nazwa, _) in HERO.items():
        im = przygotuj_zdjecie(pliki[numer - 1], 1080)
        szer, wys = im.size
        docelowa = round(szer * 9 / 16)
        gora = max(0, (wys - docelowa) // 2)
        im = im.crop((0, gora, szer, gora + docelowa)).resize((1080, 608), Image.LANCZOS)
        im.save(OUT / nazwa, 'JPEG', quality=86, optimize=True, progressive=True)
        print(f'  naglowek: {nazwa} (z {pliki[numer - 1].name})')

    RAPORT.parent.mkdir(parents=True, exist_ok=True)
    with RAPORT.open('w', newline='', encoding='utf-8') as f:
        pisarz = csv.writer(f)
        pisarz.writerow(['plik_w_serwisie', 'numer_w_arkuszu', 'plik_zrodlowy'])
        pisarz.writerows(mapowanie)
    print(f'raport: {RAPORT}')

    # --- wpiecie w dane serwisu ---
    galeria = json.loads(pathlib.Path('src/data/gallery.json').read_text(encoding='utf-8'))
    znane = {i['image'] for i in galeria['items']}
    nowe_galeria = []
    for indeks, (numer, (tagi, podpis, alt)) in enumerate(sorted(WYBRANE.items()), start=1):
        element = {'image': f'/images/realizacje/foto-{indeks:02d}.jpg',
                   'caption': podpis, 'alt': alt, 'tags': tagi}
        if element['image'] not in znane:
            galeria['items'].append(element)
            nowe_galeria.append(element)
    pathlib.Path('src/data/gallery.json').write_text(
        json.dumps(galeria, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'gallery.json: dodano {len(nowe_galeria)} zdjec, razem {len(galeria["items"])}')

    for numer, (nazwa, strona) in HERO.items():
        sciezka = pathlib.Path(strona)
        dane = json.loads(sciezka.read_text(encoding='utf-8'))
        dane['heroImage'] = f'/images/realizacje/{nazwa}'
        sciezka.write_text(json.dumps(dane, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(f'{sciezka.name}: naglowek -> {nazwa}')

    home = json.loads(pathlib.Path('src/data/pages/home.json').read_text(encoding='utf-8'))
    podpis_wg_numeru = {n: v[1] for n, v in WYBRANE.items()}
    alt_wg_numeru = {n: v[2] for n, v in WYBRANE.items()}
    tagi_wg_numeru = {n: v[0] for n, v in WYBRANE.items()}
    pozycja_numeru = {n: i for i, n in enumerate(sorted(WYBRANE), start=1)}
    elementy = [{'image': f"/images/realizacje/foto-{pozycja_numeru[n]:02d}.jpg",
                 'caption': podpis_wg_numeru[n], 'alt': alt_wg_numeru[n],
                 'tags': tagi_wg_numeru[n]} for n in GLOWNA_NOWE]
    podpisy_frontowe = {i['image'].split('/')[-1]: i for i in galeria['items']
                        if '/images/frontowe/' in i['image']}
    for nazwa in GLOWNA_FRONTOWE:
        if nazwa in podpisy_frontowe:
            elementy.append(podpisy_frontowe[nazwa])
    for blok in home['blocks']:
        if blok['type'] == 'gallery':
            blok['items'] = elementy
    pathlib.Path('src/data/pages/home.json').write_text(
        json.dumps(home, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'home.json: galeria na stronie glownej = {len(elementy)} zdjec')
    return 0


if __name__ == '__main__':
    sys.exit(main())