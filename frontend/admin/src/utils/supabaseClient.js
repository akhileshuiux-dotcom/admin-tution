import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const isPlaceholder = supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY' || !supabaseUrl.startsWith('http');

if (isPlaceholder) {
    console.warn("Supabase credentials are missing or using placeholders. Auth will be disabled/mocked.");
}

export const supabase = createClient(
    isPlaceholder ? 'https://placeholder-project.supabase.co' : supabaseUrl,
    isPlaceholder ? 'placeholder-key' : supabaseAnonKey
);
