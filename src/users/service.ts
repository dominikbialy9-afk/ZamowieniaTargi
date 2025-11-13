import crypto from 'node:crypto';

import type { MicrosoftProfile } from '../auth/microsoft';
import { getAllowedEmailDomain } from '../config/env';
import { readUserDatabase, upsertUser, writeUserDatabase } from './storage';
import type { Role, UserAccount, UserStatus } from './types';
import { AVAILABLE_ROLES } from './types';

export interface RegisterResult {
  user: UserAccount;
  created: boolean;
}

export async function registerMicrosoftUser(profile: MicrosoftProfile): Promise<RegisterResult> {
  const allowedDomain = getAllowedEmailDomain();
  ensureAllowedDomain(profile.email, allowedDomain);

  const db = await readUserDatabase();
  const normalizedEmail = profile.email.toLowerCase();
  let user = db.users.find((entry) => entry.azureObjectId === profile.oid || entry.email === normalizedEmail);
  const now = new Date().toISOString();

  if (!user) {
    user = {
      id: generateId(),
      email: normalizedEmail,
      displayName: profile.name ?? normalizedEmail,
      role: 'sprzedawca',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      azureObjectId: profile.oid,
      azureTenantId: profile.tid,
      lastLoginAttemptAt: now,
    };
    upsertUser(db, user);
    await writeUserDatabase(db);
    return { user, created: true };
  }

  if (user.status === 'disabled') {
    throw new Error('Konto zostało wyłączone. Skontaktuj się z administratorem.');
  }

  user.email = normalizedEmail;
  user.displayName = profile.name ?? normalizedEmail;
  user.azureObjectId = profile.oid;
  user.azureTenantId = profile.tid;
  user.lastLoginAttemptAt = now;
  user.updatedAt = now;
  await writeUserDatabase(db);

  return { user, created: false };
}

export async function approveUser(userId: string, role: Role, adminId: string): Promise<UserAccount> {
  const db = await readUserDatabase();
  const user = db.users.find((entry) => entry.id === userId);
  if (!user) {
    throw new Error(`Nie znaleziono użytkownika ${userId}.`);
  }
  user.status = 'active';
  user.role = role;
  user.approvedAt = new Date().toISOString();
  user.approvedBy = adminId;
  user.updatedAt = user.approvedAt;
  await writeUserDatabase(db);
  return user;
}

export async function disableUser(userId: string, adminId: string): Promise<UserAccount> {
  const db = await readUserDatabase();
  const user = db.users.find((entry) => entry.id === userId);
  if (!user) {
    throw new Error(`Nie znaleziono użytkownika ${userId}.`);
  }
  user.status = 'disabled';
  user.disabledAt = new Date().toISOString();
  user.disabledBy = adminId;
  user.updatedAt = user.disabledAt;
  await writeUserDatabase(db);
  return user;
}

export async function setUserRole(userId: string, role: Role, adminId: string): Promise<UserAccount> {
  const db = await readUserDatabase();
  const user = db.users.find((entry) => entry.id === userId);
  if (!user) {
    throw new Error(`Nie znaleziono użytkownika ${userId}.`);
  }
  user.role = role;
  user.updatedAt = new Date().toISOString();
  user.approvedBy = adminId;
  await writeUserDatabase(db);
  return user;
}

export async function listUsers(): Promise<UserAccount[]> {
  const db = await readUserDatabase();
  return db.users;
}

export async function getUserById(id: string): Promise<UserAccount | undefined> {
  const db = await readUserDatabase();
  return db.users.find((entry) => entry.id === id);
}

export async function bootstrapUserAccount(email: string, role: Role, displayName?: string): Promise<UserAccount> {
  const allowedDomain = getAllowedEmailDomain();
  ensureAllowedDomain(email.toLowerCase(), allowedDomain);

  const db = await readUserDatabase();
  const normalizedEmail = email.toLowerCase();
  const existing = db.users.find((entry) => entry.email === normalizedEmail);
  const timestamp = new Date().toISOString();

  if (existing) {
    existing.role = role;
    existing.status = 'active';
    existing.displayName = displayName ?? existing.displayName ?? normalizedEmail;
    existing.updatedAt = timestamp;
    existing.approvedAt = timestamp;
    existing.approvedBy = 'bootstrap';
    await writeUserDatabase(db);
    return existing;
  }

  const user: UserAccount = {
    id: generateId(),
    email: normalizedEmail,
    displayName: displayName ?? normalizedEmail,
    role,
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
    approvedAt: timestamp,
    approvedBy: 'bootstrap',
  };
  upsertUser(db, user);
  await writeUserDatabase(db);
  return user;
}

export function ensureAllowedDomain(email: string, allowedDomain: string): void {
  if (!email.endsWith(`@${allowedDomain}`)) {
    throw new Error(`Do systemu mogą logować się jedynie adresy *@${allowedDomain}.`);
  }
}

export function validateRole(value: string | undefined): Role {
  if (!value || !AVAILABLE_ROLES.includes(value as Role)) {
    throw new Error(`Niepoprawna rola. Dostępne wartości: ${AVAILABLE_ROLES.join(', ')}`);
  }
  return value as Role;
}

export function assertUserStatus(user: UserAccount, allowedStatuses: UserStatus[]): void {
  if (!allowedStatuses.includes(user.status)) {
    throw new Error(`Operacja niedozwolona dla statusu ${user.status}.`);
  }
}

function generateId(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return crypto.randomBytes(16).toString('hex');
}
