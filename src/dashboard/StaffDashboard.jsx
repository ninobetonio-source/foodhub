import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiClock, FiAlertCircle, FiBox, FiList } from 'react-icons/fi';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import { getOrdersForManagement, getProductsForAdmin, updateOrderStatus } from '../services/supabaseService';

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const [ordersRes, productsRes] = await Promise.all([
      getOrdersForManagement(),
      getProductsForAdmin()
    ]);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (productsRes.data) setProducts(productsRes.data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    return orders.reduce((acc, order) => {
      if (new Date(order.created_at).toDateString() === new Date().toDateString()) {
        acc.today += 1;
      }
      if (['approved', 'preparing', 'out_for_delivery'].includes(order.status)) {
        acc.inProgress += 1;
      }
      if (order.status === 'delivered') acc.delivered += 1;
      if (order.status === 'pending') acc.pending += 1;
      return acc;
    }, { today: 0, inProgress: 0, delivered: 0, pending: 0 });
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock > 0 && p.stock <= 15).sort((a, b) => a.stock - b.stock);
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter(p => p.stock === 0);
  }, [products]);

  const handleQuickApprove = async (orderId) => {
    const { error } = await updateOrderStatus(orderId, 'approved');
    if (error) {
      toast.error('Failed to approve order');
    } else {
      toast.success(`Order #${orderId.slice(0, 8)} approved!`);
      loadData();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <SectionHeading eyebrow="Staff" title="Daily operations" />
        <p className="text-sm text-gray-400">Live Kitchen Snapshot</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Orders Today" value={`${stats.today}`} accent="blue" icon="📦" />
        <StatCard title="In Progress" value={`${stats.inProgress}`} accent="orange" icon="⏳" />
        <StatCard title="Delivered" value={`${stats.delivered}`} accent="green" icon="✅" />
        <StatCard title="Pending" value={`${stats.pending}`} accent="purple" icon="🚨" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Quick Actions */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl xl:col-span-1">
          <div className="absolute -left-10 -top-10 z-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="relative z-10">
            <p className="text-lg font-bold">Staff actions</p>
            <p className="mt-2 mb-6 text-sm text-gray-400">Navigate to key management areas.</p>
            <div className="space-y-3">
              <Link to="/dashboard/orders" className="flex items-center gap-4 rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                  <FiList size={20} />
                </div>
                <div>
                  <p className="font-bold text-white">Manage Orders</p>
                  <p className="text-xs font-bold text-gray-400">Process active tickets</p>
                </div>
              </Link>
              <Link to="/dashboard/inventory" className="flex items-center gap-4 rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
                  <FiBox size={20} />
                </div>
                <div>
                  <p className="font-bold text-white">Inventory Controls</p>
                  <p className="text-xs font-bold text-gray-400">Update stock levels</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Recent Pending Orders */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl xl:col-span-1">
          <div className="absolute -right-10 -top-10 z-0 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl"></div>
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-bold">Pending Tickets</p>
              <Link to="/dashboard/orders" className="text-xs font-bold text-[#FF9900] hover:underline">View All</Link>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {loading ? (
                <p className="text-sm text-gray-400 text-center py-4">Loading tickets...</p>
              ) : orders.filter(o => o.status === 'pending').length > 0 ? (
                orders.filter(o => o.status === 'pending').slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 group">
                    <div>
                      <p className="font-bold text-white">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs font-bold text-gray-400">{order.full_name}</p>
                    </div>
                    <button 
                      onClick={() => handleQuickApprove(order.id)}
                      className="rounded-lg bg-[#FF9900] px-3 py-1.5 text-xs font-bold text-black opacity-0 transition-opacity group-hover:opacity-100 hover:bg-orange-500"
                    >
                      Approve
                    </button>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-400 group-hover:hidden">
                      <FiClock size={12} /> New
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-gray-500">
                  <FiCheckCircle size={32} className="mb-2 opacity-50" />
                  <p className="text-sm font-bold">All caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl xl:col-span-1">
          <div className="absolute -left-10 bottom-0 z-0 h-32 w-32 rounded-full bg-red-500/10 blur-3xl"></div>
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-bold flex items-center gap-2">
                Inventory Alerts
                {(outOfStockProducts.length > 0 || lowStockProducts.length > 0) && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                    {outOfStockProducts.length + lowStockProducts.length}
                  </span>
                )}
              </p>
              <Link to="/dashboard/inventory" className="text-xs font-bold text-[#FF9900] hover:underline">Manage</Link>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {loading ? (
                <p className="text-sm text-gray-400 text-center py-4">Checking stock...</p>
              ) : outOfStockProducts.length === 0 && lowStockProducts.length === 0 ? (
                 <div className="flex h-full flex-col items-center justify-center text-gray-500">
                   <FiCheckCircle size={32} className="mb-2 opacity-50" />
                   <p className="text-sm font-bold">Stock levels healthy</p>
                 </div>
              ) : (
                <>
                  {outOfStockProducts.slice(0, 3).map(p => (
                    <div key={p.id} className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                      <div>
                        <p className="font-bold text-red-200 line-clamp-1">{p.name}</p>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-500">
                        <FiAlertCircle size={12} /> Out of Stock
                      </span>
                    </div>
                  ))}
                  {lowStockProducts.slice(0, 5 - Math.min(outOfStockProducts.length, 3)).map(p => (
                    <div key={p.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                      <div>
                        <p className="font-bold text-white line-clamp-1">{p.name}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                        {p.stock} Left
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}