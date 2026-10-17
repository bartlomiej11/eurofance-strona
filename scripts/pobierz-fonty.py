#!/usr/bin/env python3
"""Pobiera kroje Inter (400, 600, 700, 800) w podzbiorach latin i latin-ext
i zapisuje je lokalnie w public/fonts oraz generuje src/styles/fonts.css.

Fonty sa hostowane lokalnie, zgodnie z wymaganiami wydajnosci (bez zapytan do Google).
Uruchomienie: python3 scripts/pobierz-fonty.py
"""
import os
import re
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, 'public', 'fonts')
CSS_PATH = os.path.join(ROOT, 'src', 'styles', 'fonts.css')
WEIGHTS = [400, 600, 700, 800]
API = (
    'https://fonts.googleapis.com/css2?family=Inter:wght@'
    + ';'.join(str(w) for w in WEIGHTS)
    + '&display=swap'
)
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

os.makedirs(FONT_DIR, exist_ok=True)
os.makedirs(os.path.dirname(CSS_PATH), exist_ok=True)

request = urllib.request.Request(API, headers={'User-Agent': UA})
css = urllib.request.urlopen(request, timeout=60).read().decode('utf-8')

blocks = re.findall(r'@font-face\s*\{(.*?)\}', css, re.S)
out = [
    '/* Fonty Inter hostowane lokalnie. Plik generowany przez scripts/pobierz-fonty.py */',
    '',
]
downloaded = 0

for block in blocks:
    weight = re.search(r'font-weight:\s*(\d+)', block)
    url = re.search(r'url\((https://[^)]+\.woff2)\)', block)
    urange = re.search(r'unicode-range:\s*([^;]+);', block)
    if not (weight and url):
        continue
    weight = weight.group(1)
    unicode_range = (urange.group(1).strip() if urange else '')
    # Podzbior latin-ext zawiera polskie znaki (m.in. U+0105, U+0142), dlatego jest obowiazkowy.
    if 'U+0100' in unicode_range:
        subset = 'latin-ext'
    elif 'U+0000-00FF' in unicode_range:
        subset = 'latin'
    else:
        continue  # cyrylica i greka nie sa potrzebne

    filename = f'inter-{weight}-{subset}.woff2'
    path = os.path.join(FONT_DIR, filename)
    if not os.path.exists(path):
        data = urllib.request.urlopen(urllib.request.Request(url.group(1), headers={'User-Agent': UA}), timeout=60).read()
        with open(path, 'wb') as handle:
            handle.write(data)
        downloaded += 1

    out.append('@font-face {')
    out.append("  font-family: 'Inter';")
    out.append('  font-style: normal;')
    out.append(f'  font-weight: {weight};')
    out.append('  font-display: swap;')
    out.append(f"  src: url('/fonts/{filename}') format('woff2');")
    if unicode_range:
        out.append(f'  unicode-range: {unicode_range};')
    out.append('}')
    out.append('')

with open(CSS_PATH, 'w', encoding='utf-8') as handle:
    handle.write('\n'.join(out))

print(f'Gotowe. Pobrano {downloaded} nowych plikow, wpisow @font-face: {len(out) // 7}')
