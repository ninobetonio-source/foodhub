import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ConfirmModal from '../components/ConfirmModal';
import { products as fallbackProducts } from '../utils/mockData';
import { useCart } from '../context/CartContext';
import { getProductBySlug } from '../services/supabaseService';
import { formatPesos } from '../utils/currency';

export default function ProductDetails() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(fallbackProducts.find((item) => item.slug === slug) ?? fallbackProducts[0]);
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const navigate = useNavigate();

  const isDrink = String(product?.category ?? '').toLowerCase() === 'drinks';
  const sizeOptions = isDrink ? ['12 oz', '16 oz', '20 oz'] : ['Small', 'Medium', 'Large'];
  
  function getPriceForSize(prod, size) {
    if (!prod) return 0;
    // explicit per-size prices if provided on the product
    if (prod.size_prices && size && prod.size_prices[size]) return prod.size_prices[size];

    const base = Number(prod.price) || 0;
    // fallback multipliers
    const multipliers = isDrink
      ? { '12 oz': 1, '16 oz': 1.25, '20 oz': 1.5 }
      : { Small: 1, Medium: 1.25, Large: 1.5 };

    return Math.round(base * (multipliers[size] ?? 1) * 100) / 100;
  }

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      const { data } = await getProductBySlug(slug);
      if (mounted && data) {
        setProduct(data);
      }
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [slug]);

  // require explicit size selection: clear previous selection when product changes
  useEffect(() => {
    setSelectedSize('');
    setSizeError('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  return (
    <div className="section-shell py-12 relative">
      <button
        onClick={() => navigate(-1)}
        aria-label="Back"
        title="Back"
        className="absolute left-4 top-4 z-50 flex items-center gap-3 rounded-full px-4 sm:px-6 text-white font-bold bg-gradient-to-r from-orange-500 to-orange-600 shadow-xl hover:scale-105 transform-gpu transition-transform"
        style={{ height: 56 }}
      >
        <FiArrowLeft className="text-2xl" />
        <span className="hidden sm:inline text-lg">Back</span>
      </button>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <img id="product-main-image" src={product.image_url} alt={product.name} className="glass-card h-64 sm:h-80 md:h-[420px] lg:h-[520px] w-full object-cover" />
        <div>
          
          <div className="flex gap-2">
            {product.badge ? <Badge tone="orange">{product.badge}</Badge> : null}
            {product.featured ? <Badge tone="green">Featured</Badge> : null}
          </div>
          <h1 className="mt-4 text-4xl font-black text-white">{product.name}</h1>
          <p className="mt-4 text-lg text-gray-300">{product.description}</p>
          <p className="mt-6 text-3xl font-black text-orange-300">{selectedSize ? formatPesos(getPriceForSize(product, selectedSize)) : formatPesos(product.price)}</p>
            <div className="mt-6">
            <label className="text-sm font-medium text-[var(--fh-text)]">Size</label>
            <div className="mt-3 flex items-center gap-3">
              {sizeOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`rounded-2xl px-4 py-2 text-sm transition-colors duration-150 ${selectedSize === s ? 'bg-orange-500 text-white' : 'bg-[var(--fh-card)] text-[var(--fh-text)] border border-[var(--fh-border)]'}`}
                >
                  {s}
                </button>
              ))}
            </div>

            {sizeError ? <p className="text-sm text-[var(--fh-danger)] mt-3">{sizeError}</p> : null}

            

            <div className="mt-8 flex gap-4">
              <Button onClick={() => {
                if (!selectedSize) {
                  setSizeError('Please choose a size before adding to cart.');
                  return;
                }
                setSizeError('');
                setConfirmOpen(true);
              }}>Add to Cart</Button>
              <Button variant="secondary">Favorite</Button>
            </div>

            <ConfirmModal
              open={confirmOpen}
              title="Confirm selection"
              body={`Add ${product.name} — ${selectedSize} for ${formatPesos(getPriceForSize(product, selectedSize))} to your cart?`}
              confirmLabel={confirming ? 'Adding...' : 'Add to cart'}
              cancelLabel="Change size"
              extraAction={{ label: 'Back', onClick: () => { setConfirmOpen(false); navigate(-1); }, variant: 'secondary' }}
              onClose={() => setConfirmOpen(false)}
              onConfirm={async () => {
                setConfirming(true);
                const selectedPrice = getPriceForSize(product, selectedSize);
                  const cartProduct = {
                    ...product,
                    id: `${product.id}::${selectedSize}`,
                    product_id: product.id,
                    selectedSize,
                    name: `${product.name} (${selectedSize})`,
                    price: selectedPrice
                  };
                try {
                  addToCart(cartProduct);
                  
                  // Trigger Fly Animation
                  const cartIcon = document.getElementById('cart-icon');
                  const productImage = document.getElementById('product-main-image');
                  if (cartIcon && productImage) {
                    const cartRect = cartIcon.getBoundingClientRect();
                    const imgRect = productImage.getBoundingClientRect();
                    
                    const flyingImg = document.createElement('img');
                    flyingImg.src = product.image_url;
                    flyingImg.style.position = 'fixed';
                    flyingImg.style.zIndex = '9999';
                    flyingImg.style.width = `${imgRect.width}px`;
                    flyingImg.style.height = `${imgRect.height}px`;
                    flyingImg.style.top = `${imgRect.top}px`;
                    flyingImg.style.left = `${imgRect.left}px`;
                    flyingImg.style.objectFit = 'cover';
                    flyingImg.style.borderRadius = '8px';
                    flyingImg.style.pointerEvents = 'none';
                    flyingImg.style.transition = 'all 0.7s cubic-bezier(0.25, 1, 0.5, 1)';
                    
                    document.body.appendChild(flyingImg);
                    
                    // Force reflow
                    flyingImg.getBoundingClientRect();
                    
                    flyingImg.style.top = `${cartRect.top}px`;
                    flyingImg.style.left = `${cartRect.left}px`;
                    flyingImg.style.width = '24px';
                    flyingImg.style.height = '24px';
                    flyingImg.style.opacity = '0.3';
                    flyingImg.style.borderRadius = '50%';
                    
                    setTimeout(() => {
                      flyingImg.remove();
                      cartIcon.style.transform = 'scale(1.4)';
                      cartIcon.style.transition = 'transform 0.2s ease-out';
                      setTimeout(() => {
                        cartIcon.style.transform = 'scale(1)';
                      }, 200);
                    }, 700);
                  }
                  
                } finally {
                  setConfirming(false);
                  setConfirmOpen(false);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
