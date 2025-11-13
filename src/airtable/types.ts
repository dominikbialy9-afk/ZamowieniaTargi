export interface AirtableRecord<TFields extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  createdTime: string;
  fields: TFields;
}

export interface AirtableResponse<TFields extends Record<string, unknown>> {
  records: AirtableRecord<TFields>[];
  offset?: string;
}

export interface FetchTableOptions {
  fields?: string[];
  pageSize?: number;
  maxRecords?: number;
}
