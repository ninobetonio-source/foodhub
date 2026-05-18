import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiMail, FiArrowRight } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-[#0a0a0a]">
      {/* Decorative background glow */}
      <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[120px]"></div>

      <div className="section-shell relative z-10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 xl:gap-24">
          
          {/* Brand & Description */}
          <div className="flex flex-col md:col-span-2 lg:col-span-1">
            <Link to="/" className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF9900] to-amber-400 shadow-[0_0_20px_rgba(255,153,0,0.3)]">
                <span className="text-xl font-black text-black">F</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Food<span className="text-[#FF9900]">Hub</span>
              </span>
            </Link>
            <p className="mb-8 max-w-sm text-sm leading-relaxed text-gray-400">
              Premium food ordering and operations platform. Built for mobile-first commerce, delivering exceptional experiences from kitchen to customer.
            </p>
            <div className="flex gap-4 text-gray-400">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-[#FF9900] hover:text-black">
                <FiInstagram size={18} />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-[#FF9900] hover:text-black">
                <FiTwitter size={18} />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-[#FF9900] hover:text-black">
                <FiFacebook size={18} />
              </a>
            </div>
          </div>

          {/* Links Section 1 */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">Explore</h3>
            <ul className="flex flex-col gap-4 text-sm font-medium text-gray-400">
              <li><Link to="/menu" className="transition-colors hover:text-[#FF9900]">Menu</Link></li>
              <li><Link to="/categories" className="transition-colors hover:text-[#FF9900]">Categories</Link></li>
              <li><Link to="/track-order" className="transition-colors hover:text-[#FF9900]">Track Order</Link></li>
              <li><Link to="/about" className="transition-colors hover:text-[#FF9900]">About Us</Link></li>
            </ul>
          </div>

          {/* Links Section 2 */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">Account</h3>
            <ul className="flex flex-col gap-4 text-sm font-medium text-gray-400">
              <li><Link to="/login" className="transition-colors hover:text-[#FF9900]">Login</Link></li>
              <li><Link to="/register" className="transition-colors hover:text-[#FF9900]">Register</Link></li>
              <li><Link to="/orders" className="transition-colors hover:text-[#FF9900]">Order History</Link></li>
              <li><Link to="/profile" className="transition-colors hover:text-[#FF9900]">Profile Settings</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">Stay Updated</h3>
            <p className="mb-4 text-sm text-gray-400">Subscribe to our newsletter for the latest menu updates and exclusive offers.</p>
            <form className="relative flex items-center" onSubmit={(e) => e.preventDefault()}>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                <FiMail size={16} />
              </div>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-12 text-sm text-white placeholder-gray-500 focus:border-[#FF9900] focus:outline-none focus:ring-1 focus:ring-[#FF9900]"
              />
              <button type="submit" className="absolute inset-y-1.5 right-1.5 flex w-9 items-center justify-center rounded-lg bg-[#FF9900] text-black transition-colors hover:bg-orange-500">
                <FiArrowRight size={16} />
              </button>
            </form>
          </div>

        </div>
      </div>
      
      {/* Copyright Bar */}
      <div className="border-t border-white/10 bg-black/40">
        <div className="section-shell flex flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-gray-500 md:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} FoodHub Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
            <a href="#" className="hover:text-gray-300">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}