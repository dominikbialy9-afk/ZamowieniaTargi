import crypto from 'node:crypto';

import type { SessionConfig } from '../config/env';
import type { Role } from '../users/types';

export interface SessionPayload {
  userId: string;
  role: Role;
  issuedAt: number;
  expiresAt: number;
}

export function createSessionToken(config: SessionConfig, userId: string, role: Role): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    userId,
    role,
    issuedAt,
    expiresAt: issuedAt + config.ttlSeconds,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(config.secret, encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(config: SessionConfig, token: string): SessionPayload | undefined {
  const [encodedPayload, providedSignature] = token.split('.');
  if (!encodedPayload || !providedSignature) return undefined;
  const expectedSignature = sign(config.secret, encodedPayload);
  if (!timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature))) {
    return undefined;
  }
  const payload = JSON.parse(Buffer.from(base64UrlDecode(encodedPayload), 'base64').toString('utf8')) as SessionPayload;
  if (payload.expiresAt <= Math.floor(Date.now() / 1000)) {
    return undefined;
  }
  return payload;
}

export function clearSessionCookie(config: SessionConfig): string {
  return `${config.cookieName}=; Path=/; HttpOnly; SameSite=${config.sameSite}; Max-Age=0;${config.secureCookies ? ' Secure;' : ''}`;
}

export function buildSessionCookie(config: SessionConfig, token: string): string {
  const maxAge = config.ttlSeconds;
  return `${config.cookieName}=${token}; Path=/; HttpOnly; SameSite=${config.sameSite}; Max-Age=${maxAge};${config.secureCookies ? ' Secure;' : ''}`;
}

function sign(secret: string, payload: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(value: string): string {
  const padLength = (4 - (value.length % 4)) % 4;
  const padded = `${value}${'='.repeat(padLength)}`;
  return padded.replace(/-/g, '+').replace(/_/g, '/');
}
