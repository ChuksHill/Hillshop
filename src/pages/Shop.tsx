import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "../components/ProductCard";
import QuickView from "../components/QuickView";
import { FiFilter, FiSearch, FiX } from "react-icons/fi";

interface Product {
    id: string;
    name: string;
    price: number;
    discount_price: number | null;
    category_id: string;
    image_url: string | null;
}

interface ProductImage {
    product_id: string;
    image_url: string;
}

interface Category {
    id: string;
    name: string;
}

export default function Shop() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [images, setImages] = useState<ProductImage[]>([]);
    const [loading, setLoading] = useState(true);

    // Quick View State
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    // Sync state with URL params
    const selectedCategory = searchParams.get("category") || "All";
    const searchQuery = searchParams.get("search") || "";

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            // Start building the query
            let query = supabase.from("products").select("*");

            // Server-side Category Filter
            if (selectedCategory && selectedCategory.toLowerCase() !== "all") {
                // We need the category ID. Since categories don't change often, 
                // we'll fetch them if we haven't already, or just use a join if supported.
                // For simplicity, we'll fetch categories first or use the local state if available.
                const { data: catData } = await supabase.from("categories").select("*");
                if (catData) {
                    setCategories(catData);
                    const catId = catData.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase())?.id;
                    if (catId) {
                        query = query.eq("category_id", catId);
                    }
                }
            } else {
                // Just fetch categories if not already fetched
                if (categories.length === 0) {
                    const { data: catData } = await supabase.from("categories").select("*");
                    setCategories(catData || []);
                }
            }

            // Server-side Search Filter
            if (searchQuery) {
                query = query.ilike("name", `%${searchQuery}%`);
            }

            const { data: prodData } = await query;
            const { data: imgData } = await supabase.from("product_images").select("*");

            setProducts(prodData || []);
            setImages(imgData || []);
            setLoading(false);
        }
        fetchData();
    }, [selectedCategory, searchQuery]);

    const updateCategory = (catName: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (catName === "All") newParams.delete("category");
        else newParams.set("category", catName);
        setSearchParams(newParams);
    };

    const updateSearch = (query: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (!query) newParams.delete("search");
        else newParams.set("search", query);
        setSearchParams(newParams);
    };

    const filteredProducts = products;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-24">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <FiFilter /> Filters
                            </h3>
                            {(selectedCategory !== "All" || searchQuery) && (
                                <button
                                    onClick={() => setSearchParams({})}
                                    className="text-xs text-red-500 hover:underline flex items-center"
                                >
                                    <FiX /> Clear
                                </button>
                            )}
                        </div>

                        {/* Search */}
                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => updateSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                            />
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        </div>

                        {/* Categories */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900 mb-2">Categories</h4>
                            <button
                                onClick={() => updateCategory("All")}
                                className={`block w-full text-left px-2 py-1 rounded ${selectedCategory === "All" ? "bg-pink-50 text-pink-600 font-medium" : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                All Categories
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => updateCategory(cat.name)}
                                    className={`block w-full text-left px-2 py-1 rounded ${selectedCategory.toLowerCase() === cat.name.toLowerCase()
                                        ? "bg-pink-50 text-pink-600 font-medium"
                                        : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-2xl font-bold">
                            {selectedCategory === "All" ? "All Products" : selectedCategory}
                        </h1>
                        <span className="text-gray-500">{filteredProducts.length} results</span>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Loading products...</div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((prod) => {
                                // Combine main image (if exists) with gallery images
                                const galleryImages = images
                                    .filter((img) => img.product_id === prod.id)
                                    .map((img) => img.image_url);

                                const allImages = [
                                    prod.image_url,
                                    ...galleryImages.filter(url => url !== prod.image_url)
                                ].filter(Boolean) as string[];

                                const finalImages = allImages.length > 0 ? allImages : ["/placeholder.png"];

                                return (
                                    <ProductCard
                                        key={prod.id}
                                        id={prod.id}
                                        name={prod.name}
                                        price={prod.price}
                                        discountPrice={prod.discount_price || undefined}
                                        images={finalImages}
                                        onOpenQuickView={(img) => {
                                            setSelectedProduct({
                                                id: prod.id,
                                                name: prod.name,
                                                price: prod.price,
                                                discountPrice: prod.discount_price || undefined,
                                                images: finalImages,
                                                initialImage: img
                                            });
                                            setIsQuickViewOpen(true);
                                        }}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 text-lg">No products found for "{searchQuery}".</p>
                            <button
                                onClick={() => setSearchParams({})}
                                className="mt-4 text-pink-500 hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <QuickView
                product={selectedProduct}
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
            />
        </div>
    );
}
