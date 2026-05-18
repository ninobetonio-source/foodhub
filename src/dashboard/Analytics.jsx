import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import { formatPesos } from '../utils/currency';
import { getCategoriesForAdmin, getOrdersForManagement, getProductsForAdmin, getSalesRecords, getStaffUsers } from '../services/supabaseService';

const orderColors = ['#FF9900', '#22c55e', '#38bdf8', '#a855f7', '#eab308', '#ef4444'];

export default function Analytics() {
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    async function load() {
      const [ordersResult, salesResult, productsResult, categoriesResult, staffResult] = await Promise.all([
        getOrdersForManagement(),
        getSalesRecords(),
        getProductsForAdmin(),
        getCategoriesForAdmin(),
        getStaffUsers()
      ]);

      setOrders(ordersResult.data ?? []);
      setSales(salesResult.data ?? []);
      setProducts(productsResult.data ?? []);
      setCategories(categoriesResult.data ?? []);
      setStaff(staffResult.data ?? []);
    }

    load();
  }, []);

  const summary = useMemo(() => {
    const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.revenue ?? 0), 0);
    const pendingOrders = orders.filter((order) => order.status === 'pending').length;
    const activeOrders = orders.filter((order) => ['pending', 'approved', 'preparing', 'out_for_delivery'].includes(order.status)).length;
    const completedOrders = orders.filter((order) => order.status === 'delivered').length;
    const topCategoryData = categories
      .map((category) => ({
        name: category.name,
        value: products.filter((product) => product.category_id === category.id).length
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const orderStatusData = Object.entries(
      orders.reduce((acc, order) => {
        const key = String(order.status ?? 'pending').replace(/_/g, ' ');
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    const revenueByDate = Object.entries(
      sales.reduce((acc, sale) => {
        const day = new Date(sale.sold_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        acc[day] = (acc[day] ?? 0) + Number(sale.revenue ?? 0);
        return acc;
      }, {})
    ).slice(-7).map(([name, revenue]) => ({ name, revenue: Number(revenue.toFixed(2)) }));

    return {
      totalRevenue,
      pendingOrders,
      activeOrders,
      completedOrders,
      topCategoryData,
      orderStatusData,
      revenueByDate,
      averageOrderValue: orders.length ? totalRevenue / orders.length : 0,
      lowStockCount: products.filter((product) => Number(product.stock ?? 0) <= 10 && product.is_active).length,
      featuredProducts: products.filter((product) => product.featured).length
    };
  }, [orders, sales, categories, products]);

  const highlightChips = [
    { label: 'Pending orders', value: summary.pendingOrders },
    { label: 'Completed orders', value: summary.completedOrders },
    { label: 'Low stock alerts', value: summary.lowStockCount },
    { label: 'Featured products', value: summary.featuredProducts }
  ];

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Admin" title="Analytics" description="Revenue, order flow, category mix, and staff coverage at a glance." />

      <div className="rounded-[1rem] border border-fh-border bg-fh-card p-6">
        <div className="relative grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#FF9900]">Live performance snapshot</p>
            <h3 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">A clean, high-contrast view of sales, staffing, and order movement.</h3>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-200/80">
              Track revenue, catch order backlogs early, and keep categories and stock visible without losing the premium FoodHub look.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {highlightChips.map((chip) => (
                <div key={chip.label} className="rounded-lg border border-fh-border bg-fh-elevated px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-gray-300">{chip.label}</p>
                  <p className="mt-1 text-lg font-black text-white">{chip.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 rounded-[1rem] border border-fh-border bg-fh-elevated p-4">
            <div className="flex items-center justify-between rounded-lg bg-fh-card px-4 py-3">
              <span className="text-sm text-gray-300">Average order value</span>
              <span className="text-sm font-bold text-white">{formatPesos(summary.averageOrderValue)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-fh-card px-4 py-3">
              <span className="text-sm text-gray-300">Active orders</span>
              <span className="text-sm font-bold text-white">{summary.activeOrders}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-fh-card px-4 py-3">
              <span className="text-sm text-gray-300">Staff online roster</span>
              <span className="text-sm font-bold text-white">{staff.length}</span>
            </div>
            <div className="rounded-lg border border-fh-border bg-fh-card px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-100">Status</p>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                Pending orders are now highlighted separately so staff can act fast.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Revenue" value={formatPesos(summary.totalRevenue)} helper="Tracked sales revenue" />
        <StatCard title="Pending" value={`${summary.pendingOrders}`} helper="Needs staff attention" accent="blue" />
        <StatCard title="Active Orders" value={`${summary.activeOrders}`} helper="Pending, approved, or in transit" />
        <StatCard title="Staff" value={`${staff.length}`} helper="Available staff accounts" accent="blue" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="glass-card flex flex-col p-5">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-white">Revenue trend</p>
              <p className="text-sm text-gray-400">Sales across the latest days recorded</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-300">7 day window</span>
          </div>
          <div className="h-[22rem] min-h-[280px] w-full flex-grow">
            {summary.revenueByDate.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.revenueByDate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenueAnalytics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF9900" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#FF9900" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} dy={10} />
                  <YAxis stroke="#6b7280" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickFormatter={(value) => `₱${value}`} dx={-10} />
                  <Tooltip 
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333333', borderRadius: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                    labelStyle={{ color: '#d1d5db', marginBottom: '4px', fontSize: '13px' }}
                    itemStyle={{ color: '#FF9900', fontWeight: '900', fontSize: '15px' }}
                    cursor={{ stroke: '#4b5563', strokeWidth: 1, strokeDasharray: '4 4' }}
                    formatter={(value) => [formatPesos(value), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#FF9900" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueAnalytics)" activeDot={{ r: 6, stroke: '#111827', strokeWidth: 2, fill: '#FF9900' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5">
                <p className="text-sm text-gray-400">No revenue data available.</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-white">Order status mix</p>
              <p className="text-sm text-gray-400">Where the queue is currently sitting</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={summary.orderStatusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
                {summary.orderStatusData.map((entry, index) => (
                  <Cell key={entry.name} fill={orderColors[index % orderColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap gap-2">
            {summary.orderStatusData.map((item, index) => (
              <span key={item.name} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-200">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: orderColors[index % orderColors.length] }} />
                {item.name} · {item.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-card border border-white/5 p-5">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-white">Top categories</p>
              <p className="text-sm text-gray-400">Category mix by product count</p>
            </div>
          </div>
          <div className="space-y-3">
            {summary.topCategoryData.length ? summary.topCategoryData.map((category) => (
              <div key={category.name} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-gray-100">{category.name}</span>
                  <span className="text-sm font-bold text-orange-300">{category.value} products</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
                    <div
                      className="h-full rounded-full bg-[#FF9900]"
                      style={{ width: `${Math.min(100, Math.max(10, category.value * 20))}%` }}
                    />
                </div>
              </div>
            )) : <p className="text-sm text-gray-400">No category data yet.</p>}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="glass-card border border-white/5 p-5">
            <p className="mb-4 text-lg font-bold text-white">Operations notes</p>
            <div className="grid gap-3 text-sm text-gray-300 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Completed orders</p>
                <p className="mt-2 text-lg font-black text-white">{summary.completedOrders}</p>
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Average order value</p>
                <p className="mt-2 text-lg font-black text-white">{formatPesos(summary.averageOrderValue)}</p>
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3 sm:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Workflow note</p>
                <p className="mt-2 leading-6 text-gray-300">
                  Pending orders should stay visible to staff until they are approved, prepared, and delivered.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card border border-white/5 p-5">
            <p className="mb-4 text-lg font-bold text-white">Staff coverage</p>
            <div className="space-y-3">
              {staff.length ? staff.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
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