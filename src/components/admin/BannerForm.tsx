import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { FiUpload, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

export default function BannerForm() {
    const [banners, setBanners] = useState<string[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);

    // Fetch banners from Supabase Storage
    const fetchBanners = async () => {
        const { data, error } = await supabase.storage
            .from("products")
            .list("banner", { limit: 50, sortBy: { column: "name", order: "asc" } });

        if (error) {
            toast.error("Error fetching banners");
            console.error(error);
            return;
        }

        const urls = data
            .filter((file) => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
            .map((file) =>
                supabase.storage.from("products").getPublicUrl(`banner/${file.name}`).data.publicUrl
            );

        setBanners(urls);
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    // Handle file selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Upload banner
    const handleUpload = async () => {
        if (!imageFile) return toast.error("No file selected");
        setLoading(true);

        try {
            const fileExt = imageFile.name.split(".").pop();
            const fileName = `${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("products")
                .upload(`banner/${fileName}`, imageFile, { cacheControl: "3600", upsert: false });

            if (uploadError) throw uploadError;

            toast.success("Banner uploaded!");
            setImageFile(null);
            setPreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchBanners();
        } catch (err: any) {
            console.error("Upload failed:", err);
            toast.error(err.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    // Delete banner
    const handleDelete = async (fileName: string) => {
        if (!confirm("Delete this banner?")) return;
        setLoading(true);

        try {
            const { error } = await supabase.storage.from("products").remove([`banner/${fileName}`]);
            if (error) throw error;
            toast.success("Banner deleted!");
            fetchBanners();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Delete failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Manage Banners</h2>

            {/* Upload Section */}
            <div className="flex gap-4 items-center mb-6">
                <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-64 h-32 object-cover mx-auto rounded-lg" />
                    ) : (
                        <div className="flex flex-col items-center">
                            <FiUpload className="text-gray-400 text-3xl mb-2" />
                            <p className="text-gray-500 text-sm">Click to select banner image</p>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleImageChange}
                    />
                </div>

                <button
                    onClick={handleUpload}
                    disabled={loading || !imageFile}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
                >
                    {loading ? "Uploading..." : "Upload"}
                </button>
            </div>

            {/* Banner List */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {banners.map((url) => {
                    const fileName = url.split("/").pop() || "";
                    return (
                        <div key={url} className="relative border rounded-lg overflow-hidden">
                            <img src={url} alt="Banner" className="w-full h-40 object-cover" />
                            <button
                                onClick={() => handleDelete(fileName)}
                                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded hover:bg-black"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
