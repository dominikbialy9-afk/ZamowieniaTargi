import { config } from 'dotenv';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { AirtableClient } from '../airtable/client';
import { AirtableRecord } from '../airtable/types';
import { normalizeCellValue, NormalizedValue } from './utils/normalize';

config();

const DEFAULT_TABLE_NAME = 'Produkty';
const SELECTED_FIELDS = [
  'Nazwa',
  'Główna nazwa PL',
  'Główna nazwa ENG',
  'Nazwa produktu Sklep',
  'Nazwa Archicad',
  'Nazwa Magazyn',
  'Kod produktu Magazyn',
  'Główny Product ID',
  'Status produktu',
  'Pozycja',
  'Kodowanie',
  'Główna kategoria',
  'Rodzaj produktu',
  'Grupa rabatu',
  'Klasa Produktu',
  'Rodzaj materiału',
  'Wymiary',
  'Cena propozycja',
  'Cena regularna A',
  'Cena minimalna A',
  'Cena Last Minute A',
  'Cena na targach A',
  'Cena regularna C',
  'Cena minimalna C',
  'Cena Last Minute C',
  'Cena na targach C',
  'Cena regularna sklep',
  'Cena netto zakupu produktu',
  'Jednostka miary',
  'Ilość produktów na magazynie',
  'Ilość dostępnych produktów',
  'Magazyn PWE',
  'Żywotność (Ilość) Przedmiot',
  'Serwis Materiał (cena brutto)',
  'Serwis Materiał (cena netto)',
  'Pomniejszona marża o żywotność (Żywotność Wartość)',
  'Marża na produkcie A',
  'Marża na produkcie B',
  'Marża na produkcie C',
  'Czas realizacji',
  'Czas Zakupu',
  'Dostawca Zakupu',
  'Opis produktu marketing PL',
  'Opis produktu marketing ENG',
  'Zastosowanie PL',
  'Zastosowanie ENG',
  'Uwagi Techniczne PL',
  'Uwagi Techniczne ENG',
  'Grafika Produktu',
  'Grafika- Ikona produktu Archicad',
  'Grafika Produktu Plik'
] as const;

type SelectedField = (typeof SELECTED_FIELDS)[number];
export type ProductRecordFields = Partial<Record<SelectedField, unknown>>;

interface NormalizedProductRecord {
  id: string;
  createdTime: string;
  fields: Record<SelectedField, NormalizedValue>;
}

async function run() {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID ?? 'appDg7Emi7rYsjFZ2';
  const tableName = process.env.AIRTABLE_PRODUCTS_TABLE_NAME ?? DEFAULT_TABLE_NAME;

  if (!token) {
    throw new Error('Brak ustawionej zmiennej AIRTABLE_TOKEN.');
  }

  const client = new AirtableClient({ token, baseId });
  const records = await client.fetchTable<ProductRecordFields>(tableName, {
    fields: [...SELECTED_FIELDS],
    pageSize: 100
  });

  const normalized: NormalizedProductRecord[] = records.map((record: AirtableRecord<ProductRecordFields>) => {
    const normalizedFields = {} as NormalizedProductRecord['fields'];
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
  mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'produkty.json');
  writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`Pobrano ${normalized.length} rekordów z tabeli "${tableName}".`);
  console.log(`Dane zapisano w ${outputPath}.`);

  if (normalized.length > 0) {
    const preview = normalized.slice(0, 5).map((record) => ({
      id: record.id,
      Nazwa: record.fields['Nazwa'],
      'Status produktu': record.fields['Status produktu'],
      'Główna kategoria': record.fields['Główna kategoria'],
      'Cena na targach A': record.fields['Cena na targach A']
    }));
    console.table(preview);
  }
}

run().catch((error) => {
  console.error('Nie udało się pobrać danych z tabeli Produkty.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
