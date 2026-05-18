import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    try {
      const username = String(form.get('username') ?? '').trim().toLowerCase();
      const email = `${username}@foodhub.local`;
      const password = String(form.get('password') ?? '');
      // Supabase requires passwords of at least 6 characters.
      if (password.length < 6) {
        toast.error('Password should be at least 6 characters.');
        setLoading(false);
        return;
      }
      const fullName = String(form.get('full_name') ?? '');
      const phone = String(form.get('phone') ?? '');

      const data = await register({ email, password, fullName, phone });

      // upsert app profile with username so login by username works
      const userId = data?.user?.id;
      if (userId) {
        await supabase.from('users').upsert({ id: userId, email, username, full_name: fullName, phone, created_at: new Date().toISOString() }, { onConflict: 'id' });
      }

      toast.success('Account created — you can now log in');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-shell flex min-h-[70vh] items-center justify-center py-12">
      <form noValidate onSubmit={handleSubmit} className="glass-card w-full max-w-md space-y-4 p-6">
        <h1 className="text-3xl font-black">Create account</h1>
        <Input name="full_name" placeholder="Full name" required />
        <Input name="phone" placeholder="Phone number" required />
        <Input name="username" placeholder="Choose a username (e.g. jireh)" required />
        <Input name="password" type="password" placeholder="Password" required />
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Creating...' : 'Register'}</Button>
        <p className="text-sm text-gray-400">Already have an account? <Link className="text-orange-300" to="/login">Login</Link></p>
      </form>
    </div>
  );
}