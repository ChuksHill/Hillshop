import { Link, Outlet, useLocation } from "react-router-dom";
import { FiGrid, FiBox, FiShoppingBag, FiLogOut, FiHome, FiUsers } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import ScrollToTopButton from "./ScrollToTopButton";

export default function AdminLayout() {
    const { signOut } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r shadow-sm fixed h-full z-20 hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <Link to="/" className="flex items-center gap-1 group">
                        <span className="text-2xl font-black text-pink-500 tracking-tighter">
                            hills
                        </span>
                        <span className="text-[10px] tracking-[0.3em] font-bold pt-1 uppercase text-gray-900">
                            Shop
                        </span>
                    </Link>
                    <span className="block text-xs font-medium text-gray-500 tracking-normal mt-1">Admin Panel</span>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Link
                        to="/admin"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive("/admin")
                            ? "bg-pink-50 text-pink-600"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                    >
                        <FiGrid size={20} /> Dashboard
                    </Link>
                    <Link
                        to="/admin/products"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive("/admin/products")
                            ? "bg-pink-50 text-pink-600"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                    >
                        <FiBox size={20} /> Products
                    </Link>
                    <Link
                        to="/admin/subscribers"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive("/admin/subscribers")
                            ? "bg-pink-50 text-pink-600"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                    >
                        <FiUsers size={20} /> Subscribers
                    </Link>
                    {/* Placeholder for future orders page */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed">
                        <FiShoppingBag size={20} /> Orders (Soon)
                    </div>
                </nav>

                <div className="p-4 border-t space-y-2">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium"
                    >
                        <FiHome size={20} /> Back to Shop
                    </Link>
                    <button
                        onClick={signOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors font-medium text-left"
                    >
                        <FiLogOut size={20} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header (Visible only on small screens) */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-30 px-4 py-3 flex justify-between items-center">
                <span className="font-bold">Admin Panel</span>
                <Link to="/" className="text-sm text-pink-500">Exit</Link>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 pt-20 md:pt-8 overflow-y-auto">
                <Outlet />
            </main>
            <ScrollToTopButton />
        </div>
    );
}
