import fs from 'node:fs';
import path from 'node:path';

import type { UserAccount, UserDatabase } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

export async function readUserDatabase(): Promise<UserDatabase> {
  try {
    const raw = await fs.promises.readFile(USERS_FILE, 'utf8');
    return JSON.parse(raw) as UserDatabase;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return createEmptyDatabase();
    }
    throw error;
  }
}

export async function writeUserDatabase(db: UserDatabase): Promise<void> {
  await fs.promises.mkdir(DATA_DIR, { recursive: true });
  const payload = JSON.stringify({ ...db, updatedAt: new Date().toISOString() }, null, 2);
  await fs.promises.writeFile(USERS_FILE, payload, 'utf8');
}

export function upsertUser(db: UserDatabase, user: UserAccount): void {
  const index = db.users.findIndex((entry) => entry.id === user.id);
  if (index >= 0) {
    db.users[index] = user;
  } else {
    db.users.push(user);
  }
}

function createEmptyDatabase(): UserDatabase {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    users: [],
  };
}
