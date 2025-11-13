# ZamowieniaTargi

Narzędzie wspierające obsługę zamówień podczas targów. Repozytorium zawiera obecnie moduły integracji z Airtable, które pobierają dane z tabel **Tabela Targi** oraz **Produkty**.

## Konfiguracja środowiska

1. Utwórz plik `.env` (nie jest dodawany do repozytorium) i zdefiniuj w nim co najmniej token API oraz dane logowania do Microsoft (szczegóły poniżej):

   ```bash
   AIRTABLE_TOKEN=patXXXXXXXXXXXX
   # Opcjonalnie
   AIRTABLE_BASE_ID=appDg7Emi7rYsjFZ2
   AIRTABLE_TABLE_NAME=Tabela Targi
   AIRTABLE_PRODUCTS_TABLE_NAME=Produkty

   # Konfiguracja logowania Microsoft (Azure AD)
   AZURE_AD_TENANT_ID=<tenant-guid>
   AZURE_AD_CLIENT_ID=<app-id>
   AZURE_AD_CLIENT_SECRET=<app-secret>
   AZURE_AD_REDIRECT_URI=http://localhost:4300/auth/callback
   ALLOWED_EMAIL_DOMAIN=warsawexpo.eu
   SESSION_SECRET=losowe_haslo_min_32_znaki
   SESSION_TTL_SECONDS=28800
   ```

2. Zainstaluj zależności i uruchom wybrane synchronizacje:

   ```bash
   npm install
   npm run sync:targi      # tabela wydarzeń
    
   # lub
   npm run sync:produkty   # katalog produktów
   ```

3. Skrypty pobierają wskazane kolumny z Airtable z batchingiem i zapisują wynik w katalogu `data/`:

   - `data/targi.json` – rekordy z tabeli "Tabela Targi",
   - `data/produkty.json` – rekordy z tabeli "Produkty".

   W terminalu wyświetlana jest krótka tabela podglądowa pierwszych rekordów.

Skrypty można wykorzystywać cyklicznie (np. jako zadania cron), by odświeżać stany wydarzeń, targów oraz katalog produktów bezpośrednio z Airtable.

## Logowanie Outlook/Microsoft i role użytkowników

System obsługuje logowanie wyłącznie służbowymi adresami `@warsawexpo.eu` poprzez konto Microsoft (Azure AD). Schemat działania:

1. **Rejestracja aplikacji w Azure AD** – utwórz aplikację typu "Web" i skonfiguruj redirect `http://localhost:4300/auth/callback`. Nadaj uprawnienia `openid profile email offline_access`.
2. **Konfiguracja `.env`** – uzupełnij zmienne `AZURE_AD_*`, `SESSION_SECRET` oraz opcjonalnie `ALLOWED_EMAIL_DOMAIN` (domyślnie `warsawexpo.eu`).
3. **Bootstrap pierwszego administratora** – przed rozpoczęciem logowania dodaj konto administratorskie CLI:

   ```bash
   npm run user:bootstrap -- --email=twoj.adres@warsawexpo.eu --name="Imię Nazwisko" --role=administrator
   ```

