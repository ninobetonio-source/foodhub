#!/usr/bin/env node
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function createOrUpdateUser({ email, password, full_name, role }) {
  try {
    // Create auth user via admin API
    const { data: userData, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    });
    if (createErr) {
      // If user already exists, fetch by email
      console.warn('Create user error — attempting lookup:', createErr.message || createErr);
      const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
      if (listErr) throw listErr;
      const existing = listData.users.find(u => String(u.email).toLowerCase() === String(email).toLowerCase());
      if (!existing) throw createErr;
      userData.user = existing;
    }

    const userId = userData.user.id;

    // Upsert profile in public.users table
      // Upsert profile in public.users table and include username for username-based login
      const { error: upsertErr } = await supabase.from('users').upsert({ id: userId, full_name, role, email, username: email.split('@')[0] }, { onConflict: 'id' });
    if (upsertErr) throw upsertErr;

    console.log(`Created/updated ${email} as ${role} (id=${userId})`);
  } catch (err) {
    console.error('Error creating user', email, err.message || err);
  }
}

async function main() {
  // Use local username@foodhub.local as emails
  await createOrUpdateUser({ email: 'jireh@foodhub.local', password: 'faith1', full_name: 'Jireh (admin)', role: 'admin' });
  await createOrUpdateUser({ email: 'jai@foodhub.local', password: '212121', full_name: 'Jai (staff)', role: 'staff' });
  process.exit(0);
}

main();
