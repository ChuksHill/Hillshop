import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "./ProductCard";

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
    <div className="max-w-7xl mx-auto px-4 py-12">
      {categories.map((category) => (
        <div key={category.id} className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{category.name}</h2>

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
                  />
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
