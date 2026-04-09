'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getColors, Theme, FONT } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase, Shop, ShopReview } from '@/lib/supabase';
import HexRadar from '@/components/HexRadar';
import ScoreSlider from '@/components/ScoreSlider';

export default function ShopDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { locale, t } = useI18n();
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>('light');
  const [shop, setShop] = useState<Shop | null>(null);
  const [reviews, setReviews] = useState<ShopReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Review form state
  const [sFlavor, setSFlavor] = useState(3);
  const [sVibe, setSVibe] = useState(3);
  const [sStay, setSStay] = useState(3);
  const [sWork, setSWork] = useState(3);
  const [sDessert, setSDessert] = useState(3);
  const [sValue, setSValue] = useState(3);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const update = () => setTheme((localStorage.getItem('theme') as Theme) ?? 'light');
    update();
    window.addEventListener('themechange', update);
    return () => window.removeEventListener('themechange', update);
  }, []);

  useEffect(() => {
    (async () => {
      const [shopRes, reviewsRes] = await Promise.all([
        supabase.from('shops').select('*').eq('id', id).single(),
        supabase.from('shop_reviews').select('*').eq('shop_id', id).order('created_at', { ascending: false }),
      ]);
      setShop(shopRes.data as Shop | null);
      setReviews((reviewsRes.data ?? []) as ShopReview[]);
      setLoading(false);
    })();
  }, [id]);

  const c = getColors(theme);

  // Compute average scores
  const avg = (key: keyof ShopReview) => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + (Number(r[key]) || 0), 0) / reviews.length;
  };

  const avgValues = [avg('score_flavor'), avg('score_vibe'), avg('score_stay'), avg('score_work'), avg('score_dessert'), avg('score_value')];
  const shopLabels = [t('shop.flavor'), t('shop.vibe'), t('shop.stay'), t('shop.work'), t('shop.dessert'), t('shop.value')];

  const tx = {
    backToMap: locale === 'ja' ? '← 地図に戻る' : locale === 'en' ? '← Back to map' : '← 回到地圖',
    avgScore: locale === 'ja' ? '平均スコア' : locale === 'en' ? 'Average score' : '平均評分',
    reviewCount: locale === 'ja' ? '件のレビュー' : locale === 'en' ? 'reviews' : '則評價',
    stayLimit: locale === 'ja' ? '滞在目安' : locale === 'en' ? 'Stay limit' : '限時',
    minutes: locale === 'ja' ? '分' : locale === 'en' ? 'min' : '分鐘',
    noLimit: locale === 'ja' ? '時間無制限' : locale === 'en' ? 'No time limit' : '不限時',
    writeReview: locale === 'ja' ? 'レビューを書く' : locale === 'en' ? 'Write a review' : '寫一則店評',
    yourReview: locale === 'ja' ? 'あなたのレビュー' : locale === 'en' ? 'Your review' : '你的評價',
    commentPlaceholder: locale === 'ja' ? '一言コメント⋯' : locale === 'en' ? 'Leave a comment…' : '簡短心得⋯',
    submit: locale === 'ja' ? 'レビューを送信' : locale === 'en' ? 'Submit review' : '送出評價',
    saving: locale === 'ja' ? '送信中⋯' : locale === 'en' ? 'Submitting…' : '送出中⋯',
    saved: locale === 'ja' ? '送信しました ✓' : locale === 'en' ? 'Submitted ✓' : '已送出 ✓',
    notFound: locale === 'ja' ? '見つかりませんでした' : locale === 'en' ? 'Shop not found' : '找不到這間店',
    allReviews: locale === 'ja' ? 'すべてのレビュー' : locale === 'en' ? 'All reviews' : '所有評價',
    noReviewsYet: locale === 'ja' ? 'まだレビューがありません。最初のレビューを書きませんか？' : locale === 'en' ? 'No reviews yet. Be the first!' : '還沒有人評價，由你來當第一個吧！',
  };

  const handleSubmitReview = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from('shop_reviews').insert({
        shop_id: id,
        user_id: user.id,
        score_flavor: sFlavor,
        score_vibe: sVibe,
        score_stay: sStay,
        score_work: sWork,
        score_dessert: sDessert,
        score_value: sValue,
        comment: comment.trim() || null,
      }).select().single();
      if (error) throw error;
      setReviews([data as ShopReview, ...reviews]);
      setSaved(true);
      setShowForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: c.bg, padding: 80, textAlign: 'center', color: c.textSub, fontFamily: FONT.cute }}>
        {t('common.loading')}
      </div>
    );
  }

  if (!shop) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: c.bg, padding: 80, textAlign: 'center', color: c.text }}>
        <p style={{ fontFamily: FONT.cute, color: c.textSub }}>{tx.notFound}</p>
        <Link href="/map" style={{ color: c.accent, fontFamily: FONT.cute }}>{tx.backToMap}</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: c.bg, color: c.text }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 80px' }}>
        <Link href="/map" style={{ color: c.textSub, fontFamily: FONT.cute, fontSize: 13 }}>{tx.backToMap}</Link>

        {/* Shop header */}
        <div style={{ display: 'grid', gridTemplateColumns: shop.cover_url ? '1fr 1fr' : '1fr', gap: 32, marginTop: 20 }}>
          {shop.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shop.cover_url} alt={shop.name} style={{ width: '100%', borderRadius: 12, border: `1px solid ${c.border}`, aspectRatio: '16/9', objectFit: 'cover' }} />
          )}
          <div>
            <div style={{ fontFamily: FONT.hand, fontSize: 12, color: c.accent, marginBottom: 4 }}>☕ Shop</div>
            <h1 style={{ fontFamily: FONT.serif, fontSize: 36, fontWeight: 600, margin: '0 0 6px' }}>{shop.name}</h1>
            {shop.address && <p style={{ fontFamily: FONT.cute, fontSize: 13, color: c.textSub, margin: '0 0 16px' }}>{shop.address}</p>}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {shop.has_wifi && <Chip c={c}>Wi-Fi</Chip>}
              {shop.has_power && <Chip c={c}>{locale === 'ja' ? '電源' : locale === 'en' ? 'Power' : '插座'}</Chip>}
              <Chip c={c}>
                {shop.time_limit_minutes ? `${tx.stayLimit} ${shop.time_limit_minutes}${tx.minutes}` : tx.noLimit}
              </Chip>
              {shop.pet_friendly && <Chip c={c}>{locale === 'ja' ? 'ペットOK' : '寵物友善'}</Chip>}
              {shop.hours && <Chip c={c}>{shop.hours}</Chip>}
            </div>

            <p style={{ fontFamily: FONT.cute, fontSize: 13, color: c.textSub }}>
              {reviews.length} {tx.reviewCount}
            </p>
          </div>
        </div>

        {/* Average hex radar */}
        {reviews.length > 0 && (
          <div style={{ marginTop: 36, backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: 32, textAlign: 'center' }}>
            <div style={{ fontFamily: FONT.hand, fontSize: 13, color: c.accent, marginBottom: 8 }}>— {tx.avgScore} —</div>
            <div style={{ display: 'inline-block' }}>
              <HexRadar
                values={avgValues}
                labels={shopLabels}
                size={320}
                color={c.accent}
                textColor={c.text}
                gridColor={c.border}
              />
            </div>
          </div>
        )}

        {/* Write review button / form */}
        {user && !saved && (
          <div style={{ marginTop: 36 }}>
            {!showForm ? (
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    fontFamily: FONT.cute,
                    fontSize: 14,
                    fontWeight: 500,
                    backgroundColor: c.accent,
                    color: '#fff',
                    padding: '12px 32px',
                    borderRadius: 30,
                    transition: 'all 0.15s',
                  }}
                >
                  ✎ {tx.writeReview}
                </button>
              </div>
            ) : (
              <div style={{ backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: 32 }}>
                <h3 style={{ fontFamily: FONT.serif, fontSize: 22, fontWeight: 600, color: c.text, margin: '0 0 20px', borderLeft: `3px solid ${c.accent}`, paddingLeft: 12 }}>
                  {tx.yourReview}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div>
                    <ScoreSlider label={t('shop.flavor')} value={sFlavor} onChange={setSFlavor} theme={theme} />
                    <ScoreSlider label={t('shop.vibe')} value={sVibe} onChange={setSVibe} theme={theme} />
                    <ScoreSlider label={t('shop.stay')} value={sStay} onChange={setSStay} theme={theme} />
                    <ScoreSlider label={t('shop.work')} value={sWork} onChange={setSWork} theme={theme} />
                    <ScoreSlider label={t('shop.dessert')} value={sDessert} onChange={setSDessert} theme={theme} />
                    <ScoreSlider label={t('shop.value')} value={sValue} onChange={setSValue} theme={theme} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                      <HexRadar
                        values={[sFlavor, sVibe, sStay, sWork, sDessert, sValue]}
                        labels={shopLabels}
                        size={240}
                        color={c.accent}
                        textColor={c.text}
                        gridColor={c.border}
                      />
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={tx.commentPlaceholder}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: c.bgSoft,
                        border: `1px solid ${c.border}`,
                        borderRadius: 8,
                        color: c.text,
                        fontFamily: FONT.hand,
                        fontSize: 15,
                        resize: 'vertical',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button
                    onClick={() => setShowForm(false)}
                    style={{ fontFamily: FONT.cute, fontSize: 13, color: c.textSub, border: `1px solid ${c.border}`, padding: '10px 24px', borderRadius: 20 }}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={saving}
                    style={{
                      fontFamily: FONT.cute,
                      fontSize: 14,
                      fontWeight: 500,
                      backgroundColor: c.accent,
                      color: '#fff',
                      padding: '10px 32px',
                      borderRadius: 20,
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? tx.saving : `✎ ${tx.submit}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {saved && (
          <div style={{ marginTop: 24, textAlign: 'center', fontFamily: FONT.cute, fontSize: 15, color: c.success }}>
            {tx.saved}
          </div>
        )}

        {/* All reviews */}
        <div style={{ marginTop: 40 }}>
          <h3 style={{ fontFamily: FONT.serif, fontSize: 22, fontWeight: 600, color: c.text, borderLeft: `3px solid ${c.accent}`, paddingLeft: 12 }}>
            {tx.allReviews}（{reviews.length{）
          </h3>

          {reviews.length === 0 ? (
            <p style={{ fontFamily: FONT.cute, fontSize: 13, color: c.textSub, textAlign: 'center', padding: 40 }}>
              {tx.noReviewsYet}
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
              {reviews.map((rv) => (
                <div key={rv.id} style={{ backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: 24, display: 'grid', gridTemplateColumns: '180px 1fr', gap: 20, alignItems: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <HexRadar
                      values={[rv.score_flavor, rv.score_vibe, rv.score_stay, rv.score_work, rv.score_dessert, rv.score_value]}
                      labels={shopLabels}
                      size={160}
                      color={c.accent}
                      textColor={c.text}
                      gridColor={c.border}
                    />
                  </div>
                  <div>
                    {rv.comment && (
                      <p style={{ fontFamily: FONT.hand, fontSize: 16, color: c.text, lineHeight: 1.8, margin: '0 0 8px' }}>
                        「{rv.comment}」
                      </p>
                    )}
                    <div style={{ fontFamily: FONT.cute, fontSize: 11, color: c.textMuted }}>
                      {new Date(rv.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ c, children }: { c: ReturnType<typeof getColors>; children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: FONT.cute, fontSize: 11, backgroundColor: c.bgSoft, color: c.textSub, border: `1px solid ${c.border}`, borderRadius: 12, padding: '3px 10px' }}>
      {children}
    </span>
  );
}
