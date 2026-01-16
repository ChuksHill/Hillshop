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
    <footer className="bg-white border-t">
      {/* Top */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Logo + Info */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img
                src="/images/logo/logo-black.svg"
                alt="Logo"
                className="h-8"
              />
            </Link>
            <p className="text-sm text-gray-600 mb-6">
              The home and elements needed to create beautiful products.
            </p>

            <div className="flex gap-4 text-gray-600">
              <a href="http://facebook.com" target="_blank">
                <FaFacebookF />
              </a>
              <a href="http://twitter.com" target="_blank">
                <FaTwitter />
              </a>
              <a href="https://www.linkedin.com/" target="_blank">
                <FaLinkedinIn />
              </a>
              <a href="https://www.youtube.com/" target="_blank">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="#">About us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Store Locations</a></li>
              <li><a href="#">Our Blog</a></li>
              <li><a href="#">Reviews</a></li>
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Shop</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="#">Game &amp; Video</a></li>
              <li><a href="#">Phone &amp; Tablets</a></li>
              <li><a href="#">Computers &amp; Laptop</a></li>
              <li><a href="#">Sport Watches</a></li>
              <li><a href="#">Discounts</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Reviews</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Shipping</a></li>
              <li><a href="#">Returns</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Talk To Us</h3>
            <p className="text-sm text-gray-600 mb-4">
              Find a location nearest you. See{" "}
              <a href="#" className="text-black underline">
                Our Stores
              </a>
            </p>

            <div className="space-y-2 text-sm">
              <p>
                <a href="tel:6244232672" className="hover:underline">
                  +234 81 0892 1608
                </a>
              </p>
              <p>
                <a href="mailto:support@harry.com" className="hover:underline">
                  support@hills.com
                </a>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom */}
      <div className="border-t">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            © 2026{" "}
            <Link to="/" className="text-black font-medium">
              Hills
            </Link>{" "}
            All Rights Reserved.
          </p>

          <img
            src="/images/footer/footer-payment.png"
            alt="Payment Methods"
            className="h-6"
          />
        </div>
      </div>
    </footer>
  );
}
