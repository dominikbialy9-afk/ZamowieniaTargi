# ZamowieniaTargi

Narzędzie wspierające obsługę zamówień podczas targów. Repozytorium zawiera obecnie moduły integracji z Airtable, które pobierają dane z tabel **Tabela Targi** oraz **Produkty**.

## Konfiguracja środowiska

1. Utwórz plik `.env` (nie jest dodawany do repozytorium) i zdefiniuj w nim co najmniej token API:

   ```bash
   AIRTABLE_TOKEN=patXXXXXXXXXXXX
   # Opcjonalnie
   AIRTABLE_BASE_ID=appDg7Emi7rYsjFZ2
   AIRTABLE_TABLE_NAME=Tabela Targi
   AIRTABLE_PRODUCTS_TABLE_NAME=Produkty
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
