import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FiPackage, FiLogOut, FiUser, FiShield } from "react-icons/fi";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface Order {
    id: string;
    created_at: string;
    total: number;
    status: string;
}

export default function Profile() {
    const { user, signOut, isAdmin } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

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
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <p className="text-gray-500 mb-4">You are not logged in.</p>
                <Link to="/login" className="bg-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-600">
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 pt-28">
            <div className="flex justify-between items-center mb-12">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <FiUser /> My Account
                </h1>
                <button
                    onClick={signOut}
                    className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition"
                >
                    <FiLogOut /> Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* User Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm border h-fit">
                    <h2 className="font-bold text-lg mb-4">Profile Details</h2>
                    <div className="space-y-4 text-sm">
                        <div>
                            <span className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Email</span>
                            <span className="font-bold text-gray-900">{user.email}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Member Since</span>
                            <span className="font-bold text-gray-900">{new Date(user.created_at || "").toLocaleDateString()}</span>
                        </div>
                        {isAdmin && (
                            <div className="pt-4 border-t mt-4">
                                <Link
                                    to="/admin"
                                    className="flex items-center gap-2 text-pink-600 font-bold hover:text-pink-700 transition"
                                >
                                    <FiShield /> Admin Dashboard
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order History */}
                <div className="md:col-span-2">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <FiPackage /> Order History
                    </h2>

                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-gray-500 text-sm">Loading orders...</p>
                        ) : orders.length > 0 ? (
                            orders.map(order => (
                                <div key={order.id} className="bg-white p-6 rounded-2xl border flex justify-between items-center hover:shadow-lg transition-all group">
                                    <div>
                                        <p className="font-black text-gray-900 uppercase text-xs tracking-tighter mb-1">Order #{order.id.slice(0, 8)}</p>
                                        <p className="text-xs text-gray-500 font-medium">{new Date(order.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-pink-600 text-lg mb-1">${Number(order.total).toFixed(2)}</p>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${order.status === "Delivered" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-gray-50 rounded-2xl p-12 text-center border border-dashed border-gray-200">
                                <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
                                <Link to="/shop" className="text-pink-500 font-bold hover:underline text-sm mt-2 inline-block">Start Shopping</Link>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
