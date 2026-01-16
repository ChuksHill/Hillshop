import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";
import { FiArrowLeft, FiShoppingCart } from "react-icons/fi";
import toast from "react-hot-toast";

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    discount_price: number | null;
}

interface ProductImage {
    image_url: string;
}

export default function Product() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        async function fetchProduct() {
            setLoading(true);

            // Fetch product details
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

            // Fetch images
            const { data: imgData } = await supabase
                .from("product_images")
                .select("image_url")
                .eq("product_id", id);

            const imgUrls = imgData?.map(i => i.image_url) || [];
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
            image: selectedImage
        });
        toast.success("Added to cart!");
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading details...</div>;
    if (!product) return <div className="p-12 text-center">Product not found.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-pink-500 mb-8 transition"
            >
                <FiArrowLeft /> Back
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <img
                            src={selectedImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition ${selectedImage === img ? "border-pink-500" : "border-transparent hover:border-gray-200"
                                        }`}
                                >
                                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

                    <div className="mb-6">
                        {product.discount_price ? (
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-bold text-pink-600">${product.discount_price.toFixed(2)}</span>
                                <span className="text-xl text-gray-400 line-through">${product.price.toFixed(2)}</span>
                                <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
                                    On Sale
                                </span>
                            </div>
                        ) : (
                            <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                        )}
                    </div>

                    <div className="prose prose-sm text-gray-600 mb-8">
                        <p>{product.description || "No description available for this product."}</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 bg-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-pink-600 transition flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
                        >
                            <FiShoppingCart /> Add to Cart
                        </button>
                        <button className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        </button>
                    </div>

                    <div className="mt-8 border-t pt-8 space-y-4 text-sm text-gray-500 basic-list">
                        <div className="flex gap-4">
                            <span className="font-medium text-gray-900 w-24">Delivery:</span>
                            <span>Free shipping on orders over $50</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="font-medium text-gray-900 w-24">Returns:</span>
                            <span>30-day money back guarantee</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
