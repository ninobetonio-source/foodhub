import { useEffect, useState, useMemo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiShoppingCart, FiUser, FiX } from 'react-icons/fi';
import Button from './Button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { products as fallbackProducts } from '../utils/mockData';
import { formatPesos } from '../utils/currency';

const navItems = [
  ['Home', '/'],
  ['Menu', '/menu'],
  ['Track Order', '/track-order'],
  ['About', '/about']
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { count } = useCart();
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return fallbackProducts
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-50">
      {/* Top Black Bar */}
      <div className="flex h-16 items-center justify-between border-b border-[#222] bg-black px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <button onClick={() => setOpen((v) => !v)} className="text-gray-400 hover:text-white lg:hidden">
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          
          <Link to="/" className="flex items-center">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Food<span className="ml-[1px] rounded-sm bg-[#FF9900] px-1.5 py-0.5 text-black">Hub</span>
            </div>
          </Link>
        </div>

        <div className="hidden max-w-2xl flex-1 mx-6 lg:flex">
          <form onSubmit={handleSearch} className="relative flex w-full items-center">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food, categories..." 
              className="w-full rounded-l-sm bg-[#222] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none" 
            />
            <button type="submit" className="rounded-r-sm bg-[#FF9900] px-4 py-2.5 text-black hover:bg-[#e68a00]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 font-bold" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
            {suggestions.length > 0 && (
              <div className="absolute left-0 top-full mt-1 w-full overflow-hidden rounded-sm border border-[#333] bg-[#1a1a1a] shadow-2xl z-50">
                {suggestions.map((item) => (
                  <button 
                    key={item.id} 
                    type="button" 
                    onClick={() => {
                      navigate(`/menu?search=${encodeURIComponent(item.name)}`);
                      setSearchQuery('');
                    }} 
                    className="flex w-full items-center gap-3 border-b border-[#222] p-2 hover:bg-[#333] transition-colors last:border-0"
                  >
                    <img src={item.image_url} alt={item.name} className="h-10 w-16 rounded-sm object-cover" />
                    <div className="flex flex-col text-left">
                      <span className="line-clamp-1 text-sm font-bold text-white group-hover:text-[#FF9900]">{item.name}</span>
                      <span className="text-[11px] font-bold text-gray-400">{formatPesos(item.price)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/cart" id="cart-icon" className="relative flex items-center text-gray-400 hover:text-[#FF9900]">
            <FiShoppingCart size={20} />
            {count > 0 ? <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF9900] text-[9px] font-bold text-black">{count}</span> : null}
          </Link>
          
          {isAuthenticated ? (
            role === 'admin' || role === 'staff' ? (
              <Link to={role === 'admin' ? '/dashboard/admin' : '/dashboard/staff'} className="hidden sm:block rounded-md bg-[#FF9900]/10 px-4 py-2 text-sm font-bold text-[#FF9900] transition-colors hover:bg-[#FF9900]/20">Dashboard</Link>
            ) : (
              <Link to="/profile" className="text-sm font-bold text-gray-400 hover:text-white">Profile</Link>
            )
          ) : (
            <>
              <Link to="/login" className="hidden sm:block text-sm font-bold text-gray-400 hover:text-white">Log in</Link>
              <Link to="/register" className="hidden sm:block text-sm font-bold text-gray-400 hover:text-white">Sign up</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search Bar (Below Logo) */}
      <div className="lg:hidden border-b border-[#222] bg-[#141414] px-4 py-3">
        <form onSubmit={handleSearch} className="relative flex w-full items-center">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search food, categories..." 
            className="w-full rounded-l-sm bg-[#222] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none" 
          />
          <button type="submit" className="rounded-r-sm bg-[#FF9900] px-4 py-2.5 text-black hover:bg-[#e68a00]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 font-bold" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>
          {suggestions.length > 0 && (
            <div className="absolute left-0 top-full mt-1 w-full overflow-hidden rounded-sm border border-[#333] bg-[#1a1a1a] shadow-2xl z-50">
              {suggestions.map((item) => (
                <button 
                  key={item.id} 
                  type="button" 
                  onClick={() => {
                    navigate(`/menu?search=${encodeURIComponent(item.name)}`);
                    setSearchQuery('');
                  }} 
                  className="flex w-full items-center gap-3 border-b border-[#222] p-2 hover:bg-[#333] transition-colors last:border-0"
                >
                  <img src={item.image_url} alt={item.name} className="h-10 w-16 rounded-sm object-cover" />
                  <div className="flex flex-col text-left">
                    <span className="line-clamp-1 text-sm font-bold text-white group-hover:text-[#FF9900]">{item.name}</span>
                    <span className="text-[11px] font-bold text-gray-400">{formatPesos(item.price)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Sub Nav Bar */}
      <div className="hidden lg:flex h-14 items-center border-b border-[#222] bg-[#141414] px-4 sm:px-6 lg:px-8">
        <nav className="flex h-full items-center gap-8">
          {navItems.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `flex h-full items-center text-base font-bold whitespace-nowrap border-b-[3px] transition-colors duration-150 ${isActive ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile Menu */}
      {open ? (
        <div className="absolute inset-x-0 top-full z-40 bg-[#141414] border-b border-[#222] lg:hidden p-4">
          <nav className="flex flex-col gap-4">
            {navItems.map(([label, path]) => (
              <NavLink key={path} to={path} onClick={() => setOpen(false)} className="text-lg font-bold text-gray-300 hover:text-white">{label}</NavLink>
            ))}
            {!isAuthenticated ? (
              <div className="mt-4 flex flex-col gap-2 border-t border-[#333] pt-4">
                <Link to="/login" onClick={() => setOpen(false)} className="text-lg font-bold text-gray-300 hover:text-white">Log in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="text-lg font-bold text-gray-300 hover:text-white">Sign up</Link>
              </div>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}