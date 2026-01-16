import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FiPackage, FiLogOut, FiUser } from "react-icons/fi";

export default function Profile() {
    const { user, signOut } = useAuth();

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <p className="text-gray-500 mb-4">You are not logged in.</p>
                <Link to="/login" className="bg-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-600">
                    Sign In
                </Link>
            </div>
        );
    }

    // Mock Orders
    const orders = [
        { id: "ORD-7782", date: "Jan 12, 2024", total: 124.50, status: "Delivered" },
        { id: "ORD-9921", date: "Jan 03, 2024", total: 45.00, status: "Processing" },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-12">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <FiUser /> My Account
                </h1>
                <button
                    onClick={signOut}
                    className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition"
                >
                    <FiLogOut /> Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* User Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm border h-fit">
                    <h2 className="font-bold text-lg mb-4">Profile Details</h2>
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className="block text-gray-500">Email</span>
                            <span className="font-medium">{user.email}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500">Member Since</span>
                            <span className="font-medium">{new Date(user.created_at || "").toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Order History */}
                <div className="md:col-span-2">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <FiPackage /> Order History
                    </h2>

                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white p-4 rounded-lg border flex justify-between items-center hover:shadow-md transition">
                                <div>
                                    <p className="font-bold text-gray-900">{order.id}</p>
                                    <p className="text-xs text-gray-500">{order.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-pink-500">${order.total.toFixed(2)}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === "Delivered" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
