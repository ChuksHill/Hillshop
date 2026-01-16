import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
}

export default function ProductCard({ id, name, price, discountPrice, images }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price: discountPrice || price,
      image: images[0] || "/placeholder.png"
    });
    toast.success("Added to cart!");
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-4 flex flex-col h-full">
      {/* Show first image as main */}
      <div className="relative aspect-square mb-2 overflow-hidden rounded-md">
        {images[0] ? (
          <img src={images[0]} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
        )}
      </div>

      <h3 className="font-semibold text-gray-800 line-clamp-1">{name}</h3>

      <div className="mb-4">
        {discountPrice ? (
          <p className="text-pink-500 font-bold">
            ${discountPrice.toFixed(2)} <span className="line-through text-gray-400 text-sm ml-2">${price.toFixed(2)}</span>
          </p>
        ) : (
          <p className="text-pink-500 font-bold">${price.toFixed(2)}</p>
        )}
      </div>

      <button
        onClick={handleAddToCart}
        className="mt-auto w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 transition active:scale-95"
      >
        Add to Cart
      </button>

      {/* Optional: small thumbnails for multiple images */}
      {/* Always reserve space for thumbnails to ensure alignment */}
      <div className="flex mt-3 gap-2 overflow-x-auto pb-1">
        {images.length > 1 ? (
          images.slice(1, 4).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${name} ${idx + 2}`}
              className="w-10 h-10 object-cover rounded border border-gray-100 flex-shrink-0"
            />
          ))
        ) : (
          /* Invisible placeholder to maintain height */
          <div className="w-10 h-10 invisible" />
        )}
      </div>
    </div>
  );
}
