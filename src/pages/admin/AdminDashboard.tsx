import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
    FiShoppingBag, FiCreditCard, FiUsers, FiPackage,
    FiAlertTriangle, FiClock, FiTrendingUp
} from "react-icons/fi";
import { formatNaira } from "../../lib/currency";

interface Stats {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalProducts: number;
}

interface Order {
    id: string;
    created_at: string;
    total: number;
    status: string;
    full_name?: string;
    payment_method?: string;
}

interface LowStockProduct {
    id: string;
    name: string;
    quantity: number;
    image_url: string | null;
}

const STATUS_COLORS: Record<string, string> = {
    delivered: "bg-green-100 text-green-700",
    shipped: "bg-blue-100 text-blue-700",
    processing: "bg-yellow-100 text-yellow-700",
    placed: "bg-gray-100 text-gray-500",
    pending: "bg-gray-100 text-gray-500",
};

const ALL_STATUSES = ["Placed", "Processing", "Shipped", "Delivered"];

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, totalCustomers: 0, totalProducts: 0 });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    async function fetchDashboardData() {
        setLoading(true);

        const [
            { count: orderCount },
            { data: orders },
            { count: customerCount },
            { count: productCount },
            { data: lowStockData },
        ] = await Promise.all([
            supabase.from("orders").select("*", { count: "exact", head: true }),
            supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(10),
            supabase.from("profiles").select("*", { count: "exact", head: true }),
            supabase.from("products").select("*", { count: "exact", head: true }),
            supabase.from("products").select("id, name, quantity, image_url").lt("quantity", 5).order("quantity", { ascending: true }),
        ]);

        // Compute total revenue
        const { data: allOrders } = await supabase.from("orders").select("total");
        const revenue = allOrders?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;

        setStats({
            totalOrders: orderCount || 0,
            totalRevenue: revenue,
            totalCustomers: customerCount || 0,
            totalProducts: productCount || 0,
        });

        setRecentOrders(orders || []);
        setLowStock(lowStockData || []);
        setLoading(false);
    }

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingOrder(orderId);
        const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
        if (!error) {
            setRecentOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
            );
        }
        setUpdatingOrder(null);
    };

    const StatCard = ({ icon, label, value, sub, color }: {
        icon: React.ReactNode;
        label: string;
        value: string | number;
        sub?: string;
        color: string;
    }) => (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                <FiTrendingUp className="text-gray-200" size={20} />
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );

    if (loading) {
        return (
            <div className="p-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl">

            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Overview of your store's performance</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<FiShoppingBag className="text-pink-500" size={22} />}
                    label="Total Orders"
                    value={stats.totalOrders}
                    color="bg-pink-50"
                />
                <StatCard
                    icon={<FiCreditCard className="text-green-500" size={22} />}
                    label="Total Revenue"
                    value={formatNaira(stats.totalRevenue)}
                    color="bg-green-50"
                />
                <StatCard
                    icon={<FiUsers className="text-blue-500" size={22} />}
                    label="Customers"
                    value={stats.totalCustomers}
                    color="bg-blue-50"
                />
                <StatCard
                    icon={<FiPackage className="text-purple-500" size={22} />}
                    label="Products"
                    value={stats.totalProducts}
                    color="bg-purple-50"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Recent Orders */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="font-black text-gray-900 flex items-center gap-2">
                            <FiClock className="text-pink-500" size={16} /> Recent Orders
                        </h2>
                        <span className="text-xs text-gray-400 font-bold">Last 10</span>
                    </div>
                    <div className="overflow-x-auto">
                        {recentOrders.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 text-sm">No orders yet.</div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-50">
                                        <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order</th>
                                        <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                        <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                                        <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Update</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => {
                                        const statusKey = order.status?.toLowerCase() || "placed";
                                        const colorClass = STATUS_COLORS[statusKey] || STATUS_COLORS.placed;

                                        return (
                                            <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-5 py-4">
                                                    <p className="font-black text-gray-900 text-xs">#{order.id.slice(0, 8).toUpperCase()}</p>
                                                    <p className="text-gray-400 text-[10px] mt-0.5">
                                                        {new Date(order.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-gray-700 text-xs">{order.full_name || "—"}</p>
                                                    {order.payment_method && (
                                                        <p className="text-gray-400 text-[10px] capitalize mt-0.5">{order.payment_method}</p>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="font-black text-gray-900">{formatNaira(Number(order.total))}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${colorClass}`}>
                                                        {order.status || "Placed"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <select
                                                        value={order.status || "Placed"}
                                                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                        disabled={updatingOrder === order.id}
                                                        className="text-xs border border-gray-200 bg-white rounded-lg px-2 py-1.5 font-medium focus:ring-2 focus:ring-pink-500 outline-none cursor-pointer disabled:opacity-50"
                                                    >
                                                        {ALL_STATUSES.map(s => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-50 flex items-center gap-2">
                        <FiAlertTriangle className="text-orange-500" size={16} />
                        <h2 className="font-black text-gray-900">Low Stock Alerts</h2>
                        {lowStock.length > 0 && (
                            <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full ml-auto">
                                {lowStock.length}
                            </span>
                        )}
                    </div>
                    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                        {lowStock.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-sm">
                                <p>✓ All products well stocked</p>
                            </div>
                        ) : (
                            lowStock.map((product) => (
                                <div key={product.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-orange-100 shrink-0">
                                        <img
                                            src={product.image_url || "/placeholder.png"}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-900 line-clamp-1">{product.name}</p>
                                        <p className={`text-[10px] font-black mt-0.5 ${product.quantity === 0 ? "text-red-500" : "text-orange-500"}`}>
                                            {product.quantity === 0 ? "OUT OF STOCK" : `Only ${product.quantity} left`}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
