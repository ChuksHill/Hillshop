import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import {
  FiMenu,
  FiX,
  FiSearch,
  FiUser,
  FiShoppingCart,
  FiChevronDown,
  FiLogOut,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu/search on route change
  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [location]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
  ];

  if (isAdmin) {
    navItems.push({ name: "Admin", path: "/admin" });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setOpen(false);
    }
  };

  // Always show solid background for reliability
  const headerStickyStyle = "bg-white shadow-md border-b border-gray-100 py-3";

  // Use dark text always since background is always white
  const textStyle = "text-gray-900";
  const navTextStyle = "text-gray-700";

  return (
    <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${headerStickyStyle}`}>
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
          <nav className="hidden lg:flex items-center gap-10 text-sm font-bold tracking-wide">
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

          {/* Navigation/Actions Icons */}
          <div className="flex items-center gap-4 lg:gap-6 text-xl relative z-10">
            {/* Search - Keep desktop only in navbar, mobile has it in menu or we can add it here too */}
            <button
              onClick={() => setSearchOpen(true)}
              className={`hidden lg:block hover:text-pink-500 transition-colors ${textStyle}`}
            >
              <FiSearch />
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-1 py-1 rounded-full transition-all hover:bg-pink-50 ${textStyle}`}
                >
                  <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-black">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <FiChevronDown className="hidden lg:block text-sm" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 truncate mt-1">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-pink-600 font-bold"
                      >
                        <FiUser /> Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                    >
                      <FiUser /> My Account
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setUserMenuOpen(false);
                        navigate("/");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-red-600 font-medium"
                    >
                      <FiLogOut /> Sign Out
                    </button>
                  </div>
                )}
              </div>
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

            {/* Mobile Menu Button - Moved inside the same flex container for better alignment */}
            <button
              className={`lg:hidden text-2xl p-2 transition-all duration-300 active:scale-90 relative z-[70] ${textStyle}`}
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <div className={`absolute top-0 left-0 w-full bg-white shadow-xl border-b transition-all duration-500 origin-top overflow-hidden z-40 ${searchOpen
        ? "scale-y-100 opacity-100 h-24 pointer-events-auto"
        : "scale-y-0 opacity-0 h-0 pointer-events-none"
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
        className={`lg:hidden fixed inset-x-0 bg-white/98 backdrop-blur-xl transition-all duration-500 border-t z-50 overflow-y-auto ${open
          ? "top-[64px] bottom-0 opacity-100 translate-y-0 pointer-events-auto"
          : "-top-full opacity-0 -translate-y-10 pointer-events-none"
          }`}
      >
        <div className="p-6 space-y-8">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-pink-500 transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isSpecial = item.name === "Admin" || item.name === "Shop";

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all ${isActive
                    ? "bg-pink-50 text-pink-600"
                    : isSpecial
                      ? "bg-gray-50 text-gray-900 border border-gray-100"
                      : "text-gray-600 hover:bg-gray-50"
                    }`}
                  onClick={() => setOpen(false)}
                >
                  <span className="text-xl font-black tracking-tight">{item.name}</span>
                  <span className={`transition-transform duration-300 ${isActive ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}>&rarr;</span>
                </Link>
              );
            })}
          </nav>

          <div className="h-[1px] bg-gray-100 w-full" />

          {/* Quick Actions Footer */}
          {/* Removed Sign In and Cart from mobile menu footer as they are now always visible in the main navbar */}
          {/*
          <div className="grid grid-cols-2 gap-4">
            {user ? (
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-3 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm shadow-lg shadow-gray-200"
              >
                <FiUser size={18} /> Account
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-3 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm shadow-lg shadow-gray-200"
              >
                <FiUser size={18} /> Sign In
              </Link>
            )}
            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-3 py-4 bg-pink-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-pink-100 relative"
            >
              <FiShoppingCart size={18} /> Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-pink-500 text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
          */}

          {user && (
            <button
              onClick={() => {
                signOut();
                setOpen(false);
                navigate("/");
              }}
              className="w-full py-4 text-red-500 font-bold text-sm bg-red-50 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <FiLogOut /> Sign Out
            </button>
          )}
        </div>
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
