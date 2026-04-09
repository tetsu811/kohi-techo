'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getColors, Theme, FONT } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import HexRadar from '@/components/HexRadar';
import ScoreSlider from '@/components/ScoreSlider';

export default function NewBeanReviewPage() {
  const { locale, t } = useI18n();
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>('light');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [origin, setOrigin] = useState('');
  const [roaster, setRoaster] = useState('');
  const [roastLevel, setRoastLevel] = useState('');
  const [brewMethod, setBrewMethod] = useState('');

  const [aroma, setAroma] = useState(3);
  const [acidity, setAcidity] = useState(3);
  const [sweetness, setSweetness] = useState(3);
  const [bitterness, setBitterness] = useState(3);
  const [body, setBody] = useState(3);
  const [aftertaste, setAftertaste] = useState(3);

  const [firstImpression, setFirstImpression] = useState('');
  const [flavorNotes, setFlavorNotes] = useState('');
  const [recommendation, setRecommendation] = useState('');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTheme((localStorage.getItem('theme') as Theme) ?? 'light');
    update();
    window.addEventListener('themechange', update);
    return () => window.removeEventListener('themechange', update);
  }, []);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.push('/login?next=/beans/new');
  }, [isLoading, isLoggedIn, router]);

  const c = getColors(theme);

  const tx = {
    title: locale === 'ja' ? '一杯を書き留める' : locale === 'en' ? 'Log a cup' : '寫下這一杯',
    subtitle: locale === 'ja' ? '一期一珈の小さな物語を。' : locale === 'en' ? 'A little story for every cup.' : '為每一杯咖啡留一段小故事。',
    photo: locale === 'ja' ? '写真（1枚）' : locale === 'en' ? 'Photo (1)' : '照片（1 張）',
    photoHint: locale === 'ja' ? 'クリックして選ぶ' : locale === 'en' ? 'click to pick' : '點擊選擇一張照片',
    beanName: locale === 'ja' ? '珈琲の名前' : locale === 'en' ? 'Coffee name' : '咖啡名稱',
    origin: locale === 'ja' ? '産地' : locale === 'en' ? 'Origin' : '產地',
    roaster: locale === 'ja' ? '焙煎所' : locale === 'en' ? 'Roaster' : '烘豆商',
    roastLevel: locale === 'ja' ? '焙煎度' : locale === 'en' ? 'Roast' : '烘焙度',
    brewMethod: locale === 'ja' ? '抽出方法' : locale === 'en' ? 'Brew method' : '沖煮方式',
    scores: locale === 'ja' ? '六角の味わい' : locale === 'en' ? 'Hex tasting' : '六角風味評分',
    story: locale === 'ja' ? '三段の物語' : locale === 'en' ? 'Three-line story' : '三段式札記',
    q1: locale === 'ja' ? '第一口の印象は？' : locale === 'en' ? 'First-sip impression…' : '第一口的印象⋯',
    q2: locale === 'ja' ? '思い出す風味は？（例：杏、黒糖、トースト）' : locale === 'en' ? 'Flavors it reminds you of (apricot, brown sugar, toast…)' : '讓人聯想到的風味⋯（杏桃、黑糖、烤吐司）',
    q3: locale === 'ja' ? '友達に一言すすめるなら？' : locale === 'en' ? 'If you told a friend…' : '推薦給朋友的話⋯',
    submit: locale === 'ja' ? '手帖に残す' : locale === 'en' ? 'Save to techō' : '存進我的手帖',
    saving: locale === 'ja' ? '保存中⋯' : locale === 'en' ? 'Saving…' : '儲存中⋯',
    saved: locale === 'ja' ? '保存しました ✓' : locale === 'en' ? 'Saved ✓' : '已存入手帖 ✓',
    required: locale === 'ja' ? '咖啡の名前を入れてね' : locale === 'en' ? 'Please enter a name' : '請填寫咖啡名稱',
  };

  const onPickPhoto = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError(tx.required);
      return;
    }
    if (!user) return;
    setError(null);
    setSaving(true);

    try {
      let photoUrl: string | null = null;

      if (photoFile) {
        const ext = photoFile.name.split('.').pop() ?? 'jpg';
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('photos').upload(path, photoFile, {
          cacheControl: '3600',
          upsert: false,
        });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('photos').getPublicUrl(path);
        photoUrl = pub.publicUrl;
      }

      const { data, error: insErr } = await supabase
        .from('bean_reviews')
        .insert({
          user_id: user.id,
          title: title.trim(),
          origin: origin.trim() || null,
          roaster: roaster.trim() || null,
          roast_level: roastLevel || null,
          brew_method: brewMethod || null,
          photo_url: photoUrl,
          score_aroma: aroma,
          score_acidity: acidity,
          score_sweetness: sweetness,
          score_bitterness: bitterness,
          score_body: body,
          score_aftertaste: aftertaste,
          first_impression: firstImpression.trim() || null,
          flavor_notes: flavorNotes.trim() || null,
          recommendation: recommendation.trim() || null,
        })
        .select()
        .single();

      if (insErr) throw insErr;

      setSaved(true);
      setTimeout(() => router.push(`/beans/${data.id}`), 600);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const labels = [
    t('score.aroma'),
    t('score.acidity'),
    t('score.sweetness'),
    t('score.bitterness'),
    t('score.body'),
    t('score.aftertaste'),
  ];

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: c.bgSoft,
    border: `1px solid ${c.border}`,
    borderRadius: 8,
    color: c.text,
    fontFamily: FONT.sans,
    fontSize: 14,
    outline: 'none',
  } as const;

  const labelStyle = {
    display: 'block',
    fontFamily: FONT.cute,
    fontSize: 13,
    fontWeight: 500,
    color: c.textSub,
    marginBottom: 6,
  } as const;

  const sectionTitle = {
    fontFamily: FONT.serif,
    fontSize: 20,
    fontWeight: 600,
    color: c.text,
    margin: '36px 0 18px',
    borderLeft: `3px solid ${c.accent}`,
    paddingLeft: 12,
  } as const;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: c.bg, color: c.text }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: FONT.hand, fontSize: 13, color: c.accent, letterSpacing: '0.1em' }}>
            ✎ New Entry
          </div>
          <h1 style={{ fontFamily: FONT.serif, fontSize: 36, fontWeight: 600, color: c.text, margin: '8px 0 6px' }}>
            {tx.title}
          </h1>
          <p style={{ fontFamily: FONT.cute, fontSize: 14, color: c.textSub, margin: 0 }}>{tx.subtitle}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40 }}>
          {/* Left column */}
          <div>
            {/* Photo */}
            <h2 style={sectionTitle}>{tx.photo}</h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                aspectRatio: '4 / 3',
                backgroundColor: c.bgSoft,
                border: `2px dashed ${c.border}`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'all 0.15s',
              }}
            >
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, color: c.textMuted, marginBottom: 8 }}>☕</div>
                  <div style={{ fontFamily: FONT.cute, fontSize: 13, color: c.textSub }}>{tx.photoHint}</div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickPhoto(f);
              }}
            />

            {/* Basic info */}
            <h2 style={sectionTitle}>{tx.beanName}</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={labelStyle}>{tx.beanName} *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 耶加雪菲 G1"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>{tx.origin}</label>
                  <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="衣索比亞" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{tx.roaster}</label>
                  <input value={roaster} onChange={(e) => setRoaster(e.target.value)} placeholder="Fika Fika" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>{tx.roastLevel}</label>
                  <select value={roastLevel} onChange={(e) => setRoastLevel(e.target.value)} style={inputStyle}>
                    <option value="">—</option>
                    <option value="light">淹焙 / Light</option>
                    <option value="medium">中焙 / Medium</option>
                    <option value="medium-dark">中深焙</option>
                    <option value="dark">深焙 / Dark</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{tx.brewMethod}</label>
                  <select value={brewMethod} onChange={(e) => setBrewMethod(e.target.value)} style={inputStyle}>
                    <option value="">—</option>
                    <option value="pourover">手沖</option>
                    <option value="espresso">義式</option>
                    <option value="latte">拿鐵</option>
                    <option value="cold-brew">冰滴 / 冷萃</option>
                    <option value="syphon">虹吸</option>
                    <option value="aeropress">Aeropress</option>
                 </select>
                </div>
              </div>
            </div>

            {/* Story */}
            <h(2 style={sectionTitle}>{tx.story}</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              <textarea
                value={firstImpression}
                onChange={(e) => setFirstImpression(e.target.value)}
                placeholder={tx.q1}
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: FONT.hand, fontSize: 15 }}
              />
              <textarea
                value={flavorNotes}
                onChange={(e) => setFlavorNotes(e.target.value)}
                placeholder={tx.q2}
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: FONT.hand, fontSize: 15 }}
              />
              <textarea
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                placeholder={tx.q3}
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: FONT.hand, fontSize: 15 }}
              />
            </div>
          </div>

          {/* Right column: scores + radar preview */}
          <div>
            <h2 style={sectionTitle}>{tx.scores}</h2>

            <div
              style={{
                backgroundColor: c.card,
                border: `1px solid ${c.border}`,
                borderRadius: 12,
                padding: 24,
                marginBottom: 20,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <HexRadar
                values={[aroma, acidity, sweetness, bitterness, body, aftertaste]}
                labels={labels}
                size={280}
                color={c.accent}
                textColor={c.text}
                gridColor={c.border}
              />
            </div>

            <div
              style={{
                backgroundColor: c.card,
                border: `1px solid ${c.border}`,
                borderRadius: 12,
                padding: 24,
              }}
            >
              <ScoreSlider label={t('score.aroma')} value={aroma} onChange={setAroma} theme={theme} />
              <ScoreSlider label={t('score.acidity')} value={acidity} onChange={setAcidity} theme={theme} />
              <ScoreSlider label={t('score.sweetness')} value={sweetness} onChange={setSweetness} theme={theme} />
              <ScoreSlider label={t('score.bitterness')} value={bitterness} onChange={setBitterness} theme={theme} />
              <ScoreSlider label={t('score.body')} value={body} onChange={setBody} theme={theme} />
              <ScoreSlider label={t('score.aftertaste')} value={aftertaste} onChange={setAftertaste} theme={theme} />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: 24,
              padding: 14,
              backgroundColor: '#fff0ee',
              border: `1px solid ${c.accent}`,
              borderRadius: 8,
              color: c.accent,
              fontFamily: FONT.cute,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* Submit */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <button
            onClick={handleSubmit}
            disabled={saving || saved}
            style={{
              fontFamily: FONT.cute,
              fontSize: 16,
              fontWeight: 500,
              backgroundColor: saved ? c.success : c.accent,
              color: '#fff',
              padding: '14px 48px',
              borderRadius: 30,
              cursor: saving || saved ? 'default' : 'pointer',
              transition: 'all 0.15s',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saved ? tx.saved : saving ? tx.saving : `✎ ${tx.submit}`}
          </button>
        </div>
      </div>
    </div>
  );
}
