import crypto from 'node:crypto';
import http from 'node:http';

import { buildMicrosoftAuthorizationUrl, exchangeCodeForToken, verifyMicrosoftIdToken } from '../auth/microsoft';
import { buildSessionCookie, clearSessionCookie, createSessionToken, verifySessionToken } from '../auth/session';
import { getAllowedEmailDomain, loadMicrosoftConfig, loadSessionConfig } from '../config/env';
import {
  approveUser,
  disableUser,
  getUserById,
  listUsers,
  registerMicrosoftUser,
  setUserRole,
  validateRole,
} from '../users/service';
import type { UserAccount } from '../users/types';

type HttpRequest = any;
type HttpResponse = any;

const microsoftConfig = loadMicrosoftConfig();
const sessionConfig = loadSessionConfig();
const allowedDomain = getAllowedEmailDomain();
const loginStates = new Map<string, { nonce: string; createdAt: number }>();
const server = http.createServer(requestHandler);
const port = Number.parseInt(process.env.PORT ?? '4300', 10);

server.listen(port, () => {
  console.log(`Serwer logowania działa na http://localhost:${port}`);
});

async function requestHandler(req: HttpRequest, res: HttpResponse): Promise<void> {
  const method = req.method ?? 'GET';
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (method === 'GET' && url.pathname === '/') {
    await handleHome(req, res);
    return;
  }
  if (method === 'GET' && url.pathname === '/auth/login') {
    await handleLogin(res);
    return;
  }
  if (method === 'GET' && url.pathname === '/auth/callback') {
    await handleCallback(req, res, url);
    return;
  }
  if (method === 'GET' && url.pathname === '/api/session') {
    await respondSession(req, res);
    return;
  }
  if (method === 'POST' && url.pathname === '/api/logout') {
    await handleLogout(res);
    return;
  }
  if (url.pathname.startsWith('/admin/users')) {
    await handleAdminRoute(req, res, method, url);
    return;
  }

  res.statusCode = 404;
  res.end('Not found');
}

