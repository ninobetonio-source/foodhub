insert into public.categories (name, slug, description, image_url) values
  ('Burgers', 'burgers', 'Juicy handcrafted burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80'),
  ('Pizza', 'pizza', 'Premium stone-baked pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80'),
  ('Healthy Bowls', 'healthy-bowls', 'Fresh, light, and balanced meals', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80')
on conflict (slug) do nothing;

insert into public.products (category_id, name, slug, description, price, rating, image_url, badge, featured, trending, best_seller, healthy, stock, is_active)
select c.id, p.name, p.slug, p.description, p.price, p.rating, p.image_url, p.badge, p.featured, p.trending, p.best_seller, p.healthy, p.stock, true
from (values
  ('burgers', 'Truffle Smash Burger', 'truffle-smash-burger', 'Double patty, truffle aioli, caramelized onions, and sharp cheddar.', 18.50, 4.8, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80', 'HOT', true, true, true, false, 18),
  ('pizza', 'Neapolitan Margherita', 'neapolitan-margherita', 'Slow-fermented crust, basil, tomato, and fresh mozzarella.', 16.25, 4.7, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80', 'PREMIUM', true, false, true, false, 22),
  ('healthy-bowls', 'Protein Power Bowl', 'protein-power-bowl', 'Grilled chicken, quinoa, greens, avocado, and citrus dressing.', 14.90, 4.9, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80', 'HEALTHY', false, true, false, true, 11)
) as p(category_slug, name, slug, description, price, rating, image_url, badge, featured, trending, best_seller, healthy, stock)
join public.categories c on c.slug = p.category_slug
on conflict (slug) do nothing;