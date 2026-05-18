import { useEffect, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import { getStaffUsers } from '../services/supabaseService';

export default function StaffManagement() {
  const [staffUsers, setStaffUsers] = useState([]);

  useEffect(() => {
    async function loadStaff() {
      const { data } = await getStaffUsers();
      if (data) {
        setStaffUsers(data);
      }
    }

    loadStaff();
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Admin" title="Staff roster" description="Staff accounts are created in User Management with role set to staff." />
      <div className="glass-card overflow-x-auto p-6">
        <table className="min-w-full text-left text-sm text-gray-200">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="px-2 py-3">Name</th>
              <th className="px-2 py-3">Email</th>
              <th className="px-2 py-3">Phone</th>
              <th className="px-2 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {staffUsers.map((staff) => (
              <tr key={staff.id} className="border-b border-gray-900/80">
                <td className="px-2 py-3">{staff.full_name}</td>
                <td className="px-2 py-3">{staff.email ?? 'N/A'}</td>
                <td className="px-2 py-3">{staff.phone ?? '-'}</td>
                <td className="px-2 py-3">{new Date(staff.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}