async function handleHome(req: HttpRequest, res: HttpResponse): Promise<void> {
  const sessionUser = await resolveSessionUser(req);
  const body = sessionUser
    ? `<h1>Panel Zamówienia Targi</h1><p>Zalogowano jako <strong>${escapeHtml(sessionUser.displayName)}</strong> (${sessionUser.role}).</p><form method="post" action="/api/logout"><button type="submit">Wyloguj</button></form>`
    : `<h1>Panel Zamówienia Targi</h1><p>Musisz się zalogować służbowym adresem @${allowedDomain}.</p><a href="/auth/login">Zaloguj przez Microsoft</a>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(body);
}

async function handleLogin(res: HttpResponse): Promise<void> {
  const state = crypto.randomBytes(16).toString('hex');
  const nonce = crypto.randomBytes(16).toString('hex');
  loginStates.set(state, { nonce, createdAt: Date.now() });
  const redirectUrl = buildMicrosoftAuthorizationUrl(microsoftConfig, state, nonce);
  res.statusCode = 302;
  res.setHeader('Location', redirectUrl);
  res.end();
}

async function handleCallback(req: HttpRequest, res: HttpResponse, url: URL): Promise<void> {
  const error = url.searchParams.get('error');
  if (error) {
    res.statusCode = 400;
    res.end(`Logowanie nie powiodło się: ${error}`);
    return;
  }
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) {
    res.statusCode = 400;
    res.end('Brak kodu lub stanu logowania.');
    return;
  }
  const stored = loginStates.get(state);
  loginStates.delete(state);
  if (!stored) {
    res.statusCode = 400;
    res.end('Niepoprawny stan logowania. Spróbuj ponownie.');
    return;
  }

  try {
    const tokenResponse = await exchangeCodeForToken(microsoftConfig, code);
    const profile = await verifyMicrosoftIdToken(microsoftConfig, tokenResponse.id_token, stored.nonce);
    const { user } = await registerMicrosoftUser(profile);
    if (user.status !== 'active') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(
        `<h1>Dziękujemy</h1><p>Konto ${escapeHtml(user.email)} oczekuje na akceptację administratora. ` +
          'Powiadom zespół administracyjny, aby potwierdzili dostęp.</p>',
      );
      return;
    }

    const sessionToken = createSessionToken(sessionConfig, user.id, user.role);
    res.statusCode = 302;
    res.setHeader('Set-Cookie', buildSessionCookie(sessionConfig, sessionToken));
    res.setHeader('Location', '/');
    res.end();
  } catch (authError) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(`Logowanie nie powiodło się: ${(authError as Error).message}`);
  }
}

async function respondSession(req: HttpRequest, res: HttpResponse): Promise<void> {
  const sessionUser = await resolveSessionUser(req);
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify(
      sessionUser
        ? { authenticated: true, user: toSafeUser(sessionUser) }
        : { authenticated: false },
    ),
  );
}

async function handleLogout(res: HttpResponse): Promise<void> {
  res.statusCode = 200;
  res.setHeader('Set-Cookie', clearSessionCookie(sessionConfig));
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success: true }));
}

async function handleAdminRoute(
  req: HttpRequest,
  res: HttpResponse,
  method: string,
  url: URL,
): Promise<void> {
  const sessionUser = await resolveSessionUser(req);
  if (!sessionUser || sessionUser.role !== 'administrator') {
    res.statusCode = 403;
    res.end('Brak uprawnień administratora.');
    return;
  }

  if (method === 'GET' && url.pathname === '/admin/users/pending') {
    const users = await listUsers();
    const pending = users.filter((user) => user.status === 'pending');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ total: pending.length, users: pending.map(toSafeUser) }));
    return;
  }

  const approveMatch = url.pathname.match(/^\/admin\/users\/([^/]+)\/approve$/);
  if (method === 'POST' && approveMatch) {
    const body = await parseJsonBody(req);
    const role = validateRole(typeof body.role === 'string' ? body.role : String(body.role ?? ''));
    const user = await approveUser(approveMatch[1], role, sessionUser.email);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ user: toSafeUser(user) }));
    return;
  }

  const disableMatch = url.pathname.match(/^\/admin\/users\/([^/]+)\/disable$/);
  if (method === 'POST' && disableMatch) {
    const user = await disableUser(disableMatch[1], sessionUser.email);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ user: toSafeUser(user) }));
    return;
  }

  const roleMatch = url.pathname.match(/^\/admin\/users\/([^/]+)\/role$/);
  if (method === 'POST' && roleMatch) {
    const body = await parseJsonBody(req);
    const role = validateRole(typeof body.role === 'string' ? body.role : String(body.role ?? ''));
    const user = await setUserRole(roleMatch[1], role, sessionUser.email);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ user: toSafeUser(user) }));
    return;
  }

  res.statusCode = 404;
  res.end('Nieznany endpoint administracyjny.');
}

async function resolveSessionUser(req: HttpRequest): Promise<UserAccount | undefined> {
  const token = extractSessionToken(req);
  if (!token) return undefined;
  const payload = verifySessionToken(sessionConfig, token);
  if (!payload) return undefined;
  const user = await getUserById(payload.userId);
  if (!user || user.status !== 'active') {
    return undefined;
  }
  return user;
}

function extractSessionToken(req: HttpRequest): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [rawKey, rawValue] = cookie.trim().split('=');
    if (rawKey === sessionConfig.cookieName) {
      return rawValue;
    }
  }
  return undefined;
}

async function parseJsonBody(req: HttpRequest): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req as AsyncIterable<Buffer>) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>;
  } catch (error) {
    throw new Error(`Nieprawidłowe JSON: ${(error as Error).message}`);
  }
}

function toSafeUser(user: UserAccount) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#039;';
      default:
        return char;
    }
  });
}
