#!/usr/bin/env python3
"""Doprowadza meta description do dlugosci 140 do 160 znakow PO podmianie tokenow.

Tokeny w rodzaju {panel_3d_mb} albo {telefon} rozwijaja sie do konkretnych wartosci
dopiero podczas budowania, dlatego dlugosc liczymy na tekscie po podmianie.

Uruchomienie: python3 scripts/popraw-meta.py
"""
import glob
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIN_LEN = 140
MAX_LEN = 160
TOKEN = re.compile(r'\{([a-z0-9_]+)\}', re.I)

DODATKI = [
    ' Wycena i montaż w całej Polsce, gwarancja 5 lat.',
    ' Sprawdź ceny i warunki realizacji.',
    ' Zadzwoń i odbierz wycenę w 24 h.',
]

with open(os.path.join(ROOT, 'src', 'data', 'prices.json'), encoding='utf-8') as handle:
    PRICES = json.load(handle)
with open(os.path.join(ROOT, 'src', 'data', 'site.json'), encoding='utf-8') as handle:
    SITE = json.load(handle)

MAPA = {**PRICES.get('values', {}), **PRICES.get('examples', {})}
MAPA.update({
    'telefon': SITE['phone']['display'],
    'telefon_short': SITE['phone']['short'],
    'email': SITE['email'],
    'gwarancja': SITE['warranty'],
    'ocena': str(SITE['googleRating']['value']),
    'liczba_opinii': str(SITE['googleRating']['count']),
    'godziny': SITE['hours']['line'],
    'miasto_produkcji': SITE['address']['city'],
    'czas_odpowiedzi': SITE['stats']['responseTime'],
    'czas_produkcji': SITE['stats']['productionDays'],
    'czas_montazu': SITE['stats']['montageDays'],
    'czas_pomiaru': SITE['stats']['pomiarDays'],
    'czas_dostawy': SITE['stats']['deliveryDays'],
    'lata': str(SITE['stats']['years']),
    'realizacje': str(SITE['stats']['realizacje']),
    'ekipy': str(SITE['stats']['teams']),
    'km_rocznie': str(SITE['stats']['kmPerYear']),
    'aktualizacja': PRICES.get('updated', ''),
})


def rozwin(text):
    return TOKEN.sub(lambda m: MAPA.get(m.group(1).lower(), m.group(0)), text)


def skroc_do(text, limit):
    """Skraca tekst tak, aby po podmianie tokenow nie przekraczal limitu."""
    if len(rozwin(text)) <= limit:
        return text
    slowa = text.split(' ')
    while len(slowa) > 3 and len(rozwin(' '.join(slowa))) > limit:
        slowa.pop()
    return ' '.join(slowa).rstrip(' ,.;') + '.'


def dopasuj(meta):
    if not isinstance(meta, str) or not meta.strip():
        return meta
    tekst = meta.strip()
    for dodatek in DODATKI:
        if len(rozwin(tekst)) >= MIN_LEN:
            break
        tekst = tekst.rstrip(' .') + '.' + dodatek
    return skroc_do(tekst, MAX_LEN)


def typ_sciezki(path):
    name = os.path.basename(path)
    if name == 'products.json':
        return 'produkt'
    return 'strona'


def popraw_plik(path):
    with open(path, encoding='utf-8') as handle:
        dane = json.load(handle)
    zmiany = 0

    def obsluz(obiekt):
        nonlocal zmiany
        if not isinstance(obiekt, dict):
            return
        meta = obiekt.get('metaDescription')
        if not isinstance(meta, str) or not meta.strip():
            return
        nowa = dopasuj(meta)
        if nowa != meta:
            obiekt['metaDescription'] = nowa
            zmiany += 1

    if isinstance(dane, list):
        for obiekt in dane:
            obsluz(obiekt)
    else:
        obsluz(dane)
        for wartosc in dane.values():
            if isinstance(wartosc, list):
                for obiekt in wartosc:
                    obsluz(obiekt)

    if zmiany:
        with open(path, 'w', encoding='utf-8') as handle:
            json.dump(dane, handle, ensure_ascii=False, indent=2)
            handle.write('\n')
    return zmiany


def main():
    pliki = [os.path.join(ROOT, 'src', 'data', 'products.json')]
    pliki += sorted(glob.glob(os.path.join(ROOT, 'src', 'data', 'pages', '*.json')))
    pliki += [os.path.join(ROOT, 'src', 'data', 'blog', 'categories.json')]
    pliki += sorted(glob.glob(os.path.join(ROOT, 'src', 'data', 'blog', 'encyklopedia', '*.json')))
    razem = 0
    for path in pliki:
        if not os.path.exists(path):
            continue
        liczba = popraw_plik(path)
        if liczba:
            print(f'{os.path.relpath(path, ROOT)}: poprawiono {liczba}')
        razem += liczba
    print(f'Razem poprawionych opisow: {razem}')


if __name__ == '__main__':
    main()