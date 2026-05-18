import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { FiBarChart2, FiBox, FiHome, FiLayers, FiShoppingBag, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getOrdersForManagement } from '../services/supabaseService';

const adminLinks = [
  { to: '/dashboard/admin', label: 'Overview', icon: FiHome },
  { to: '/dashboard/products', label: 'Products', icon: FiBox },
  { to: '/dashboard/orders', label: 'Orders', icon: FiShoppingBag },
  { to: '/dashboard/revenue', label: 'Sales', icon: FiBarChart2 },
  { to: '/dashboard/categories', label: 'Categories', icon: FiLayers },
  { to: '/dashboard/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/dashboard/users', label: 'Users', icon: FiUsers }
];

const staffLinks = [
  { to: '/dashboard/staff', label: 'Overview', icon: FiHome },
  { to: '/dashboard/orders', label: 'Orders', icon: FiShoppingBag },
  { to: '/dashboard/inventory', label: 'Inventory', icon: FiLayers }
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  const links = role === 'staff' ? staffLinks : adminLinks;
  const [orderAlertCount, setOrderAlertCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadOrderAlerts() {
      const { data } = await getOrdersForManagement();
      if (!mounted) return;

      const alertCount = (data ?? []).filter((order) => ['pending', 'approved', 'preparing', 'out_for_delivery'].includes(String(order.status ?? '').toLowerCase())).length;
      setOrderAlertCount(alertCount);
    }

    loadOrderAlerts();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/?public=1', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white lg:flex">
      <aside className="border-r border-white/5 bg-black/30 lg:w-72">
        <div className="border-b border-white/5 px-6 py-6">
          <p className="text-2xl font-black tracking-tight">FoodHub</p>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-gray-400">Dashboard</p>
          <div className="mt-6 flex flex-col gap-3">
            <NavLink
              to="/?public=1"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/10"
            >
              <FiHome size={16} /> Back to Home
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300"
            >
              Logout
            </button>
          </div>
        </div>
        <nav className="space-y-2 p-4">
          {links.map(({ to, label, icon: Icon }) => {
            const showBadge = to === '/dashboard/orders' && orderAlertCount > 0;

            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon />
                <span className="flex-1">{label}</span>
                {showBadge ? <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--fh-accent)] px-2 text-[11px] font-black text-[var(--fh-bg)]">{orderAlertCount}</span> : null}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1">
        <div className="border-b border-white/5 px-6 py-5">
          <p className="text-sm text-gray-400">Operations and analytics</p>
        </div>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}