import { approveUser, bootstrapUserAccount, disableUser, listUsers, setUserRole, validateRole } from '../users/service';

interface ArgMap {
  [key: string]: string | undefined;
}

async function main(): Promise<void> {
  const [, , command, ...rest] = process.argv;
  const args = parseArgs(rest);

  switch (command) {
    case 'list':
      await listCommand();
      break;
    case 'pending':
      await pendingCommand();
      break;
    case 'approve':
      await approveCommand(args);
      break;
    case 'disable':
      await disableCommand(args);
      break;
    case 'set-role':
      await setRoleCommand(args);
      break;
    case 'bootstrap':
      await bootstrapCommand(args);
      break;
    default:
      printUsage();
      process.exitCode = 1;
  }
}

function parseArgs(tokens: string[]): ArgMap {
  const args: ArgMap = {};
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (!token.startsWith('--')) continue;
    const [rawKey, rawValue] = token.slice(2).split('=');
    const key = rawKey.trim();
    if (rawValue !== undefined) {
      args[key] = rawValue.trim();
      continue;
    }
    const next = tokens[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = 'true';
    }
  }
  return args;
}

async function listCommand(): Promise<void> {
  const users = await listUsers();
  if (users.length === 0) {
    console.log('Brak kont. Użyj `npm run user:bootstrap -- --email=...` aby dodać pierwszego administratora.');
    return;
  }
  console.table(users.map(toRow));
}

async function pendingCommand(): Promise<void> {
  const users = await listUsers();
  const pending = users.filter((user) => user.status === 'pending');
  if (pending.length === 0) {
    console.log('Brak kont oczekujących na akceptację.');
    return;
  }
  console.table(pending.map(toRow));
}

async function approveCommand(args: ArgMap): Promise<void> {
  const id = args.id ?? args.user ?? '';
  const role = validateRole(args.role);
  const admin = args.admin ?? 'cli-admin';
  if (!id) {
    console.error('Podaj identyfikator użytkownika: --id=UUID.');
    process.exitCode = 1;
    return;
  }
  const user = await approveUser(id, role, admin);
  console.log(`Aktywowano konto ${user.email} z rolą ${user.role}.`);
}

async function disableCommand(args: ArgMap): Promise<void> {
  const id = args.id ?? args.user ?? '';
  const admin = args.admin ?? 'cli-admin';
  if (!id) {
    console.error('Podaj identyfikator użytkownika: --id=UUID.');
    process.exitCode = 1;
    return;
  }
  const user = await disableUser(id, admin);
  console.log(`Wyłączono konto ${user.email}.`);
}

async function setRoleCommand(args: ArgMap): Promise<void> {
  const id = args.id ?? args.user ?? '';
  const role = validateRole(args.role);
  const admin = args.admin ?? 'cli-admin';
  if (!id) {
    console.error('Podaj identyfikator użytkownika: --id=UUID.');
    process.exitCode = 1;
    return;
  }
  const user = await setUserRole(id, role, admin);
  console.log(`Zmieniono rolę konta ${user.email} na ${user.role}.`);
}

async function bootstrapCommand(args: ArgMap): Promise<void> {
  const email = args.email ?? '';
  const displayName = args.name ?? args.displayName;
  if (!email) {
    console.error('Podaj adres e-mail konta: --email=adres@warsawexpo.eu');
    process.exitCode = 1;
    return;
  }
  const normalizedRole = validateRole(args.role ?? 'administrator');
  const user = await bootstrapUserAccount(email, normalizedRole, displayName);
  console.log(`Konto ${user.email} jest aktywne z rolą ${user.role}.`);
}

function toRow(user: Awaited<ReturnType<typeof listUsers>>[number]) {
  return {
    id: user.id,
    email: user.email,
    name: user.displayName,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    approvedAt: user.approvedAt ?? '',
  };
}

function printUsage(): void {
  console.log('Zarządzanie kontami:');
  console.log('  npm run user:list');
  console.log('  npm run user:pending');
  console.log('  npm run user:approve -- --id=UUID --role=sprzedawca [--admin=mail]');
  console.log('  npm run user:disable -- --id=UUID [--admin=mail]');
  console.log('  npm run user:set-role -- --id=UUID --role=koordynator [--admin=mail]');
  console.log('  npm run user:bootstrap -- --email=admin@warsawexpo.eu [--role=administrator] [--name="Imię"]');
}

main().catch((error) => {
  console.error('Błąd:', error);
  process.exitCode = 1;
});
