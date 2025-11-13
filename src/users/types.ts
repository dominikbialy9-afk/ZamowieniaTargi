export type Role = 'administrator' | 'sprzedawca' | 'magazynier' | 'koordynator';
export type UserStatus = 'pending' | 'active' | 'disabled';

export interface UserAccount {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  status: UserStatus;
  azureObjectId?: string;
  azureTenantId?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  disabledAt?: string;
  disabledBy?: string;
  lastLoginAttemptAt?: string;
}

export interface UserDatabase {
  version: 1;
  updatedAt: string;
  users: UserAccount[];
}

export const AVAILABLE_ROLES: Role[] = ['administrator', 'sprzedawca', 'magazynier', 'koordynator'];

export function isRole(value: string | undefined): value is Role {
  return AVAILABLE_ROLES.includes(value as Role);
}
