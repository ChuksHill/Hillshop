import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiX, FiShoppingCart, FiMinus, FiPlus } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

interface Product {
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
    images: string[];
    description?: string;
}

interface QuickViewProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function QuickView({ product, isOpen, onClose }: QuickViewProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState("");
    const { addToCart } = useCart();

    useEffect(() => {
        if (product && product.images.length > 0) {
            // @ts-ignore - added initialImage dynamically
            setSelectedImage(product.initialImage || product.images[0]);
            setQuantity(1);
        }
    }, [product]);

    if (!isOpen || !product) return null;

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.discountPrice || product.price,
                image: selectedImage || "/placeholder.png"
            });
        }
        toast.success(`Added ${quantity} ${product.name} to cart!`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-500 hover:text-pink-500 transition-all"
                >
                    <FiX size={24} />
                </button>

                {/* Left: Image Section */}
                <div className="w-full md:w-1/2 bg-gray-50 p-6 flex flex-col">
                    <Link
                        to={`/product/${product.id}`}
                        className="flex-1 aspect-square rounded-2xl overflow-hidden shadow-inner bg-white group/img"
                    >
                        <img
                            src={selectedImage || "/placeholder.png"}
                            alt={product.name}
                            className="w-full h-full object-cover transition-all duration-500 group-hover/img:scale-110"
                        />
                    </Link>

                    {/* Thumbnails */}
                    {product.images.length > 1 && (
                        <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img ? "border-pink-500 scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Content Section */}
                <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                    <div className="flex flex-col h-full">
                        <Link to={`/product/${product.id}`} className="group/title">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2 group-hover/title:text-pink-500 transition-colors uppercase tracking-tight">{product.name}</h2>
                        </Link>

                        <div className="flex items-center gap-3 mb-6">
                            {product.discountPrice ? (
                                <>
                                    <span className="text-3xl font-bold text-pink-600">${product.discountPrice.toFixed(2)}</span>
                                    <span className="text-xl text-gray-400 line-through">${product.price.toFixed(2)}</span>
                                    <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                                        Sale
                                    </span>
                                </>
                            ) : (
                                <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                            )}
                        </div>

                        <p className="text-gray-600 leading-relaxed mb-8">
                            {product.description || "Indulge in the perfect blend of style and quality. This piece is designed to elevate your everyday experience with premium materials and timeless aesthetics."}
                        </p>

                        <div className="mt-auto space-y-6">
                            {/* Quantity Selector */}
                            <div className="flex items-center gap-6">
                                <span className="font-semibold text-gray-700">Quantity</span>
                                <div className="flex items-center border border-gray-200 rounded-full px-2 py-1 bg-gray-50">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-2 hover:text-pink-500 transition-colors"
                                    >
                                        <FiMinus />
                                    </button>
                                    <span className="w-10 text-center font-bold text-gray-800">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-2 hover:text-pink-500 transition-colors"
                                    >
                                        <FiPlus />
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-pink-500 text-white h-14 rounded-2xl font-bold text-lg hover:bg-pink-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-pink-200 active:scale-[0.98]"
                                >
                                    <FiShoppingCart size={22} /> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
