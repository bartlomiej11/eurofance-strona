import { site, absolute } from './content.js';
import { embedUrl } from './media.js';
import { tkDeep, tk } from './tk.js';

const FIRMA_ID = `${site.domain}/#firma`;
const WEBSITE_ID = `${site.domain}/#website`;

export function organization() {
  return {
    '@type': ['Organization', 'HomeAndConstructionBusiness'],
    '@id': FIRMA_ID,
    name: site.name,
    legalName: site.legalName,
    url: site.domain,
    telephone: site.phone.tel,
    email: site.email,
    image: absolute('/images/logo-dark.png'),
    logo: absolute('/images/logo-dark.png'),
    priceRange: 'od 85 zł/mb',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: site.googleRating.ratingValue || '4.7',
      reviewCount: site.googleRating.count,
      bestRating: '5',
      worstRating: '1',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      postalCode: site.address.postcode,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.address.lat, longitude: site.address.lng },
    areaServed: [
      { '@type': 'Country', name: 'Polska' },
      { '@type': 'AdministrativeArea', name: 'mazowieckie' },
      { '@type': 'AdministrativeArea', name: 'podlaskie' },
      { '@type': 'AdministrativeArea', name: 'kujawsko-pomorskie' },
      { '@type': 'AdministrativeArea', name: 'warmińsko-mazurskie' },
      { '@type': 'AdministrativeArea', name: 'łódzkie' },
      { '@type': 'AdministrativeArea', name: 'lubelskie' },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:00',
        closes: '17:00',
      },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '08:00', closes: '13:00' },
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: site.phone.tel,
        contactType: 'sprzedaż',
        availableLanguage: ['pl'],
        areaServed: 'PL',
      },
      {
        '@type': 'ContactPoint',
        telephone: site.phone.tel,
        contactType: 'obsługa klienta',
        availableLanguage: ['pl'],
        email: site.email,
      },
    ],
    knowsAbout: [
      'ogrodzenia panelowe',
      'bramy przesuwne',
      'bramy skrzydłowe',
      'ogrodzenia palisadowe',
      'malowanie proszkowe',
      'podmurówki betonowe',
    ],
    sameAs: [site.social.facebook, site.social.youtube],
  };
}

export function website() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: site.domain,
    name: `${site.name} - ogrodzenia i bramy od producenta`,
    inLanguage: 'pl-PL',
    publisher: { '@id': FIRMA_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${site.domain}/szukaj?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbs(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: tk(item.name),
      item: absolute(item.url),
    })),
  };
}

export function faq(items) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: tk(item.q),
      acceptedAnswer: { '@type': 'Answer', text: tk(item.a) },
    })),
  };
}

export function itemList(name, items) {
  return {
    '@type': 'ItemList',
    name: tk(name),
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: tk(item.name),
      url: item.url ? absolute(item.url) : undefined,
    })),
  };
}

export function product(p, extra = {}) {
  const offer = {
    '@type': 'Offer',
    url: absolute(`/sklep/${p.slug}`),
    priceCurrency: 'PLN',
    price: p.priceValue || undefined,
    priceSpecification: p.priceValue
      ? {
          '@type': 'PriceSpecification',
          price: p.priceValue,
          priceCurrency: 'PLN',
          unitCode: p.unitCode || 'C62',
        }
      : undefined,
    availability: 'https://schema.org/InStock',
    seller: { '@id': FIRMA_ID },
    itemCondition: 'https://schema.org/NewCondition',
    areaServed: 'PL',
  };
  return {
    '@type': 'Product',
    '@id': `${absolute(`/sklep/${p.slug}`)}#produkt`,
    name: tk(p.name),
    description: tk(p.description),
    image: [absolute(p.image)],
    sku: p.sku,
    mpn: p.sku,
    brand: { '@type': 'Brand', name: site.name },
    material: p.material || 'stal ocynkowana malowana proszkowo',
    color: p.color || undefined,
    offers: offer,
    additionalProperty: (p.params || []).map((row) => ({
      '@type': 'PropertyValue',
      name: tk(row[0]),
      value: tk(row[1]),
    })),
    ...tkDeep(extra),
  };
}

export function service(name, description, areaServed, extra = {}) {
  return {
    '@type': 'Service',
    name: tk(name),
    description: tk(description),
    provider: { '@id': FIRMA_ID },
    areaServed: areaServed
      ? [{ '@type': 'City', name: areaServed }, { '@type': 'Country', name: 'Polska' }]
      : { '@type': 'Country', name: 'Polska' },
    serviceType: tk(name),
    offers: { '@type': 'Offer', priceCurrency: 'PLN', availability: 'https://schema.org/InStock' },
    ...tkDeep(extra),
  };
}

