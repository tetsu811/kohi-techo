import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Shared types
export type BeanReview = {
  id: string;
  user_id: string;
  title: string;
  origin: string | null;
  roaster: string | null;
  roast_level: string | null;
  brew_method: string | null;
  shop_id: string | null;
  photo_url: string | null;
  score_aroma: number;
  score_acidity: number;
  score_sweetness: number;
  score_bitterness: number;
  score_body: number;
  score_aftertaste: number;
  first_impression: string | null;
  flavor_notes: string | null;
  recommendation: string | null;
  created_at: string;
};

export type Shop = {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  hours: string | null;
  phone: string | null;
  has_wifi: boolean;
  has_power: boolean;
  time_limit_minutes: number | null;
  pet_friendly: boolean;
  reservation_only: boolean;
  cover_url: string | null;
  created_by: string | null;
  created_at: string;
};

export type ShopReview = {
  id: string;
  shop_id: string;
  user_id: string;
  score_flavor: number;
  score_vibe: number;
  score_stay: number;
  score_work: number;
  score_dessert: number;
  score_value: number;
  comment: string | null;
  photo_url: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
};
