import { useCallback, useEffect, useState } from 'react';
import {
  beginToggleLogin,
  clearSession,
  completeToggleLogin,
  ensureFreshSession,
  getSessionUser,
  type ToggleSessionUser,
} from '../utils/auth';

/**
 * Session state for the Toggle Account System. Signing in redirects to the
 * hosted Toggle Account UI (the app never sees credentials); the callback
 * completes the OAuth2 authorization-code + PKCE exchange. Contacts storage
 * is scoped to the signed-in user id (see useContacts).
 */
export function useAuth() {
  const [user, setUser] = useState<ToggleSessionUser | null>(() => getSessionUser());
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');

  // Complete the hosted sign-in redirect (/auth/callback?code=...&state=...)
  useEffect(() => {
    let cancelled = false;

    async function finish() {
      try {
        const session = await completeToggleLogin();
        if (!cancelled && session) setUser(session);
      } catch (e) {
        if (!cancelled) {
          setAuthError(e instanceof Error ? e.message : 'Sign-in failed. Please try again.');
        }
      }
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('code') || params.get('error')) {
      finish();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the access token fresh while the app is open
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      const fresh = await ensureFreshSession();
      if (!fresh) {
        setUser(null);
      } else {
        setUser((prev) => (prev ? { ...prev, ...fresh } : fresh));
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [user]);

  const signIn = useCallback(async () => {
    setIsSigningIn(true);
    setAuthError('');
    try {
      await beginToggleLogin(); // full-page redirect to the hosted UI
    } catch (e) {
      setAuthError(
        e instanceof Error ? e.message : 'Could not start the hosted sign-in.'
      );
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return { user, isSigningIn, authError, signIn, signOut };
}
