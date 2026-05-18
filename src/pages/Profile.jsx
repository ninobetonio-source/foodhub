import SectionHeading from '../components/SectionHeading';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { profile, user } = useAuth();

  return (
    <div className="section-shell py-12">
      <SectionHeading eyebrow="Profile" title="Your account details" />
      <div className="glass-card p-6">
        <p className="text-sm text-gray-400">Email</p>
        <p className="text-white">{user?.email}</p>
        <p className="mt-4 text-sm text-gray-400">Role</p>
        <p className="text-white">{profile?.role ?? 'customer'}</p>
      </div>
    </div>
  );
}