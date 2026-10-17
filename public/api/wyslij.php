<?php
/**
 * Obsluga zgloszen z formularzy strony Eurofance.
 *
 * Dzialanie:
 *  1. Przyjmuje dane z formularza w formacie JSON (tak wysyla forms.js) albo jako zwykly POST.
 *  2. Sprawdza pole pulapkowe (firma_x) i podstawowa walidacje telefonu oraz adresu e-mail.
 *  3. Ogranicza liczbe zgloszen z jednego adresu IP.
 *  4. Wysyla e-mail na adresy z listy ODBIORCY oraz opcjonalnie przekazuje dane do CRM przez webhook.
 *  5. Dopisuje zgloszenie do pliku CSV w katalogu dane/ (kopie zapasowej, gdyby e-mail nie doszedl).
 *  6. Zwraca odpowiedz JSON.
 *
 * Konfiguracja ponizej. Przed wdrozeniem uzupelnij ODBIORCY, NADAWCA i WEBHOOK.
 */

declare(strict_types=1);

const ODBIORCY = ['zamowienia@eurofance.pl'];
const NADAWCA = 'formularz@eurofance.pl';
const TEMAT_PREFIX = 'Zgloszenie ze strony';
const WEBHOOK = ''; // Adres webhooka CRM, pusty wylacza przekazywanie.
const LIMIT_NA_IP = 6;       // Maksymalna liczba zgloszen z jednego IP.
const LIMIT_OKNO = 900;      // Okno czasowe limitu w sekundach.
const DANE_DIR = __DIR__ . '/dane';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function odpowiedz(int $kod, array $dane): void
{
    http_response_code($kod);
    echo json_encode($dane, JSON_UNESCAPED_UNICODE);
    exit;
}

function czysc(string $value, int $max = 500): string
{
    $value = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $value);
    $value = strip_tags($value);
    $value = trim($value);
    return mb_substr($value, 0, $max);
}

function wejscie(): array
{
    $typ = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($typ, 'application/json') !== false) {
        $raw = file_get_contents('php://input') ?: '';
        $dane = json_decode($raw, true);
        if (is_array($dane)) {
            return $dane;
        }
    }
    return $_POST;
}

function limit_ip(string $ip): bool
{
    if (!is_dir(DANE_DIR) && !mkdir(DANE_DIR, 0755, true) && !is_dir(DANE_DIR)) {
        return true; // Brak katalogu nie moze blokowac zgloszen.
    }
    $plik = DANE_DIR . '/limit.json';
    $teraz = time();
    $stan = [];
    if (is_file($plik)) {
        $stan = json_decode((string) file_get_contents($plik), true) ?: [];
    }
    $wpisy = array_values(array_filter($stan[$ip] ?? [], fn ($t) => ($teraz - (int) $t) < LIMIT_OKNO));
    if (count($wpisy) >= LIMIT_NA_IP) {
        return false;
    }
    $wpisy[] = $teraz;
    $stan[$ip] = $wpisy;
    file_put_contents($plik, json_encode($stan), LOCK_EX);
    return true;
}

function zapisz_csv(array $dane): void
{
    if (!is_dir(DANE_DIR) && !mkdir(DANE_DIR, 0755, true) && !is_dir(DANE_DIR)) {
        return;
    }
    $plik = DANE_DIR . '/zgloszenia-' . date('Y-m') . '.csv';
    $nowy = !is_file($plik);
    $uchwyt = fopen($plik, 'a');
    if (!$uchwyt) {
        return;
    }
    if ($nowy) {
        fputcsv($uchwyt, ['data', 'formularz', 'imie', 'telefon', 'email', 'miasto', 'zakres', 'szczegoly', 'zrodlo', 'strona'], ';');
    }
    fputcsv($uchwyt, [
        date('c'),
        $dane['formularz'] ?? '',
        $dane['imie'] ?? '',
        $dane['telefon'] ?? '',
        $dane['email'] ?? '',
        $dane['lokalizacja'] ?? '',
        $dane['zakres'] ?? $dane['kategoria'] ?? $dane['produkt'] ?? '',
        $dane['wiadomosc'] ?? $dane['wymiary'] ?? $dane['ilosc'] ?? '',
        $dane['utm_source'] ?? '',
        $dane['strona_wyslania'] ?? '',
    ], ';');
    fclose($uchwyt);
}

function webhook(array $dane): void
{
    if (WEBHOOK === '' || !filter_var(WEBHOOK, FILTER_VALIDATE_URL)) {
        return;
    }
    $ch = curl_init(WEBHOOK);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($dane, JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
    ]);
    curl_exec($ch);
    curl_close($ch);
}

$dane = wejscie();