4. **Uruchom serwer logowania** – komenda `npm run auth:server` startuje prosty serwer HTTP z zakładką logowania (http://localhost:4300). Użytkownik klika „Zaloguj przez Microsoft”, przechodzi przez okno Outlook/Microsoft i wraca do aplikacji.
5. **Akceptacja kont** – nowe konta trafiają do statusu `pending`. Administrator potwierdza dostęp i rolę przez:

   - CLI: `npm run user:pending`, `npm run user:approve -- --id=<UUID> --role=sprzedawca`.
   - API: zalogowany administrator wywołuje `POST /admin/users/<id>/approve` lub `.../disable`, `.../role` (serwer obsługuje JSON i cookie sesyjne).

6. **Role** – dostępne role: `administrator`, `sprzedawca`, `magazynier`, `koordynator`. Administrator może zmieniać uprawnienia (`npm run user:set-role -- --id=... --role=koordynator`) lub wygaszać konta (`npm run user:disable -- --id=...`).

Serwer logowania wystawia też endpoint `GET /api/session`, który pozwala front-endowi sprawdzić czy użytkownik ma ważną sesję oraz jaką rolę posiada.

> 💡 **Tryb demo**: podczas lokalnego prototypowania możesz ustawić `DEMO_MODE=true` w `.env`, aby interfejs WWW był dostępny bez logowania (aplikacja poda się jako administrator w trybie tylko do podglądu).

## Interfejs WWW (konfigurator zamówień)

Po zalogowaniu (lub przy ustawionym `DEMO_MODE=true`) dostępna jest wieloetapowa ścieżka pod adresem `http://localhost:4300/app/events`. Każdy krok to osobna strona z dedykowanym widokiem i stanem zapisywanym w `sessionStorage`, dzięki czemu można wrócić do wcześniejszych etapów bez utraty danych.

### Jak uruchomić tryb testowy

```bash
DEMO_MODE=true \  # opcjonalnie, by pominąć logowanie i użyć konta demo
npm run auth:server
# po uruchomieniu odwiedź http://localhost:4300/app/events
```

Do testu potrzebny jest plik `.env` z konfiguracją Microsoft/Airtable (jak w sekcji „Konfiguracja”). W trybie demo wystarczy `SESSION_SECRET` oraz zmienna `DEMO_MODE=true`, aby backend udostępnił widoki bez logowania.

### Etapy konfiguratora

1. **Targi (`/app/events`)** – kafle wydarzeń z filtrem po branży. Kliknięcie przycisku „Wybierz” zapisuje docelowe wydarzenie i aktywuje przycisk przejścia do hal.
2. **Hala (`/app/halls`)** – lista hal powiązanych z wybranym eventem (powierzchnia, magazyn). Zmiana hali resetuje dalsze kroki, aby zamówienie pozostało spójne z magazynem.
3. **Stoisko (`/app/booth`)** – tabela z bazą stoisk zawierająca kolumny: nazwa targów, hala, numer zamówienia, stoisko, wystawca, status ogólny/szczegółowy, NIP, osoba kontaktowa i adres e-mail. Można filtrować po nazwie oraz statusie, a wybór realizowany jest przez zaznaczenie wiersza.
4. **Produkty (`/app/products`)** – konfigurator z przełącznikiem waluty (PLN/EUR), cennikiem (A/B/C), filtrem tekstowym oraz kartami produktów. Każdy produkt ma kontrolę ilości i pole rabatu procentowego, które wpływają na wartości w koszyku.
5. **Podsumowanie (`/app/summary`)** – tabela pozycji zamówienia, obliczenia netto/VAT/brutto, pole „Uwagi do zamówienia”, szybki podgląd bieżących zamówień oraz akcje „Zapisz roboczo” i „Generuj ofertę PDF” (placeholder przed podpięciem właściwego generatora dokumentu).

Przykładowe dane targów, hal, stoisk i produktów znajdują się w `public/app.js`, dzięki czemu całą ścieżkę można przejść bez dodatkowych integracji. Po przygotowaniu API wystarczy podmienić źródło danych w tym pliku.

## Rejestr hal i baza stoisk

Po zsynchronizowaniu wydarzeń możesz lokalnie rejestrować hale oraz przypisaną do nich bazę stoisk, aby mieć miejsce na szybkie wklejenie danych z innych systemów.

1. **Lista hal**

   ```bash
   npm run hall:list
   ```

   Komenda wypisze wszystkie dotychczas utworzone hale wraz z informacją o pliku roboczym CSV.

2. **Utworzenie hali i arkusza wejściowego**

   ```bash
   npm run hall:create -- --eventId=EVT123 --eventName="Warsaw Build 2025" --hall="Hala F"
   ```

   Polecenie zapisze definicję hali w `data/halls.json`, utworzy katalog `data/halls/<event-hala>/` oraz plik `booths.csv` z nagłówkami:

   | Kolumna              | Opis                                 |
   | -------------------- | ------------------------------------ |
   | Nazwa targów        | Nazwa wydarzenia                     |
   | Hala                | Oznaczenie hali                      |
   | Numer zamówienia    | Numer referencyjny zamówienia        |
   | Numer stoiska       | Numer stoiska / pola                 |
   | Nazwa wystawcy      | Nazwa firmy                          |
   | Status ogólny       | Główny status                        |
   | Status szczegółowy  | Dodatkowe informacje o statusie      |
   | NIP                 | Identyfikator podatkowy wystawcy     |
   | Osoba kontaktowa    | Imię i nazwisko osoby odpowiedzialnej|
   | Adres e-mail        | Kontakt mailowy                      |

   Plik CSV można otworzyć w Excelu i wypełnić ręcznie lub poprzez wklejanie z innego systemu.

3. **Import/odświeżenie bazy stoisk**

   ```bash
   npm run hall:import -- --hall=warsaw-build-2025-hala-f
   # opcjonalnie --from=ścieżka.csv --delimiter=; jeśli używasz innego pliku
   ```

   Skrypt sparsuje wskazany plik (obsługuje nagłówki oraz delimitery `,`, `;`, `\t`), ujednolici wartości i zapisze wynik w `data/halls/<hall>/booths.json`. Plik JSON zawiera metadane importu oraz tablicę stoisk gotową do dalszego przetwarzania przez backend lub panel www.
