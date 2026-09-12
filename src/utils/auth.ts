import type { AuthUser } from '../types/auth';

const USERS_KEY = 'toggle_accounts_v1';
const SESSION_KEY = 'toggle_session_v1';

interface StoredAccount extends AuthUser {
  passwordHash: string;
}

function readAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse accounts', e);
  }
  return [];
}

function writeAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
}

/** Hash a password with SHA-256 (Web Crypto) */
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`toggle::${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getSessionUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthUser;
    // Validate the user still exists
    const exists = readAccounts().some((a) => a.id === session.id);
    return exists ? session : null;
  } catch {
    return null;
  }
}

export function setSessionUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function registerAccount(
  name: string,
  email: string,
  password: string
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!name.trim()) return { ok: false, error: 'Please enter your name.' };
  if (!validateEmail(cleanEmail)) return { ok: false, error: 'Please enter a valid email address.' };
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

  const accounts = readAccounts();
  if (accounts.some((a) => a.email === cleanEmail)) {
    return { ok: false, error: 'An account with this email already exists.' };
  }

  const passwordHash = await hashPassword(password);
  const user: AuthUser = {
    id: `u-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    name: name.trim(),
    email: cleanEmail,
    createdAt: new Date().toISOString(),
  };
  accounts.push({ ...user, passwordHash });
  writeAccounts(accounts);
  setSessionUser(user);
  return { ok: true, user };
}

export async function loginAccount(
  email: string,
  password: string
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const account = readAccounts().find((a) => a.email === cleanEmail);
  if (!account) return { ok: false, error: 'No account found with this email.' };

  const passwordHash = await hashPassword(password);
  if (passwordHash !== account.passwordHash) {
    return { ok: false, error: 'Incorrect password. Please try again.' };
  }

  const user: AuthUser = {
    id: account.id,
    name: account.name,
    email: account.email,
    createdAt: account.createdAt,
  };
  setSessionUser(user);
  return { ok: true, user };
}

export function logoutAccount() {
  setSessionUser(null);
}
