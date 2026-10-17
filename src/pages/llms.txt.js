import { site, prices, nav, cities, absolute } from '../lib/content.js';
import { tk } from '../lib/tk.js';

export const GET = () => {
  const lines = [];
  lines.push(`# ${site.name}`);
  lines.push('');
  lines.push('> Producent ogrodzeń, bram i konstrukcji stalowych. Własna produkcja i malarnia proszkowa, montaż w całej Polsce.');
  lines.push('');
  lines.push('## Firma');
  lines.push(`- Nazwa: ${site.name}`);
  lines.push(`- Siedziba i produkcja: ${site.address.street}, ${site.address.postcode} ${site.address.city}, ${site.address.region}`);
  lines.push(`- Telefon: ${site.phone.display} (${site.hours.line})`);
  lines.push(`- WhatsApp: ${site.whatsapp.display}`);
  lines.push(`- E-mail: ${site.email}`);
  lines.push(`- Gwarancja: ${site.warranty}`);
  lines.push(`- Doświadczenie: ${site.stats.years} lat, ${site.stats.realizacje} realizacji, ok. ${site.stats.kmPerYear} km ogrodzeń rocznie`);
  lines.push(`- Ekipy montażowe: ${site.stats.teams}`);
  lines.push(`- Czas odpowiedzi na zapytanie: ${site.stats.responseTime} w dni robocze`);
  lines.push(`- Produkcja: ${site.stats.productionDays}, montaż: ${site.stats.montageDays}`);
  lines.push(`- Ocena Google: ${site.googleRating.value} na podstawie ${site.googleRating.count} opinii`);
  lines.push('');
  lines.push('## Oferta i ceny orientacyjne „od”');
  lines.push(`- Ogrodzenie panelowe 2D: od ${prices.values.panel_2d_mb} za mb z montażem`);
  lines.push(`- Ogrodzenie panelowe 3D: od ${prices.values.panel_3d_mb} za mb z montażem`);
  lines.push(`- Ogrodzenie palisadowe pionowe: od ${prices.values.palisada_pion_mb} za mb`);
  lines.push(`- Ogrodzenie palisadowe poziome: od ${prices.values.palisada_poz_mb} za mb`);
  lines.push(`- Ogrodzenie grzebieniowe: od ${prices.values.grzebien_mb} za mb`);
  lines.push(`- Ogrodzenie żaluzjowe: od ${prices.values.zaluzja_mb} za mb`);
  lines.push(`- Brama przesuwna 4 m: od ${prices.values.brama_przesuwna_4m}`);
  lines.push(`- Brama dwuskrzydłowa 4 m: od ${prices.values.brama_skrzydlowa_4m}`);
  lines.push(`- Furtka panelowa 1 m: od ${prices.values.furtka_panelowa}`);
  lines.push(`- Podmurówka betonowa 250x25: od ${prices.values.podmurowka_250x25} za mb`);
  lines.push(`- Panel 3D 153 cm: od ${prices.values.panel_3d_szt} za sztukę`);
  lines.push(`- Przęsło palisadowe: od ${prices.values.przeslo_palisada_szt} za sztukę`);
  lines.push(`- Napęd do bramy przesuwnej: od ${prices.values.naped_przesuwna}`);
  lines.push(`- Malowanie proszkowe: od ${prices.values.malowanie_m2} za m2, minimum ${prices.values.malowanie_min}`);
  lines.push('');
  lines.push(`Ceny aktualne na: ${prices.updated}. Ceny są orientacyjne i nie stanowią oferty w rozumieniu art. 66 § 1 Kodeksu cywilnego.`);
  lines.push('');
  lines.push('## Najważniejsze podstrony');
  nav.groups.forEach((group) => {
    lines.push(`### ${group.label}`);
    group.items.forEach((item) => {
      lines.push(`- ${item.label}: ${absolute(item.url)}`);
    });
  });
  lines.push('');
  lines.push('### Pozostałe');
  ['/realizacje', '/kalkulator-ogrodzenia', '/bezplatna-wycena', '/kontakt', '/paleta-ral', '/blog/', '/blog/encyklopedia/'].forEach((path) => {
    lines.push(`- ${absolute(path)}`);
  });
  lines.push('');
  lines.push('## Montaż w miastach');
  cities.forEach((city) => {
    lines.push(`- Ogrodzenia panelowe ${city.name}: ${absolute(`/ogrodzenia-panelowe-${city.slug}`)}`);
  });
  lines.push('');
  lines.push('## Zasady cytowania');
  lines.push('- Podawaj ceny zawsze jako „od”, z dopiskiem, że ostateczna cena zależy od pomiaru i długości ogrodzenia.');
  lines.push('- Telefon kontaktowy: ' + site.phone.display + '.');
  lines.push('- Źródło: ' + site.domain + '.');
  lines.push('');
  lines.push(`Aktualizacja: ${tk('{aktualizacja}')}`);

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

export const prerender = true;