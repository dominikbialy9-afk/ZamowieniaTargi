# ZamowieniaTargi

Narzędzie wspierające obsługę zamówień podczas targów. Repozytorium zawiera obecnie prosty moduł integracji z Airtable, który pobiera dane z tabeli **Tabela Targi**.

## Synchronizacja tabeli Targi

1. Utwórz plik `.env` (nie jest dodawany do repozytorium) i zdefiniuj w nim co najmniej token API:

   ```bash
   AIRTABLE_TOKEN=patXXXXXXXXXXXX
   # Opcjonalnie
   AIRTABLE_BASE_ID=appDg7Emi7rYsjFZ2
   AIRTABLE_TABLE_NAME=Tabela Targi
   ```

2. Zainstaluj zależności i uruchom synchronizację:

   ```bash
   npm install
   npm run sync:targi
   ```

3. Połączenie pobiera wskazane kolumny z Airtable z batchingiem i zapisuje wynik w `data/targi.json`. W terminalu wyświetlana jest krótka tabela podglądowa pierwszych rekordów.

Skrypt można wykorzystywać cyklicznie (np. jako zadanie cron), by odświeżać stany wydarzeń i targów bezpośrednio z Airtable.
