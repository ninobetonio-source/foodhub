import { useEffect, useMemo, useState } from 'react';
import { FiCheck, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import SectionHeading from '../components/SectionHeading';
import { deleteProduct, getCategories, getProductsForAdmin, saveProduct } from '../services/supabaseService';
import { formatPesos } from '../utils/currency';
import { products as fallbackProducts } from '../utils/mockData';

const initialForm = {
  id: '',
  name: '',
  slug: '',
  description: '',
  price: '',
  stock: '',
  category_id: '',
  image_url: '',
  badge: '',
  is_active: true,
  featured: false,
  trending: false,
  best_seller: false,
  healthy: false
};

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const editing = useMemo(() => Boolean(form.id), [form.id]);

  const loadData = async () => {
    const [{ data: productData, error: productError }, { data: categoryData, error: categoryError }] = await Promise.all([
      getProductsForAdmin(),
      getCategories()
    ]);

    if (productError) {
      toast.error(productError.message);
    } else {
      const remoteProducts = productData ?? [];
      const mergedProducts = [...remoteProducts, ...fallbackProducts].filter((item, index, list) => {
        const key = item.slug ?? item.id;
        return list.findIndex((entry) => (entry.slug ?? entry.id) === key) === index;
      });
      setProducts(mergedProducts);
    }

    if (categoryError) {
      toast.error(categoryError.message);
    } else {
      setCategories(categoryData ?? []);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: form.category_id || null
    };

    const { error } = await saveProduct(payload);
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(editing ? 'Product updated' : 'Product created');
    setForm(initialForm);
    setIsModalOpen(false);
    await loadData();
  };

  const handleEdit = (product) => {
    const isMock = String(product.id).startsWith('p');
    let category_id = product.category_id || '';
    
    if (isMock && product.category) {
       const foundCat = categories.find(c => c.name.toLowerCase() === product.category.toLowerCase());
       if (foundCat) {
          category_id = foundCat.id;
       }
    }

    setForm({
      ...initialForm,
      ...product,
      id: isMock ? '' : product.id,
      category_id,
      price: product.price,
      stock: product.stock
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (String(id).startsWith('p')) {
      toast.error('Cannot delete default menu items. Edit and set to inactive instead.');
      return;
    }
    const { error } = await deleteProduct(id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Product deleted');
    await loadData();
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading eyebrow="Admin" title="Manage products" description="Create, edit, or remove menu items with live stock and labels." />
        <Button onClick={() => { setForm(initialForm); setIsModalOpen(true); }}>Create New Product</Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-xl border border-[#333] bg-[#1a1a1a] shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#333] bg-[#1a1a1a] px-6 py-4">
              <h3 className="text-lg font-black text-white">{editing ? 'Edit Product' : 'Create Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid gap-4 p-6 lg:grid-cols-2">
              <Input value={form.name} onChange={(event) => onChange('name', event.target.value)} placeholder="Product name" required />
              <Input value={form.slug} onChange={(event) => onChange('slug', event.target.value)} placeholder="Slug (e.g. spicy-burger)" required />
              <Input value={form.price} onChange={(event) => onChange('price', event.target.value)} placeholder="Price" type="number" min="0" step="0.01" required />
              <Input value={form.stock} onChange={(event) => onChange('stock', event.target.value)} placeholder="Stock" type="number" min="0" required />
              <Input value={form.image_url} onChange={(event) => onChange('image_url', event.target.value)} placeholder="Image URL" required className="lg:col-span-2" />
              <Input value={form.badge} onChange={(event) => onChange('badge', event.target.value)} placeholder="Badge (optional)" />
              <select value={form.category_id} onChange={(event) => onChange('category_id', event.target.value)} className="rounded-2xl border border-gray-800 bg-gray-900/70 px-4 py-3 text-sm text-white focus:border-[#FF9900] outline-none">
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <Textarea value={form.description} onChange={(event) => onChange('description', event.target.value)} placeholder="Description" rows="3" className="lg:col-span-2" required />
              <div className="grid grid-cols-2 gap-3 lg:col-span-2 sm:grid-cols-3 xl:grid-cols-5">
                {[
                  ['is_active', 'Active'],
                  ['featured', 'Featured'],
                  ['trending', 'Trending'],
                  ['best_seller', 'Best seller'],
                  ['healthy', 'Healthy']
                ].map(([key, label]) => (
                  <label key={key} className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#333] bg-white/5 px-3 py-2 text-sm transition-colors hover:border-[#FF9900]">
                    <input type="checkbox" checked={Boolean(form[key])} onChange={(event) => onChange(key, event.target.checked)} className="accent-[#FF9900]" />
                    {label}
                  </label>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-3 lg:col-span-2 border-t border-[#333] pt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : editing ? 'Update product' : 'Create product'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass-card overflow-x-auto p-6">
        <table className="min-w-full text-left text-sm text-gray-200">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="px-2 py-3">Name</th>
              <th className="px-2 py-3">Price</th>
              <th className="px-2 py-3">Stock</th>
              <th className="px-2 py-3">Status</th>
              <th className="px-2 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-900/80">
                <td className="px-2 py-3 font-bold text-white">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-sm bg-[#333]">
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    {product.name}
                  </div>
                </td>
                <td className="px-2 py-3">{formatPesos(product.price)}</td>
                <td className="px-2 py-3">{product.stock}</td>
                <td className="px-2 py-3">
                  <div className="flex flex-col items-start gap-1.5">
                    {product.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-green-500">
                        <FiCheck size={10} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        <FiEyeOff size={10} /> Hidden
                      </span>
                    )}
                    
                    {product.stock === 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-500">
                        <FiAlertCircle size={10} /> Out of Stock
                      </span>
                    ) : product.stock <= 15 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-orange-400">
                        <FiAlertCircle size={10} /> Low Stock
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-2 py-3">
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" className="px-3 py-2 text-xs" onClick={() => handleEdit(product)}>Edit</Button>
                    <Button type="button" variant="ghost" className="px-3 py-2 text-xs" onClick={() => handleDelete(product.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}