import { Link } from 'react-router-dom';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';
import { formatPesos } from '../utils/currency';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();

  if (!items.length) {
    return <div className="section-shell py-12"><EmptyState title="Your cart is empty" description="Add premium dishes and checkout in a few steps." actionLabel="Browse Menu" onAction={() => window.location.assign('/menu')} /></div>;
  }

  return (
    <div className="section-shell py-12">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <img src={item.image_url} alt={item.name} className="h-24 w-24 rounded-2xl object-cover" />
              <div className="flex-1">
                <h3 className="text-xl font-bold">{item.name}</h3>
                <p className="text-sm text-gray-400">{formatPesos(item.price)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="rounded-xl bg-white/10 px-3 py-2">-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="rounded-xl bg-white/10 px-3 py-2">+</button>
              </div>
              <Button variant="ghost" onClick={() => removeFromCart(item.id)}>Remove</Button>
            </div>
          ))}
        </div>
        <div className="glass-card h-fit p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Order Summary</p>
          <div className="mt-4 space-y-3 text-sm text-gray-300">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPesos(subtotal)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>Calculated at checkout</span></div>
          </div>
          <Link to="/checkout"><Button className="mt-6 w-full">Checkout</Button></Link>
        </div>
      </div>
    </div>
  );
}