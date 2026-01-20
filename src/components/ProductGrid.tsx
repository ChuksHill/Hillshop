import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
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
    <div className="py-0">
      {categories.map((category) => (
        <div key={category.id} className="mb-12">
          <Link to={`/shop?category=${encodeURIComponent(category.name)}`} className="group inline-block mb-8">
            <h2 className="text-2xl font-bold text-pink-500 group-hover:text-pink-600 transition-colors flex items-center gap-2">
              {category.name}
              <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                View All &rarr;
              </span>
            </h2>
          </Link>

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
                    onOpenQuickView={(img) => {
                      setSelectedProduct({
                        id: prod.id,
                        name: prod.name,
                        price: prod.price,
                        discountPrice: prod.discount_price || undefined,
                        images: imagesToShow,
                        initialImage: img
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
