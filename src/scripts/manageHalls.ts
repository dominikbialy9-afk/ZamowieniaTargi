import fs from 'node:fs';
import path from 'node:path';

import { ensureHallFiles, hallBoothsJsonPath, hallSlug, hallWorksheetPath, readIndex, saveBoothsJson, writeIndex } from '../halls/storage';
import type { BoothRecord, HallDefinition } from '../halls/types';
import { BOOTH_HEADERS, dropHeaderIfPresent, parseDelimited } from './utils/csv';

interface ArgMap {
  [key: string]: string | undefined;
}

async function main(): Promise<void> {
  const [, , command, ...rest] = process.argv;
  switch (command) {
    case 'list':
      await listHalls();
      break;
    case 'create':
      await createHall(parseArgs(rest));
      break;
    case 'import':
      await importBooths(parseArgs(rest));
      break;
    default:
      printUsage();
      process.exitCode = 1;
  }
}

function parseArgs(args: string[]): ArgMap {
  const map: ArgMap = {};
  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (!token.startsWith('--')) continue;
    const [rawKey, rawValue] = token.slice(2).split('=');
    const key = rawKey.trim();
    if (rawValue !== undefined) {
      map[key] = rawValue.trim();
      continue;
    }
    const next = args[i + 1];
    if (next && !next.startsWith('--')) {
      map[key] = next;
      i += 1;
    } else {
      map[key] = 'true';
    }
  }
  return map;
}

async function listHalls(): Promise<void> {
  const index = await readIndex();
  if (index.halls.length === 0) {
    console.log('Brak utworzonych hal. Użyj `npm run hall:create -- --eventId=... --hall=...`');
    return;
  }

  console.table(
    index.halls.map((hall) => ({
      id: hall.id,
      eventId: hall.eventId,
      eventName: hall.eventName ?? '',
      hall: hall.hallName,
      worksheet: relativePath(hall.boothsWorksheet),
      updatedAt: hall.updatedAt,
    })),
  );
}

async function createHall(args: ArgMap): Promise<void> {
  const eventId = args.eventId ?? args.event ?? '';
  const hallName = args.hall ?? args.hallName ?? '';
  const eventName = args.eventName;

  if (!eventId || !hallName) {
    console.error('Wymagane argumenty: --eventId=ID --hall="Nazwa Hali"');
    process.exitCode = 1;
    return;
  }

  const slug = hallSlug(eventId, hallName);
  const worksheetPath = hallWorksheetPath(slug);

  const index = await readIndex();
  const existing = index.halls.find((hall) => hall.id === slug);
  const timestamp = new Date().toISOString();

  const payload: HallDefinition = existing
    ? { ...existing, eventName, hallName, eventId, boothsWorksheet: worksheetPath, updatedAt: timestamp }
    : {
        id: slug,
        eventId,
        eventName,
        hallName,
        boothsWorksheet: worksheetPath,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

  if (existing) {
    Object.assign(existing, payload);
  } else {
    index.halls.push(payload);
  }

  await ensureHallFiles(slug, BOOTH_HEADERS);
  await writeIndex(index);

  console.log('Hala gotowa do edycji. Arkusz wejściowy:', relativePath(worksheetPath));
  console.log('Uzupełnij plik (możesz otworzyć w Excelu), a następnie uruchom import:');
  console.log(`npm run hall:import -- --hall=${slug}`);
}

async function importBooths(args: ArgMap): Promise<void> {
  const hallId = args.hall ?? args.id;
  if (!hallId) {
    console.error('Podaj identyfikator hali: --hall=<slug>. Użyj `npm run hall:list` by sprawdzić dostępne wartości.');
    process.exitCode = 1;
    return;
  }

  const index = await readIndex();
  const hall = index.halls.find((item) => item.id === hallId);
  if (!hall) {
    console.error(`Nie znaleziono hali ${hallId}.`);
    process.exitCode = 1;
    return;
  }

  const sourcePath = path.resolve(args.from ?? args.source ?? hall.boothsWorksheet);
  const delimiter = args.delimiter;
  let raw: string;
  try {
    raw = await fs.promises.readFile(sourcePath, 'utf8');
  } catch (error) {
    console.error(`Nie mogę odczytać pliku ${sourcePath}:`, (error as Error).message);
    process.exitCode = 1;
    return;
  }

  const parsed = parseDelimited(raw, delimiter);
  const rows = dropHeaderIfPresent(parsed.rows);
  const records: BoothRecord[] = rows.map((row) => toBoothRecord(row));

  const dataset = {
    hall: hallId,
    hallName: hall.hallName,
    eventId: hall.eventId,
    eventName: hall.eventName ?? '',
    importedAt: new Date().toISOString(),
    sourceFile: relativePath(sourcePath),
    delimiter: parsed.delimiter,
    total: records.length,
    headers: BOOTH_HEADERS,
    records,
  };

  await saveBoothsJson(hallId, dataset);
  hall.updatedAt = dataset.importedAt;
  await writeIndex(index);

  console.log(`Zaimportowano ${records.length} rekordów do hali ${hall.hallName}.`);
  console.log('Dane zapisane w:', relativePath(hallBoothsJsonPath(hallId)));
}

function toBoothRecord(row: string[]): BoothRecord {
  const value = (index: number) => (row[index] ?? '').trim();
  return {
    targi: value(0),
    hall: value(1),
    orderNumber: value(2),
    boothNumber: value(3),
    exhibitorName: value(4),
    generalStatus: value(5),
    detailedStatus: value(6),
    nip: value(7),
    contactPerson: value(8),
    contactEmail: value(9),
  };
}

function relativePath(target: string): string {
  return path.relative(process.cwd(), target);
}

function printUsage(): void {
  console.log('Dostępne polecenia:');
  console.log('  npm run hall:list');
  console.log('  npm run hall:create -- --eventId=ID --eventName="Nazwa" --hall="Hala"');
  console.log('  npm run hall:import -- --hall=SLUG [--from=ścieżka.csv] [--delimiter=,|;|\t]');
}

main().catch((error) => {
  console.error('Błąd:', error);
  process.exitCode = 1;
});
