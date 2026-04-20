import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { FiPackage, FiMapPin, FiCreditCard, FiChevronDown, FiChevronUp, FiCheck } from "react-icons/fi";
import { formatNaira } from "../lib/currency";

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price_id?: string;
    product?: {
        name: string;
        image_url: string | null;
        price: number;
    };
}

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

interface OrderDetailProps {
    order: Order;
}

const STATUS_STEPS = ["Placed", "Processing", "Shipped", "Delivered"];

function getStatusIndex(status: string): number {
    const normalized = status?.toLowerCase() || "";
    if (normalized === "delivered") return 3;
    if (normalized === "shipped") return 2;
    if (normalized === "processing") return 1;
    return 0; // placed / pending
}

export function OrderDetail({ order }: OrderDetailProps) {
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!expanded || items.length > 0) return;

        async function fetchItems() {
            setLoading(true);
            const { data } = await supabase
                .from("order_items")
                .select("*, product:products(name, image_url, price)")
                .eq("order_id", order.id);
            setItems(data || []);
            setLoading(false);
        }
        fetchItems();
    }, [expanded, order.id]);

    const statusIndex = getStatusIndex(order.status);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">

            {/* Order Summary Row */}
            <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center shrink-0">
                        <FiPackage className="text-pink-500" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0.5">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-sm font-medium text-gray-500">
                            {new Date(order.created_at).toLocaleDateString(undefined, {
                                year: "numeric", month: "short", day: "numeric"
                            })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-lg font-black text-pink-600">{formatNaira(Number(order.total))}</p>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                            order.status?.toLowerCase() === "delivered"
                                ? "bg-green-100 text-green-700"
                                : order.status?.toLowerCase() === "shipped"
                                    ? "bg-blue-100 text-blue-700"
                                    : order.status?.toLowerCase() === "processing"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-gray-100 text-gray-500"
                        }`}>
                            {order.status || "Placed"}
                        </span>
                    </div>
                    {expanded ? <FiChevronUp className="text-gray-400 shrink-0" /> : <FiChevronDown className="text-gray-400 shrink-0" />}
                </div>
            </button>

            {/* Expanded Detail Panel */}
            {expanded && (
                <div className="border-t border-gray-100 p-5 space-y-6 bg-gray-50/50">

                    {/* Status Timeline */}
                    <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Order Progress</h4>
                        <div className="flex items-center">
                            {STATUS_STEPS.map((step, i) => {
                                const isCompleted = i <= statusIndex;
                                const isActive = i === statusIndex;
                                const isLast = i === STATUS_STEPS.length - 1;

                                return (
                                    <div key={step} className="flex items-center flex-1 last:flex-none">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                                isCompleted
                                                    ? "bg-pink-500 text-white shadow-lg shadow-pink-100"
                                                    : "bg-gray-100 text-gray-400"
                                            } ${isActive ? "ring-4 ring-pink-50 scale-110" : ""}`}>
                                                {isCompleted ? <FiCheck size={14} /> : i + 1}
                                            </div>
                                            <p className={`text-[10px] font-bold mt-2 whitespace-nowrap ${isCompleted ? "text-pink-500" : "text-gray-400"}`}>
                                                {step}
                                            </p>
                                        </div>
                                        {!isLast && (
                                            <div className={`flex-1 h-0.5 mx-1 mb-5 transition-all ${i < statusIndex ? "bg-pink-400" : "bg-gray-200"}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Items Ordered</h4>
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : items.length > 0 ? (
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3 bg-white rounded-2xl p-3 border border-gray-100">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                                            <img
                                                src={item.product?.image_url || "/placeholder.png"}
                                                alt={item.product?.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.product?.name || "Product"}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                                        </div>
                                        {item.product?.price && (
                                            <p className="text-sm font-black text-gray-900 shrink-0">
                                                {formatNaira(item.product.price * item.quantity)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No item details available.</p>
                        )}
                    </div>

                    {/* Delivery & Payment Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {order.address && (
                            <div className="bg-white rounded-2xl p-4 border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <FiMapPin className="text-pink-500" size={14} />
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Delivery Address</p>
                                </div>
                                <p className="text-sm font-bold text-gray-800">{order.full_name}</p>
                                <p className="text-sm text-gray-500">{order.address}, {order.city}</p>
                                {order.delivery_method && (
                                    <p className="text-xs text-gray-400 mt-1 capitalize">{order.delivery_method} shipping</p>
                                )}
                            </div>
                        )}
                        {order.payment_method && (
                            <div className="bg-white rounded-2xl p-4 border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <FiCreditCard className="text-pink-500" size={14} />
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Payment Method</p>
                                </div>
                                <p className="text-sm font-bold text-gray-800 capitalize">{order.payment_method}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
