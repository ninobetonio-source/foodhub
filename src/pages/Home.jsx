import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import ProductCard from '../components/ProductCard';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { categories as fallbackCategories, products as fallbackProducts } from '../utils/mockData';
import { getCategories, getProducts } from '../services/supabaseService';
import Hero from '../components/Hero';

const tags = ['Spicy', 'Vegan', 'Dessert', '100% Beef', 'Quick Prep', 'Top Rated', 'Local', 'Trending', 'Chicken', 'Seafood', 'Breakfast'];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState(fallbackProducts);
  const [categoryItems, setCategoryItems] = useState(fallbackCategories);

  useEffect(() => {
    let mounted = true;

    async function loadHomeData() {
      const [{ data: productData }, { data: categoryData }] = await Promise.all([
        getProducts({ featured: true, limit: 3 }),
        getCategories()
      ]);

      if (!mounted) return;
      if (productData?.length) setFeaturedProducts(productData);
      if (categoryData?.length) setCategoryItems(categoryData);
    }

    loadHomeData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="pt-2">
      <Hero />
      {/* Promo Banner */}
      <div className="section-shell">
        <Link to="/menu" className="block w-full rounded-sm bg-[#1a1a1a] border border-[#333] hover:border-[#FF9900] transition-colors p-4 text-center">
          <p className="text-sm font-bold text-gray-300">
            <span className="text-[#FF9900]">PREMIUM</span> delivery now available in your area. <span className="text-white underline decoration-gray-500 underline-offset-4 ml-2">Click here to order.</span>
          </p>
        </Link>
      </div>

      {/* Quick Tags Section */}
      <div className="section-shell pt-6 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tags.map((tag) => (
            <Link key={tag} to={`/menu?search=${tag}`} className="whitespace-nowrap rounded-sm bg-[#222] px-3 py-1.5 text-xs font-bold text-gray-300 hover:bg-[#333] hover:text-[#FF9900] transition-colors border border-[#333]">
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Recommended for You (Horizontal Scroll) */}
      <div className="section-shell pt-4 pb-2">
        <SectionHeading title="Recommended for You" />
        <div className="flex items-start gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {fallbackProducts.slice(0, 6).map((product) => (
            <div key={`rec-${product.id}`} className="min-w-[220px] md:min-w-[260px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      <div className="section-shell py-6">
        <SectionHeading title="Hot Foods" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
          {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>

      <div className="section-shell py-8">
        <SectionHeading title="Top Categories" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
          {categoryItems.map((category) => (
            <Link key={category.id} to={`/menu?category=${category.slug || category.id}`} className="group relative block overflow-hidden rounded-sm bg-[#222]">
              <div className="aspect-video w-full overflow-hidden">
                <img src={category.image_url} alt={category.name} className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-80" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2">
                <p className="text-sm font-bold text-white group-hover:text-[#FF9900]">{category.name}</p>
                <p className="text-[11px] font-bold text-gray-400">{category.description?.substring(0, 40)}{category.description?.length > 40 ? '...' : ''}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
