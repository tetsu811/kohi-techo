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
    q2: locale === 'ja' ? '思い出す風味は？（例：杏、黑糖、トースト）' : locale === 'en' ? 'Flavors it reminds you of (apricot, brown sugar, toast…)' : '讓人聯想到的風味⋯（杏桃、黑糖、烤吐司）',
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
                    <option value="light">淺煙 / Light</option>
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
            <h2 style={sectionTitle}>{tx.story}</h2>
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
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getColors, Theme, FONT } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from 'A/lib/supabase';
import HexRadar from 'A/components/HexRadar';
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
    title: locale === 'ja' ? 'ä¸æ¯ãæ¸ãçãã' : locale === 'en' ? 'Log a cup' : 'å¯«ä¸éä¸æ¯',
    subtitle: locale === 'ja' ? 'ä¸æä¸çã®å°ããªç©èªãã' : locale === 'en' ? 'A little story for every cup.' : 'çºæ¯ä¸æ¯åå¡çä¸æ®µå°æäºã',
    photo: locale === 'ja' ? 'åçï¼1æï¼% : locale === 'en' ? 'Photo (1)' : 'ç§çï¼1 å¼µï¼%,
    photoHint: locale === 'ja' ? 'ã¯ãªãã¯ãã¦é¸ã¶' : locale === 'en' ? 'click to pick' : 'é»æé¸æä¸å¼µç§ç',
    beanName: locale === 'ja' ? 'çç²ã®åå' : locale === 'en' ? 'Coffee name' : 'åå¡åç¨±',
    origin: locale === 'ja' ? 'ç£å°' : locale === 'en' ? 'Origin' : 'ç¢å°',
    roaster: locale === 'ja' ? 'ççæ' : locale === 'en' ? 'Roaster' : 'çè±å',
    roastLevel: locale === 'ja' ? 'ççåº¦' : locale === 'en' ? 'Roast' : 'ççåº¦',
    brewMethod: locale === 'ja' ? 'æ½åºæ¹æ³' : locale === 'en' ? 'Brew method' : 'æ²ç®æ¹å¼',
    scores: locale === 'ja' ? 'å­è§ã®å³ãã' : locale === 'en' ? 'Hex tasting' : 'å­è§é¢¨å³è©å',
    story: locale === 'ja' ? 'ä¸æ®µã®ç©èª' : locale === 'en' ? 'Three-line story' : 'ä¸æ®µå¼æ­è¨',
    q1: locale === 'ja' ? 'ç¬¬ä¸å£ã®å°è±¡ã¯ï¼' : locale === 'en' ? 'First-sip impressionâ¦' : 'ç¬¬ä¸å£çå°è±¡â¯',
    q2: locale === 'ja' ? 'æãåºãé¢¨å³ã¯ï¼ï¼ä¾ï¼æãé»ç³ããã¼ã¹ãï¼' : locale === 'en' ? 'Flavors it reminds you of (apricot, brown sugar, toastâ¦)' : 'è®äººè¯æ³å°çé¢¨å³â¯ï¼ææ¡ãé»ç³ãç¤åå¸ï¼',
    q3: locale === 'ja' ? 'åéã¸ã®ä¸è¨' : locale === 'en' ? 'If you told a friendâ¦' : 'æ¨è¦çµ¦æåçè©±â¯',
    submit: locale === 'ja' ? 'æå¸ã«æ®ã' : locale === 'en' ? 'Save to techÅ' : 'å­é²æçæå¸',
    saving: locale === 'ja' ? 'ä¿å­ä¸­â¯' : locale === 'en' ? 'Savingâ¦' : 'å²å­ä¸­â¯',
    saved: locale === 'ja' ? 'ä¿å­ãã¾ãã â' : locale === 'en' ? 'Saved â' : 'å·²å­å¥æå¸ â',
    required: locale === 'ja' ? 'åå¡ã®ååãå¥ãã¦ã­' : locale === 'en' ? 'Please enter a name' : 'è«å¡«å¯«åå¡åç¨±',
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
            â New Entry
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
                  <div style={{ fontSize: 32, color: c.textMuted, marginBottom: 8 }}>â</div>
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
                  placeholder="e.g. è¶å éªè² G1"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>{tx.origin}</label>
                  <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="è¡£ç´¢æ¯äº" style={inputStyle} />
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
                    <option value="">â</option>
                    <option value="light">æ·ºç Â· Light</option>
                    <option value="medium">ä¸­æ·¬ç "H Medtum´ð½½ÁÑ¥½¸ø(ñ½ÁÑ¥½¸Ù±Õôµ¥Õ´µÉ¬ûâ·ÞÇdð½½ÁÑ¥½¸ø(ñ½ÁÑ¥½¸Ù±ÕôÉ¬ûÞÇd	 Âö÷Föãà¢Â÷6VÆV7Cà¢ÂöFcà¢ÆFcà¢ÆÆ&VÂ7GÆS×¶Æ&VÅ7GÆWÓç·Gæ'&WtÖWFöGÓÂöÆ&VÃà¢Ç6VÆV7BfÇVS×¶'&WtÖWFöGÒöä6ævS×²RÓâ6WD'&WtÖWFöBRçF&vWBçfÇVRÒ7GÆS×¶çWE7GÆWÓà¢Æ÷FöâfÇVSÒ"#î(	CÂö÷Föãà¢Æ÷FöâfÇVSÒ'÷W&÷fW"#îh¾k)cÂö÷Föãà¢Æ÷FöâfÇVSÒ&W7&W76ò#îy:[ÈóÂö÷Föãà¢Æ÷FöâfÇVSÒ&ÆGFR#îh»þSÂö÷Föãà¢Æ÷FöâfÇVSÒ&6öÆBÖ'&Wr#îXkk»BòXk~<È¢ö÷Föãà¢Æ÷FöâfÇVSÒ'7öâ#îYÂö÷Föãà¢Æ÷FöâfÇVSÒ&W&÷&W72#äW&÷&W73Âö÷Föãà¢Â÷6VÆV7Cà¢ÂöFcà¢ÂöFcà¢ÂöFcà ¢²ò¢7F÷'¢÷Ð¢Æ"7GÆS×·6V7FöåFFÆWÓç·Gç7F÷'ÓÂö#à¢ÆFb7GÆS×·²F7Æ¢vw&BrÂv¢B×Óà¢ÇFWF&V¢fÇVS×¶f'7D×&W76öçÐ¢öä6ævS×²RÓâ6WDf'7D×&W76öâRçF&vWBçfÇVRÐ¢Æ6VöÆFW#×·GçÐ¢&÷w3×³'Ð¢7GÆS×·²ââæçWE7GÆRÂ&W6¦S¢wfW'F6ÂrÂföçDfÖÇ¢dôåBææBÂföçE6¦S¢R×Ð¢óà¢ÇFWF&V¢fÇVS×¶fÆf÷$æ÷FW7Ð¢öä6ævS×²RÓâ6WDfÆf÷$æ÷FW2RçF&vWBçfÇVRÐ¢Æ6VöÆFW#×·Gç'Ð¢&÷w3×³'Ð¢7GÆS×·²ââæçWE7GÆRÂ&W6¦S¢wfW'F6ÂrÂföçDfÖÇ¢dôåBææBÂföçE6¦S¢R×Ð¢óà¢ÇFWF&V¢fÇVS×·&V6öÖÖVæFFöçÐ¢öä6ævS×²RÓâ6WE&V6öÖÖVæFFöâRçF&vWBçfÇVRÐ¢Æ6VöÆFW#×·Gç7Ð¢&÷w3×³'Ð¢7GÆS×·²ââæçWE7GÆRÂ&W6¦S¢wfW'F6ÂrÂföçDfÖÇ¢dôåBææBÂföçE6¦S¢R×Ð¢óà¢ÂöFcà¢ÂöFcà ¢²ò¢&vB6öÇVÖã¢66÷&W2²&F"&WfWr¢÷Ð¢ÆFcà¢Æ"7GÆS×·6V7FöåFFÆWÓç·Gç66÷&W7ÓÂö#à ¢ÆF`¢7GÆS×·°¢&6¶w&÷VæD6öÆ÷#¢2æ6&BÀ¢&÷&FW#¢6öÆBG¶2æ&÷&FW'ÖÀ¢&÷&FW%&FW3¢"À¢FFæs¢#BÀ¢Ö&vä&÷GFöÓ¢#À¢F7Æ¢vfÆWrÀ¢§W7Fg6öçFVçC¢v6VçFW"rÀ¢×Ð¢à¢ÄW&F ¢fÇVW3×µ¶&öÖÂ6FGÂ7vVWFæW72Â&GFW&æW72Â&öGÂgFW'F7FU×Ð¢Æ&VÇ3×¶Æ&VÇ7Ð¢6¦S×³#Ð¢6öÆ÷#×¶2æ66VçGÐ¢FWD6öÆ÷#×¶2çFWGÐ¢w&D6öÆ÷#×¶2æ&÷&FW'Ð¢óà¢ÂöFcà ¢ÆF`¢7GÆS×·°¢&6¶w&÷VæD6öÆ÷#¢2æ6&BÀ¢&÷&FW#¢6öÆBG¶2æ&÷&FW'ÖÀ¢&÷&FW%&FW3¢"À¢FFæs¢#@¢×Ð¢à¢Å66÷&U6ÆFW"Æ&VÃ×·Bw66÷&Ræ&öÖrÒfÇVS×¶&öÖÒöä6ævS×·6WD&öÖÒFVÖS×·FVÖWÒóà¢Å66÷&U6ÆFW"Æ&VÃ×·Bw66÷&Ræ6FGrÒfÇVS×¶6FGÒöä6ævS×·6WD6FGÒFVÖS×·FVÖWÒóà¢Å66÷&U6ÆFW"Æ&VÃ×·Bw66÷&Rç7vVWFæW72rÒfÇVS×·7VVWFæW77Òöä6ævS×·6WE7vVWFæW77ÒFVÖS×·FVÖWÒóà¢Å66÷&U6ÆFW"Æ&VÃ×·Bw66÷&Ræ&GFW&æW72rÒfÇVS×¶&GFW&æW77Òöä6ævS×·6WD&GFW&æW77ÒFVÖS×·FVÖWÒóà¢Å66÷&U6ÆFW"Æ&VÃ×·Bw66÷&Ræ&öGrÒfÇVS×¶&öGÒöä6ævS×·6WD&öGÒFVÖS×·FVÖWÒóà¢Å66÷&U6ÆFW"Æ&VÃ×·Bw66÷&RægFW'F7FRrÒfÇVS×¶gFW'F7FWÒöä6ævS×·6WDgFW'F7FWÒFVÖS×·FVÖWÒóà¢ÂöFcà¢ÂöFcà¢ÂöFcà ¢²ò¢W'&÷"¢÷Ð¢¶W'&÷"bb¢ÆF`¢7GÆS×·°¢Ö&våF÷¢#BÀ¢FFæs¢BÀ¢&6¶w&÷VæD6öÆ÷#¢r6ffcVRrÀ¢&÷&FW#¢6öÆBG¶2æ66VçGÖÀ¢&÷&FW%&FW3¢À¢6öÆ÷#¢2æ66VçBÀ¢föçDfÖÇ¢dôåBæ7WFRÀ¢föçE6¦S¢2À¢×Ð¢à¢¶W'&÷'Ð¢ÂöFcà¢Ð ¢²ò¢7V&ÖB¢÷Ð¢ÆFb7GÆS×·²Ö&våF÷¢CÂFWDÆvã¢v6VçFW"r×Óà¢Æ'WGFöà¢öä6Æ6³×¶æFÆU7V&ÖGÐ¢F6&ÆVC×·6færÇÂ6fVGÐ¢7GÆS×·°¢föçDfÖÇ¢dôåBæ7WFRÀ¢föçE6¦S¢bÀ¢föçEvVvC¢SÀ¢&6¶w&÷VæD6öÆ÷#¢6fVBò2ç7V66W72¢2æ66VçBÀ¢6öÆ÷#¢r6ffbrÀ¢FFæs¢sGCrÀ¢&÷&FW%&FW3¢3À¢7W'6÷#¢6færÇÂ6fVBòvFVfVÇBr¢wöçFW"rÀ¢G&ç6Föã¢vÆÂãW2rÀ¢÷6G¢6færòãr¢À¢×Ð¢à¢·6fVBòGç6fVB¢6færòGç6fær¢)ÈâG·Gç7V&ÖGÖÐ¢Âö'WGFöãà¢ÂöFcà¢ÂöFcà¢ÂöFcà¢°§Ð
