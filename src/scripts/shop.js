// Filtrowanie i sortowanie listy produktow w sklepie.
// Dziala na gotowych kartach w HTML, wiec wyniki sa widoczne od razu,
// bez przeladowania strony i bez dodatkowych zapytan do serwera.

function liczba(wartosc) {
  const n = parseFloat(String(wartosc).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export function initShopFilters() {
  const bar = document.querySelector('[data-shop-filter]');
  const grid = document.getElementById('lista-produktow');
  if (!bar || !grid) return;

  const karty = [...grid.querySelectorAll('[data-card]')];
  if (!karty.length) return;

  const pole = bar.querySelector('[data-filter-q]');
  const kategoria = bar.querySelector('[data-filter-category]');
  const cena = bar.querySelector('[data-filter-price]');
  const sortowanie = bar.querySelector('[data-filter-sort]');
  const reset = bar.querySelector('[data-filter-reset]');
  const licznik = bar.querySelector('[data-filter-count]');
  const pusty = document.querySelector('[data-filter-empty]');

  const odmiana = (n) => {
    if (n === 1) return 'element';
    const reszta = n % 10;
    const setki = n % 100;
    if (reszta >= 2 && reszta <= 4 && !(setki >= 12 && setki <= 14)) return 'elementy';
    return 'elementów';
  };

  const filtruj = () => {
    const fraza = (pole.value || '').trim().toLowerCase();
    const wybranaKategoria = kategoria.value;
    const zakres = cena.value ? cena.value.split('-').map(liczba) : null;

    let widoczne = 0;
    karty.forEach((karta) => {
      const nazwa = karta.getAttribute('data-name') || '';
      const kat = karta.getAttribute('data-category') || '';
      const wartosc = liczba(karta.getAttribute('data-price'));

      const pasujeFraza = !fraza || nazwa.includes(fraza);
      const pasujeKategoria = !wybranaKategoria || kat === wybranaKategoria;
      const pasujeCena = !zakres || (wartosc >= zakres[0] && wartosc <= zakres[1]);

      const ok = pasujeFraza && pasujeKategoria && pasujeCena;
      karta.hidden = !ok;
      if (ok) widoczne += 1;
    });

    // Sortowanie: przepisujemy karty w nowej kolejnosci.
    const tryb = sortowanie.value;
    const posortowane = [...karty].sort((a, b) => {
      if (tryb === 'nazwa') {
        return (a.getAttribute('data-name') || '').localeCompare(b.getAttribute('data-name') || '', 'pl');
      }
      const pa = liczba(a.getAttribute('data-price'));
      const pb = liczba(b.getAttribute('data-price'));
      return tryb === 'cena-malejaco' ? pb - pa : pa - pb;
    });
    posortowane.forEach((karta) => grid.appendChild(karta));

    if (licznik) {
      licznik.textContent = widoczne === karty.length
        ? `${karty.length} ${odmiana(karty.length)} dostępnych w sklepie`
        : `${widoczne} z ${karty.length} elementów po filtrowaniu`;
    }
    if (pusty) pusty.hidden = widoczne > 0;

    // Zdarzenie do analityki: co klienci filtruja.
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'shop_filter',
        filtr_szukanie: fraza,
        filtr_kategoria: wybranaKategoria,
        filtr_cena: cena.value,
        filtr_sortowanie: tryb,
        wynikow: widoczne,
      });
    }
  };

  [pole, kategoria, cena, sortowanie].forEach((el) => {
    if (!el) return;
    el.addEventListener('input', filtruj);
    el.addEventListener('change', filtruj);
  });

  if (reset) {
    reset.addEventListener('click', () => {
      pole.value = '';
      kategoria.value = '';
      cena.value = '';
      sortowanie.value = 'cena-rosnaco';
      filtruj();
      pole.focus();
    });
  }

  // Fraza z adresu, np. /sklep?q=panel
  const zAdresu = new URLSearchParams(window.location.search).get('q');
  if (zAdresu) {
    pole.value = zAdresu;
  }
  filtruj();
}