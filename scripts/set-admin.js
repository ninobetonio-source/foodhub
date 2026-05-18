#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setAdmin() {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role: 'admin', updated_at: new Date().toISOString() })
      .eq('email', 'admin@foodhub.local')
      .select('id, email, role');

    if (error) {
      console.error('Supabase error:', error);
      process.exit(1);
    }

    console.log('Updated rows:', data?.length ?? 0);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

setAdmin();
