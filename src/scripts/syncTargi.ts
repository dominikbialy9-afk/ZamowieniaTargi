import { config } from 'dotenv';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { AirtableClient } from '../airtable/client';
import { AirtableRecord } from '../airtable/types';

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
  fields: Record<SelectedField, string | number | boolean | ''>;
}

const toCellValue = (value: unknown): string | number | boolean | '' => {
  if (value === null || value === undefined) {
    return '';
  }
  if (Array.isArray(value)) {
    const serialized = value
      .map((item) => {
        if (item === null || item === undefined) return '';
        const itemType = typeof item;
        if (itemType === 'string' || itemType === 'number' || itemType === 'boolean') {
          return item as string | number | boolean;
        }
        try {
          return JSON.stringify(item);
        } catch {
          return String(item);
        }
      })
      .filter((item) => item !== '')
      .join(', ');
    return serialized;
  }
  const valueType = typeof value;
  if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
    return value as string | number | boolean;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

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
      normalizedFields[field] = toCellValue(record.fields[field]);
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
  mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'targi.json');
  writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

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
