import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import QuickView from "./QuickView";

interface Product {
  id: string;
  name: string;
  price: number;
  discount_price: number | null;
  category_id: string;
}

interface ProductImage {
  product_id: string;
  image_url: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);

  // Quick View State
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*");

      const { data: productsData } = await supabase
        .from("products")
        .select("*");

      const { data: imagesData } = await supabase
        .from("product_images")
        .select("*");

      setCategories(categoriesData || []);
      setProducts(productsData || []);
      setImages(imagesData || []);
    };

    fetchData();
  }, []);

  return (
    <div className="py-12">
      {categories.map((category) => (
        <div key={category.id} className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold">{category.name}</h2>
            <Link to={`/shop?category=${encodeURIComponent(category.name)}`} className="text-pink-500 font-medium hover:underline text-sm">
              {category.name.toLowerCase() === "accessories" ? "tho  and accessorie" : `View All ${category.name}`} &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products
              .filter((p) => p.category_id === category.id)
              .map((prod) => {
                const productImages = images
                  .filter((img) => img.product_id === prod.id)
                  .map((img) => img.image_url);

                const imagesToShow =
                  productImages.length > 0
                    ? productImages
                    : ["/placeholder.png"];

                return (
                  <ProductCard
                    key={prod.id}
                    id={prod.id}
                    name={prod.name}
                    price={prod.price}
                    discountPrice={prod.discount_price || undefined}
                    images={imagesToShow}
                    onOpenQuickView={() => {
                      setSelectedProduct({
                        id: prod.id,
                        name: prod.name,
                        price: prod.price,
                        discountPrice: prod.discount_price || undefined,
                        images: imagesToShow
                      });
                      setIsQuickViewOpen(true);
                    }}
                  />
                );
              })}
          </div>
        </div>
      ))}

      <QuickView
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </div>
  );
}
