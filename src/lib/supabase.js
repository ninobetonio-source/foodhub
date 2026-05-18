import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function createFallbackClient() {
	const query = {
		select: () => query,
		eq: () => query,
		ilike: () => query,
		order: () => query,
		insert: async () => ({ data: null, error: null }),
		upsert: async () => ({ data: null, error: null }),
		single: async () => ({ data: null, error: null })
	};

	return {
		auth: {
			getSession: async () => ({ data: { session: null } }),
			onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
			signUp: async () => ({ data: { user: null, session: null }, error: null }),
			signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
			signOut: async () => ({ error: null })
		},
		from: () => query
	};
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : createFallbackClient();