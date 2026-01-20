import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";
import { FiArrowLeft, FiShoppingCart, FiMinus, FiPlus, FiHeart, FiShield, FiTruck, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    discount_price: number | null;
}

export default function Product() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        if (!id) return;

        async function fetchProduct() {
            setLoading(true);
            const { data: prodData, error } = await supabase
                .from("products")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !prodData) {
                setLoading(false);
                return;
            }

            setProduct(prodData);

            const { data: imgData } = await supabase
                .from("product_images")
                .select("image_url")
                .eq("product_id", id);

            const imgUrls = imgData?.map((i: { image_url: string }) => i.image_url) || [];
            setImages(imgUrls);
            if (imgUrls.length > 0) setSelectedImage(imgUrls[0]);
            else setSelectedImage("/placeholder.png");

            setLoading(false);
        }

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart({
            id: product.id,
            name: product.name,
            price: product.discount_price || product.price,
            image: selectedImage,
            quantity: quantity
        });
        toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart!`);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
    );

    if (!product) return <div className="p-12 text-center">Product not found.</div>;

    const discountPercentage = product.discount_price
        ? Math.round(((product.price - product.discount_price) / product.price) * 100)
        : 0;

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
                {/* Breadcrumbs / Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-2 text-gray-400 hover:text-pink-500 mb-12 transition-all"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Collection</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
                    {/* Left: Image Gallery */}
                    <div className="space-y-6">
                        <div className="aspect-[4/5] bg-gray-50 rounded-3xl overflow-hidden shadow-2xl shadow-gray-200 group relative">
                            <img
                                src={selectedImage}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {discountPercentage > 0 && (
                                <div className="absolute top-6 left-6 bg-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-black shadow-lg">
                                    -{discountPercentage}%
                                </div>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === img
                                                ? "border-pink-500 scale-95 shadow-lg"
                                                : "border-transparent opacity-60 hover:opacity-100"
                                            }`}
                                    >
                                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-8 border-b border-gray-100 pb-8">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                                    {product.name}
                                </h1>
                                <button
                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                    className={`p-3 rounded-full border transition-all active:scale-90 ${isWishlisted
                                            ? "bg-pink-50 border-pink-100 text-pink-500 shadow-md"
                                            : "hover:bg-gray-50 border-gray-100 text-gray-400"
                                        }`}
                                >
                                    <FiHeart className={isWishlisted ? "fill-current" : ""} size={24} />
                                </button>
                            </div>

                            <div className="flex items-center gap-6 mb-4">
                                {product.discount_price ? (
                                    <>
                                        <span className="text-4xl font-black text-pink-600">${product.discount_price.toFixed(2)}</span>
                                        <span className="text-2xl text-gray-300 line-through decoration-pink-300 decoration-2">${product.price.toFixed(2)}</span>
                                    </>
                                ) : (
                                    <span className="text-4xl font-black text-gray-900">${product.price.toFixed(2)}</span>
                                )}
                            </div>

                            <p className="text-gray-500 text-lg leading-relaxed max-w-lg">
                                {product.description || "Indulge in the perfect blend of style and functionality. This premium selection from Hillshop is designed to elevate your everyday experience with unmatched quality."}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-8">
                            <div className="flex flex-col sm:flex-row gap-6">
                                {/* Quantity Selector */}
                                <div className="flex items-center bg-gray-50 rounded-2xl p-1 h-14 w-40 border border-gray-100">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all text-gray-500"
                                    >
                                        <FiMinus />
                                    </button>
                                    <span className="flex-1 text-center font-black text-lg text-gray-800">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all text-gray-500"
                                    >
                                        <FiPlus />
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-black transition-all flex items-center justify-center gap-3 shadow-2xl shadow-gray-200 active:scale-[0.98]"
                                >
                                    <FiShoppingCart /> Add to Cart
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-pink-100 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shrink-0 group-hover:scale-110 transition-transform">
                                        <FiTruck size={20} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider leading-tight">Free Secure Shipping</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-pink-100 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shrink-0 group-hover:scale-110 transition-transform">
                                        <FiRefreshCw size={20} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider leading-tight">30-Day Free Returns</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-pink-100 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shrink-0 group-hover:scale-110 transition-transform">
                                        <FiShield size={20} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider leading-tight">Secure Payments</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
