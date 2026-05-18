import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import SectionHeading from '../components/SectionHeading';
import Input from '../components/Input';
import Button from '../components/Button';
import { createManagedUser, deleteManagedUser, getStaffUsers, updateUserRole } from '../services/supabaseService';

const roleOptions = ['staff'];

const emptyForm = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  role: 'staff'
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    const { data, error } = await getStaffUsers();
    if (error) {
      toast.error(error.message);
      return;
    }
    setUsers(data ?? []);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const staffCount = useMemo(() => users.length, [users]);

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setLoading(true);

    const { error } = await createManagedUser(form);
    setLoading(false);

    if (error) {
      toast.error(error.message.includes('auth.admin')
        ? 'Admin user creation requires service role/edge function in production.'
        : error.message);
      return;
    }

    toast.success('User created');
    setForm(emptyForm);
    await loadUsers();
  };

  const handleRoleUpdate = async (id, role) => {
    const { error } = await updateUserRole(id, role);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Role updated');
    setUsers((current) => current.map((user) => (user.id === id ? { ...user, role } : user)));
  };

  const handleDelete = async (id) => {
    const { error } = await deleteManagedUser(id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('User removed');
    setUsers((current) => current.filter((user) => user.id !== id));
  };

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Admin" title="User and staff management" description={`Manage logins and roles. Current staff accounts: ${staffCount}`} />

      <form onSubmit={handleCreateUser} className="glass-card grid gap-4 p-6 lg:grid-cols-2">
        <Input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} type="email" placeholder="User email" required />
        <Input value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} type="password" placeholder="Temporary password" required />
        <Input value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} placeholder="Full name" required />
        <Input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Phone (optional)" />
        <div className="rounded-2xl border border-gray-800 bg-gray-900/70 px-4 py-3 text-sm text-gray-300 lg:col-span-1">
          Role is locked to staff in this screen.
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create user'}</Button>
          <Button type="button" variant="ghost" onClick={() => setForm(emptyForm)}>Reset</Button>
        </div>
      </form>

      <div className="glass-card overflow-x-auto p-6">
        <table className="min-w-full text-left text-sm text-gray-200">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="px-2 py-3">Name</th>
              <th className="px-2 py-3">Email</th>
              <th className="px-2 py-3">Role</th>
              <th className="px-2 py-3">Created</th>
              <th className="px-2 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-900/80">
                <td className="px-2 py-3">{user.full_name}</td>
                <td className="px-2 py-3">{user.email ?? 'N/A'}</td>
                <td className="px-2 py-3">
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-200">staff</span>
                </td>
                <td className="px-2 py-3">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-2 py-3">
                  <Button type="button" variant="ghost" className="px-3 py-2 text-xs" onClick={() => handleDelete(user.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}