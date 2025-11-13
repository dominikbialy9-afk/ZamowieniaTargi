import crypto from 'node:crypto';
import https from 'node:https';

import type { MicrosoftAuthConfig } from '../config/env';

export interface MicrosoftTokenResponse {
  token_type: string;
  scope: string;
  expires_in: number;
  ext_expires_in?: number;
  access_token: string;
  id_token: string;
  refresh_token?: string;
}

export interface MicrosoftProfile {
  oid: string;
  tid: string;
  email: string;
  preferredUsername: string;
  name?: string;
  nonce?: string;
}

interface JwtHeader {
  kid: string;
  alg: string;
  typ: string;
}

interface JwtPayload {
  aud: string;
  iss: string;
  iat: number;
  exp: number;
  nbf?: number;
  oid: string;
  tid: string;
  nonce?: string;
  name?: string;
  preferred_username?: string;
  email?: string;
}

interface JwkKey {
  kid: string;
  nbf?: number;
  use: string;
  kty: string;
  e: string;
  n: string;
  x5c?: string[];
}

interface JwksResponse {
  keys: JwkKey[];
}

const jwksCache = new Map<string, { fetchedAt: number; keys: JwkKey[] }>();
const JWKS_TTL_MS = 5 * 60 * 1000;

export function buildMicrosoftAuthorizationUrl(
  config: MicrosoftAuthConfig,
  state: string,
  nonce: string,
): string {
  const base = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize`;
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    response_mode: 'query',
    scope: config.scopes.join(' '),
    state,
    nonce,
    prompt: 'select_account',
  });
  return `${base}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  config: MicrosoftAuthConfig,
  code: string,
): Promise<MicrosoftTokenResponse> {
  const tokenEndpoint = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
  }).toString();

  const payload = await httpPost(tokenEndpoint, body, 'application/x-www-form-urlencoded');
  const parsed = JSON.parse(payload) as Partial<MicrosoftTokenResponse>;
  if (!parsed.id_token || !parsed.access_token) {
    throw new Error('Niepoprawna odpowiedź token endpointu Microsoft (brak id_token/access_token).');
  }
  return parsed as MicrosoftTokenResponse;
}

export async function verifyMicrosoftIdToken(
  config: MicrosoftAuthConfig,
  rawToken: string,
  expectedNonce?: string,
): Promise<MicrosoftProfile> {
  const segments = rawToken.split('.');
  if (segments.length !== 3) {
    throw new Error('Niepoprawny format tokenu ID.');
  }

  const header = parseSegment<JwtHeader>(segments[0]);
  const payload = parseSegment<JwtPayload>(segments[1]);
  const signature = base64UrlToBuffer(segments[2]);
  const signingInput = Buffer.from(`${segments[0]}.${segments[1]}`, 'utf8');

  if (payload.aud !== config.clientId) {
    throw new Error('Token nie jest przeznaczony dla tej aplikacji (aud).');
  }
  const expectedIssuer = `https://login.microsoftonline.com/${config.tenantId}/v2.0`;
  if (payload.iss !== expectedIssuer) {
    throw new Error('Token pochodzi z innego wystawcy (iss).');
  }
  if (payload.tid !== config.tenantId) {
    throw new Error('Token pochodzi z innego dzierżawcy (tid).');
  }
  const now = Math.floor(Date.now() / 1000);
  if (payload.nbf && now + 60 < payload.nbf) {
    throw new Error('Token jeszcze nie obowiązuje (nbf).');
  }
  if (payload.exp <= now) {
    throw new Error('Token wygasł (exp).');
  }
  if (expectedNonce && payload.nonce !== expectedNonce) {
    throw new Error('Nieprawidłowy parametr nonce.');
  }

  const jwk = await findJwk(config.tenantId, header.kid);
  if (!verifySignature(header.alg, jwk, signingInput, signature)) {
    throw new Error('Podpis tokenu jest nieprawidłowy.');
  }

  const email = (payload.email ?? payload.preferred_username ?? '').toLowerCase();
  if (!email) {
    throw new Error('Token nie zawiera adresu e-mail.');
  }

  return {
    oid: payload.oid,
    tid: payload.tid,
    email,
    preferredUsername: payload.preferred_username ?? email,
    name: payload.name,
    nonce: payload.nonce,
  };
}

async function findJwk(tenantId: string, kid: string): Promise<JwkKey> {
  const cacheKey = `${tenantId}:${kid}`;
  const cached = jwksCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.fetchedAt < JWKS_TTL_MS) {
    return selectKey(cached.keys, kid);
  }

  const jwksUrl = `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;
  const raw = await httpGet(jwksUrl);
  const data = JSON.parse(raw) as JwksResponse;
  if (!data.keys || data.keys.length === 0) {
    throw new Error('Microsoft nie zwrócił żadnych kluczy JWKS.');
  }
  jwksCache.set(cacheKey, { fetchedAt: now, keys: data.keys });
  return selectKey(data.keys, kid);
}

function selectKey(keys: JwkKey[], kid: string): JwkKey {
  const key = keys.find((item) => item.kid === kid);
  if (!key) {
    throw new Error('Brak odpowiedniego klucza publicznego dla tokenu (kid).');
  }
  return key;
}

function verifySignature(alg: string, jwk: JwkKey, signingInput: Buffer, signature: Buffer): boolean {
  if (alg !== 'RS256') {
    throw new Error(`Nieobsługiwany algorytm podpisu ${alg}.`);
  }
  const cert = jwk.x5c?.[0];
  if (!cert) {
    throw new Error('Klucz JWKS nie zawiera certyfikatu x5c.');
  }
  const pem = formatCert(cert);
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(signingInput);
  verifier.end();
  return verifier.verify(pem, signature);
}

function parseSegment<T>(segment: string): T {
  const json = Buffer.from(base64Url(segment), 'base64').toString('utf8');
  return JSON.parse(json) as T;
}

function base64UrlToBuffer(segment: string): Buffer {
  return Buffer.from(base64Url(segment), 'base64');
}

function base64Url(input: string): string {
  const padLength = (4 - (input.length % 4)) % 4;
  const padded = `${input}${'='.repeat(padLength)}`;
  return padded.replace(/-/g, '+').replace(/_/g, '/');
}

function formatCert(cert: string): string {
  const lines = cert.match(/.{1,64}/g) ?? [];
  return `-----BEGIN CERTIFICATE-----\n${lines.join('\n')}\n-----END CERTIFICATE-----`;
}

function httpGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res: any) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Błąd HTTP ${res.statusCode}: ${Buffer.concat(chunks).toString('utf8')}`));
            return;
          }
          resolve(Buffer.concat(chunks).toString('utf8'));
        });
      })
      .on('error', reject);
  });
}

function httpPost(url: string, body: string, contentType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = https.request(url, { method: 'POST', headers: { 'Content-Type': contentType, 'Content-Length': Buffer.byteLength(body).toString() } }, (res: any) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const payload = Buffer.concat(chunks).toString('utf8');
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Błąd HTTP ${res.statusCode}: ${payload}`));
          return;
        }
        resolve(payload);
      });
    });
    request.on('error', reject);
    request.write(body);
    request.end();
  });
}
