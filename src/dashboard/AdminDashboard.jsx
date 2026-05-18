import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import { useEffect, useMemo, useState } from 'react';
import { getDashboardMetrics, getOrdersForManagement, getProductsForAdmin, getStaffUsers } from '../services/supabaseService';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatPesos } from '../utils/currency';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    total_revenue: 0,
    pending_orders: 0,
    completed_orders: 0,
    low_stock_alerts: 0
  });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      const [{ data: metricData }, { data: orderData }, { data: productData }, { data: staffData }] = await Promise.all([
        getDashboardMetrics(),
        getOrdersForManagement(),
        getProductsForAdmin(),
        getStaffUsers()
      ]);

      if (metricData) {
        setMetrics(metricData);
      }

      if (orderData) {
        setOrders(orderData);
      }

      if (productData) {
        setProducts(productData);
      }

      if (staffData) {
        setStaff(staffData);
      }
    }

    loadDashboard();
  }, []);

  const revenueSeries = useMemo(() => {
    const byDay = {};
    orders.forEach((order) => {
      const date = new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      byDay[date] = (byDay[date] ?? 0) + Number(order.total_amount ?? 0);
    });

    return Object.entries(byDay)
      .slice(-7)
      .map(([name, revenue]) => ({ name, revenue: Number(revenue.toFixed(2)) }));
  }, [orders]);

  const bestSelling = useMemo(() => {
    return [...products]
      .sort((a, b) => Number(b.stock ?? 0) - Number(a.stock ?? 0))
      .slice(0, 5);
  }, [products]);

  const pendingAlerts = useMemo(
    () => orders.filter((order) => ['pending', 'approved', 'preparing', 'out_for_delivery'].includes(String(order.status ?? '').toLowerCase())).slice(0, 5),
    [orders]
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <SectionHeading eyebrow="Admin" title="Operations overview" />
        <p className="text-sm text-gray-400">System metrics up to date</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Revenue" value={formatPesos(metrics.total_revenue ?? 0)} helper="All non-cancelled orders" accent="orange" icon="💰" />
        <StatCard title="Pending Orders" value={`${metrics.pending_orders ?? 0}`} helper="Needs approval" accent="blue" icon="⏳" />
        <StatCard title="Completed Orders" value={`${metrics.completed_orders ?? 0}`} helper="Delivered orders" accent="green" icon="✅" />
        <StatCard title="Staff" value={`${staff.length}`} helper="Active staff accounts" accent="purple" icon="👥" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <div className="absolute -left-10 -top-10 z-0 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl"></div>
          <div className="relative z-10 h-96">
            <p className="mb-4 text-lg font-bold">Revenue Trend</p>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={revenueSeries}>
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px' }} />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <div className="absolute -right-10 -top-10 z-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl"></div>
          <div className="relative z-10">
            <p className="mb-4 text-lg font-bold">Best selling foods</p>
            <div className="space-y-3">
              {bestSelling.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 transition-colors hover:bg-white/10">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-orange-300 font-bold">Stock {product.stock}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <div className="absolute -left-10 -top-10 z-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="relative z-10">
            <p className="mb-4 text-lg font-bold text-white">Pending order alerts</p>
            <div className="space-y-3">
              {pendingAlerts.length ? pendingAlerts.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 transition-colors hover:bg-orange-500/20">
                  <div>
                    <p className="font-semibold text-white">#{order.id.slice(0, 8)} · {order.full_name}</p>
                    <p className="text-xs text-orange-200">{String(order.status ?? 'pending').replace(/_/g, ' ')} · {new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-orange-200">Staff alert</span>
                </div>
              )) : <p className="text-sm text-gray-400">No outstanding orders right now.</p>}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <div className="absolute -right-10 -top-10 z-0 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl"></div>
          <div className="relative z-10">
            <p className="mb-4 text-lg font-bold text-white">Staff coverage</p>
            <div className="space-y-3">
              {staff.length ? staff.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 transition-colors hover:bg-white/10">
                  <div>
                    <p className="font-semibold text-white">{member.full_name}</p>
                    <p className="text-xs text-gray-400">{member.email}</p>
                  </div>
                  <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200">staff</span>
                </div>
              )) : <p className="text-sm text-gray-400">No staff accounts loaded.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}