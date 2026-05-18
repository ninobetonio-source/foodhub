import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { products as fallbackProducts } from '../utils/mockData';

export default function Hero() {
  const items = useMemo(() => fallbackProducts.filter(p => p.image_url).slice(0, 5), []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    items.forEach((p) => {
      const img = new Image();
      img.src = p.image_url;
    });
  }, [items]);

  useEffect(() => {
    if (!items.length) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <div className="section-shell pt-6 pb-2">
      <div className="relative w-full overflow-hidden rounded-sm bg-[#141414] aspect-[16/9] sm:aspect-[21/9] lg:aspect-[28/9] border border-[#222] shadow-2xl">
        {items.map((product, i) => (
          <div
            key={product.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}
          >
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="h-full w-full object-cover"
            />
            {/* Gradient Overlay for Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            
            {/* Featured Info */}
            <div className="absolute bottom-0 left-0 p-5 sm:p-8 md:p-12 w-full md:w-3/4">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-[#FF9900] text-black text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wider">Featured</span>
                <span className="text-[#22c55e] text-xs font-bold">{product.rating * 20}% Rating</span>
              </div>
              <Link to={`/product/${product.slug}`} className="block">
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2 hover:text-[#FF9900] transition-colors line-clamp-1">{product.name}</h2>
              </Link>
              <p className="hidden sm:block text-sm md:text-base text-gray-300 line-clamp-2 mb-5 max-w-2xl">{product.description}</p>
              
              <Link to={`/product/${product.slug}`} className="inline-flex items-center justify-center bg-[#FF9900] text-black font-bold px-5 sm:px-8 py-2 sm:py-3 rounded-sm hover:bg-[#e68a00] transition-colors text-sm sm:text-base">
                Order Now
              </Link>
            </div>
          </div>
        ))}
        
        {/* Navigation Dots */}
        <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-8 z-30 flex gap-2">
          {items.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'bg-[#FF9900] w-8' : 'bg-white/40 w-2 hover:bg-white/80'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
