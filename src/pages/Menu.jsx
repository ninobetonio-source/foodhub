import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import Input from '../components/Input';
import { products as fallbackProducts } from '../utils/mockData';
import Button from '../components/Button';
import { getProducts } from '../services/supabaseService';
import { formatPesos } from '../utils/currency';

const PAGE_SIZE = 6;

function getCategoryLabel(item) {
  return item?.category?.name ?? item?.category ?? 'Uncategorized';
}

export default function Menu() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState(fallbackProducts);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    if (searchParams.get('category')) {
      setActiveCategory(searchParams.get('category'));
    }
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      const { data } = await getProducts({ limit: 50 });
      if (!mounted) return;

      const remoteProducts = Array.isArray(data) ? data : [];
      const mergedProducts = [...remoteProducts, ...fallbackProducts].filter((item, index, list) => {
        const key = item.slug ?? item.id;
        return list.findIndex((entry) => (entry.slug ?? entry.id) === key) === index;
      });

      if (mergedProducts.length > 0) {
        setProducts(mergedProducts);
        setPage(1);
      } else {
        setProducts(fallbackProducts);
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return products
      .filter((item) => [item.name, item.description, getCategoryLabel(item)].join(' ').toLowerCase().includes(search.toLowerCase()))
      .filter((item) => activeCategory === 'all' || getCategoryLabel(item).toLowerCase() === activeCategory.toLowerCase())
      .sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        if (sort === 'rating') return b.rating - a.rating;
        return Number(b.featured) - Number(a.featured);
      });
  }, [activeCategory, search, sort, products]);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    return products.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, 4);
  }, [search, products]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const categories = useMemo(() => ['all', ...new Set(products.map((item) => getCategoryLabel(item)))], [products]);

  const navigate = useNavigate();

  return (
    <div className="section-shell py-12">
      <SectionHeading title="Menu" />

      <div className="mb-6 flex justify-end">
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded-sm border border-[#333] bg-[#222] px-4 py-2.5 text-sm font-bold text-white outline-none hover:border-[#FF9900] transition-colors cursor-pointer"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => {
          const active = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => {
                setActiveCategory(category);
                setPage(1);
              }}
              className={`whitespace-nowrap rounded-sm border px-3 py-1.5 text-xs font-bold transition-colors duration-200 ${active ? 'border-[#FF9900] bg-[#FF9900] text-black' : 'border-[#333] bg-[#222] text-gray-300 hover:text-[#FF9900]'}`}
            >
              {category === 'all' ? 'All' : category}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {paginated.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Button variant="secondary" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Previous</Button>
        <span className="text-sm text-[var(--fh-muted)]">Page {page} of {totalPages}</span>
        <Button variant="secondary" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>Next</Button>
      </div>
    </div>
  );
}
