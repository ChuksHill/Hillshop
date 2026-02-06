import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { FiHeart } from "react-icons/fi";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  priceId?: string;
  discountPrice?: number;
  images: string[];
  stockStatus?: string;
  quantity?: number;
}

export default function ProductCard({
  id,
  name,
  price,
  priceId,
  discountPrice,
  images,
  stockStatus,
  quantity,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);

  const isOutOfStock = stockStatus === 'out_of_stock' || (quantity !== undefined && quantity <= 0);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", id);

      if (data?.length) {
        const avg =
          data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(avg);
        setReviewCount(data.length);
      }
    };

    fetchReviews();
  }, [id]);

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price: discountPrice ?? price,
      price_id: priceId,
      image: images[0] || "/placeholder.png",
    });
    toast.success("Added to cart!");
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-2 sm:p-4 flex flex-col h-full group relative">
      {/* Entire card navigates to product page */}
      <Link
        to={`/product/${id}`}
        className="flex-1 flex flex-col cursor-pointer"
      >
        <div className="relative aspect-square mb-4 overflow-hidden rounded-xl">
          {images[0] ? (
            <img
              src={images[0]}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-medium">
              No Image
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center text-red-600 font-bold text-sm tracking-wider uppercase border-2 border-red-500 m-4 rounded-lg">
              Out of Stock
            </div>
          )}

          {!isOutOfStock && discountPrice && (
            <div className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg z-10">
              -{Math.round(((price - discountPrice) / price) * 100)}%
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(id);
            }}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-md z-10"
          >
            <FiHeart
              size={18}
              className={
                isInWishlist(id)
                  ? "fill-pink-500 text-pink-500 scale-110"
                  : "text-gray-600 hover:text-pink-500"
              }
            />
          </button>
        </div>

        <h3 className="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-pink-500 transition-colors text-xs sm:text-base">
          {name}
        </h3>

        {averageRating !== null && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${i < Math.round(averageRating)
                    ? "fill-current"
                    : "fill-gray-200"
                    }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 font-medium">
              ({reviewCount})
            </span>
          </div>
        )}

        <div className="mb-2 sm:mb-4">
          {discountPrice ? (
            <p className="text-pink-600 font-bold text-sm sm:text-lg">
              ${discountPrice.toFixed(2)}
              <span className="line-through text-gray-400 text-[10px] sm:text-sm ml-1 sm:ml-2 font-normal">
                ${price.toFixed(2)}
              </span>
            </p>
          ) : (
            <p className="text-gray-900 font-bold text-sm sm:text-lg">
              ${price.toFixed(2)}
            </p>
          )}
        </div>
      </Link>

      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`mt-auto w-full py-2 sm:py-3 rounded-xl transition-all active:scale-[0.97] font-bold text-[10px] sm:text-sm ${isOutOfStock
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-gray-900 text-white hover:bg-black'
          }`}
      >
        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  );
}