// Pole pulapkowe wypelnione przez robota: konczymy bez bledu, zeby nie uczyc spamu.
if (!empty($dane['firma_x'])) {
    odpowiedz(200, ['ok' => true]);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
if (!limit_ip($ip)) {
    odpowiedz(429, ['ok' => false, 'blad' => 'Zbyt wiele zgloszen. Zadzwon do nas: 22 300 50 10.']);
}

$telefon = preg_replace('/[^\d+]/', '', (string) ($dane['telefon'] ?? ''));
$email = (string) ($dane['email'] ?? '');

if (strlen(preg_replace('/\D/', '', $telefon)) < 9) {
    odpowiedz(422, ['ok' => false, 'blad' => 'Podaj numer telefonu z dziewiecioma cyframi.']);
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    odpowiedz(422, ['ok' => false, 'blad' => 'Adres e-mail wyglada na niepoprawny.']);
}
if (empty($dane['rodo'])) {
    odpowiedz(422, ['ok' => false, 'blad' => 'Potwierdz zgode na kontakt w sprawie wyceny.']);
}

$formularz = czysc((string) ($dane['formularz'] ?? 'formularz'), 60);
$imie = czysc((string) ($dane['imie'] ?? ''), 80);

$pola = [
    'Imie' => $imie,
    'Telefon' => $telefon,
    'E-mail' => czysc($email, 120),
    'Miejscowosc' => czysc((string) ($dane['lokalizacja'] ?? ''), 120),
    'Zakres' => czysc((string) ($dane['zakres'] ?? $dane['kategoria'] ?? $dane['produkt'] ?? ''), 160),
    'Dlugosc w mb' => czysc((string) ($dane['dlugosc_mb'] ?? $dane['dlugosc_frontu_mb'] ?? ''), 40),
    'Wysokosc w cm' => czysc((string) ($dane['wysokosc_cm'] ?? ''), 40),
    'System' => czysc((string) ($dane['system'] ?? ''), 80),
    'Kolor RAL' => czysc((string) ($dane['ral'] ?? ''), 40),
    'Brama' => czysc((string) ($dane['brama'] ?? $dane['typ_bramy'] ?? ''), 80),
    'Szerokosc wjazdu' => czysc((string) ($dane['szerokosc_wjazdu_m'] ?? ''), 40),
    'Napęd' => czysc((string) ($dane['naped'] ?? ''), 40),
    'Furtka' => czysc((string) ($dane['furtka'] ?? ''), 40),
    'Montaz' => czysc((string) ($dane['montaz'] ?? ''), 40),
    'Termin' => czysc((string) ($dane['termin'] ?? ''), 80),
    'Wycena z kalkulatora' => czysc((string) ($dane['wycena_kalkulatora'] ?? ''), 80),
    'Wiadomosc' => czysc((string) ($dane['wiadomosc'] ?? ''), 2000),
    'Firma' => czysc((string) ($dane['firma'] ?? ''), 160),
    'NIP' => czysc((string) ($dane['nip'] ?? ''), 20),
];

$zrodlo = [
    'Strona wyslania' => czysc((string) ($dane['strona_wyslania'] ?? ''), 200),
    'Strona wejscia' => czysc((string) ($dane['strona_wejscia'] ?? ''), 200),
    'utm_source' => czysc((string) ($dane['utm_source'] ?? ''), 80),
    'utm_medium' => czysc((string) ($dane['utm_medium'] ?? ''), 80),
    'utm_campaign' => czysc((string) ($dane['utm_campaign'] ?? ''), 80),
    'utm_term' => czysc((string) ($dane['utm_term'] ?? ''), 120),
    'gclid' => czysc((string) ($dane['gclid'] ?? ''), 120),
    'IP' => $ip,
    'Godzina serwera' => date('c'),
];

$tresc = "Nowe zgloszenie ze strony eurofance.pl\n";
$tresc .= "Formularz: {$formularz}\n\n";
foreach ($pola as $etykieta => $wartosc) {
    if ($wartosc !== '') {
        $tresc .= "{$etykieta}: {$wartosc}\n";
    }
}
$tresc .= "\n--- Zrodlo ---\n";
foreach ($zrodlo as $etykieta => $wartosc) {
    if ($wartosc !== '') {
        $tresc .= "{$etykieta}: {$wartosc}\n";
    }
}

$naglowki = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: ' . NADAWCA,
];
if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $naglowki[] = 'Reply-To: ' . $email;
}

$temat = TEMAT_PREFIX . ': ' . $formularz . ' - ' . ($pola['Miejscowosc'] !== '' ? $pola['Miejscowosc'] : 'brak miejscowosci');
$wyslano = false;
foreach (ODBIORCY as $odbiorca) {
    if (mail($odbiorca, '=?UTF-8?B?' . base64_encode($temat) . '?=', $tresc, implode("\r\n", $naglowki))) {
        $wyslano = true;
    }
}

zapisz_csv($dane);
webhook($dane);

odpowiedz(200, ['ok' => true, 'mail' => $wyslano]);