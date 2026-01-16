import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import {
  FiMenu,
  FiX,
  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingCart,
  // FiLogOut
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Cart", path: "/cart" }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setOpen(false);
    }
  };

  return (
    <header className="w-full bg-white border-b fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1">
            <span className="text-2xl font-bold text-pink-500 tracking-tight">
              hills
            </span>
            <span className="text-xs tracking-[0.25em] font-medium">
              Shop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="relative hover:text-pink-500 transition"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center gap-5 text-xl">
            {/* Search Toggle */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg border rounded-full overflow-hidden flex items-center w-64">
                  <input
                    autoFocus
                    type="text"
                    className="w-full px-4 py-1 text-sm outline-none"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => !searchQuery && setSearchOpen(false)}
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} className="px-3 text-gray-400 hover:text-gray-600">
                    <FiX size={14} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)}>
                  <Icon>
                    <FiSearch />
                  </Icon>
                </button>
              )}
            </div>

            {user ? (
              <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded transition group">
                <span className="text-xs text-gray-500 hidden lg:block group-hover:text-pink-500">{user.email}</span>
                <Icon>
                  <FiUser />
                </Icon>
              </Link>
            ) : (
              <Link to="/login">
                <Icon>
                  <FiUser />
                </Icon>
              </Link>
            )}

            <Icon count={0}>
              <FiHeart />
            </Icon>
            <Link to="/cart">
              <Icon count={cartCount}>
                <FiShoppingCart />
              </Icon>
            </Link>
          </div>

          {/* Mobile Menu Button (zig-zag hover) */}
          <button
            className="md:hidden text-2xl p-2 transition-transform duration-200 hover:rotate-6"
            onClick={() => setOpen(!open)}
            aria-label="Toggle Menu"
          >
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-96 border-t" : "max-h-0"
          }`}
      >
        <nav className="flex flex-col gap-6 px-6 py-6 text-sm font-medium bg-white">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="hover:text-pink-500 transition"
              onClick={() => setOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
              <FiSearch />
            </button>
          </form>

          <div className="flex gap-6 pt-4 text-xl justify-center border-t">
            {user ? (
              <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <Icon><FiUser /></Icon>
                <span className="text-sm font-normal">My Account</span>
              </Link>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)}>
                <Icon>
                  <FiUser />
                </Icon>
              </Link>
            )}
            <div className="relative">
              <Icon count={0}>
                <FiHeart />
              </Icon>
            </div>
            <Link to="/cart" onClick={() => setOpen(false)}>
              <Icon count={cartCount}>
                <FiShoppingCart />
              </Icon>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

/* Reusable Icon with badge */
interface IconProps {
  children: ReactNode;
  count?: number;
}

function Icon({ children, count }: IconProps) {
  return (
    <span className="relative cursor-pointer hover:text-pink-500 transition">
      {children}

      {typeof count === "number" && count > 0 && (
        <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full leading-none">
          {count}
        </span>
      )}
    </span>
  );
}
