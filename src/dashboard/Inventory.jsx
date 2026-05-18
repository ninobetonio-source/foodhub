import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiCheck, FiAlertCircle, FiSave, FiPlus, FiMinus } from 'react-icons/fi';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import { getProductsForAdmin, getCategories, saveProduct } from '../services/supabaseService';
import { products as fallbackProducts } from '../utils/mockData';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Track changes made by the user before saving
  const [stockChanges, setStockChanges] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      getProductsForAdmin(),
      getCategories()
    ]);
    
    if (catRes.data) setCategories(catRes.data);

    const remoteProducts = prodRes.data || [];
    const mergedProducts = [...remoteProducts, ...fallbackProducts].filter((item, index, list) => {
      const key = item.slug ?? item.id;
      return list.findIndex((entry) => (entry.slug ?? entry.id) === key) === index;
    });

    setProducts(mergedProducts);
    setStockChanges({});
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleStockChange = (productId, newStock) => {
    const validStock = Math.max(0, parseInt(newStock) || 0);
    setStockChanges(prev => ({
      ...prev,
      [productId]: validStock
    }));
  };

  const saveChanges = async () => {
    const changedIds = Object.keys(stockChanges);
    if (changedIds.length === 0) return;
    
    setIsSaving(true);
    let errorCount = 0;
    
    for (const id of changedIds) {
      const product = products.find(p => String(p.id) === String(id));
      if (!product) continue;
      
      const newStock = stockChanges[id];
      const isMock = String(product.id).startsWith('p');
      
      // Explicitly extract valid columns to prevent Postgres schema errors
      const validKeys = ['name', 'slug', 'description', 'price', 'stock', 'is_active', 'featured', 'trending', 'best_seller', 'healthy', 'category_id', 'image_url', 'badge'];
      const payload = {};
      
      validKeys.forEach(key => {
         if (product[key] !== undefined) payload[key] = product[key];
      });
      payload.stock = newStock;
      
      if (!isMock) {
        payload.id = product.id;
      } else {
        if (product.category && !payload.category_id) {
           const foundCat = categories.find(c => c.name.toLowerCase() === product.category.toLowerCase());
           if (foundCat) payload.category_id = foundCat.id;
        }
      }
      
      const { error } = await saveProduct(payload);
      if (error) {
        console.error(error);
        errorCount++;
      }
    }
    
    setIsSaving(false);
    if (errorCount === 0) {
      toast.success('Inventory updated successfully!');
      loadData();
    } else {
      toast.error(`Completed with ${errorCount} errors. Check console.`);
      loadData();
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  const hasChanges = Object.keys(stockChanges).length > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionHeading eyebrow="Staff" title="Inventory Controls" />
          <p className="text-sm text-gray-400">Monitor and update product stock levels.</p>
        </div>
        <div className="flex items-center gap-4">
          {hasChanges && (
            <p className="text-sm font-bold text-[#FF9900] animate-pulse">Unsaved changes</p>
          )}
          <Button 
            onClick={saveChanges} 
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? 'Saving...' : (
              <>
                <FiSave size={16} /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-[#333] bg-[#1a1a1a] p-6 shadow-xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-sm border border-[#333] bg-[#222] py-2.5 pl-10 pr-4 text-sm font-bold text-white outline-none transition-colors focus:border-[#FF9900]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF9900] border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#222] text-xs font-black uppercase text-gray-400">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 w-48 text-center">Stock Level</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const currentStock = stockChanges[product.id] !== undefined ? stockChanges[product.id] : product.stock;
                  const isModified = stockChanges[product.id] !== undefined;
                  const isLow = currentStock <= 15 && currentStock > 0;
                  const isOut = currentStock === 0;

                  return (
                    <tr key={product.id} className={`border-b border-[#333] transition-colors hover:bg-[#222]/50 ${isModified ? 'bg-orange-950/20' : ''}`}>
                      <td className="px-4 py-4 font-bold text-white">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-sm bg-[#333]">
                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                          </div>
                          {product.name}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-1 text-[10px] font-black uppercase text-red-500">
                            <FiAlertCircle size={10} /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-2.5 py-1 text-[10px] font-black uppercase text-orange-400">
                            <FiAlertCircle size={10} /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2.5 py-1 text-[10px] font-black uppercase text-green-500">
                            <FiCheck size={10} /> In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleStockChange(product.id, currentStock - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#333] text-gray-300 transition-colors hover:bg-[#FF9900] hover:text-black"
                          >
                            <FiMinus size={14} />
                          </button>
                          <input
                            type="number"
                            value={currentStock}
                            onChange={(e) => handleStockChange(product.id, e.target.value)}
                            className={`w-16 rounded-sm border py-1.5 text-center text-sm font-bold outline-none transition-colors ${
                              isModified ? 'border-[#FF9900] bg-orange-500/10 text-[#FF9900]' : 'border-[#444] bg-[#222] text-white focus:border-gray-400'
                            }`}
                          />
                          <button
                            onClick={() => handleStockChange(product.id, currentStock + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#333] text-gray-300 transition-colors hover:bg-[#FF9900] hover:text-black"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredProducts.length === 0 && (
              <div className="py-12 text-center text-sm font-bold text-gray-500">
                No products found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}