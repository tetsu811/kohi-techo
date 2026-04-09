'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { getColors, Theme, FONT } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

const mapStyle = { width: '100%', height: '400px', borderRadius: '12px' };
const defaultCenter = { lat: 25.033, lng: 121.5654 };

export default function NewShopPage() {
  const { locale, t } = useI18n();
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>('light');

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(25.033);
  const [lng, setLng] = useState(121.5654);
  const [hours, setHours] = useState('');
  const [phone, setPhone] = useState('');
  const [hasWifi, setHasWifi] = useState(false);
  const [hasPower, setHasPower] = useState(false);
  const [timeLimit, setTimeLimit] = useState('');
  const [petFriendly, setPetFriendly] = useState(false);
  const [reservationOnly, setReservationOnly] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  });

  useEffect(() => {
    const update = () => setTheme((localStorage.getItem('theme') as Theme) ?? 'light');
    update();
    window.addEventListener('themechange', update);
    return () => window.removeEventListener('themechange', update);
  }, []);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.push('/login?next=/map/new');
  }, [isLoading, isLoggedIn, router]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setLat(parseFloat(e.latLng.lat().toFixed(6)));
      setLng(parseFloat(e.latLng.lng().toFixed(6)));
    }
  }, []);

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setLat(parseFloat(e.latLng.lat().toFixed(6)));
      setLng(parseFloat(e.latLng.lng().toFixed(6)));
    }
  }, []);

  const c = getColors(theme);

  const tx = {
    title: locale === 'ja' ? '新しい珈琲店を追加' : locale === 'en' ? 'Add a coffee shop' : '新增咖啡店',
    subtitle: locale === 'ja' ? '地図に新しいお気に入りを。' : locale === 'en' ? 'Put your favorite on the map.' : '把你喜歡的店放上地圖。',
    shopName: locale === 'ja' ? '店名' : locale === 'en' ? 'Shop name' : '店名',
    address: locale === 'ja' ? '住所' : locale === 'en' ? 'Address' : '地址',
    hours: locale === 'ja' ? '営業時間' : locale === 'en' ? 'Hours' : '營業時間',
    phone: locale === 'ja' ? '電話' : locale === 'en' ? 'Phone' : '電話',
    wifi: 'Wi-Fi',
    power: locale === 'ja' ? '電源あり' : locale === 'en' ? 'Power outlets' : '有插座',
    timeLimit: locale === 'ja' ? '制限時間（分）' : locale === 'en' ? 'Time limit (min)' : '限時（分鐘）',
    noLimit: locale === 'ja' ? '無制限の場合は空欄' : locale === 'en' ? 'Leave blank if no limit' : '不限時可留空',
    pet: locale === 'ja' ? 'ペットOK' : locale === 'en' ? 'Pet friendly' : '寵物友善',
    reservation: locale === 'ja' ? '予約制' : locale === 'en' ? 'Reservation only' : '需預約',
    photo: locale === 'ja' ? '店の写真' : locale === 'en' ? 'Shop photo' : '店面照片',
    pickLocation: locale === 'ja' ? '地図をクリックして場所を選んでね' : locale === 'en' ? 'Click the map to pick a location' : '點擊地圖選定位置',
    submit: locale === 'ja' ? '地図に追加する' : locale === 'en' ? 'Add to map' : '放上地圖',
    saving: locale === 'ja' ? '追加中⋯' : locale === 'en' ? 'Adding…' : '新增中⋯',
    saved: locale === 'ja' ? '追加しました ✓' : locale === 'en' ? 'Added ✓' : '已放上地圖 ✓',
    required: locale === 'ja' ? '店名を入れてね' : locale === 'en' ? 'Shop name is required' : '請填寫店名',
  };

  const onPickPhoto = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError(tx.required); return; }
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      let coverUrl: string | null = null;
      if (photoFile) {
        const ext = photoFile.name.split('.').pop() ?? 'jpg';
        const path = `shops/${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('photos').upload(path, photoFile, { cacheControl: '3600', upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('photos').getPublicUrl(path);
        coverUrl = pub.publicUrl;
      }

      const { data, error: insErr } = await supabase.from('shops').insert({
        name: name.trim(),
        address: address.trim() || null,
        lat, lng,
        hours: hours.trim() || null,
        phone: phone.trim() || null,
        has_wifi: hasWifi,
        has_power: hasPower,
        time_limit_minutes: timeLimit ? parseInt(timeLimit) : null,
        pet_friendly: petFriendly,
        reservation_only: reservationOnly,
        cover_url: coverUrl,
        created_by: user.id,
      }).select().single();

      if (insErr) throw insErr;
      setSaved(true);
      setTimeout(() => router.push(`/map/${data.id}`), 600);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    backgroundColor: c.bgSoft, border: `1px solid ${c.border}`,
    borderRadius: 8, color: c.text, fontFamily: FONT.sans, fontSize: 14, outline: 'none',
  } as const;

  const labelStyle = {
    display: 'block' as const, fontFamily: FONT.cute, fontSize: 13, fontWeight: 500 as const,
    color: c.textSub, marginBottom: 6,
  };

  const sectionTitle = {
    fontFamily: FONT.serif, fontSize: 20, fontWeight: 600 as const,
    color: c.text, margin: '32px 0 16px', borderLeft: `3px solid ${c.accent}`, paddingLeft: 12,
  };

  const checkboxRow = (label: string, value: boolean, onChange: (v: boolean) => void) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT.cute, fontSize: 14, color: c.text, cursor: 'pointer', padding: '6px 0' }}>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} style={{ accentColor: c.accent, width: 18, height: 18, cursor: 'pointer' }} />
      {label}
    </label>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: c.bg, color: c.text }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: FONT.hand, fontSize: 13, color: c.accent, letterSpacing: '0.1em' }}>＋ New Shop</div>
          <h1 style={{ fontFamily: FONT.serif, fontSize: 36, fontWeight: 600, color: c.text, margin: '8px 0 6px' }}>{tx.title}</h1>
          <p style={{ fontFamily: FONT.cute, fontSize: 14, color: c.textSub, margin: 0 }}>{tx.subtitle}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
          <div>
            <div onClick={() => fileInputRef.current?.click()} style={{
              width: '100%', aspectRatio: '16/9', backgroundColor: c.bgSoft,
              border: `2px dashed ${c.border}`, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden', transition: 'all 0.15s',
            }}>
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, color: c.textMuted, marginBottom: 6 }}>📷</div>
                  <div style={{ fontFamily: FONT.cute, fontSize: 12, color: c.textSub }}>{tx.photo}</div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onPickPhoto(f); }} />

            <h2 style={sectionTitle}>{tx.shopName}</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={labelStyle}>{tx.shopName} *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fika Fika Cafe" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{tx.address}</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="台北市松山區伊通街33號" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><label style={labelStyle}>{tx.hours}</label><input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="10:00–20:00" style={inputStyle} /></div>
                <div><label style={labelStyle}>{tx.phone}</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="02-1234-5678" style={inputStyle} /></div>
              </div>
              <div>
                <label style={labelStyle}>{tx.timeLimit} <span style={{ fontWeight: 400, color: c.textMuted }}>({tx.noLimit})</span></label>
                <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} placeholder="90" style={inputStyle} />
              </div>
            </div>

            <h2 style={sectionTitle}>設施 / Facilities</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {checkboxRow(tx.wifi, hasWifi, setHasWifi)}
              {checkboxRow(tx.power, hasPower, setHasPower)}
              {checkboxRow(tx.pet, petFriendly, setPetFriendly)}
              {checkboxRow(tx.reservation, reservationOnly, setReservationOnly)}
            </div>
          </div>

          <div>
            <h2 style={sectionTitle}>{tx.pickLocation}</h2>
            <div style={{ border: `1px solid ${c.border}`, borderRadius: 12, overflow: 'hidden' }}>
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapStyle}
                  center={{ lat, lng }}
                  zoom={13}
                  onClick={onMapClick}
                  options={{ disableDefaultUI: true, zoomControl: true }}
                >
                  <MarkerF
                    position={{ lat, lng }}
                    draggable
                    onDragEnd={onMarkerDragEnd}
                  />
                </GoogleMap>
              ) : (
                <div style={{ ...mapStyle, backgroundColor: c.bgSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.cute, color: c.textSub }}>
                  HA8,!8, ⋯
                </div>
              )}
            </div>
            <div style={{ fontFamily: FONT.cute, fontSize: 12, color: c.textMuted, marginTop: 8, textAlign: 'center' }}>
              📍 {lat.toFixed(4)}, {lng.toFixed(4)}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 24, padding: 14, backgroundColor: '#fff0ee', border: `1px solid ${c.accent}`, borderRadius: 8, color: c.accent, fontFamily: FONT.cute, fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <button onClick={handleSubmit} disabled={saving || saved} style={{
            fontFamily: FONT.cute, fontSize: 16, fontWeight: 500,
            backgroundColor: saved ? '#5B8A3C' : c.accent, color: '#fff',
            padding: '14px 48px', borderRadius: 30,
            cursor: saving || saved ? 'default' : 'pointer',
            transition: 'all 0.15s', opacity: saving ? 0.7 : 1,
          }}>
            {saved ? tx.saved : saving ? tx.saving : `☕ ${tx.submit}`}
          </button>
        </div>
      </div>
    </div>
  );
}
