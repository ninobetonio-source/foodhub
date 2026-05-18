import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { formatPesos } from '../utils/currency';

function pad(value) {
  return String(value).padStart(2, '0');
}

function getLocalTodayString(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getCurrentTimeString(date = new Date()) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getCurrentMinute() {
  const now = new Date();
  now.setSeconds(0, 0);
  return now;
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [dateMin, setDateMin] = useState('');
  const [timeMin, setTimeMin] = useState('00:00');
  const [timeError, setTimeError] = useState('');
  const intervalRef = useRef(null);

  const itemCount = items.reduce((total, item) => total + (item.quantity ?? 1), 0);
  const deliveryFee = subtotal > 0 ? 49 : 0;
  const serviceFee = subtotal > 0 ? Math.round(subtotal * 0.03) : 0;
  const orderTotal = subtotal + deliveryFee + serviceFee;
  const isScheduleInvalid = Boolean(timeError);

  useEffect(() => {
    function refreshScheduleBounds() {
      const today = getLocalTodayString(new Date());
      const currentTime = getCurrentTimeString(getCurrentMinute());

      setDateMin(today);
      setTimeMin(currentTime);

      setSelectedDate((currentDate) => currentDate || today);

      setSelectedTime((currentTimeValue) => {
        const activeDate = selectedDate || today;
        if (activeDate !== today) return currentTimeValue || currentTime;
        if (!currentTimeValue) return currentTime;
        if (currentTimeValue < currentTime) {
          setTimeError('This time is no longer available. Please select a new time.');
          return '';
        }
        return currentTimeValue;
      });
    }

    refreshScheduleBounds();
    intervalRef.current = setInterval(refreshScheduleBounds, 60000);
    return () => clearInterval(intervalRef.current);
  }, [selectedDate]);

  const submitOrder = async (event) => {
    event.preventDefault();

    if (!items.length) {
      toast.error('Your cart is empty.');
      return;
    }

    setLoading(true);
    const form = new FormData(event.currentTarget);
    const dateInput = form.get('preferred_delivery_date') || selectedDate;
    const timeInput = form.get('preferred_delivery_time') || selectedTime;

    // Validate preferred delivery datetime against current time (prevents selecting past times)
    if (dateInput && timeInput) {
      const preferred = new Date(`${dateInput}T${timeInput}:00`);
      const now = getCurrentMinute();
      if (preferred < now) {
        setTimeError('The selected time has already passed. Please choose a new time.');
        setLoading(false);
        return;
      }
    }

    const payload = {
      user_id: user?.id ?? null,
      full_name: form.get('full_name'),
      email: form.get('email'),
      phone: form.get('phone'),
      delivery_address: form.get('delivery_address'),
      delivery_location: form.get('delivery_location'),
      preferred_delivery_time: dateInput && timeInput ? new Date(`${dateInput}T${timeInput}:00`).toISOString() : null,
      notes: form.get('notes'),
      payment_method: form.get('payment_method'),
      total_amount: orderTotal
    };

    const { data, error } = await createOrder(payload, items);
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    const orderSnapshot = {
      id: data.id,
      status: data.status ?? 'pending',
      total_amount: orderTotal,
      created_at: data.created_at ?? new Date().toISOString(),
      customer_name: payload.full_name,
      email: payload.email,
      items,
      delivery_address: payload.delivery_address,
      delivery_location: payload.delivery_location,
      preferred_delivery_time: payload.preferred_delivery_time,
      payment_method: payload.payment_method
    };

    try {
      window.localStorage.setItem(`foodhub-order-${data.id}`, JSON.stringify(orderSnapshot));
      window.localStorage.setItem('foodhub-latest-order', JSON.stringify(orderSnapshot));
    } catch {
      // Non-blocking fallback when localStorage is unavailable.
    }

    clearCart();
    toast.success('Order placed successfully');
    navigate(`/track-order/${data.id}`, { replace: true });
  };

  return (
    <div className="section-shell py-12">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
        <form onSubmit={submitOrder} className="grid gap-6">
          <section className="glass-card grid gap-4 p-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--fh-muted)]">Checkout details</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--fh-text)]">Complete your order</h1>
              <p className="mt-2 text-sm text-[var(--fh-muted)]">Secure your delivery time and place the order in one smooth step.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input name="full_name" placeholder="Full name" required className="bg-[var(--fh-card)] border-[var(--fh-border)] text-[var(--fh-text)] placeholder:text-[var(--fh-muted)] focus:border-[var(--fh-accent)]" />
              <Input name="email" type="email" placeholder="Email" required className="bg-[var(--fh-card)] border-[var(--fh-border)] text-[var(--fh-text)] placeholder:text-[var(--fh-muted)] focus:border-[var(--fh-accent)]" />
              <Input name="phone" placeholder="Phone number" required className="bg-[var(--fh-card)] border-[var(--fh-border)] text-[var(--fh-text)] placeholder:text-[var(--fh-muted)] focus:border-[var(--fh-accent)]" />
              <Input name="delivery_address" placeholder="Delivery address" required className="bg-[var(--fh-card)] border-[var(--fh-border)] text-[var(--fh-text)] placeholder:text-[var(--fh-muted)] focus:border-[var(--fh-accent)]" />
            </div>

            <Input name="delivery_location" placeholder="Location details (landmark, map pin, notes)" className="bg-[var(--fh-card)] border-[var(--fh-border)] text-[var(--fh-text)] placeholder:text-[var(--fh-muted)] focus:border-[var(--fh-accent)]" />
          </section>

          <section className={`glass-card grid gap-5 p-6 ${isScheduleInvalid ? 'border-[var(--fh-danger)]' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--fh-muted)]">Delivery schedule</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--fh-text)]">Choose date and time</h2>
              </div>
              <div className="rounded-full border border-[var(--fh-border)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--fh-muted)]">
                Scheduled
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[var(--fh-text)]">Preferred delivery date</label>
                <input
                  name="preferred_delivery_date"
                  type="date"
                  value={selectedDate}
                  min={dateMin}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setTimeError('');
                  }}
                  className={`rounded-2xl border bg-[var(--fh-card)] px-4 py-3 text-[var(--fh-text)] transition-colors duration-200 ${isScheduleInvalid ? 'border-[var(--fh-danger)] focus:border-[var(--fh-danger)]' : 'border-[var(--fh-border)] focus:border-[var(--fh-accent)]'}`}
                />
                <p className="text-sm text-[var(--fh-muted)]">Minimum date is today.</p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[var(--fh-text)]">Preferred delivery time</label>
                <input
                  type="time"
                  name="preferred_delivery_time"
                  value={selectedTime}
                  min={selectedDate === dateMin ? timeMin : '00:00'}
                  step="60"
                  onChange={(e) => {
                    setSelectedTime(e.target.value);
                    setTimeError('');
                  }}
                  className={`rounded-2xl border bg-[var(--fh-card)] px-4 py-3 text-[var(--fh-text)] transition-colors duration-200 ${isScheduleInvalid ? 'border-[var(--fh-danger)] focus:border-[var(--fh-danger)]' : 'border-[var(--fh-border)] focus:border-[var(--fh-accent)]'}`}
                />
                <p className="text-sm text-[var(--fh-muted)]">For today, pick the current minute or later. Future dates allow any time.</p>
                {timeError ? <p className="text-sm font-medium text-[var(--fh-danger)]">{timeError}</p> : null}
              </div>
            </div>
          </section>

          <section className="glass-card grid gap-4 p-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--fh-muted)]">Optional note</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--fh-text)]">Add delivery instructions</h2>
            </div>
            <Textarea name="notes" placeholder="Order notes" rows="4" className="bg-[var(--fh-card)] border-[var(--fh-border)] text-[var(--fh-text)] placeholder:text-[var(--fh-muted)] focus:border-[var(--fh-accent)]" />
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[var(--fh-text)]">Payment method</label>
              <select name="payment_method" className="rounded-2xl border border-[var(--fh-border)] bg-[var(--fh-card)] px-4 py-3 text-[var(--fh-text)]">
                <option>Cash on delivery</option>
                <option>Card</option>
                <option>Wallet</option>
              </select>
            </div>
          </section>

          <Button disabled={loading} className="w-full md:w-auto">{loading ? 'Processing...' : 'Place Order'}</Button>
        </form>

        <aside className="lg:sticky lg:top-24">
          <div className="glass-card overflow-hidden border border-[var(--fh-border)] p-0">
            <div className="border-b border-[var(--fh-border)] bg-[var(--fh-elevated)] px-6 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--fh-muted)]">Order summary</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-extrabold tracking-tight text-[var(--fh-text)]">{formatPesos(orderTotal)}</p>
                  <p className="mt-1 text-sm text-[var(--fh-muted)]">{itemCount} items • {formatPesos(subtotal)} subtotal</p>
                </div>
                <div className="rounded-full border border-[var(--fh-border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fh-muted)]">Secure</div>
              </div>
            </div>

            <div className="divide-y divide-[var(--fh-border)] px-6">
              <div className="py-4">
                <div className="flex items-center justify-between text-sm text-[var(--fh-muted)]">
                  <span>Subtotal</span>
                  <span className="text-[var(--fh-text)]">{formatPesos(subtotal)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-[var(--fh-muted)]">
                  <span>Delivery fee</span>
                  <span className="text-[var(--fh-text)]">{formatPesos(deliveryFee)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-[var(--fh-muted)]">
                  <span>Service fee</span>
                  <span className="text-[var(--fh-text)]">{formatPesos(serviceFee)}</span>
                </div>
              </div>

              <div className="py-4">
                <div className="flex items-center justify-between text-sm text-[var(--fh-muted)]">
                  <span>Estimated time</span>
                  <span className="font-medium text-[var(--fh-text)]">35–45 mins</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-[var(--fh-muted)]">
                  <span>Delivery type</span>
                  <span className="font-medium text-[var(--fh-text)]">Scheduled delivery</span>
                </div>
              </div>

              <div className="py-4">
                <p className="text-sm font-medium text-[var(--fh-text)]">Items</p>
                <div className="mt-4 space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[var(--fh-text)]">{item.name}</p>
                        <p className="text-xs text-[var(--fh-muted)]">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm text-[var(--fh-text)]">{formatPesos(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--fh-border)] px-6 py-4">
              <p className="text-sm text-[var(--fh-muted)]">By placing this order, you agree to the checkout policy and scheduled delivery timing.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
