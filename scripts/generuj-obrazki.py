#!/usr/bin/env python3
"""Generuje obrazki zastepcze (SVG) dla wszystkich sciezek /images/... uzywanych w danych.

Obrazki zastepcze sa lekkie (kilka kB), maja prawidlowe wymiary, wiec uklad strony
i Core Web Vitals sa poprawne jeszcze przed wgraniem prawdziwych zdjec.

PRZED PUBLIKACJA: podmien pliki na prawdziwe zdjecia w WebP/AVIF (do 200 KB),
zachowujac te same nazwy plikow albo aktualizujac sciezki w plikach JSON w src/data.

Uruchomienie: python3 scripts/generuj-obrazki.py
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'src', 'data')
PUBLIC = os.path.join(ROOT, 'public')

SIZES = [
    ('/images/hero-', 1600, 900),
    ('/images/realizacje/', 1200, 900),
    ('/images/produkt-', 1200, 900),
    ('/images/blog/', 1200, 630),
    ('/images/rolki/', 540, 960),
    ('/images/og-', 1200, 630),
]

GRAPHITE = '#1f2429'
GRAPHITE_SOFT = '#2c333a'
RED = '#e80c0c'


def size_for(path):
    for prefix, width, height in SIZES:
        if path.startswith(prefix):
            return width, height
    return 1200, 900


def label_for(path):
    name = path.rsplit('/', 1)[-1].replace('.svg', '')
    name = re.sub(r'[-_]+', ' ', name)
    return name.upper()


def placeholder_svg(path):
    width, height = size_for(path)
    label = label_for(path)
    note = 'Obrazek zastepczy. Podmien na zdjecie WebP/AVIF.'
    font_big = int(height * 0.075)
    font_small = int(height * 0.032)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" role="img" aria-label="{label}">
  <rect width="{width}" height="{height}" fill="{GRAPHITE}"/>
  <rect x="0" y="0" width="{width}" height="{max(6, int(height * 0.012))}" fill="{RED}"/>
  <g fill="none" stroke="{GRAPHITE_SOFT}" stroke-width="2">
    <path d="M0 {int(height * 0.62)} H{width}"/>
    <path d="M0 {int(height * 0.78)} H{width}"/>
    {''.join(f'<path d="M{int(width * i / 12)} {int(height * 0.5)} V{height}"/>' for i in range(1, 12))}
  </g>
  <text x="{int(width * 0.06)}" y="{int(height * 0.42)}" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="{font_big}" font-weight="bold">{label}</text>
  <text x="{int(width * 0.06)}" y="{int(height * 0.52)}" fill="#c9ced4" font-family="Arial, Helvetica, sans-serif" font-size="{font_small}">Eurofance, {width} x {height} px</text>
  <text x="{int(width * 0.06)}" y="{int(height * 0.92)}" fill="#8b939b" font-family="Arial, Helvetica, sans-serif" font-size="{font_small}">{note}</text>
</svg>
'''


def collect_paths():
    paths = set()
    for root, _dirs, files in os.walk(DATA):
        for name in files:
            if not name.endswith('.json'):
                continue
            with open(os.path.join(root, name), encoding='utf-8') as handle:
                text = handle.read()
            for match in re.findall(r'"(/images/[^"]+\.(?:svg|webp|avif|jpg|png))"', text):
                paths.add(match)
    return sorted(paths)


def write_fixed_assets():
    os.makedirs(os.path.join(PUBLIC, 'images'), exist_ok=True)

    logo = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 34" width="150" height="34" role="img" aria-label="Eurofance">
  <rect x="0" y="4" width="26" height="26" rx="4" fill="#1f2429"/>
  <rect x="5" y="9" width="16" height="3" fill="#e80c0c"/>
  <rect x="5" y="15" width="16" height="3" fill="#ffffff"/>
  <rect x="5" y="21" width="16" height="3" fill="#e80c0c"/>
  <text x="34" y="24" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="bold" fill="#1f2429">EURO<tspan fill="#e80c0c">FANCE</tspan></text>
</svg>
'''
    with open(os.path.join(PUBLIC, 'images', 'logo.svg'), 'w', encoding='utf-8') as handle:
        handle.write(logo)

    favicon = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="6" fill="#1f2429"/>
  <rect x="7" y="8" width="18" height="4" fill="#e80c0c"/>
  <rect x="7" y="14" width="18" height="4" fill="#ffffff"/>
  <rect x="7" y="20" width="18" height="4" fill="#e80c0c"/>
</svg>
'''
    with open(os.path.join(PUBLIC, 'favicon.svg'), 'w', encoding='utf-8') as handle:
        handle.write(favicon)


def main():
    write_fixed_assets()
    created = 0
    skipped = 0
    for path in collect_paths():
        target = os.path.join(PUBLIC, path.lstrip('/'))
        os.makedirs(os.path.dirname(target), exist_ok=True)
        if os.path.exists(target):
            skipped += 1
            continue
        with open(target, 'w', encoding='utf-8') as handle:
            handle.write(placeholder_svg(path))
        created += 1
    print(f'Gotowe. Nowe obrazki: {created}, istniejace pominiete: {skipped}')


if __name__ == '__main__':
    main()