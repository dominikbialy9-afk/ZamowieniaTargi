import { config as loadEnv } from 'dotenv';

loadEnv();

export interface MicrosoftAuthConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface SessionConfig {
  secret: string;
  ttlSeconds: number;
  cookieName: string;
  sameSite: 'Lax' | 'Strict';
  secureCookies: boolean;
}

export function getAllowedEmailDomain(): string {
  const raw = process.env.ALLOWED_EMAIL_DOMAIN ?? 'warsawexpo.eu';
  return raw.trim().toLowerCase();
}

export function loadMicrosoftConfig(): MicrosoftAuthConfig {
  const tenantId = requireEnv('AZURE_AD_TENANT_ID');
  const clientId = requireEnv('AZURE_AD_CLIENT_ID');
  const clientSecret = requireEnv('AZURE_AD_CLIENT_SECRET');
  const redirectUri = requireEnv('AZURE_AD_REDIRECT_URI');
  const scopes = (process.env.AZURE_AD_SCOPES ?? 'openid profile email offline_access').split(/[ ,]+/).filter(Boolean);

  return { tenantId, clientId, clientSecret, redirectUri, scopes };
}

export function loadSessionConfig(): SessionConfig {
  const secret = requireEnv('SESSION_SECRET');
  const ttlSeconds = parseInteger(process.env.SESSION_TTL_SECONDS, 60 * 60 * 8);
  const cookieName = process.env.SESSION_COOKIE_NAME ?? 'zt_session';
  const sameSite = (process.env.SESSION_SAMESITE as 'Lax' | 'Strict' | undefined) ?? 'Lax';
  const secureCookies = parseBoolean(process.env.SESSION_SECURE_COOKIES, true);

  return { secret, ttlSeconds, cookieName, sameSite, secureCookies };
}

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Brak wymaganej zmiennej środowiskowej ${key}.`);
  }
  return value;
}

function parseInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'y'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n'].includes(normalized)) return false;
  return fallback;
}
