import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "./ProductCard";
import { FiZap, FiChevronRight } from "react-icons/fi";

interface Product {
    id: string;
    name: string;
    price: number;
    price_id?: string;
    discount_price: number | null;
    image_url: string | null;
}

export default function FlashSales() {
    const [products, setProducts] = useState<Product[]>([]);
    const [images, setImages] = useState<any[]>([]);
    const [seconds, setSeconds] = useState(12 * 3600 + 45 * 60); // 12h 45m


    // Countdown Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    useEffect(() => {
        const fetchData = async () => {
            const { data: productsData } = await supabase
                .from("products")
                .select("*")
                .not("discount_price", "is", null)
                .limit(4);

            const { data: imagesData } = await supabase
                .from("product_images")
                .select("*");

            setProducts(productsData || []);
            setImages(imagesData || []);
        };
        fetchData();
    }, []);

    if (products.length === 0) return null;

    return (
        <section className="my-12">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-pink-600 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-white text-xl sm:text-2xl font-black flex items-center gap-2 uppercase tracking-tight">
                            <FiZap className="fill-white" /> Flash Sales
                        </h2>
                        <div className="flex gap-2 items-center">
                            <span className="text-red-600 bg-white font-black px-2 py-1 rounded-lg text-sm shadow-sm">{String(h).padStart(2, '0')}h</span>
                            <span className="text-white font-bold opacity-80">:</span>
                            <span className="text-red-600 bg-white font-black px-2 py-1 rounded-lg text-sm shadow-sm">{String(m).padStart(2, '0')}m</span>
                            <span className="text-white font-bold opacity-80">:</span>
                            <span className="text-red-600 bg-white font-black px-2 py-1 rounded-lg text-sm shadow-sm">{String(s).padStart(2, '0')}s</span>
                        </div>
                    </div>
                    <Link to="/shop" className="text-white font-bold hover:underline flex items-center gap-1 text-sm">
                        SEE ALL <FiChevronRight />
                    </Link>
                </div>

                {/* Product Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((prod) => {
                            const galleryImages = images
                                .filter((img) => img.product_id === prod.id)
                                .map((img) => img.image_url);

                            const finalImages = [
                                prod.image_url,
                                ...galleryImages.filter(url => url !== prod.image_url)
                            ].filter(Boolean) as string[];

                            const imagesToShow = finalImages.length > 0 ? finalImages : ["/placeholder.png"];

                            return (
                                <div key={prod.id} className="relative">
                                    <ProductCard
                                        id={prod.id}
                                        name={prod.name}
                                        price={prod.price}
                                        priceId={prod.price_id}
                                        discountPrice={prod.discount_price || undefined}
                                        images={imagesToShow}
                                    />
                                    {/* Stock Bar Mock */}
                                    <div className="mt-3 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-pink-500 h-full w-[65%] rounded-full" />
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">12 items left</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
