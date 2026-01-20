import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import Banner from "../components/Banner";
import FlashSales from "../components/FlashSales";
import FeaturesBar from "../components/FeaturesBar";
import Newsletter from "../components/Newsletter";
import { supabase } from "../lib/supabaseClient";
import {
  FiSmartphone,
  FiMonitor,
  FiActivity,
  FiWatch,
  FiShoppingBag,
  FiChevronRight
} from "react-icons/fi";

const Home = () => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("*");
      setCategories(data || []);
    }
    fetchCategories();
  }, []);

  // Icon mapping for Jumia-style sidebar
  const getIcon = (name: string) => {
    switch (name) {
      case "Electronics": return <FiSmartphone />;
      case "Computing": return <FiMonitor />;
      case "Health & Beauty": return <FiActivity />;
      case "Fashion": return <FiShoppingBag />;
      default: return <FiWatch />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pt-20">

      {/* Hero Section Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-4">
        <div className="grid grid-cols-12 gap-4">

          {/* Left Sidebar (Desktop Only) */}
          <aside className="hidden lg:block col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <nav className="flex flex-col py-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="flex items-center justify-between px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 group-hover:text-pink-500 transition-colors">
                      {getIcon(cat.name)}
                    </span>
                    {cat.name}
                  </div>
                  <FiChevronRight size={14} className="text-gray-300 group-hover:text-pink-500" />
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content (Banner) */}
          <main className="col-span-12 lg:col-span-7">
            <div className="rounded-xl overflow-hidden shadow-sm h-[400px]">
              <Banner />
            </div>
          </main>

          {/* Right Column Promos (Desktop Only) */}
          <aside className="hidden lg:flex col-span-3 flex-col gap-4">
            <div className="flex-1 bg-pink-500 rounded-xl p-6 relative overflow-hidden group cursor-pointer shadow-sm">
              <div className="relative z-10 text-white">
                <p className="text-xs font-black uppercase tracking-widest mb-2 opacity-80">Mega Clearance</p>
                <h3 className="text-2xl font-black mb-4 leading-tight">Up to 70% <br /> Off Tech</h3>
                <Link to="/shop" className="inline-block bg-white text-pink-500 px-4 py-2 rounded-lg text-xs font-black hover:bg-gray-100 transition-colors">Shop Now</Link>
              </div>
              <FiSmartphone className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32 rotate-12 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex-1 bg-gray-900 rounded-xl p-6 relative overflow-hidden group cursor-pointer shadow-sm">
              <div className="relative z-10 text-white">
                <p className="text-xs font-black uppercase tracking-widest mb-2 opacity-80">New Arrivals</p>
                <h3 className="text-2xl font-black mb-4 leading-tight">Fresh Style <br /> Just In</h3>
                <Link to="/shop" className="inline-block bg-pink-500 text-white px-4 py-2 rounded-lg text-xs font-black hover:bg-pink-600 transition-colors">Explore</Link>
              </div>
              <FiShoppingBag className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32 -rotate-12 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </aside>
        </div>

        {/* Features Row */}
        <FeaturesBar />

        {/* Flash Sales */}
        <FlashSales />

        {/* Regular Categories Grid */}
        <div className="mt-12 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <ProductGrid />
        </div>

        {/* Newsletter */}
        <Newsletter />
      </div>
    </div>
  );
};

export default Home;
