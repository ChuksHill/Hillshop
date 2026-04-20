import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { Link } from "react-router-dom";
import { FiPackage, FiLogOut, FiUser, FiShield, FiHeart } from "react-icons/fi";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { OrderDetail } from "../components/OrderDetail";

interface Order {
    id: string;
    created_at: string;
    total: number;
    status: string;
    full_name?: string;
    address?: string;
    city?: string;
    delivery_method?: string;
    payment_method?: string;
}

type Tab = "orders" | "wishlist";

export default function Profile() {
    const { user, signOut, isAdmin } = useAuth();
    const { wishlistItems } = useWishlist();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("orders");

    useEffect(() => {
        if (!user) return;

        async function fetchOrders() {
            setLoading(true);
            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .eq("user_id", user?.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching orders:", error);
            } else {
                setOrders(data || []);
            }
            setLoading(false);
        }

        fetchOrders();
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 pt-28">
                <p className="text-gray-500 mb-4">You are not logged in.</p>
                <Link to="/login" className="bg-pink-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-pink-600 transition-colors">
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 pt-28">

            {/* Page Header */}
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <FiUser className="text-pink-500" /> My Account
                </h1>
                <button
                    onClick={signOut}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors font-bold bg-gray-50 px-4 py-2 rounded-xl"
                >
                    <FiLogOut /> Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Sidebar */}
                <div className="md:col-span-1 space-y-4">
                    {/* Profile Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-14 h-14 rounded-2xl bg-pink-500 flex items-center justify-center text-white text-2xl font-black mb-4">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</span>
                                <span className="font-bold text-gray-900 break-all text-xs">{user.email}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Member Since</span>
                                <span className="font-bold text-gray-900 text-xs">
                                    {new Date(user.created_at || "").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                                </span>
                            </div>
                        </div>
                        {isAdmin && (
                            <div className="pt-4 mt-4 border-t border-gray-100">
                                <Link
                                    to="/admin"
                                    className="flex items-center gap-2 text-pink-600 font-black text-sm hover:text-pink-700 transition-colors"
                                >
                                    <FiShield size={14} /> Admin Dashboard
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                            <p className="text-2xl font-black text-gray-900">{orders.length}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Orders</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                            <p className="text-2xl font-black text-pink-500">{wishlistItems.length}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Saved</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="md:col-span-3">

                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl mb-6 w-fit">
                        <button
                            onClick={() => setActiveTab("orders")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                                activeTab === "orders"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <FiPackage size={14} /> Orders
                            {orders.length > 0 && (
                                <span className="bg-pink-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                    {orders.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("wishlist")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                                activeTab === "wishlist"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <FiHeart size={14} /> Wishlist
                            {wishlistItems.length > 0 && (
                                <span className="bg-pink-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                    {wishlistItems.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Orders Tab */}
                    {activeTab === "orders" && (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
                                    ))}
                                </div>
                            ) : orders.length > 0 ? (
                                orders.map(order => (
                                    <OrderDetail key={order.id} order={order} />
                                ))
                            ) : (
                                <div className="bg-gray-50 rounded-3xl p-16 text-center border border-dashed border-gray-200">
                                    <FiPackage className="text-gray-300 mx-auto mb-4" size={40} />
                                    <p className="text-gray-500 font-bold mb-2">No orders yet</p>
                                    <p className="text-gray-400 text-sm mb-6">When you place an order, it will appear here.</p>
                                    <Link
                                        to="/shop"
                                        className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-black text-sm hover:bg-black transition-all"
                                    >
                                        Start Shopping
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Wishlist Tab */}
                    {activeTab === "wishlist" && (
                        <div>
                            {wishlistItems.length === 0 ? (
                                <div className="bg-gray-50 rounded-3xl p-16 text-center border border-dashed border-gray-200">
                                    <FiHeart className="text-gray-300 mx-auto mb-4" size={40} />
                                    <p className="text-gray-500 font-bold mb-2">Your wishlist is empty</p>
                                    <p className="text-gray-400 text-sm mb-6">Heart items while browsing to save them here.</p>
                                    <Link
                                        to="/shop"
                                        className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-black text-sm hover:bg-black transition-all"
                                    >
                                        Browse Shop
                                    </Link>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                                    <p className="text-sm text-gray-500 mb-4">You have {wishlistItems.length} saved item{wishlistItems.length !== 1 ? "s" : ""}.</p>
                                    <Link
                                        to="/wishlist"
                                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-black text-sm hover:bg-black transition-all"
                                    >
                                        <FiHeart size={14} /> View Wishlist
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
