'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getColors, Theme, FONT } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';
import { supabase, BeanReview } from '@/lib/supabase';
import HexRadar from '@/components/HexRadar';

export default function BeanDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { locale, t } = useI18n();
  const [theme, setTheme] = useState<Theme>('light');
  const [review, setReview] = useState<BeanReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<{ id: string; body: string; user_id: string; created_at: string }[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const update = () => setTheme((localStorage.getItem('theme') as Theme) ?? 'light');
    update();
    window.addEventListener('themechange', update);
    return () => window.removeEventListener('themechange', update);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('bean_reviews').select('*').eq('id', id).single();
      setReview(data as BeanReview | null);
      setLoading(false);

      const { data: cs } = await supabase
        .from('comments')
        .select('*')
        .eq('target_type', 'bean_review')
        .eq('target_id', id)
        .order('created_at', { ascending: true });
      setComments((cs ?? []) as typeof comments);
    })();
  }, [id]);

  const c = getColors(theme);

  const tx = {
    firstImpression: locale === 'ja' ? '第一口の印象' : locale === 'en' ? 'First-sip impression' : '第一口印象',
    flavorNotes: locale === 'ja' ? '思い出す風味' : locale === 'en' ? 'Flavor memory' : '聯想的風味',
    recommendation: locale === 'ja' ? '友達への一言' : locale === 'en' ? 'A word to a friend' : '推薦給朋友',
    comments: locale === 'ja' ? 'コメント' : locale === 'en' ? 'Comments' : '留言',
    writeComment: locale === 'ja' ? 'コメントを書く...' : locale === 'en' ? 'Leave a comment...' : '留言⋯',
    post: locale === 'ja' ? '送る' : locale === 'en' ? 'Post' : '送出',
    notFound: locale === 'ja' ? '見つかりませんでした' : locale === 'en' ? 'Not found' : '找不到這則紀錄',
  };

  const labels = [
    t('score.aroma'),
    t('score.acidity'),
    t('score.sweetness'),
    t('score.bitterness'),
    t('score.body'),
    t('score.aftertaste'),
  ];

  const postComment = async () => {
    if (!newComment.trim()) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data } = await supabase
      .from('comments')
      .insert({
        user_id: userData.user.id,
        target_type: 'bean_review',
        target_id: id,
        body: newComment.trim(),
      })
      .select()
      .single();
    if (data) {
      setComments([...comments, data]);
      setNewComment('');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: c.bg, color: c.textSub, padding: 80, textAlign: 'center', fontFamily: FONT.cute }}>
        {t('common.loading')}
      </div>
    );
  }

  if (!review) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: c.bg, color: c.text, padding: 80, textAlign: 'center' }}>
        <p style={{ fontFamily: FONT.cute, color: c.textSub }}>{tx.notFound}</p>
        <Link href="/beans" style={{ color: c.accent, fontFamily: FONT.cute }}>
          ← {t('nav.beans')}
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: c.bg, color: c.text }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 80px' }}>
        <Link href="/beans" style={{ color: c.textSub, fontFamily: FONT.cute, fontSize: 13 }}>
          ← {t('nav.beans')}
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 24 }}>
          {/* Photo */}
          <div>
            {review.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={review.photo_url}
                alt={review.title}
                style={{ width: '100%', borderRadius: 12, border: `1px solid ${c.border}` }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  backgroundColor: c.card,
                  border: `1px solid ${c.border}`,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 80,
                  color: c.textMuted,
                }}
              >
                ☕
              </div>
            )}
          </div>

          {/* Info + Radar */}
          <div>
            <div style={{ fontFamily: FONT.hand, fontSize: 13, color: c.accent, marginBottom: 4 }}>
              No.{review.id.slice(0, 4).toUpperCase()}
            </div>
            <h1 style={{ fontFamily: FONT.serif, fontSize: 36, fontWeight: 600, color: c.text, margin: '0 0 6px' }}>
              {review.title}
            </h1>
            <div style={{ fontFamily: FONT.cute, fontSize: 13, color: c.textSub, marginBottom: 20 }}>
              {[review.origin, review.roaster, review.roast_level, review.brew_method].filter(Boolean).join(' · ')}
            </div>

            <div
              style={{
                backgroundColor: c.card,
                border: `1px solid ${c.border}`,
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <HexRadar
                values={[
                  review.score_aroma,
                  review.score_acidity,
                  review.score_sweetness,
                  review.score_bitterness,
                  review.score_body,
                  review.score_aftertaste,
                ]}
                labels={labels}
                size={300}
                color={c.accent}
                textColor={c.text}
                gridColor={c.border}
              />
            </div>
          </div>
        </div>

        {/* Story */}
        <div style={{ marginTop: 40, backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: 36 }}>
          {review.first_impression && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: FONT.cute, fontSize: 12, color: c.accent, marginBottom: 6 }}>— {tx.firstImpression}</div>
              <p style={{ fontFamily: FONT.hand, fontSize: 18, color: c.text, lineHeight: 1.9, margin: 0 }}>
                「{review.first_impression}�#B ��          </p>
            </div>
          )}
          {review.flavor_notes && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: FONT.cute, fontSize: 12, color: c.accent, marginBottom: 6 }}>— {tx.flavorNotes}</div>
              <p style={{ fontFamily: FONT.hand, fontSize: 17, color: c.text, lineHeight: 1.9, margin: 0 }}>
                {review.flavor_notes}
              </p>
            </div>
          )}
          {review.recommendation && (
            <div>
              <div style={{ fontFamily: FONT.cute, fontSize: 12, color: c.accent, marginBottom: 6 }}>— {tx.recommendation}</div>
              <p style={{ fontFamily: FONT.hand, fontSize: 17, color: c.text, lineHeight: 1.9, margin: 0 }}>
                {review.recommendation}
              </p>
            </div>
          )}
        </div>

        {/* Comments */}
        <div style={{ marginTop: 40 }}>
          <h3 style={{ fontFamily: FONT.serif, fontSize: 20, fontWeight: 600, color: c.text, borderLeft: `3px solid ${c.accent}`, paddingLeft: 12 }}>
            {tx.comments}（{comments.length}）
          </h3>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={tx.writeComment}
              style={{
                flex: 1,
                padding: '10px 14px',
                backgroundColor: c.card,
                border: `1px solid ${c.border}`,
                borderRadius: 20,
                color: c.text,
                fontFamily: FONT.cute,
                outline: 'none',
              }}
            />
            <button
              onClick={postComment}
              style={{
                padding: '10px 20px',
                backgroundColor: c.accent,
                color: '#fff',
                borderRadius: 20,
                fontFamily: FONT.cute,
                fontSize: 13,
              }}
            >
              {tx.post}
            </button>
          </div>

          <div style={{ marginTop: 20 }}>
            {comments.map((cm) => (
              <div
                key={cm.id}
                style={{
                  padding: '14px 0',
                  borderBottom: `1px dashed ${c.border}`,
                  fontFamily: FONT.sans,
                  fontSize: 14,
                  color: c.text,
                }}
              >
                {cm.body}
                <div style={{ fontSize: 11, color: c.textMuted, marginTop: 4 }}>
                  {new Date(cm.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
