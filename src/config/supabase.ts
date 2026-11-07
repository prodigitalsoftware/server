import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL || 'https://prunuegthoruksqyqang.supabase.co';
const supabaseKey =
  process.env.SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_JDHakneZBhPJnnRrt4GVXA_BWujh-IQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log(`[Supabase] Client initialized for URL: ${supabaseUrl}`);

