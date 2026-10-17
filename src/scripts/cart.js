// Koszyk sklepu: trwaly zapis w przegladarce, licznik w naglowku,
// potwierdzenie dodania i widok koszyka z ilosciami oraz suma.

import { track } from './tracking.js';

const KLUCZ = 'ef_cart';
const KLUCZ_SESJI = 'ef_cart_sesja';

export function czytajKoszyk() {
  try {
    const lokalny = localStorage.getItem(KLUCZ);
    if (lokalny) return JSON.parse(lokalny) || [];
    // Zgodnosc ze starsza wersja koszyka zapisywana w pamieci sesji.
    const sesyjny = sessionStorage.getItem(KLUCZ_SESJA);
    if (sesyjny) {
      const dane = JSON.parse(sesyjny) || [];
      zapiszKoszyk(dane);
      return dane;
    }
  } catch (e) {
    return [];
  }
  return [];
}

export function zapiszKoszyk(pozycje) {
  try {
    localStorage.setItem(KLUCZ, JSON.stringify(pozycje));
  } catch (e) {
    // Brak dostepu do localStorage: zostaje zapis na czas sesji.
    try { sessionStorage.setItem(KLUCZ_SESJA, JSON.stringify(pozycje)); } catch (e2) {}
  }
  aktualizujLicznik(pozycje);
}

function liczba(wartosc) {
  const n = Number(String(wartosc).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function sumaKoszyka(pozycje) {
  return pozycje.reduce((suma, p) => suma + liczba(p.price) * (p.qty || 1), 0);
}

export function liczbaElementow(pozycje) {
  return (pozycje || czytajKoszyk()).reduce((suma, p) => suma + (p.qty || 1), 0);
}

export function aktualizujLicznik(pozycje) {
  const ile = liczbaElementow(pozycje);
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = String(ile);
    el.hidden = ile === 0;
  });
  document.querySelectorAll('[data-cart-link]').forEach((el) => {
    el.setAttribute('aria-label', ile ? `Koszyk, ${ile} elementów` : 'Koszyk');
  });
}

export function dodajDoKoszyka({ name, price, slug, unit }) {
  const pozycje = czytajKoszyk();
  const istniejaca = slug ? pozycje.find((p) => p.slug === slug) : null;
  if (istniejaca) {
    istniejaca.qty = (istniejaca.qty || 1) + 1;
  } else {
    pozycje.push({ name, price: liczba(price), slug: slug || '', unit: unit || '', qty: 1 });
  }
  zapiszKoszyk(pozycje);
  pokazPotwierdzenie(name);
  track('add_to_cart', { item_name: name, value: liczba(price), currency: 'PLN' });
  return pozycje;
}

export function usunZKoszyka(indeks) {
  const pozycje = czytajKoszyk();
  pozycje.splice(indeks, 1);
  zapiszKoszyk(pozycje);
  return pozycje;
}

export function ustawIlosc(indeks, ilosc) {
  const pozycje = czytajKoszyk();
  if (!pozycje[indeks]) return pozycje;
  const nowa = Math.max(1, Math.min(99, Math.round(ilosc)));
  pozycje[indeks].qty = nowa;
  zapiszKoszyk(pozycje);
  return pozycje;
}

function pokazPotwierdzenie(nazwa) {
  let box = document.querySelector('[data-cart-toast]');
  if (!box) {
    box = document.createElement('div');
    box.className = 'cart-toast';
    box.setAttribute('data-cart-toast', '');
    box.setAttribute('role', 'status');
    document.body.appendChild(box);
  }
  box.innerHTML =
    '<span class="cart-toast__text">Dodano do koszyka: <strong>' + nazwa + '</strong></span>' +
    '<a class="cart-toast__link" href="/koszyk">Przejdź do koszyka</a>' +
    '<button type="button" class="cart-toast__close" aria-label="Zamknij">×</button>';
  box.classList.add('is-visible');
  const zamknij = () => box.classList.remove('is-visible');
  box.querySelector('[data-cart-close], .cart-toast__close').addEventListener('click', zamknij);
  clearTimeout(box._timer);
  box._timer = setTimeout(zamknij, 6000);
}

function zl(wartosc) {
  return liczba(wartosc).toLocaleString('pl-PL') + ' zł';
}