export function localBusinessMalarnia() {
  return {
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    '@id': `${absolute('/malarnia-proszkowa')}#malarnia`,
    name: site.malarnia.name,
    parentOrganization: { '@id': FIRMA_ID },
    telephone: site.phone.tel,
    email: site.email,
    url: absolute('/malarnia-proszkowa'),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.malarnia.street,
      postalCode: site.malarnia.postcode,
      addressLocality: site.malarnia.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.address.lat, longitude: site.address.lng },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:00',
        closes: '17:00',
      },
    ],
  };
}

export function article(post, url) {
  return {
    '@type': 'Article',
    headline: tk(post.title),
    description: tk(post.metaDescription),
    inLanguage: 'pl-PL',
    mainEntityOfPage: { '@type': 'WebPage', '@id': absolute(url) },
    author: { '@type': 'Organization', name: site.name, url: site.domain },
    publisher: { '@id': FIRMA_ID },
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    image: post.image ? [absolute(post.image)] : undefined,
  };
}

// VideoObject zgodny z wytycznymi Google dla wyników wideo.
// Wymagane: name, thumbnailUrl, uploadDate. Zalecane: description, duration,
// contentUrl (plik MP4) albo embedUrl (YouTube bez ciasteczek), hasPart z momentami.
export function videoObject(v, url) {
  const plik = v.sources?.find((s) => s.type === 'video/mp4')?.src || v.sources?.[0]?.src || v.url || '';
  const embed = embedUrl(v);
  return {
    '@type': 'VideoObject',
    '@id': url ? `${absolute(url)}#wideo` : undefined,
    name: tk(v.name),
    description: tk(v.description),
    thumbnailUrl: v.poster ? [absolute(v.poster)] : undefined,
    uploadDate: v.uploadDate,
    duration: v.duration,
    contentUrl: plik ? absolute(plik) : undefined,
    embedUrl: embed || undefined,
    width: v.width ? { '@type': 'QuantitativeValue', value: v.width, unitCode: 'E37' } : undefined,
    height: v.height ? { '@type': 'QuantitativeValue', value: v.height, unitCode: 'E37' } : undefined,
    inLanguage: 'pl-PL',
    isFamilyFriendly: true,
    transcript: v.transcript ? String(v.transcript).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : undefined,
    about: v.system ? { '@type': 'Thing', name: tk(v.system) } : undefined,
    contentLocation: v.city ? { '@type': 'Place', name: tk(v.city) } : undefined,
    hasPart: (v.keyMoments || []).map((moment) => ({
      '@type': 'Clip',
      name: tk(moment.label),
      startOffset: Number(moment.startOffset) || 0,
      url: url ? `${absolute(url)}#t=${Number(moment.startOffset) || 0}` : undefined,
    })),
    publisher: { '@id': FIRMA_ID },
  };
}

// Lista filmów na stronie zbiorczej: kazdy film jako VideoObject w ItemList.
export function videoList(items, name, urlOf = (item) => `/wideo/${item.slug}`) {
  return {
    '@type': 'ItemList',
    name: tk(name),
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: videoObject(item, urlOf(item)),
    })),
  };
}

// Strona z filmem jako glowna trescia - najbezpieczniejszy wariant dla wynikow wideo.
export function videoPage(item, url, title, description) {
  return {
    '@type': 'WebPage',
    '@id': `${absolute(url)}#strona`,
    url: absolute(url),
    name: tk(title),
    description: tk(description),
    inLanguage: 'pl-PL',
    isPartOf: { '@id': WEBSITE_ID },
    primaryImageOfPage: item.poster ? { '@type': 'ImageObject', url: absolute(item.poster) } : undefined,
    mainEntity: videoObject(item, url),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Strona główna', item: absolute('/') },
        { '@type': 'ListItem', position: 2, name: 'Wideo i rolki', item: absolute('/wideo') },
        { '@type': 'ListItem', position: 3, name: tk(item.name), item: absolute(url) },
      ],
    },
  };
}

export function contactPage() {
  return {
    '@type': 'ContactPage',
    name: 'Kontakt Eurofance',
    url: absolute('/kontakt'),
    about: { '@id': FIRMA_ID },
    mainEntity: {
      '@type': 'Organization',
      '@id': FIRMA_ID,
      telephone: site.phone.tel,
      email: site.email,
    },
  };
}

// Zbiera graf wiedzy dla strony: jeden skrypt JSON-LD z tablica obiektow.
export function graph(nodes) {
  const clean = nodes.filter(Boolean).map((n) => tkDeep(n));
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': clean });
}
