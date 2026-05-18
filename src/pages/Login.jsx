import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const ADMIN_USERNAME = 'jireh';
const ADMIN_EMAIL = 'jireh@foodhub.local';
const ADMIN_PASSWORD = 'faith1';
const STAFF_EMAIL = 'jai@foodhub.local';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getRoleWithRetry = async (userId, attempts = 10) => {
    for (let index = 0; index < attempts; index += 1) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();

        if (error) {
          console.warn(`Attempt ${index + 1}: Role query error:`, error.message);
        }

        if (data?.role) {
          console.log(`✓ Role found on attempt ${index + 1}:`, data.role);
          return String(data.role).toLowerCase();
        }
      } catch (err) {
        console.warn(`Attempt ${index + 1}: ${err.message}`);
      }

      if (index < attempts - 1) {
        await new Promise((resolve) => {
          setTimeout(resolve, 300);
        });
      }
    }

    console.warn('Could not retrieve role after all attempts');
    return null;
  };

  const resolveTarget = async ({ user, role }) => {
    const returnPath = location.state?.from?.pathname;
    const userEmail = String(user?.email ?? '').toLowerCase().trim();
    const isAdmin = userEmail === ADMIN_EMAIL;
    const isStaff = userEmail === STAFF_EMAIL;

    console.log('Resolving redirect target:', { email: userEmail, role, isAdmin });

    if (role === 'admin' || isAdmin) {
      console.log('✓ Redirecting to admin dashboard');
      return '/dashboard/admin';
    }

    if (role === 'staff' || isStaff) {
      console.log('✓ Redirecting to staff dashboard');
      return '/dashboard/staff';
    }

    if (returnPath) {
      console.log('Using return path:', returnPath);
      return returnPath;
    }

    console.log('✓ Redirecting to home');
    return '/';
  };

  const normalizeLoginInput = (value) => {
    const raw = String(value ?? '').trim().toLowerCase();
    if (!raw) return { username: '', email: '' };
    if (raw.includes('@')) {
      return { username: raw.split('@')[0], email: raw };
    }
    return { username: raw, email: `${raw}@foodhub.local` };
  };

  const bootstrapAdminAccount = async (loginInput, password) => {
    const { username: normalizedUsername, email: normalizedEmail } = normalizeLoginInput(loginInput);

    // supported bootstrap accounts
    const accounts = {
      [ADMIN_USERNAME]: { password: ADMIN_PASSWORD, role: 'admin', fullName: 'Jireh' },
      jai: { password: '212121', role: 'staff', fullName: 'Jai' }
    };

    const acct = accounts[normalizedUsername];
    if (!acct || acct.password !== password) return false;

    // If username already exists in app profile, don't bootstrap
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .ilike('username', normalizedUsername)
      .maybeSingle();

    if (existingUser) return false;

    const email = normalizedEmail;

    try {
      // create auth user (client signUp) — this creates auth.users row
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: acct.fullName } }
      });

      if (signUpErr && !String(signUpErr.message).toLowerCase().includes('user already registered')) {
        console.warn('signUp error:', signUpErr.message || signUpErr);
        return false;
      }

      // sign in immediately
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        console.warn('signIn after signUp failed:', signInErr.message || signInErr);
        return false;
      }

      const user = signInData.user;
      if (!user) return false;

      // upsert profile in public.users (now authenticated)
      const { error: upsertErr } = await supabase.from('users').upsert({
        id: user.id,
        email,
        username: normalizedUsername,
        full_name: acct.fullName,
        role: acct.role,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      if (upsertErr) {
        console.warn('Profile upsert error:', upsertErr.message || upsertErr);
        // inform the user so they can run the SQL/console fix — allow login to proceed
        try {
          toast.error('Account created but profile upsert failed. Run the SQL to add username/profile in Supabase.');
        } catch (e) {
          // ignore if toast not available for any reason
        }
      }

      return true;
    } catch (err) {
      console.error('Bootstrap error:', err.message || err);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    try {
      const input = String(form.get('username') ?? '').trim().toLowerCase();
      const password = String(form.get('password') ?? '');
      const { username, email } = normalizeLoginInput(input);
      console.log('Login attempt:', { input, username, email });

      // Try to resolve a stored email first, then fall back to the normalized email.
      const { data: profile } = await supabase
        .from('users')
        .select('email, username')
        .or(`username.ilike.${username},email.ilike.${email}`)
        .maybeSingle();
      const loginEmail = profile?.email ?? email;
      let user;

      try {
        ({ user } = await login({ email: loginEmail, password }));
        console.log('✓ Login successful, user ID:', user?.id);
      } catch (loginError) {
        const loginMessage = String(loginError?.message ?? '').toLowerCase();
        const isInvalidCredentials = loginMessage.includes('invalid login credentials');

        if (!isInvalidCredentials) {
          throw loginError;
        }

        console.log('Login failed, attempting admin bootstrap...');
        const bootstrapped = await bootstrapAdminAccount(input, password);

        if (!bootstrapped) {
          throw loginError;
        }

        ({ user } = await login({ email: loginEmail, password }));
        console.log('✓ Admin bootstrap successful');
      }

      const role = await getRoleWithRetry(user.id);
      console.log('Role retrieved:', role);
      
      const target = await resolveTarget({ user, role });
      console.log('Final redirect target:', target);
      
      navigate(target, { replace: true });
    } catch (error) {
      const message = String(error?.message ?? 'Unable to sign in');
      const isInvalidCredentials = message.toLowerCase().includes('invalid login credentials');
      const isBootstrapError = message.toLowerCase().includes('failed to create admin') || 
                               message.toLowerCase().includes('supabase url not configured') ||
                               message.toLowerCase().includes('admin bootstrap error');

      console.error('Login error:', message);

      if (isBootstrapError) {
        toast.error(`Admin setup failed: ${message}`);
      } else if (isInvalidCredentials) {
        toast.error('Invalid username or password');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-shell flex min-h-[70vh] items-center justify-center py-12">
      <form onSubmit={handleSubmit} className="glass-card w-full max-w-md space-y-4 p-6">
        <h1 className="text-3xl font-black">Welcome back</h1>
        <Input name="username" type="text" placeholder="Username or email" required />
        <Input name="password" type="password" placeholder="Password" />
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Signing in...' : 'Login'}</Button>
        <p className="text-sm text-gray-400">No account? <Link className="text-orange-300" to="/register">Register</Link></p>
      </form>
    </div>
  );
}