import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import {
  FiMenu,
  FiX,
  FiSearch,
  FiUser,
  FiShoppingCart,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll Detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu/search on route change
  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [location]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setOpen(false);
    }
  };

  const isHome = location.pathname === "/";
  const headerStickyStyle = isScrolled || !isHome
    ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-3"
    : "bg-transparent py-5";

  const textStyle = isScrolled || !isHome ? "text-gray-900" : "text-white";
  const navTextStyle = isScrolled || !isHome ? "text-gray-700" : "text-white/90";

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${headerStickyStyle}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between relative h-10">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 group relative z-10 transition-transform hover:scale-105">
            <span className="text-2xl font-black text-pink-500 tracking-tighter">
              hills
            </span>
            <span className={`text-[10px] tracking-[0.3em] font-bold pt-1 uppercase transition-colors ${textStyle}`}>
              Shop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10 text-sm font-bold tracking-wide">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative transition-colors duration-300 hover:text-pink-500 group ${isActive ? "text-pink-500" : navTextStyle
                    }`}
                >
                  {item.name}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-pink-500 transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`} />
                </Link>
              );
            })}
          </nav>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center gap-6 text-xl relative z-10">
            <button
              onClick={() => setSearchOpen(true)}
              className={`hover:text-pink-500 transition-colors ${textStyle}`}
            >
              <FiSearch />
            </button>

            {user ? (
              <Link to="/profile" className={`flex items-center gap-2 p-1 rounded transition group ${textStyle}`}>
                <Icon><FiUser /></Icon>
              </Link>
            ) : (
              <Link to="/login" className={`hover:text-pink-500 transition-colors ${textStyle}`}>
                <Icon><FiUser /></Icon>
              </Link>
            )}

            <Link to="/cart" className={`relative transition-colors duration-300 ${textStyle} hover:text-pink-500`}>
              <Icon count={cartCount}>
                <FiShoppingCart />
              </Icon>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden text-2xl p-2 transition-all duration-300 active:scale-90 ${textStyle}`}
            onClick={() => setOpen(!open)}
          >
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      <div className={`absolute top-0 left-0 w-full bg-white shadow-xl border-b transition-all duration-500 origin-top overflow-hidden ${searchOpen ? "scale-y-100 opacity-100 h-24" : "scale-y-0 opacity-0 h-0"
        }`}>
        <div className="max-w-5xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <FiSearch className="text-gray-400 text-2xl" />
          <form onSubmit={handleSearch} className="flex-1">
            <input
              autoFocus={searchOpen}
              type="text"
              className="w-full bg-transparent border-none text-xl font-medium outline-none text-gray-900 placeholder:text-gray-300"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <button
            onClick={() => setSearchOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <FiX size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-x-0 bg-white shadow-2xl transition-all duration-500 border-t ${open ? "top-[70px] opacity-100 translate-y-0" : "-top-full opacity-0 -translate-y-10"
          }`}
      >
        <nav className="flex flex-col p-8 gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="text-2xl font-black text-gray-900 hover:text-pink-500 transition-colors flex justify-between items-center group"
              onClick={() => setOpen(false)}
            >
              {item.name}
              <span className="text-pink-500 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all font-light">&rarr;</span>
            </Link>
          ))}

          <div className="h-[1px] bg-gray-100 w-full" />

          <div className="flex gap-12 text-3xl justify-center py-4">
            <Link to="/login" onClick={() => setOpen(false)} className="text-gray-900 hover:text-pink-500 transition"><FiUser /></Link>
            <Link to="/cart" onClick={() => setOpen(false)} className="text-gray-900 hover:text-pink-500 transition relative">
              <FiShoppingCart />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

interface IconProps {
  children: ReactNode;
  count?: number;
}

function Icon({ children, count }: IconProps) {
  return (
    <span className="relative flex items-center justify-center transition-all duration-300">
      {children}
      {typeof count === "number" && count > 0 && (
        <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-sm font-black border-2 border-white/20">
          {count}
        </span>
      )}
    </span>
  );
}
