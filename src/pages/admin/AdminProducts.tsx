import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiFilter, FiList, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import toast from "react-hot-toast";
import ProductForm from "../../components/admin/ProductForm";

interface Product {
    id: string;
    name: string;
    price: number;
    category_id: string;
    stock_status?: string;
    quantity?: number;
    image_url: string | null;
}

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Filter & Sort State
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Dropdown UI State
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const PRODUCTS_PER_PAGE = 15;

    const filterRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    // Click outside to close menus
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowFilterMenu(false);
            }
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setShowSortMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchCategories = async () => {
        const { data } = await supabase.from("categories").select("id, name");
        setCategories(data || []);
    };

    const fetchProducts = async () => {
        setLoading(true);

        const from = (page - 1) * PRODUCTS_PER_PAGE;
        const to = from + PRODUCTS_PER_PAGE - 1;

        let query = supabase
            .from("products")
            .select("*", { count: "exact" });

        // Apply Search
        if (searchQuery) {
            query = query.ilike("name", `%${searchQuery}%`);
        }

        // Apply Category Filter
        if (selectedCategory !== "All") {
            query = query.eq("category_id", selectedCategory);
        }

        // Apply Sorting
        if (sortBy === "category") {
            query = query.order("category_id", { ascending: sortOrder === "asc" });
        } else {
            query = query.order(sortBy, { ascending: sortOrder === "asc" });
        }

        const { data, count, error } = await query.range(from, to);

        if (error) {
            toast.error("Failed to fetch products");
        } else {
            setProducts(data || []);
            setTotalCount(count || 0);
        }
        setLoading(false);
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to page 1 on search
            fetchProducts();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedCategory, sortBy, sortOrder]);

    // Fetch when page changes
    useEffect(() => {
        fetchProducts();
    }, [page]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        setProducts(products.filter(p => p.id !== id));
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) {
            toast.error("Failed to delete product");
            fetchProducts();
        } else {
            toast.success("Product deleted");
            if (products.length === 1 && page > 1) {
                setPage(prev => prev - 1);
            } else {
                fetchProducts();
            }
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleFormClose = (needsRefresh = false) => {
        setIsFormOpen(false);
        setEditingProduct(null);
        if (needsRefresh) fetchProducts();
    };

    const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-black transition-colors shadow-sm"
                >
                    <FiPlus /> Add Product
                </button>
            </div>

            {/* Controls: Search, Filter, Sort */}
            <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    />
                </div>

                <div className="flex gap-2">
                    {/* Category Filter Dropdown */}
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`p-2 border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 ${selectedCategory !== "All" ? "border-pink-500 text-pink-600 bg-pink-50" : "text-gray-600"}`}
                            title="Filter Category"
                        >
                            <FiFilter size={20} />
                            <span className="hidden md:inline text-sm font-medium">{selectedCategory === "All" ? "Filter" : categories.find(c => c.id === selectedCategory)?.name}</span>
                        </button>

                        {showFilterMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                                <div className="px-4 py-2 border-b border-gray-100 font-bold text-xs text-gray-400 uppercase tracking-wider">Category</div>
                                <button
                                    onClick={() => { setSelectedCategory("All"); setShowFilterMenu(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${selectedCategory === "All" ? "text-pink-600 font-bold" : "text-gray-700"}`}
                                >
                                    All Categories
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => { setSelectedCategory(cat.id); setShowFilterMenu(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${selectedCategory === cat.id ? "text-pink-600 font-bold" : "text-gray-700"}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative" ref={sortRef}>
                        <button
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            className="p-2 border rounded-lg hover:bg-gray-50 transition-colors text-gray-600 flex items-center gap-2"
                            title="Sort"
                        >
                            <FiList size={20} />
                            <span className="hidden md:inline text-sm font-medium">Sort</span>
                        </button>

                        {showSortMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                                <div className="px-4 py-2 border-b border-gray-100 font-bold text-xs text-gray-400 uppercase tracking-wider">Sort By</div>
                                {[
                                    { label: "Newest", value: "created_at" },
                                    { label: "Price", value: "price" },
                                    { label: "Name", value: "name" },
                                    { label: "Category", value: "category" }
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => { setSortBy(option.value); setShowSortMenu(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === option.value ? "text-pink-600 font-bold" : "text-gray-700"}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                                <div className="border-t border-gray-100 my-1"></div>
                                <div className="px-4 py-2 font-bold text-xs text-gray-400 uppercase tracking-wider">Order</div>
                                <button
                                    onClick={() => { setSortOrder("asc"); setShowSortMenu(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortOrder === "asc" ? "text-pink-600 font-bold" : "text-gray-700"}`}
                                >
                                    Ascending
                                </button>
                                <button
                                    onClick={() => { setSortOrder("desc"); setShowSortMenu(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortOrder === "desc" ? "text-pink-600 font-bold" : "text-gray-700"}`}
                                >
                                    Descending
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-900">Product</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Price</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Category</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading && !products.length ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No products match your filters.</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">Img</div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-900">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            ${product.price ? product.price.toFixed(2) : "0.00"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${product.stock_status === 'out_of_stock' || (product.quantity !== undefined && product.quantity <= 0)
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-green-100 text-green-700'
                                                }`}>
                                                {product.stock_status === 'out_of_stock' || (product.quantity !== undefined && product.quantity <= 0) ? 'Out of Stock' : 'In Stock'}
                                            </span>
                                            {product.quantity !== undefined && (
                                                <span className="ml-2 text-xs text-gray-500 font-medium">({product.quantity})</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                                {categories.find(c => c.id === product.category_id)?.name || "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-gray-500"
                    >
                        <FiChevronLeft />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                        // Logic to limit number of buttons displayed could be added here
                        // For simplicity in this fix, we render all
                        return (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-10 h-10 rounded-lg font-bold transition-all ${page === p
                                    ? "bg-pink-500 text-white shadow-md scale-105"
                                    : "bg-white border text-gray-700 hover:bg-gray-50 hover:text-pink-500"
                                    }`}
                            >
                                {p}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-gray-500"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            )}

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <ProductForm
                            product={editingProduct}
                            onClose={() => handleFormClose(false)}
                            onSuccess={() => handleFormClose(true)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
