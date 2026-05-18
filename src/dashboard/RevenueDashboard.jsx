import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import Input from '../components/Input';
import Button from '../components/Button';
import { deleteSale, getOrdersForManagement, getSalesRecords, saveSale } from '../services/supabaseService';
import { formatPesos } from '../utils/currency';

const emptyForm = {
  id: '',
  order_id: '',
  revenue: ''
};

export default function RevenueDashboard() {
  const [sales, setSales] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const loadSales = async () => {
    const [{ data: saleData, error: salesError }, { data: orderData, error: orderError }] = await Promise.all([
      getSalesRecords(),
      getOrdersForManagement()
    ]);

    if (salesError) {
      toast.error(salesError.message);
      return;
    }

    if (orderError) {
      toast.error(orderError.message);
    }

    setSales(saleData ?? []);
    setOrders(orderData ?? []);
  };

  useEffect(() => {
    loadSales();
  }, []);

  const totalRevenue = useMemo(
    () => sales.reduce((acc, item) => acc + Number(item.revenue ?? 0), 0),
    [sales]
  );

  const revenueByDay = useMemo(() => {
    return Object.entries(
      sales.reduce((acc, sale) => {
        const day = new Date(sale.sold_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        acc[day] = (acc[day] ?? 0) + Number(sale.revenue ?? 0);
        return acc;
      }, {})
    ).slice(-7).map(([name, revenue]) => ({ name, revenue: Number(revenue.toFixed(2)) }));
  }, [sales]);

  const trendStats = useMemo(() => {
    const highest = revenueByDay.reduce((max, item) => Math.max(max, item.revenue), 0);
    const average = revenueByDay.length ? revenueByDay.reduce((total, item) => total + item.revenue, 0) / revenueByDay.length : 0;
    const latest = revenueByDay.at(-1)?.revenue ?? 0;

    return {
      highest,
      average,
      latest
    };
  }, [revenueByDay]);

  const completedOrderCount = useMemo(() => orders.filter((order) => order.status === 'delivered').length, [orders]);
  const pendingOrderCount = useMemo(() => orders.filter((order) => order.status === 'pending').length, [orders]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      revenue: Number(form.revenue)
    };

    const { error } = await saveSale(payload);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(form.id ? 'Sale updated' : 'Sale recorded');
    setForm(emptyForm);
    await loadSales();
  };

  const handleEdit = (record) => {
    setForm({
      id: record.id,
      order_id: record.order_id,
      revenue: record.revenue
    });
  };

  const handleDelete = async (id) => {
    const { error } = await deleteSale(id);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Sale deleted');
    await loadSales();
  };

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Admin" title="Sales and revenue" description={`Tracked sales revenue: ${formatPesos(totalRevenue)}`} />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Sales records" value={`${sales.length}`} helper="Manual sales entries" />
        <StatCard title="Completed orders" value={`${completedOrderCount}`} helper="Delivered orders" accent="blue" />
        <StatCard title="Pending orders" value={`${pendingOrderCount}`} helper="Needs staff follow-up" />
      </div>

      <div className="rounded-[1rem] border border-fh-border bg-fh-card p-6">
        <div className="relative grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-between gap-6 rounded-[1rem] border border-fh-border bg-fh-elevated p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#FF9900]">Revenue trend</p>
              <h3 className="mt-3 text-3xl font-black tracking-tight text-white">Recent sales movement</h3>
              <p className="mt-3 text-sm leading-6 text-gray-200/80">
                A quick look at the latest recorded revenue so you can see momentum at a glance.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400">Latest</p>
                <p className="mt-2 text-lg font-black text-white">{formatPesos(trendStats.latest)}</p>
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400">Average</p>
                <p className="mt-2 text-lg font-black text-white">{formatPesos(trendStats.average)}</p>
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400">Peak</p>
                <p className="mt-2 text-lg font-black text-white">{formatPesos(trendStats.highest)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1rem] border border-fh-border bg-fh-elevated p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-300">Last 7 entries</p>
                <p className="mt-1 text-sm text-gray-400">Revenue recorded by sale date</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-300">Live chart</span>
            </div>

            <div className="h-[22rem]">
              {revenueByDay.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF9900" stopOpacity={1} />
                        <stop offset="100%" stopColor="#FF9900" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#243042" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} width={60} tickFormatter={(value) => `₱${Number(value).toFixed(0)}`} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 700 }}
                      formatter={(value) => [formatPesos(value), 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="url(#revenueBarGradient)" radius={[14, 14, 4, 4]} barSize={34} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-[1.25rem] border border-dashed border-white/10 bg-white/5 px-6 text-center">
                  <div>
                    <p className="text-sm font-semibold text-white">No revenue data yet</p>
                    <p className="mt-2 text-sm text-gray-400">Add a sale record to start the trend chart.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card grid gap-4 p-6 md:grid-cols-3">
        <Input value={form.order_id} onChange={(event) => setForm((prev) => ({ ...prev, order_id: event.target.value }))} placeholder="Order ID" required />
        <Input value={form.revenue} onChange={(event) => setForm((prev) => ({ ...prev, revenue: event.target.value }))} placeholder="Revenue" type="number" min="0" step="0.01" required />
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : form.id ? 'Update' : 'Add sale'}</Button>
          <Button type="button" variant="ghost" onClick={() => setForm(emptyForm)}>Clear</Button>
        </div>
      </form>

      <div className="glass-card overflow-x-auto p-6">
        <table className="min-w-full text-left text-sm text-gray-200">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="px-2 py-3">Order ID</th>
              <th className="px-2 py-3">Revenue</th>
              <th className="px-2 py-3">Sold at</th>
              <th className="px-2 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((record) => (
              <tr key={record.id} className="border-b border-gray-900/80">
                <td className="px-2 py-3">{record.order_id}</td>
                <td className="px-2 py-3">{formatPesos(record.revenue)}</td>
                <td className="px-2 py-3">{new Date(record.sold_at).toLocaleString()}</td>
                <td className="px-2 py-3">
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" className="px-3 py-2 text-xs" onClick={() => handleEdit(record)}>Edit</Button>
                    <Button type="button" variant="ghost" className="px-3 py-2 text-xs" onClick={() => handleDelete(record.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}