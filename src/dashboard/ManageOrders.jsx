import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import { getOrdersForManagement, getStaffUsers, updateOrderStatus } from '../services/supabaseService';
import { formatPesos } from '../utils/currency';

const statusOptions = ['pending', 'approved', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [savingId, setSavingId] = useState('');

  const loadOrders = async () => {
    const [{ data: orderData, error: orderError }, { data: staffData, error: staffError }] = await Promise.all([
      getOrdersForManagement(),
      getStaffUsers()
    ]);

    if (orderError) {
      toast.error(orderError.message);
      return;
    }

    if (staffError) {
      toast.error(staffError.message);
    }

    setOrders(orderData ?? []);
    setStaff(staffData ?? []);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const stats = useMemo(() => {
    return orders.reduce((acc, order) => {
      acc.total += 1;
      if (order.status === 'pending') acc.pending += 1;
      if (['approved', 'preparing', 'out_for_delivery'].includes(order.status)) acc.incomplete += 1;
      if (order.status === 'delivered') acc.delivered += 1;
      return acc;
    }, { total: 0, pending: 0, incomplete: 0, delivered: 0 });
  }, [orders]);

  const priorityOrders = useMemo(
    () => orders.filter((order) => ['pending', 'approved', 'preparing', 'out_for_delivery'].includes(order.status)).slice(0, 5),
    [orders]
  );

  const handleStatusChange = async (orderId, nextStatus) => {
    setSavingId(orderId);
    const { error } = await updateOrderStatus(orderId, nextStatus);
    setSavingId('');

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Order status updated');
    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)));
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Operations"
        title="Manage orders"
        description={`Total: ${stats.total} | Pending: ${stats.pending} | Incomplete: ${stats.incomplete} | Delivered: ${stats.delivered}`}
        action={<Button variant="secondary" onClick={loadOrders}>Refresh</Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total" value={`${stats.total}`} />
        <StatCard title="Pending" value={`${stats.pending}`} accent="blue" helper="Needs staff attention" />
        <StatCard title="Incomplete" value={`${stats.incomplete}`} helper="Approved / preparing / in transit" />
        <StatCard title="Staff" value={`${staff.length}`} accent="blue" helper="Available to handle orders" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card p-6">
          <p className="text-lg font-bold text-white">Order notifications</p>
          <p className="mt-2 text-sm text-gray-400">Pending and unfinished orders stay visible here until staff moves them to delivered.</p>
          <div className="mt-4 space-y-3">
            {priorityOrders.length ? priorityOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3">
                <div>
                  <p className="font-semibold text-white">#{order.id.slice(0, 8)} · {order.full_name}</p>
                  <p className="text-xs text-orange-200">{order.status.replace(/_/g, ' ')} · {new Date(order.created_at).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-orange-200">Staff review</span>
              </div>
            )) : <p className="text-sm text-gray-400">No pending or incomplete orders right now.</p>}
          </div>
        </div>

        <div className="glass-card p-6">
          <p className="text-lg font-bold text-white">Staff on duty</p>
          <div className="mt-4 space-y-3">
            {staff.length ? staff.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <div>
                  <p className="font-semibold text-white">{member.full_name}</p>
                  <p className="text-xs text-gray-400">{member.email}</p>
                </div>
                <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200">staff</span>
              </div>
            )) : <p className="text-sm text-gray-400">No staff users found yet.</p>}
          </div>
        </div>
      </div>

      <div className="glass-card overflow-x-auto p-6">
        <table className="min-w-full text-left text-sm text-gray-200">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="px-2 py-3">Order</th>
              <th className="px-2 py-3">Customer</th>
              <th className="px-2 py-3">Address</th>
              <th className="px-2 py-3">Preferred time</th>
              <th className="px-2 py-3">Total</th>
              <th className="px-2 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-900/80 align-top">
                <td className="px-2 py-3">
                  <p className="font-semibold">#{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                </td>
                <td className="px-2 py-3">
                  <p>{order.full_name}</p>
                  <p className="text-xs text-gray-400">{order.email}</p>
                  <p className="text-xs text-gray-400">{order.phone}</p>
                </td>
                <td className="px-2 py-3">
                  <p>{order.delivery_address}</p>
                  {order.delivery_location ? <p className="text-xs text-gray-400">{order.delivery_location}</p> : null}
                </td>
                <td className="px-2 py-3">
                  {order.preferred_delivery_time ? new Date(order.preferred_delivery_time).toLocaleString() : 'ASAP'}
                </td>
                <td className="px-2 py-3">{formatPesos(order.total_amount)}</td>
                <td className="px-2 py-3">
                  <select
                    className="rounded-xl border border-gray-800 bg-gray-900/70 px-3 py-2"
                    value={order.status}
                    disabled={savingId === order.id}
                    onChange={(event) => handleStatusChange(order.id, event.target.value)}
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}