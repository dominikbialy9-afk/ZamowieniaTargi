import fs from 'node:fs';
import path from 'node:path';

import type { HallsIndexFile } from './types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const HALLS_DIR = path.join(DATA_DIR, 'halls');
const INDEX_PATH = path.join(DATA_DIR, 'halls.json');

const INDEX_TEMPLATE: HallsIndexFile = {
  version: 1,
  updatedAt: new Date(0).toISOString(),
  halls: [],
};

const fsp = fs.promises;

export async function ensureDataLayout(): Promise<void> {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  await fsp.mkdir(HALLS_DIR, { recursive: true });
}

export async function readIndex(): Promise<HallsIndexFile> {
  await ensureDataLayout();
  try {
    const raw = await fsp.readFile(INDEX_PATH, 'utf8');
    const parsed = JSON.parse(raw) as HallsIndexFile;
    parsed.halls ??= [];
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { ...INDEX_TEMPLATE };
    }
    throw error;
  }
}

export async function writeIndex(index: HallsIndexFile): Promise<void> {
  await ensureDataLayout();
  const payload: HallsIndexFile = {
    ...index,
    updatedAt: new Date().toISOString(),
  };
  await fsp.writeFile(INDEX_PATH, JSON.stringify(payload, null, 2), 'utf8');
}

export function hallSlug(eventId: string, hallName: string): string {
  const base = `${eventId}-${hallName}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return base
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function hallDirectory(slug: string): string {
  return path.join(HALLS_DIR, slug);
}

export function hallWorksheetPath(slug: string): string {
  return path.join(hallDirectory(slug), 'booths.csv');
}

export function hallBoothsJsonPath(slug: string): string {
  return path.join(hallDirectory(slug), 'booths.json');
}

export async function ensureHallFiles(slug: string, headers: string[]): Promise<void> {
  const dir = hallDirectory(slug);
  await fsp.mkdir(dir, { recursive: true });
  const worksheet = hallWorksheetPath(slug);
  try {
    await fsp.access(worksheet);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fsp.writeFile(worksheet, `${headers.join(',')}` + '\n', 'utf8');
    } else {
      throw error;
    }
  }
}

export async function saveBoothsJson(slug: string, payload: unknown): Promise<void> {
  const filePath = hallBoothsJsonPath(slug);
  await fsp.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
}
