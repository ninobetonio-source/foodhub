import { useMemo, useState, useEffect, useRef } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import { trackOrderByEmail, getProducts } from '../services/supabaseService';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import { formatPesos } from '../utils/currency';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';
import { getOrderById, updateOrderStatus } from '../services/supabaseService';

const statusToneMap = {
  pending: 'orange',
  approved: 'orange',
  preparing: 'neutral',
  out_for_delivery: 'green',
  delivered: 'green',
  cancelled: 'neutral'
};

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]); // all matched orders
  const [order, setOrder] = useState(null); // selected order
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  
  useEffect(() => {
    getProducts().then(res => {
      if (res.data) setAllProducts(res.data);
    });
  }, []);
  
  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittedReview, setSubmittedReview] = useState(null);

  const resolveLocalOrders = (lookupId, lookupEmail) => {
    let matchedOrders = [];
    try {
      // Find all orders in local storage
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key.startsWith('foodhub-order-')) {
          try {
            const parsed = JSON.parse(window.localStorage.getItem(key));
            const matchesId = lookupId ? parsed.id === lookupId : true;
            const matchesEmail = lookupEmail ? String(parsed.email ?? '').toLowerCase() === lookupEmail : true;
            
            if (matchesId && matchesEmail) {
              matchedOrders.push(parsed);
            }
          } catch {}
        }
      }
      
      // Also check the generic latest order just in case
      const latest = window.localStorage.getItem('foodhub-latest-order');
      if (latest) {
        try {
          const parsed = JSON.parse(latest);
          const matchesId = lookupId ? parsed.id === lookupId : true;
          const matchesEmail = lookupEmail ? String(parsed.email ?? '').toLowerCase() === lookupEmail : true;
          if (matchesId && matchesEmail && !matchedOrders.find(o => o.id === parsed.id)) {
            matchedOrders.push(parsed);
          }
        } catch {}
      }
    } catch {
      // ignore
    }
    
    // Sort newest first
    return matchedOrders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  };

  const trackOrder = async () => {
    if (!email.trim()) {
      setError('Enter the email used at checkout to continue.');
      setOrder(null);
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    const normalizedOrderId = orderId.trim();
    const normalizedEmail = email.trim().toLowerCase();

    let data = null;
    let fetchError = null;

    if (normalizedOrderId) {
      const result = await trackOrderByEmail(normalizedEmail, normalizedOrderId);
      data = result.data;
      fetchError = result.error;
    } else {
      const result = await trackOrderByEmail(normalizedEmail);
      data = result.data;
      fetchError = result.error;
    }

    if (fetchError) {
      const localOrders = resolveLocalOrders(normalizedOrderId, normalizedEmail);

      if (localOrders.length > 0) {
        setOrders(localOrders);
        setOrder(localOrders[0]);
        setLoading(false);
        return;
      }

      setError('We could not find that order. Double-check the email and optional ID, then try again.');
    } else {
      // `data` from service is now an array of orders (newest first)
      const list = Array.isArray(data) ? data : [data];
      setOrders(list);
      setOrder(list[0] ?? null);
    }

    setLoading(false);
  };

  // Poll for updates every 30 seconds when an order is loaded
  const pollRef = useRef(null);
  useEffect(() => {
    if (!order?.id) return;

    async function fetchLatest() {
      const { data, error } = await getOrderById(order.id);
      if (error) return;
      if (!data) return;

      // if status changed from pending -> preparing while user is on page
      if (order.status === 'pending' && data.status !== 'pending') {
        toast('Your order is now being prepared and can no longer be cancelled.');
      }

      // update selected order
      setOrder((prev) => ({ ...prev, ...data }));

      // also update orders list if present
      setOrders((current) => current.map((o) => (o.id === data.id ? { ...o, ...data } : o)));
    }

    fetchLatest();
    pollRef.current = setInterval(fetchLatest, 30000);
    return () => clearInterval(pollRef.current);
  }, [order?.id]);

  useEffect(() => {
    if (order?.id) {
      const existing = window.localStorage.getItem(`foodhub-review-${order.id}`);
      if (existing) {
        setSubmittedReview(JSON.parse(existing));
      } else {
        setSubmittedReview(null);
      }
      setRating(5);
      setComment('');
    }
  }, [order?.id]);

  // Cancel flow
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const normalizedStatus = String(order?.status ?? 'pending').toLowerCase();

  const handleCancelConfirm = async () => {
    if (!order?.id) return;
    setCancelling(true);
    try {
      // Server-side validation is required; attempt update
      const { data, error } = await updateOrderStatus(order.id, 'cancelled');
      setCancelling(false);
      setConfirmOpen(false);
      if (error) {
        toast.error('Cancellation failed. Please try again or contact support.');
        return;
      }

      // Update local state and UI
      setOrder((prev) => ({ ...prev, status: 'cancelled', cancelled_at: new Date().toISOString() }));
      try {
        window.localStorage.setItem(`foodhub-order-${order.id}`, JSON.stringify({ ...order, status: 'cancelled' }));
      } catch {}

      toast.success('Your order has been cancelled.');
    } catch (err) {
      setCancelling(false);
      toast.error('Cancellation failed. Please try again or contact support.');
    }
  };

  const statusTone = useMemo(() => statusToneMap[normalizedStatus] ?? 'neutral', [normalizedStatus]);

  return (
    <div className="section-shell py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="glass-card p-6">
          <h1 className="text-4xl font-black">Track your order</h1>
          <p className="mt-3 text-gray-400">Enter the email used at checkout to track your latest order. Order ID is optional if you want a specific one.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Input value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="Enter order ID (optional)" />
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email used at checkout" type="email" />
            <Button onClick={trackOrder} disabled={loading}>{loading ? 'Tracking...' : 'Track Order'}</Button>
          </div>
          {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        </div>

        {orders.length ? (
          <div className="mx-auto max-w-2xl space-y-4">
            {orders.map((o) => (
              <div key={o.id} className={`glass-card p-6 ${o.id === order?.id ? 'ring-2 ring-orange-600' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Order</p>
                    <h2 className="mt-2 text-3xl font-black text-white">#{o.id}</h2>
                  </div>
                  <Badge tone={statusToneMap[String(o.status ?? 'pending').toLowerCase()] ?? 'neutral'}>{String(o.status ?? 'pending').replace(/_/g, ' ')}</Badge>
                </div>

                <div className="mt-6 space-y-4">
                  {(o.order_items ?? o.items ?? []).map((item) => {
                    const matchedProduct = allProducts.find(p => p.id === (item.product_id || item.id) || p.name === (item.product_name || item.name));
                    const itemImg = item.image_url ?? matchedProduct?.image_url ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80';
                    return (
                      <div key={`${item.product_id ?? item.id}-${item.product_name ?? item.name}`} className="flex items-center justify-between rounded-sm border border-[#222] bg-[#141414] p-3">
                        <div className="flex items-center gap-4">
                          <img src={itemImg} alt={item.product_name ?? item.name} className="w-14 h-14 rounded-sm object-cover border border-[#333]" />
                          <div>
                            <p className="font-black text-white">{item.product_name ?? item.name}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Qty {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-[#FF9900] font-black">{formatPesos(item.price)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" onClick={() => { setOrder(o); setDetailsModalOpen(true); }}>View details</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#141414] border border-[#222] rounded-sm overflow-hidden flex flex-col md:flex-row items-stretch">
             <div className="w-full md:w-1/2 h-48 md:h-auto border-b md:border-b-0 md:border-r border-[#222] relative">
                <img src="https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=1200&q=80" alt="Delivery Tracking" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent md:bg-gradient-to-l opacity-80"></div>
             </div>
             <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">Awaiting Instructions.</h3>
                <p className="text-gray-400 text-sm font-bold leading-relaxed">Enter your checkout email above to instantly access the real-time status and complete history of all your orders.</p>
             </div>
          </div>
        )}

        <ConfirmModal
          open={confirmOpen}
          title="Cancel this order?"
          body="Are you sure you want to cancel? This cannot be undone."
          danger
          confirmLabel={cancelling ? 'Cancelling...' : 'Yes, cancel my order'}
          cancelLabel="Keep my order"
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleCancelConfirm}
        />

        {/* Order Details Modal */}
        {detailsModalOpen && order && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-xl border border-[#333] bg-[#1a1a1a] p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <button 
                onClick={() => setDetailsModalOpen(false)} 
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
              
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Delivery details</p>
              <div className="mt-4 space-y-3 text-sm text-gray-300">
                <div className="flex justify-between"><span>Customer</span><span>{order.full_name ?? order.customer_name ?? 'Guest'}</span></div>
                <div className="flex justify-between"><span>Payment</span><span>{order.payment_method ?? 'Cash on delivery'}</span></div>
                <div className="flex justify-between"><span>Total</span><span className="font-bold text-[#FF9900]">{formatPesos(order.total_amount ?? order.total ?? 0)}</span></div>
                <div className="flex justify-between"><span>Address</span><span className="max-w-[14rem] text-right">{order.delivery_address ?? 'Pending'}</span></div>
                
                {String(order.status ?? '').toLowerCase() === 'cancelled' && (
                  <div className="mt-4 border-t border-[#333] pt-3 text-sm text-gray-500">
                    Cancelled on {new Date(order.cancelled_at ?? Date.now()).toLocaleString()}
                  </div>
                )}
                
                {String(order.status ?? '').toLowerCase() === 'pending' && (
                  <div className="mt-6 flex justify-end">
                    <Button type="button" variant="danger" onClick={() => setConfirmOpen(true)} disabled={cancelling}>{cancelling ? 'Cancelling...' : 'Cancel Order'}</Button>
                  </div>
                )}

                {/* Review Section for Delivered Orders */}
                {normalizedStatus === 'delivered' && (
                  <div className="mt-6 border-t border-[#333] pt-5">
                    {submittedReview ? (
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Your Review</p>
                        <div className="flex gap-1 text-[#FF9900] mb-3">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-5 h-5 ${i < submittedReview.rating ? 'fill-current' : 'text-gray-600'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          ))}
                        </div>
                        {submittedReview.comment && <p className="text-sm text-gray-300 italic bg-[#141414] p-3 rounded-sm border border-[#222]">"{submittedReview.comment}"</p>}
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Rate your order</p>
                        <div className="flex gap-1 mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => setRating(star)} className={`hover:scale-110 transition-transform ${star <= rating ? 'text-[#FF9900]' : 'text-gray-600'}`}>
                              <svg className="w-7 h-7 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            </button>
                          ))}
                        </div>
                        <textarea 
                          className="w-full bg-[#141414] border border-[#333] rounded-sm p-3 text-sm text-white focus:border-[#FF9900] outline-none resize-none mb-3" 
                          rows="3" 
                          placeholder="Leave a comment about the food or delivery..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <Button 
                          onClick={() => {
                            const rev = { rating, comment, date: new Date().toISOString() };
                            window.localStorage.setItem(`foodhub-review-${order.id}`, JSON.stringify(rev));
                            setSubmittedReview(rev);
                            toast.success('Thank you for your feedback!');
                          }}
                        >
                          Submit Feedback
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}