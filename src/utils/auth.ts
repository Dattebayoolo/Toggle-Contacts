/**
 * Browser SSO client for the Toggle Account System.
 *
 * The app never collects credentials itself. Signing in redirects the browser
 * to the hosted Toggle Account UI:
 *
 *   1. beginToggleLogin()      -> PKCE + state -> redirect to /authorize
 *   2. User signs in / signs up on the hosted UI (email verification, lockout,
 *      argon2id, consent screen — all handled by the auth service)
 *   3. Auth service redirects back to /auth/callback?code=...
 *   4. completeToggleLogin()   -> POST /token (code + PKCE verifier)
 *                                 -> stores { access_token, refresh_token }
 *
 * Access tokens last 15 min; the rotating refresh token (offline_access
 * scope) is used to silently renew via ensureFreshSession().
 *
 * The auth service is proxied through Vite at /api/auth/* to avoid CORS.
 */

const SESSION_KEY = 'toggle_session_v1';
const STATE_KEY = 'toggle_oauth_state'; // { state, codeVerifier } while redirecting

const CLIENT_ID = 'toggle-contacts';
const AUTH_BASE = import.meta.env.VITE_AUTH_UI_URL || 'http://localhost:4000';
const REDIRECT_URI = `${window.location.origin}/auth/callback`;
const SCOPES = 'profile.read offline_access';

export interface ToggleSessionUser {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms when the access token expires
}

export function getAuthBase(): string {
  return AUTH_BASE;
}

/* ── Session storage ───────────────────────────────────────────────────────── */

export function getSessionUser(): ToggleSessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as ToggleSessionUser;
    if (!session?.userId || !session?.accessToken) return null;
    return session;
  } catch {
    return null;
  }
}

function saveSession(session: ToggleSessionUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(STATE_KEY);
}

/* ── PKCE helpers (Web Crypto) ─────────────────────────────────────────────── */

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createPkcePair(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const verifierBytes = crypto.getRandomValues(new Uint8Array(48));
  const codeVerifier = base64UrlEncode(verifierBytes);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
  return { codeVerifier, codeChallenge: base64UrlEncode(digest) };
}

/* ── JWT claims (payload is signed, not encrypted) ─────────────────────────── */

function decodeJwtClaims(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

/* ── 1. Begin: redirect to the hosted Toggle Account sign-in ───────────────── */

export async function beginToggleLogin() {
  const state = base64UrlEncode(crypto.getRandomValues(new Uint8Array(24)));
  const { codeVerifier, codeChallenge } = await createPkcePair();

  sessionStorage.setItem(STATE_KEY, JSON.stringify({ state, codeVerifier }));

  const authorizeUrl = new URL('/authorize', AUTH_BASE);
  authorizeUrl.searchParams.set('client_id', CLIENT_ID);
  authorizeUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('scope', SCOPES);
  authorizeUrl.searchParams.set('code_challenge', codeChallenge);
  authorizeUrl.searchParams.set('code_challenge_method', 'S256');

  window.location.assign(authorizeUrl.toString());
}

/* ── 4. Callback: exchange the authorization code for tokens ───────────────── */

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  user?: { user_id: string; email: string };
  error?: string;
}

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const response = await fetch('/api/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as TokenResponse;
  if (!response.ok) {
    throw new Error(payload.error || 'Token exchange failed.');
  }
  return payload;
}

function buildSession(token: TokenResponse): ToggleSessionUser {
  const claims = decodeJwtClaims(token.access_token) || {};
  const expiresAt = Date.now() + (token.expires_in || 900) * 1000 - 30_000;
  return {
    userId: String(token.user?.user_id || claims.sub || ''),
    email: String(claims.email || token.user?.email || ''),
    accessToken: token.access_token,
    refreshToken: token.refresh_token || '',
    expiresAt,
  };
}

export async function completeToggleLogin(): Promise<ToggleSessionUser | null> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const oauthError = params.get('error');

  if (oauthError) {
    console.error(
      'Toggle Account authorization error:',
      params.get('error_description') || oauthError
    );
    return null;
  }
  if (!code || !state) return null;

  const raw = sessionStorage.getItem(STATE_KEY);
  if (!raw) {
    throw new Error('Missing sign-in state. Please try signing in again.');
  }
  const { state: expectedState, codeVerifier } = JSON.parse(raw) as {
    state: string;
    codeVerifier: string;
  };
  if (state !== expectedState) {
    throw new Error('Sign-in state mismatch. Please try signing in again.');
  }

  const token = await tokenRequest({
    grant_type: 'authorization_code',
    code,
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const session = buildSession(token);
  saveSession(session);
  sessionStorage.removeItem(STATE_KEY);

  // Strip code/state from the address bar
  window.history.replaceState({}, '', window.location.pathname);
  return session;
}

/* ── Silent renewal with the rotating refresh token ─────────────────────────── */

export async function ensureFreshSession(): Promise<ToggleSessionUser | null> {
  const session = getSessionUser();
  if (!session) return null;
  if (Date.now() < session.expiresAt) return session;

  if (!session.refreshToken) {
    // No offline access — force a fresh hosted sign-in.
    clearSession();
    return null;
  }

  try {
    const token = await tokenRequest({
      grant_type: 'refresh_token',
      refresh_token: session.refreshToken,
      client_id: CLIENT_ID,
    });
    const fresh = buildSession(token);
    saveSession(fresh);
    return fresh;
  } catch (e) {
    // Replaying a rotated token revokes the whole family per the auth service.
    console.error('Refresh token rejected — signing out.', e);
    clearSession();
    return null;
  }
}
