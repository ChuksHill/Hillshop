import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { FiMail, FiCalendar, FiTrash2, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";

interface Subscriber {
    id: string;
    email: string;
    subscribed_at: string;
}

export default function AdminSubscribers() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("newsletter_subscriptions")
                .select("*")
                .order("subscribed_at", { ascending: false });

            if (error) {
                console.error("Supabase Fetch Error:", error);
                toast.error(`Failed to fetch subscribers: ${error.message}`);
                return;
            }
            setSubscribers(data || []);
        } catch (error: any) {
            toast.error("Failed to fetch subscribers");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this subscriber?")) return;

        try {
            const { error } = await supabase
                .from("newsletter_subscriptions")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Subscriber removed");
            setSubscribers(subscribers.filter(s => s.id !== id));
        } catch (error: any) {
            toast.error("Failed to delete subscriber");
            console.error(error);
        }
    };

    const filteredSubscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
                <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-bold">
                    {subscribers.length} Total
                </span>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl border shadow-sm">
                <div className="relative w-full max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-900">Email</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Subscribed On</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-gray-600">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500 italic">Loading subscribers...</td>
                                </tr>
                            ) : filteredSubscribers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500 italic">No subscribers found.</td>
                                </tr>
                            ) : (
                                filteredSubscribers.map((subscriber) => (
                                    <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
                                                    <FiMail size={14} />
                                                </div>
                                                <span className="font-medium text-gray-900">{subscriber.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FiCalendar className="text-gray-400" />
                                                {new Date(subscriber.subscribed_at).toLocaleDateString("en-US", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(subscriber.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
