import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import {
  deleteCategory,
  getCategoriesForAdmin,
  getProductsForAdmin,
  saveCategory
} from '../services/supabaseService';

const emptyForm = {
  id: '',
  name: '',
  slug: '',
  description: '',
  image_url: ''
};

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const [{ data: categoryData, error: categoryError }, { data: productData, error: productError }] = await Promise.all([
      getCategoriesForAdmin(),
      getProductsForAdmin()
    ]);

    if (categoryError) {
      toast.error(categoryError.message);
    } else {
      setCategories(categoryData ?? []);
    }

    if (productError) {
      toast.error(productError.message);
    } else {
      setProducts(productData ?? []);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categoryStats = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      productCount: products.filter((product) => product.category_id === category.id).length
    }));
  }, [categories, products]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      slug: String(form.slug).trim().toLowerCase().replace(/\s+/g, '-')
    };

    const { error } = await saveCategory(payload);
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(form.id ? 'Category updated' : 'Category created');
    setForm(emptyForm);
    await loadData();
  };

  const handleEdit = (category) => {
    setForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      image_url: category.image_url ?? ''
    });
  };

  const handleDelete = async (id) => {
    const { error } = await deleteCategory(id);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Category deleted');
    await loadData();
  };

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Admin" title="Manage categories" description="Create, edit, and remove menu categories with live product counts." />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <form onSubmit={handleSubmit} className="glass-card grid gap-4 p-6">
          <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Category name" required />
          <Input value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} placeholder="Slug (e.g. burgers)" required />
          <Input value={form.image_url} onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))} placeholder="Image URL" />
          <Textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" rows="4" />
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : form.id ? 'Update category' : 'Create category'}</Button>
            <Button type="button" variant="ghost" onClick={() => setForm(emptyForm)}>Clear</Button>
          </div>
        </form>

        <div className="glass-card overflow-x-auto p-6">
          <table className="min-w-full text-left text-sm text-gray-200">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="px-2 py-3">Category</th>
                <th className="px-2 py-3">Products</th>
                <th className="px-2 py-3">Created</th>
                <th className="px-2 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map((category) => (
                <tr key={category.id} className="border-b border-gray-900/80">
                  <td className="px-2 py-3">
                    <p className="font-semibold text-white">{category.name}</p>
                    <p className="text-xs text-gray-400">/{category.slug}</p>
                  </td>
                  <td className="px-2 py-3">{category.productCount}</td>
                  <td className="px-2 py-3">{new Date(category.created_at).toLocaleDateString()}</td>
                  <td className="px-2 py-3">
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" className="px-3 py-2 text-xs" onClick={() => handleEdit(category)}>Edit</Button>
                      <Button type="button" variant="ghost" className="px-3 py-2 text-xs" onClick={() => handleDelete(category.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}