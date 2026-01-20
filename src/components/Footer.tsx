// 
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      {/* Top */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-16">

          {/* Logo + Info */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-1 mb-6 group">
              <span className="text-2xl font-black text-pink-500 tracking-tighter">
                hills
              </span>
              <span className="text-[10px] tracking-[0.3em] font-bold pt-1 uppercase text-white transition-colors group-hover:text-pink-400">
                Shop
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              Curating the finest products to help you create a beautiful, modern lifestyle.
            </p>

            <div className="flex gap-4 text-gray-400">
              <a href="#" className="hover:text-pink-500 transition-colors">
                <FaFacebookF />
              </a>
              <a href="#" className="hover:text-pink-500 transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-pink-500 transition-colors">
                <FaLinkedinIn />
              </a>
              <a href="#" className="hover:text-pink-500 transition-colors">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-pink-500">Company</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Store Locations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Our Blog</a></li>
            </ul>
          </div>

          {/* Shop */}
          <div className="space-y-6">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-pink-500">Shop</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=Skincare" className="hover:text-white transition-colors">Skincare</Link></li>
              <li><Link to="/shop?category=Electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-pink-500">Support</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-pink-500">Talk To Us</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Find a location nearest you. See{" "}
              <a href="#" className="text-pink-500 hover:underline">
                Our Stores
              </a>
            </p>

            <div className="space-y-2 text-sm">
              <p>
                <a href="tel:2348108921608" className="text-white hover:text-pink-500 transition-colors font-bold">
                  +234 81 0892 1608
                </a>
              </p>
              <p>
                <a href="mailto:support@hills.com" className="text-gray-400 hover:text-white transition-colors">
                  support@hills.com
                </a>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-500">
            © 2026{" "}
            <Link to="/" className="text-pink-500 font-black hover:text-pink-400 transition-colors">
              Hills Shop
            </Link>{" "}
            — Defined by quality.
          </p>

          <div className="flex items-center gap-6 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <img
              src="/images/footer/footer-payment.png"
              alt="Payment Methods"
              className="h-6"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
