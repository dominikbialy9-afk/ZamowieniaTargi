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
