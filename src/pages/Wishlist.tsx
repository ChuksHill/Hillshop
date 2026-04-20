import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { formatNaira } from "../lib/currency";

interface Product {
    id: string;
    name: string;
    price: number;
    price_id?: string;
    discount_price: number | null;
    image_url: string | null;
    stock_status?: string;
    quantity?: number;
}

export default function Wishlist() {
    const { wishlistItems, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        if (wishlistItems.length === 0) {
            setProducts([]);
            setLoading(false);
            return;
        }

        async function fetchWishlistProducts() {
            setLoading(true);
            const { data } = await supabase
                .from("products")
                .select("*")
                .in("id", wishlistItems);
            setProducts(data || []);
            setLoading(false);
        }

        fetchWishlistProducts();
    }, [wishlistItems, user]);

    if (!user) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 pt-28 px-4">
                <div className="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center">
                    <FiHeart className="text-pink-400" size={40} />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Sign in to see your Wishlist</h1>
                    <p className="text-gray-500 mb-6">Save your favourite items so you never lose track of them.</p>
                    <Link
                        to="/login"
                        className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-black transition-all inline-flex items-center gap-2"
                    >
                        Sign In <FiArrowRight />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">

            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <FiHeart className="text-pink-500" /> My Wishlist
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {wishlistItems.length} saved item{wishlistItems.length !== 1 ? "s" : ""}
                    </p>
                </div>
                {wishlistItems.length > 0 && (
                    <Link
                        to="/shop"
                        className="text-sm font-bold text-pink-500 hover:underline flex items-center gap-1"
                    >
                        Continue Shopping <FiArrowRight size={14} />
                    </Link>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-3xl bg-gray-100 animate-pulse aspect-[3/4]" />
                    ))}
                </div>
            ) : wishlistItems.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mb-6">
                        <FiHeart className="text-pink-300" size={36} />
                    </div>
                    <h2 className="text-xl font-black text-gray-800 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 text-sm mb-8 text-center max-w-xs">
                        Browse our shop and tap the ♡ icon to save items you love.
                    </p>
                    <Link
                        to="/shop"
                        className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-black transition-all inline-flex items-center gap-2"
                    >
                        Browse Shop <FiArrowRight />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const effectivePrice = product.discount_price ?? product.price;
                        const discountPct = product.discount_price
                            ? Math.round(((product.price - product.discount_price) / product.price) * 100)
                            : 0;
                        const isOutOfStock = product.stock_status === "out_of_stock" ||
                            (product.quantity !== undefined && product.quantity <= 0);

                        return (
                            <div
                                key={product.id}
                                className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                            >
                                {/* Image */}
                                <div
                                    className="relative aspect-square bg-gray-50 cursor-pointer overflow-hidden"
                                    onClick={() => navigate(`/product/${product.id}`)}
                                >
                                    <img
                                        src={product.image_url || "/placeholder.png"}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {discountPct > 0 && (
                                        <span className="absolute top-3 left-3 bg-pink-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                            -{discountPct}%
                                        </span>
                                    )}
                                    {isOutOfStock && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Out of Stock</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <p
                                        className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 cursor-pointer hover:text-pink-500 transition-colors"
                                        onClick={() => navigate(`/product/${product.id}`)}
                                    >
                                        {product.name}
                                    </p>

                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-lg font-black text-gray-900">{formatNaira(effectivePrice)}</span>
                                        {product.discount_price && (
                                            <span className="text-sm text-gray-400 line-through">{formatNaira(product.price)}</span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                if (isOutOfStock) { toast.error("Product is out of stock"); return; }
                                                addToCart({
                                                    id: product.id,
                                                    name: product.name,
                                                    price: effectivePrice,
                                                    price_id: product.price_id,
                                                    image: product.image_url || "/placeholder.png",
                                                });
                                                toast.success("Added to cart!");
                                            }}
                                            disabled={isOutOfStock}
                                            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl text-xs font-black hover:bg-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <FiShoppingCart size={14} />
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => toggleWishlist(product.id)}
                                            className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-400 rounded-xl hover:bg-red-100 transition-all"
                                            title="Remove from wishlist"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
