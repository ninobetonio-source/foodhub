import { createContext, useContext, useMemo, useState } from 'react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);
const STORAGE_KEY = 'foodhub-cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') return [];

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore persistence failures in constrained environments.
    }
  }, [items]);

  const addToCart = (product) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...current, { ...product, quantity: 1 }];
    });
    toast.success(
      <span className="font-bold text-sm">
        <span className="text-[#FF9900]">{product.name}</span> secured in your cart.
      </span>,
      {
        icon: '🛒',
        duration: 2500,
        style: {
          background: '#141414',
          border: '1px solid #333',
          color: '#fff',
        }
      }
    );
  };

  const updateQuantity = (id, quantity) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)));
  };

  const removeFromCart = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
    toast.success('Item removed from cart');
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  const value = useMemo(() => ({ items, addToCart, updateQuantity, removeFromCart, clearCart, subtotal, count: items.reduce((total, item) => total + item.quantity, 0) }), [items, subtotal]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);