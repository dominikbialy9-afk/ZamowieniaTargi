export const BOOTH_HEADERS = [
  'Nazwa targów',
  'Hala',
  'Numer zamówienia',
  'Numer stoiska',
  'Nazwa wystawcy',
  'Status ogólny',
  'Status szczegółowy',
  'NIP',
  'Osoba kontaktowa',
  'Adres e-mail',
];

const NORMALIZED_HEADERS = BOOTH_HEADERS.map((header) => normalizeHeader(header));

export interface ParsedDelimitedFile {
  delimiter: string;
  rows: string[][];
}

export function parseDelimited(content: string, delimiter?: string): ParsedDelimitedFile {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { delimiter: delimiter ?? ',', rows: [] };
  }

  const detectedDelimiter = delimiter ?? detectDelimiter(lines[0]);
  const rows = lines.map((line) => splitLine(line, detectedDelimiter));
  return { delimiter: detectedDelimiter, rows };
}

export function dropHeaderIfPresent(rows: string[][]): string[][] {
  if (rows.length === 0) return rows;
  const normalized = rows[0].map(normalizeHeader);
  const matchesHeader = normalized.every((value, idx) => value === NORMALIZED_HEADERS[idx]);
  return matchesHeader ? rows.slice(1) : rows;
}

function detectDelimiter(sample: string): string {
  const delimiters = [',', ';', '\t'];
  const ranked = delimiters
    .map((delim) => ({ delim, count: [...sample].filter((char) => char === delim).length }))
    .sort((a, b) => b.count - a.count);
  const best = ranked[0];
  return best && best.count > 0 ? best.delim : ',';
}

function splitLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === delimiter && !insideQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function normalizeHeader(header: string): string {
  return header
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
