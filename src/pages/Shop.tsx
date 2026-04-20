import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "../components/ProductCard";
import { FiSearch, FiX, FiChevronLeft, FiChevronRight, FiSliders } from "react-icons/fi";
import { formatNaira } from "../lib/currency";

interface Product {
    id: string;
    name: string;
    price: number;
    price_id?: string;
    discount_price: number | null;
    category_id: string;
    image_url: string | null;
    stock_status?: string;
    quantity?: number;
}

interface ProductImage {
    product_id: string;
    image_url: string;
}

interface Category {
    id: string;
    name: string;
}

const ITEMS_PER_PAGE = 9;

const SORT_OPTIONS = [
    { value: "newest", label: "Newest Arrivals" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A to Z" },
];

export default function Shop() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [images, setImages] = useState<ProductImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [minPriceInput, setMinPriceInput] = useState("");
    const [maxPriceInput, setMaxPriceInput] = useState("");

    const selectedCategory = searchParams.get("category") || "All";
    const searchQuery = searchParams.get("search") || "";
    const sortBy = searchParams.get("sort") || "newest";
    const minPrice = searchParams.get("min_price") || "";
    const maxPrice = searchParams.get("max_price") || "";
    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    useEffect(() => {
        setMinPriceInput(minPrice);
        setMaxPriceInput(maxPrice);
    }, [minPrice, maxPrice]);

    const fetchData = useCallback(async () => {
        setLoading(true);

        const { data: catData } = await supabase.from("categories").select("*");
        if (catData) {
            setCategories(catData);
        }

        let query = supabase.from("products").select("*", { count: "exact" });

        if (selectedCategory && selectedCategory.toLowerCase() !== "all" && catData) {
            const catId = catData.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase())?.id;
            if (catId) {
                query = query.eq("category_id", catId);
            }
        }

        if (searchQuery) {
            query = query.ilike("name", `%${searchQuery}%`);
        }

        if (minPrice) {
            query = query.gte("price", parseFloat(minPrice));
        }
        if (maxPrice) {
            query = query.lte("price", parseFloat(maxPrice));
        }

        switch (sortBy) {
            case "price_asc":
                query = query.order("price", { ascending: true });
                break;
            case "price_desc":
                query = query.order("price", { ascending: false });
                break;
            case "name_asc":
                query = query.order("name", { ascending: true });
                break;
            default:
                query = query.order("created_at", { ascending: false });
        }

        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to);

        const { data: prodData, count } = await query;
        const { data: imgData } = await supabase.from("product_images").select("*");

        setProducts(prodData || []);
        setImages(imgData || []);
        setTotalCount(count || 0);
        setLoading(false);
    }, [selectedCategory, searchQuery, sortBy, minPrice, maxPrice, currentPage]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateParam = (key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (!value || value === "All") {
            newParams.delete(key);
        } else {
            newParams.set(key, value);
        }
        newParams.delete("page");
        setSearchParams(newParams);
    };

    const updateCategory = (catName: string) => updateParam("category", catName);
    const updateSearch = (query: string) => updateParam("search", query);
    const updateSort = (sort: string) => updateParam("sort", sort);

    const applyPriceRange = () => {
        const newParams = new URLSearchParams(searchParams);
        if (minPriceInput) {
            newParams.set("min_price", minPriceInput);
        } else {
            newParams.delete("min_price");
        }
        if (maxPriceInput) {
            newParams.set("max_price", maxPriceInput);
        } else {
            newParams.delete("max_price");
        }
        newParams.delete("page");
        setSearchParams(newParams);
        setMobileFiltersOpen(false);
    };

    const clearAll = () => {
        setMinPriceInput("");
        setMaxPriceInput("");
        setSearchParams({});
    };

    const goToPage = (page: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", page.toString());
        setSearchParams(newParams);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const hasActiveFilters = selectedCategory !== "All" || searchQuery || minPrice || maxPrice;
    const minPriceLabel = formatNaira(Number(minPrice || 0));
    const maxPriceLabel = maxPrice ? formatNaira(Number(maxPrice)) : "No max";

    const FilterPanel = () => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 sticky top-24">
            <div className="flex justify-between items-center">
                <h3 className="font-black text-gray-900 flex items-center gap-2">
                    <FiSliders className="text-pink-500" /> Filters
                </h3>
                {hasActiveFilters && (
                    <button onClick={clearAll} className="text-xs text-red-500 hover:underline flex items-center gap-1 font-bold">
                        <FiX size={12} /> Clear All
                    </button>
                )}
            </div>

            <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Search</label>
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => updateSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Category</label>
                <div className="space-y-1">
                    <button
                        onClick={() => updateCategory("All")}
                        className={`block w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${selectedCategory === "All"
                            ? "bg-pink-50 text-pink-600 font-black"
                            : "text-gray-600 hover:bg-gray-50 font-medium"}`}
                    >
                        All Categories
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => updateCategory(cat.name)}
                            className={`block w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${selectedCategory.toLowerCase() === cat.name.toLowerCase()
                                ? "bg-pink-50 text-pink-600 font-black"
                                : "text-gray-600 hover:bg-gray-50 font-medium"}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Price Range</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                        min={0}
                    />
                    <span className="text-gray-400 font-bold text-sm">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                        min={0}
                    />
                </div>
                <button
                    onClick={applyPriceRange}
                    className="mt-3 w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-black hover:bg-black transition-all"
                >
                    Apply
                </button>
                {(minPrice || maxPrice) && (
                    <p className="text-xs text-pink-500 font-bold mt-2 text-center">
                        Active: {minPriceLabel} - {maxPriceLabel}
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
            <div className="flex items-center justify-between mb-6 md:hidden">
                <h1 className="text-2xl font-black text-gray-900">
                    {selectedCategory === "All" ? "All Products" : selectedCategory}
                </h1>
                <button
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold"
                >
                    <FiSliders /> Filters
                    {hasActiveFilters && <span className="bg-pink-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">!</span>}
                </button>
            </div>

            {mobileFiltersOpen && (
                <div className="md:hidden mb-6 border border-gray-100 rounded-2xl overflow-hidden">
                    <FilterPanel />
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-8">
                <aside className="hidden md:block w-64 flex-shrink-0">
                    <FilterPanel />
                </aside>

                <div className="flex-1 min-w-0">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="hidden md:block text-2xl font-black text-gray-900">
                                {selectedCategory === "All" ? "All Products" : selectedCategory}
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {loading ? "Loading..." : `${totalCount} result${totalCount !== 1 ? "s" : ""}`}
                                {currentPage > 1 && ` - Page ${currentPage} of ${totalPages}`}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Sort by</label>
                            <select
                                value={sortBy}
                                onChange={(e) => updateSort(e.target.value)}
                                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-pink-500 outline-none cursor-pointer"
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 mb-5">
                            {selectedCategory !== "All" && (
                                <span className="flex items-center gap-1.5 bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-bold">
                                    {selectedCategory}
                                    <button onClick={() => updateCategory("All")}><FiX size={12} /></button>
                                </span>
                            )}
                            {searchQuery && (
                                <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold">
                                    "{searchQuery}"
                                    <button onClick={() => updateSearch("")}><FiX size={12} /></button>
                                </span>
                            )}
                            {(minPrice || maxPrice) && (
                                <span className="flex items-center gap-1.5 bg-green-50 text-green-600 border border-green-100 px-3 py-1 rounded-full text-xs font-bold">
                                    {minPriceLabel} - {maxPriceLabel}
                                    <button onClick={() => {
                                        setMinPriceInput("");
                                        setMaxPriceInput("");
                                        const p = new URLSearchParams(searchParams);
                                        p.delete("min_price");
                                        p.delete("max_price");
                                        setSearchParams(p);
                                    }}><FiX size={12} /></button>
                                </span>
                            )}
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="aspect-[3/4] bg-gray-100 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((prod) => {
                                const galleryImages = images
                                    .filter((img) => img.product_id === prod.id)
                                    .map((img) => img.image_url);
                                const allImages = [
                                    prod.image_url,
                                    ...galleryImages.filter(url => url !== prod.image_url),
                                ].filter(Boolean) as string[];
                                const finalImages = allImages.length > 0 ? allImages : ["/placeholder.png"];

                                return (
                                    <ProductCard
                                        key={prod.id}
                                        id={prod.id}
                                        name={prod.name}
                                        price={prod.price}
                                        priceId={prod.price_id}
                                        discountPrice={prod.discount_price || undefined}
                                        images={finalImages}
                                        stockStatus={prod.stock_status}
                                        quantity={prod.quantity}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-600 font-bold text-lg mb-2">No products found</p>
                            <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search term</p>
                            <button
                                onClick={clearAll}
                                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}

                    {totalPages > 1 && !loading && (
                        <div className="mt-12 flex items-center justify-center gap-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-pink-300 hover:text-pink-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <FiChevronLeft />
                            </button>

                            {[...Array(totalPages)].map((_, i) => {
                                const page = i + 1;
                                const isActive = page === currentPage;
                                const showPage = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                                const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                                const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

                                if (showEllipsisBefore || showEllipsisAfter) {
                                    return <span key={page} className="text-gray-400 px-1">...</span>;
                                }

                                if (!showPage) {
                                    return null;
                                }

                                return (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black transition-all ${
                                            isActive
                                                ? "bg-pink-500 text-white shadow-lg shadow-pink-100"
                                                : "bg-white border border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-500"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-pink-300 hover:text-pink-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <FiChevronRight />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
