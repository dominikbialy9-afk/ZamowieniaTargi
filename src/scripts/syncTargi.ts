import { config } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { AirtableClient } from '../airtable/client';
import { AirtableRecord } from '../airtable/types';
import { normalizeCellValue, NormalizedValue } from './utils/normalize';

config();

const DEFAULT_TABLE_NAME = 'Tabela Targi';
const SELECTED_FIELDS = [
  'Status Targów',
  'Nazwa wydarzenia',
  'Branża',
  'ID Targi1',
  'Data wydarzenia',
  'Edycja',
  'Ilość dosprzedaży na targach',
  'Kwota dosprzedaży na targach',
  'Nazwa wydarzenia (Grupa)',
  'Edycja (W dniu wydarzenia)',
  'Edycja (w dniu wydarzenia rok temu)',
  'Edycja (kryteria)',
  'Sezon',
  'Link Logo'
] as const;

type SelectedField = (typeof SELECTED_FIELDS)[number];

export type TargiRecordFields = Partial<Record<SelectedField, unknown>>;

interface NormalizedRecord {
  id: string;
  createdTime: string;
  fields: Record<SelectedField, NormalizedValue>;
}

async function run() {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID ?? 'appDg7Emi7rYsjFZ2';
  const tableName = process.env.AIRTABLE_TABLE_NAME ?? DEFAULT_TABLE_NAME;

  if (!token) {
    throw new Error('Brak ustawionej zmiennej AIRTABLE_TOKEN.');
  }

  const client = new AirtableClient({ token, baseId });
  const records = await client.fetchTable<TargiRecordFields>(tableName, {
    fields: [...SELECTED_FIELDS],
    pageSize: 100
  });

  const normalized: NormalizedRecord[] = records.map((record: AirtableRecord<TargiRecordFields>) => {
    const normalizedFields = {} as NormalizedRecord['fields'];
    for (const field of SELECTED_FIELDS) {
      normalizedFields[field] = normalizeCellValue(record.fields[field]);
    }
    return {
      id: record.id,
      createdTime: record.createdTime,
      fields: normalizedFields
    };
  });

  const output = {
    fetchedAt: new Date().toISOString(),
    table: tableName,
    total: normalized.length,
    fields: SELECTED_FIELDS,
    records: normalized
  };

  const outputDir = path.resolve('data');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'targi.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`Pobrano ${normalized.length} rekordów z tabeli "${tableName}".`);
  console.log(`Dane zapisano w ${outputPath}.`);

  if (normalized.length > 0) {
    const preview = normalized.slice(0, 5).map((record) => ({
      id: record.id,
      'Nazwa wydarzenia': record.fields['Nazwa wydarzenia'],
      'Status Targów': record.fields['Status Targów'],
      Sezon: record.fields['Sezon'],
      'Data wydarzenia': record.fields['Data wydarzenia']
    }));
    console.table(preview);
  }
}

run().catch((error) => {
  console.error('Nie udało się pobrać danych z Airtable.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
