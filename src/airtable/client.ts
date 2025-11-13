import { AirtableRecord, AirtableResponse, FetchTableOptions } from './types';

const AIRTABLE_API_URL = 'https://api.airtable.com/v0';

interface AirtableClientConfig {
  token: string;
  baseId: string;
}

export class AirtableClient {
  private readonly headers: Record<string, string>;

  constructor(private readonly config: AirtableClientConfig) {
    if (!config.token) {
      throw new Error('Brak tokenu Airtable (AIRTABLE_TOKEN).');
    }
    if (!config.baseId) {
      throw new Error('Brak identyfikatora bazy Airtable (AIRTABLE_BASE_ID).');
    }

    this.headers = {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/json'
    };
  }

  async fetchTable<TFields extends Record<string, unknown>>(tableName: string, options: FetchTableOptions = {}): Promise<AirtableRecord<TFields>[]> {
    if (!tableName) {
      throw new Error('Należy podać nazwę tabeli Airtable.');
    }

    const fields = options.fields ?? [];
    const pageSize = options.pageSize ?? 100;
    const maxRecords = options.maxRecords ?? Infinity;

    let offset: string | undefined;
    const collected: AirtableRecord<TFields>[] = [];

    do {
      const searchParams = new URLSearchParams();
      if (fields.length > 0) {
        for (const field of fields) {
          searchParams.append('fields[]', field);
        }
      }
      searchParams.append('pageSize', pageSize.toString());
      if (offset) {
        searchParams.append('offset', offset);
      }

      const url = `${AIRTABLE_API_URL}/${this.config.baseId}/${encodeURIComponent(tableName)}?${searchParams.toString()}`;
      const response = await fetch(url, { headers: this.headers });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Błąd Airtable ${response.status} ${response.statusText}: ${errorBody}`);
      }

      const data = (await response.json()) as AirtableResponse<TFields>;
      collected.push(...data.records);
      offset = data.offset;
    } while (offset && collected.length < maxRecords);

    if (collected.length > maxRecords) {
      return collected.slice(0, maxRecords);
    }

    return collected;
  }
}
