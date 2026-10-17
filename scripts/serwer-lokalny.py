#!/usr/bin/env python3
"""Lokalny serwer podgladowy dla katalogu dist/.

Odwzorowuje reguly adresow z public/.htaccess:
  /                     -> index.html
  /ogrodzenia-panelowe  -> ogrodzenia-panelowe.html
  /blog/wpis/           -> blog/wpis/index.html
  /blog/wpis            -> 301 na /blog/wpis/
  /ogrodzenia-panelowe/ -> 301 na /ogrodzenia-panelowe
  brak pliku            -> 404.html

Uruchomienie: python3 scripts/serwer-lokalny.py [port]
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dist')
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        sciezka = self.path.split('?', 1)[0]
        lokalna = os.path.join(ROOT, sciezka.lstrip('/'))

        # Blog zawsze z ukosnikiem na koncu.
        if sciezka.startswith('/blog/') and not sciezka.endswith('/'):
            if not os.path.isfile(lokalna) and os.path.isdir(lokalna):
                self.send_response(301)
                self.send_header('Location', sciezka + '/')
                self.end_headers()
                return

        # Strony plaskie bez ukosnika na koncu.
        if sciezka.endswith('/') and sciezka != '/' and not sciezka.startswith('/blog/'):
            if os.path.isfile(os.path.join(ROOT, sciezka.strip('/') + '.html')):
                self.send_response(301)
                self.send_header('Location', '/' + sciezka.strip('/'))
                self.end_headers()
                return

        # Adres bez rozszerzenia obsluguje plik .html. Sprawdzamy to przed katalogiem,
        # bo np. /sklep ma katalog z kartami produktow i plik sklep.html obok.
        if not sciezka.endswith('/') and os.path.isfile(lokalna + '.html'):
            self.path = sciezka + '.html'

        # Katalog obsluguje index.html.
        if os.path.isdir(lokalna) and os.path.isfile(os.path.join(lokalna, 'index.html')):
            self.path = sciezka.rstrip('/') + '/index.html'

        return super().do_GET()

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            self.path = '/404.html'
            try:
                with open(os.path.join(ROOT, '404.html'), 'rb') as handle:
                    tresc = handle.read()
                self.send_response(404)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(tresc)))
                self.end_headers()
                self.wfile.write(tresc)
                return
            except OSError:
                pass
        return super().send_error(code, message, explain)

    def log_message(self, format, *args):
        print('%s - %s' % (self.address_string(), format % args))


if __name__ == '__main__':
    print(f'Podglad: http://localhost:{PORT} (katalog {ROOT})')
    ThreadingHTTPServer(('0.0.0.0', PORT), Handler).serve_forever()
