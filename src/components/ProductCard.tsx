import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
  onOpenQuickView?: (initialImage?: string) => void;
}

export default function ProductCard({ id, name, price, discountPrice, images, onOpenQuickView }: ProductCardProps) {
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
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-4 flex flex-col h-full group relative">
      {/* Clickable Area for Quick View */}
      <div
        onClick={() => onOpenQuickView?.()}
        className="cursor-pointer flex-1 flex flex-col"
      >
        {/* Show first image as main */}
        <div className="relative aspect-square mb-4 overflow-hidden rounded-xl">
          {images[0] ? (
            <img
              src={images[0]}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-medium">No Image</div>
          )}

          {/* Subtle View Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 shadow-lg">
              Quick View
            </span>
          </div>
        </div>

        <h3 className="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-pink-500 transition-colors">{name}</h3>

        <div className="mb-4">
          {discountPrice ? (
            <p className="text-pink-600 font-bold">
              ${discountPrice.toFixed(2)} <span className="line-through text-gray-400 text-sm ml-2 font-normal">${price.toFixed(2)}</span>
            </p>
          ) : (
            <p className="text-gray-900 font-bold">${price.toFixed(2)}</p>
          )}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleAddToCart();
        }}
        className="mt-auto w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-black transition-all active:scale-[0.97] font-bold text-sm"
      >
        Add to Cart
      </button>

      {/* Thumbnail Previews */}
      <div className="flex mt-4 gap-2 overflow-x-auto pb-1 scrollbar-hide h-9">
        {images.length > 1 ? (
          images.slice(0, 4).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${name} ${idx + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                onOpenQuickView?.(img);
              }}
              className="w-8 h-8 object-cover rounded-md border border-gray-100 flex-shrink-0 cursor-pointer hover:border-pink-500 transition-colors"
            />
          ))
        ) : (
          <div className="w-8 h-8 invisible" />
        )}
      </div>
    </div>
  );
}
