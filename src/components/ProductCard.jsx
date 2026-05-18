import { FiHeart, FiStar, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import Button from './Button';
import { formatPesos } from '../utils/currency';

export default function ProductCard({ product }) {
  const imageUrl = product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80';

  return (
    <article className="group bg-transparent">
      <Link to={`/product/${product.slug}`} className="block relative aspect-[16/9] w-full overflow-hidden bg-[#222]">
        <img src={imageUrl} alt={product.name} className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-80" />
        <div className="absolute bottom-1 right-1 rounded-sm bg-black/80 px-1.5 py-0.5 text-[11px] font-bold text-white">
          {formatPesos(product.price)}
        </div>
      </Link>

      <div className="mt-2 space-y-0.5">
        <Link to={`/product/${product.slug}`} className="line-clamp-1 text-sm font-bold text-[#d1d1d1] hover:text-[#FF9900]">
          {product.name}
        </Link>
        
        <div className="flex items-center justify-between text-[11.5px] font-bold text-[#777]">
          <div className="flex items-center gap-1">
            <span className="text-[#22c55e]">{product.rating * 20}%</span>
            <span>•</span>
            <span>{product.stock} items</span>
          </div>
          <span>{product.category?.name ?? product.category ?? 'Uncategorized'}</span>
        </div>
      </div>
    </article>
  );
}