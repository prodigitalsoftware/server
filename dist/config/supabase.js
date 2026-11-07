"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL || 'https://prunuegthoruksqyqang.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_JDHakneZBhPJnnRrt4GVXA_BWujh-IQ';
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
console.log(`[Supabase] Client initialized for URL: ${supabaseUrl}`);
