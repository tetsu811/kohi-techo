# çç²æå¸ é¨ç½²æå

## åç½®éæ±

- Node.js 18+ï¼å»ºè­° 20+ï¼
- Git
- GitHub å¸³è
- Vercel å¸³èï¼å¯ç¨ GitHub ç»å¥ï¼
- Supabase å¸³è + ä¸å project

---

## Step 1ï½Supabase è¨­å®

1. å° [Supabase Dashboard](https://supabase.com/dashboard) å»ºä¸åæ° projectï¼æç¨ç¾æçï¼
2. é²å¥ **SQL Editor**ï¼è²¼ä¸ `supabase-schema.sql` çå¨é¨å§å®¹ä¸¦å·è¡
3. é²å¥ **Storage**ï¼å»ºä¸å bucket å« `photos`ï¼è¨­çº **Public**
4. å¨ Storage ç **Policies** å ä¸ä»¥ä¸ï¼ä¹å¯ä»¥å¨ SQL Editor å·è¡ï¼ï¼

```sql
create policy "Public read photos"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "Authed users upload photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos');
```

5. è¨ä¸ä½ çï¼
   - **Project URL**ï¼`https://xxxxxxx.supabase.co`
   - **Anon Key**ï¼å¨ Settings â API è£¡æ¾

---

## Step 2ï½æ¬æ©è¨­å®

```bash
# é²å¥å°æ¡è³æå¤¾
cd ~/Desktop/kohi-techo    # çä½ æ¾å¨åªè£¡

# å»ºç« .env.local
cp .env.example .env.local
# ç·¨è¼¯ .env.localï¼å¡«å¥ä½ ç Supabase URL å Anon Key

# å®è£ä¾è³´
npm install

# æ¬æ©æ¸¬è©¦
npm run dev
# æé http://localhost:3000 ç¢ºèªè½è·
```

---

## Step 3ï½æ¨å° GitHub

```bash
# åå§å git
git init
git add -A
git commit -m "feat: çç²æå¸ MVP â bean reviews with hex radar + coffee map"

# å¨ GitHub å»ºç« repoï¼ç¨ gh CLI æç¶²é ¡é½è¡ï¼
# æ¹æ³ Aï¼ç¨ gh CLI
gh repo create kohi-techo --public --source=. --push

# æ¹æ³ Bï¼æå
# 1. å° github.com/new å»ºä¸åå« kohi-techo ç repo
# 2. ç¶å¾ï¼
git branch -M main
git remote add origin https://github.com/ä½ çå¸³è/kohi-techo.git
git push -u origin main
```

---

## Step 4ï½Vercel é¨ç½²

### æ¹æ³ Aï¼ç¶²é æä½ï¼æç°å®ï¼

1. å° [vercel.com](https://vercel.com) ç¨ GitHub ç»å¥
2. é» **Add New â Project**
3. Import ä½ ç `kohi-techo` repo
4. Framework æèªååµæ¸¬ **Next.js**
5. å±é **Environment Variables**ï¼å å¥ï¼
   - `NEXT_PUBLIC_SUPABASE_URL` = ä½ ç Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = ä½ ç Anon Key
6. æ **Deploy**
7. ç­å¹¾åéå°±ææ¿å°ä¸å `https://kohi-techo.vercel.app` çç¶²å

### æ¹æ³ Bï¼CLI é¨ç½²

```bash
# å®è£ Vercel CLI
npm i -g vercel

# é¨ç½²ï¼ç¬¬ä¸æ¬¡æåä½ ä¸äºè¨­å®åé¡ï¼é½é¸é è¨­å°±å¥½ï¼
vercel --prod

# è¨­å®ç°å¢è®æ¸
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# è²¼ä¸å°æçå¼

# éæ°é¨ç½²è®ç°å¢è®æ¸çæ
vercel --prod
```

---

## Step 5ï½Supabase å ç½åå®

é¨ç½²å®æ¿å° Vercel ç¶²åå¾ï¼

1. å° Supabase Dashboard â **Authentication** â **URL Configuration**
2. å¨ **Redirect URLs** å å¥ï¼
   - `https://kohi-techo.vercel.app`
   - `https://kohi-techo.vercel.app/**`

éæ¨£ OAuth ç»å¥è·³è½æä¸æè¢«æã

---

## Step 6ï¼é¸ç¨ï¼ï½å¯ç¢¼ä¿è­·

å¦æä½ æ³è®ç¶²ç«æ«æåªæèªå·±è½çï¼

1. Vercel â Project Settings â **Deployment Protection**
2. éå **Password Protection**
3. è¨­å®å¯ç¢¼

---

## ä¹å¾æ´æ°

æ¯æ¬¡æ¹å® codeï¼åªè¦ï¼

```bash
git add -A
git commit -m "ä½ çæ¹åæè¿°"
git push
```

Vercel æèªåéæ°é¨ç½²ã
