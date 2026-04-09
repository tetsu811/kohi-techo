'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
};

/**
 * Auth hook that wraps Supabase session handling with a timeout fallback
 * to work around the NavigatorLockAcquireTimeoutError issue.
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const timeout = setTimeout(() => {
      if (!cancelled) setIsLoading(false);
    }, 3000);

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        const s = data.session;
        if (s?.user) {
          setUser({
            id: s.user.id,
            email: s.user.email ?? '',
            displayName: (s.user.user_metadata?.display_name as string) || (s.user.email?.split('@')[0] ?? 'user'),
          });
        }
      } catch (e) {
        console.warn('[useAuth] session error', e);
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setIsLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          displayName: (session.user.user_metadata?.display_name as string) || (session.user.email?.split('@')[0] ?? 'user'),
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, isLoggedIn: !!user, isLoading, signOut };
}
