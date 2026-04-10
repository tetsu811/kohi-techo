'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params?.get('next') ?? '/beans';

  useEffect(() => {
    const check = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          subscription.unsubscribe();
          router.push(next);
        }
      });

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        subscription.unsubscribe();
        router.push(next);
      }

      setTimeout(() => {
        subscription.unsubscribe();
        router.push('/login');
      }, 10000);
    };

    check();
  }, [router, next]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF7F2', fontFamily: '"Zen Maru Gothic", "Klee One", sans-serif', color: '#8D6E63', fontSize: 14 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#C75B12', marginBottom: 8, fontFamily: '"Klee One", cursive' }}>— 珈琲手帖 —</div>
        <div>登入中...</div>
      </div>
    </div>
  );
}
