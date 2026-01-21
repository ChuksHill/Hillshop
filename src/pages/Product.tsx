import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { FiArrowLeft, FiShoppingCart, FiMinus, FiPlus, FiHeart, FiShield, FiTruck, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    discount_price: number | null;
    image_url: string | null;
    stock: number;
}

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
}

export default function Product() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { user } = useAuth();

    const [product, setProduct] = useState<Product | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
    const [submittingReview, setSubmittingReview] = useState(false);

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

            // Fetch gallery images
            const { data: imgData } = await supabase
                .from("product_images")
                .select("image_url")
                .eq("product_id", id);

            // Fetch reviews
            const { data: reviewData } = await supabase
                .from("reviews")
                .select("*")
                .eq("product_id", id)
                .order("created_at", { ascending: false });

            setReviews(reviewData || []);

            const galleryUrls = imgData?.map((i: { image_url: string }) => i.image_url) || [];

            // Combine main image with gallery
            const allImages = [
                prodData.image_url,
                ...galleryUrls.filter(url => url !== prodData.image_url)
            ].filter(Boolean) as string[];

            setImages(allImages);

            if (allImages.length > 0) {
                setSelectedImage(allImages[0]);
            } else {
                setSelectedImage("/placeholder.png");
            }

            setLoading(false);
        }

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;

        if (product.stock < quantity) {
            toast.error(`Only ${product.stock} items left in stock`);
            return;
        }

        addToCart({
            id: product.id,
            name: product.name,
            price: product.discount_price || product.price,
            image: selectedImage,
            quantity: quantity
        });
        toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart!`);
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please sign in to leave a review");
            navigate("/login");
            return;
        }

        if (!id) return;

        setSubmittingReview(true);
        const { error } = await supabase
            .from("reviews")
            .insert({
                product_id: id,
                user_id: user.id,
                rating: newReview.rating,
                comment: newReview.comment
            });

        if (error) {
            console.error("Review submission error:", error);
            if (error.message.includes("duplicate")) {
                toast.error("You've already reviewed this product");
            } else if (error.message.includes("policy")) {
                toast.error("Permission denied. Please make sure you're signed in.");
            } else {
                toast.error(`Failed to submit review: ${error.message}`);
            }
        } else {
            toast.success("Review submitted successfully!");
            setNewReview({ rating: 5, comment: "" });
            // Refresh reviews
            const { data } = await supabase
                .from("reviews")
                .select("*")
                .eq("product_id", id)
                .order("created_at", { ascending: false });
            setReviews(data || []);
        }
        setSubmittingReview(false);
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
                                    onClick={() => id && toggleWishlist(id)}
                                    className={`p-3 rounded-full border transition-all active:scale-90 ${id && isInWishlist(id)
                                        ? "bg-pink-50 border-pink-100 text-pink-500 shadow-md"
                                        : "hover:bg-gray-50 border-gray-100 text-gray-400"
                                        }`}
                                >
                                    <FiHeart className={id && isInWishlist(id) ? "fill-current" : ""} size={24} />
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

                            <div className="flex items-center gap-4 mb-4">
                                {product.stock > 0 ? (
                                    <span className="text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                        In Stock ({product.stock} units)
                                    </span>
                                ) : (
                                    <span className="text-xs font-black text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                        Out of Stock
                                    </span>
                                )}
                            </div>

                            <p className="text-gray-500 text-lg leading-relaxed max-w-lg mb-4">
                                {product.description || "No description available for this product."}
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
                                    disabled={product.stock === 0}
                                    className="flex-1 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-black transition-all flex items-center justify-center gap-3 shadow-2xl shadow-gray-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiShoppingCart /> {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
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

                {/* Reviews Section */}
                <div className="mt-24 border-t border-gray-100 pt-16">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Customer Reviews</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                                ))}
                            </div>
                            <span className="font-bold text-gray-900">{reviews.length} Reviews</span>
                        </div>
                    </div>

                    {/* Write a Review Form */}
                    {user ? (
                        <form onSubmit={handleSubmitReview} className="mb-12 bg-gray-50 rounded-3xl p-8 border border-gray-100">
                            <h3 className="text-xl font-black text-gray-900 mb-6">Write a Review</h3>

                            {/* Star Rating Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Your Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <svg
                                                className={`w-8 h-8 ${star <= newReview.rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "fill-gray-200 text-gray-200"
                                                    }`}
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment Textarea */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Your Review</label>
                                <textarea
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                    required
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none resize-none"
                                    placeholder="Share your thoughts about this product..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submittingReview}
                                className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submittingReview ? "Submitting..." : "Submit Review"}
                            </button>
                        </form>
                    ) : (
                        <div className="mb-12 bg-gray-50 rounded-3xl p-8 border border-dashed border-gray-200 text-center">
                            <p className="text-gray-600 font-medium">
                                Please <button onClick={() => navigate("/login")} className="text-pink-500 font-bold hover:underline">sign in</button> to leave a review
                            </p>
                        </div>
                    )}

                    {reviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex text-yellow-400">
                                            {[...Array(review.rating)].map((_, i) => (
                                                <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                                    <div className="mt-6 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-[10px] font-black">HS</div>
                                        <span className="text-sm font-bold text-gray-900">Verified Buyer</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-500 font-medium">No reviews yet. Be the first to share your experience!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
