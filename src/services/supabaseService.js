import { supabase } from '../lib/supabase';

const productSelect = '*, categories(name, slug)';

export async function getProducts(filters = {}) {
  let query = supabase.from('products').select(productSelect).eq('is_active', true).order('created_at', { ascending: false });

  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  if (filters.featured) {
    query = query.eq('featured', true);
  }

  if (filters.trending) {
    query = query.eq('trending', true);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase.from('products').select(productSelect).eq('slug', slug).single();
  return { data, error };
}

export async function getCategories() {
  return supabase.from('categories').select('*').order('name');
}

export async function getCategoriesForAdmin() {
  return supabase
    .from('categories')
    .select('id, name, slug, description, image_url, created_at, updated_at')
    .order('created_at', { ascending: false });
}

export async function saveCategory(category) {
  if (category.id) {
    const { id, ...changes } = category;
    return supabase.from('categories').update(changes).eq('id', id).select('*').single();
  }

  return supabase.from('categories').insert(category).select('*').single();
}

export async function deleteCategory(categoryId) {
  return supabase.from('categories').delete().eq('id', categoryId);
}

export async function createOrder(orderPayload, items = []) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderPayload)
    .select()
    .single();

  if (orderError) {
    return { data: null, error: orderError };
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id ?? String(item.id ?? '').split('::')[0],
    product_name: item.name,
    price: item.price,
    quantity: item.quantity
  }));

  if (orderItems.length > 0) {
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      return { data: order, error: itemsError };
    }
  }

  return { data: order, error: null };
}

export async function upsertUserProfile(profile) {
  return supabase.from('users').upsert(profile).select().single();
}

export async function getOrderById(orderId) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, order_items(*), users(full_name, phone, role)')
    .eq('id', orderId)
    .single();

  if (orderError) {
    return { data: null, error: orderError };
  }

  return { data: order, error: null };
}

export async function trackOrderByEmail(email, orderId = null) {
  // First attempt direct query to get ALL orders for this email
  let directQuery = supabase.from('orders').select('*, order_items(*)').eq('email', email).order('created_at', { ascending: false });
  if (orderId) {
    directQuery = directQuery.eq('id', orderId);
  }
  
  const { data: directData, error: directError } = await directQuery;
  
  if (!directError && directData && directData.length > 0) {
    return { data: directData, error: null };
  }

  // Fallback to RPC if direct query fails (e.g. due to RLS) or returns empty
  const { data, error } = await supabase.rpc('track_order_by_email', {
    p_email: email,
    p_order_id: orderId || null
  });

  if (error) {
    return { data: null, error };
  }

  const matches = Array.isArray(data) ? data : (data ? [data] : []);
  
  if (matches.length === 0) {
    return { data: null, error: { message: 'Order not found for that email.' } };
  }

  return {
    data: matches.map(match => ({
      ...match,
      order_items: match.items ?? match.order_items ?? []
    })),
    error: null
  };
}

export async function getDashboardMetrics() {
  return supabase.from('dashboard_metrics').select('*').single();
}

export async function getOrdersForManagement() {
  return supabase
    .from('orders')
    .select('id, full_name, email, phone, delivery_address, delivery_location, preferred_delivery_time, payment_method, status, total_amount, created_at')
    .order('created_at', { ascending: false });
}

export async function getStaffUsers() {
  return supabase
    .from('users')
    .select('id, full_name, email, role, created_at, updated_at')
    .eq('role', 'staff')
    .order('created_at', { ascending: false });
}

export async function updateOrderStatus(orderId, status) {
  return supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select('id, status')
    .single();
}

export async function getProductsForAdmin() {
  return supabase
    .from('products')
    .select('id, name, slug, description, price, stock, is_active, featured, trending, best_seller, healthy, category_id, image_url, badge, created_at')
    .order('created_at', { ascending: false });
}

export async function saveProduct(product) {
  if (product.id) {
    const { id, ...changes } = product;
    return supabase.from('products').update(changes).eq('id', id).select('*').single();
  }

  return supabase.from('products').insert(product).select('*').single();
}

export async function deleteProduct(productId) {
  return supabase.from('products').delete().eq('id', productId);
}

export async function getUsersForAdmin() {
  return supabase
    .from('users')
    .select('id, email, full_name, phone, role, created_at, updated_at')
    .order('created_at', { ascending: false });
}

export async function updateUserRole(userId, role) {
  return supabase
    .from('users')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id, role')
    .single();
}

export async function createManagedUser({ email, password, fullName, phone, role, username }) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone: phone ?? ''
    }
  });

  if (error) {
    return { data: null, error };
  }

  const { error: profileError } = await supabase
    .from('users')
    .update({
      full_name: fullName,
      phone: phone ?? null,
      role,
      email,
      username: username ?? email.split('@')[0],
      updated_at: new Date().toISOString()
    })
    .eq('id', data.user.id);

  if (profileError) {
    return { data: null, error: profileError };
  }

  return { data: data.user, error: null };
}

export async function deleteManagedUser(userId) {
  const { error: profileError } = await supabase.from('users').delete().eq('id', userId);
  if (profileError) {
    return { error: profileError };
  }

  const { error } = await supabase.auth.admin.deleteUser(userId);
  return { error };
}

export async function getSalesRecords() {
  return supabase.from('sales').select('id, order_id, revenue, sold_at').order('sold_at', { ascending: false });
}

export async function saveSale(record) {
  if (record.id) {
    const { id, ...changes } = record;
    return supabase.from('sales').update(changes).eq('id', id).select('*').single();
  }

  return supabase.from('sales').insert(record).select('*').single();
}

export async function deleteSale(id) {
  return supabase.from('sales').delete().eq('id', id);
}