function rysujKoszyk() {
  const lista = document.querySelector('[data-cart-list]');
  if (!lista) return;

  const podsumowanie = document.getElementById('cart-summary');
  const sumaOut = document.querySelector('[data-cart-total]');
  const pozycje = czytajKoszyk();

  if (!pozycje.length) {
    lista.innerHTML =
      '<div class="cart-empty">' +
      '<p class="cart-empty__lead">Koszyk jest pusty. Wybierz elementy w sklepie albo zamów wycenę z montażem.</p>' +
      '<div class="btn-row">' +
      '<a class="btn btn--red" href="/sklep" data-cta="koszyk-pusty">Przejdź do sklepu</a>' +
      '<a class="btn btn--outline" href="/bezplatna-wycena" data-cta="koszyk-pusty">Zamów wycenę z montażem</a>' +
      '</div></div>';
    if (podsumowanie) podsumowanie.hidden = true;
    return;
  }

  let html = '<div class="cart-table" role="table" aria-label="Zawartość koszyka">';
  pozycje.forEach((p, i) => {
    html +=
      '<div class="cart-row" role="row">' +
      '<div class="cart-row__name" role="cell">' + (p.slug ? '<a href="/sklep/' + p.slug + '">' + p.name + '</a>' : p.name) + '</div>' +
      '<div class="cart-row__qty" role="cell">' +
      '<button type="button" class="cart-qty" data-cart-minus="' + i + '" aria-label="Zmniejsz ilość">−</button>' +
      '<input type="text" inputmode="numeric" value="' + (p.qty || 1) + '" data-cart-qty="' + i + '" aria-label="Ilość" />' +
      '<button type="button" class="cart-qty" data-cart-plus="' + i + '" aria-label="Zwiększ ilość">+</button>' +
      '</div>' +
      '<div class="cart-row__price" role="cell">' + zl(liczba(p.price) * (p.qty || 1)) + '</div>' +
      '<div class="cart-row__remove" role="cell"><button type="button" class="cart-remove" data-cart-remove="' + i + '">Usuń</button></div>' +
      '</div>';
  });
  html += '</div>';
  html +=
    '<div class="cart-actions">' +
    '<a class="btn btn--outline" href="/sklep" data-cta="koszyk-doshop">Dodaj kolejne elementy</a>' +
    '<button type="button" class="btn btn--ghost" data-cart-clear>Wyczyść koszyk</button>' +
    '</div>';

  lista.innerHTML = html;
  if (podsumowanie) {
    podsumowanie.hidden = false;
    if (sumaOut) sumaOut.textContent = zl(sumaKoszyka(pozycje));
  }

  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'view_cart',
      value: sumaKoszyka(pozycje),
      currency: 'PLN',
      items: liczbaElementow(pozycje),
    });
  }
}

function obsluzKoszyk() {
  const lista = document.querySelector('[data-cart-list]');
  if (!lista) return;
  lista.addEventListener('click', (e) => {
    const minus = e.target.closest('[data-cart-minus]');
    const plus = e.target.closest('[data-cart-plus]');
    const usun = e.target.closest('[data-cart-remove]');
    const wyczysc = e.target.closest('[data-cart-clear]');
    if (minus) {
      const i = Number(minus.getAttribute('data-cart-minus'));
      const pozycje = czytajKoszyk();
      ustawIlosc(i, (pozycje[i]?.qty || 1) - 1);
      rysujKoszyk();
    } else if (plus) {
      const i = Number(plus.getAttribute('data-cart-plus'));
      const pozycje = czytajKoszyk();
      ustawIlosc(i, (pozycje[i]?.qty || 1) + 1);
      rysujKoszyk();
    } else if (usun) {
      usunZKoszyka(Number(usun.getAttribute('data-cart-remove')));
      rysujKoszyk();
    } else if (wyczysc) {
      zapiszKoszyk([]);
      rysujKoszyk();
    }
  });
  lista.addEventListener('change', (e) => {
    const pole = e.target.closest('[data-cart-qty]');
    if (!pole) return;
    ustawIlosc(Number(pole.getAttribute('data-cart-qty')), liczba(pole.value));
    rysujKoszyk();
  });
}

export function initCart() {
  aktualizujLicznik();
  document.querySelectorAll('[data-add-to-cart]').forEach((button) => {
    button.addEventListener('click', () => {
      dodajDoKoszyka({
        name: button.getAttribute('data-add-to-cart'),
        price: button.getAttribute('data-price'),
        slug: button.getAttribute('data-slug') || '',
        unit: button.getAttribute('data-unit') || '',
      });
      const pierwotny = button.getAttribute('data-label') || button.textContent;
      button.setAttribute('data-label', pierwotny);
      button.textContent = 'Dodano do koszyka';
      setTimeout(() => { button.textContent = pierwotny; }, 2500);
    });
  });
  obsluzKoszyk();
  rysujKoszyk();
}