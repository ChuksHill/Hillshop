import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { FiUpload, FiX, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";

interface Product {
    id: string;
    name: string;
    price: number;
    description?: string;
    category_id: string;
    image_url: string | null;
    stock_status?: string;
    quantity?: number;
    discount_price?: number;
}

interface Category {
    id: string;
    name: string;
}

interface ProductFormProps {
    product?: Product | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [discountPrice, setDiscountPrice] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [stockStatus, setStockStatus] = useState("in_stock");
    const [quantity, setQuantity] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Using ref to clear file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Fetch categories
        const fetchCategories = async () => {
            const { data } = await supabase.from("categories").select("*");
            if (data) setCategories(data);
        };
        fetchCategories();

        // Populate form if editing
        if (product) {
            setName(product.name);
            setPrice(product.price.toString());
            setDiscountPrice(product.discount_price ? product.discount_price.toString() : "");
            setCategoryId(product.category_id);
            setStockStatus(product.stock_status || "in_stock");
            // Safely handle 0, null, or undefined
            const initialQty = product.quantity !== undefined && product.quantity !== null ? product.quantity : "";
            setQuantity(initialQty.toString());
            setDescription(product.description || "");
            setPreviewUrl(product.image_url);
        }
    }, [product]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = product?.image_url || null;

            // 1. Upload Image if selected
            if (imageFile) {
                const fileExt = imageFile.name.split(".").pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from("products") // Assumes 'products' bucket exists
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from("products")
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            // 2. Insert or Update Product
            const qtyToSend = quantity && !isNaN(parseInt(quantity)) ? parseInt(quantity) : 0;

            const productData = {
                name,
                price: parseFloat(price),
                discount_price: discountPrice ? parseFloat(discountPrice) : null,
                category_id: categoryId,
                stock_status: stockStatus,
                quantity: qtyToSend,
                description,
                image_url: imageUrl,
            };

            let error;
            let resultId = product?.id;

            if (product) {
                // Update
                const { error: updateError } = await supabase
                    .from("products")
                    .update(productData)
                    .eq("id", product.id);
                error = updateError;
            } else {
                // Insert
                const { data: insertData, error: insertError } = await supabase
                    .from("products")
                    .insert([productData])
                    .select()
                    .single();

                if (insertData) resultId = insertData.id;
                error = insertError;
            }

            if (error) throw error;

            // VERIFICATION STEP
            if (resultId) {
                const { data: verifyData } = await supabase
                    .from("products")
                    .select("quantity")
                    .eq("id", resultId)
                    .single();

                if (verifyData && verifyData.quantity !== qtyToSend) {
                    toast.error(`Warning: Access saved but Quantity did not persist. DB says: ${verifyData.quantity}`);
                    console.error("Mismatch:", { sent: qtyToSend, received: verifyData.quantity });
                } else {
                    toast.success(product ? "Product updated!" : "Product created!");
                }
            } else {
                toast.success(product ? "Product updated!" : "Product created!");
            }

            onSuccess();
        } catch (err: any) {
            console.error("Error saving product:", err);
            toast.error(err.message || "Failed to save product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-heading">
                    {product ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <FiX size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Image & Basic Info */}
                    <div className="space-y-6">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {previewUrl ? (
                                    <div className="relative aspect-square w-full max-w-[200px] mx-auto overflow-hidden rounded-lg">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">Change</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8">
                                        <FiUpload className="mx-auto text-gray-400 text-3xl mb-2" />
                                        <p className="text-sm text-gray-500">Click to upload image</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                                required
                            >
                                <option value="" disabled>Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                placeholder="e.g. Summer Floral Dress"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={discountPrice}
                                    onChange={(e) => setDiscountPrice(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none resize-none"
                                placeholder="Product details..."
                            />
                        </div>

                        {/* Stock Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                            <select
                                value={stockStatus}
                                onChange={(e) => {
                                    const newStatus = e.target.value;
                                    setStockStatus(newStatus);
                                    if (newStatus === "out_of_stock") {
                                        setQuantity("0");
                                    }
                                }}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                            >
                                <option value="in_stock">In Stock</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                                type="number"
                                min="0"
                                value={quantity}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || parseInt(val) >= 0) {
                                        setQuantity(val);
                                        if (parseInt(val) > 0) {
                                            setStockStatus("in_stock");
                                        } else if (parseInt(val) === 0) {
                                            setStockStatus("out_of_stock");
                                        }
                                    }
                                }}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="mr-3 px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : <><FiSave /> Save Product</>}
                    </button>
                </div>
            </form >
        </div >
    );
}
