'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getColors, Theme, FONT } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';
import { supabase, BeanReview } from '@/lib/supabase';
import HexRadar from '@/components/HexRadar';

export default function BeansPage() {
  const { locale, t } = useI18n();
  const [theme, setTheme] = useState<Theme>('light');
  const [reviews, setReviews] = useState<BeanReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const update = () => setTheme((localStorage.getItem('theme') as Theme) ?? 'light');
    update();
    window.addEventListener('themechange', update);
    return () => window.removeEventListener('themechange', update);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('bean_reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      setReviews((data ?? []) as BeanReview[]);
      setLoading(false);
    })();
  }, []);

  const c = getColors(theme);

  const tx = {
    title: locale === 'ja' ? '豆手帖' : locale === 'en' ? 'Bean Book' : '豆評手帖',
    subtitle: locale === 'ja' ? 'みんなの一杯を覗いてみよう。' : locale === 'en' ? "Peek into everyone's cups." : '看看大家最近在喝什麼。',
    empty: locale === 'ja' ? 'まだ一杯も書かれていません。最初の一杯を書きませんか？' : locale === 'en' ? 'No cups yet. Write the first one?' : '還沒有人寫下第一杯，要不要由你開始？',
  };

  const labels = [t('score.aroma'), t('score.acidity'), t('score.sweetness'), t('score.bitterness'), t('score.body'), t('score.aftertaste')];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: c.bg, color: c.text }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: FONT.hand, fontSize: 13, color: c.accent, letterSpacing: '0.1em' }}>
            ◆ Bean Reviews
          </div>
          <h1 style={{ fontFamily: FONT.serif, fontSize: 42, fontWeight: 600, color: c.text, margin: '6px 0 6px' }}>
            {tx.title}
          </h1>
          <p style={{ fontFamily: FONT.cute, fontSize: 14, color: c.textSub, margin: 0 }}>{tx.subtitle}</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: c.textSub, fontFamily: FONT.cute }}>{t('common.loading')}</div>
        ) : reviews.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: c.card,
              border: `1px dashed ${c.border}`,
              borderRadius: 12,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>☕</div>
            <p style={{ fontFamily: FONT.cute, color: c.textSub, marginBottom: 20 }}>{tx.empty}</p>
            <Link
              href="/beans/new"
              style={{
                fontFamily: FONT.cute,
                fontSize: 14,
                backgroundColor: c.accent,
                color: '#fff',
                padding: '10px 24px',
                borderRadius: 20,
              }}
            >
              ✎ {t('nav.new')}
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 20,
            }}
          >
            {reviews.map((r) => (
              <Link
                key={r.id}
                href={`/beans/${r.id}`}
                style={{
                  backgroundColor: c.card,
                  border: `1px solid ${c.border}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  transition: 'all 0.15s',
                  display: 'block',
                }}
              >
                {r.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.photo_url}
                    alt={r.title}
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }}
                  />
                )}
                <div style={{ padding: 20 }}>
                  <div style={{ fontFamily: FONT.hand, fontSize: 11, color: c.accent, marginBottom: 4 }}>
                    No.{r.id.slice(0, 4).toUpperCase()}
                  </div>
                  <h3 style={{ fontFamily: FONT.serif, fontSize: 20, fontWeight: 600, color: c.text, margin: '0 0 4px' }}>
                    {r.title}
                  </h3>
                  <div style={{ fontFamily: FONT.cute, fontSize: 12, color: c.textSub, marginBottom: 14 }}>
                    {[r.origin, r.roast_level, r.brew_method].filter(Boolean).join(' · ')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <HexRadar
                      values={[r.score_aroma, r.score_acidity, r.score_sweetness, r.score_bitterness, r.score_body, r.score_aftertaste]}
                      labels={labels}
                      size={200}
                      color={c.accent}
                      textColor={c.text}
                      gridColor={c.border}
                    />
                  </div>
                  {r.first_impression && (
                    <p
                      style={{
                        fontFamily: FONT.hand,
                        fontSize: 13,
                        color: c.text,
                        lineHeight: 1.8,
                        marginTop: 12,
                        borderTop: `1px dashed ${c.border}`,
                        paddingTop: 12,
                      }}
                    >
                      「{r.first_impression}‍
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
