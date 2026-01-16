import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Checkout() {
    const { items, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate payment delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        clearCart();
        toast.success("Order placed successfully!");
        navigate("/order-success");
        setLoading(false);
    };

    if (items.length === 0) {
        navigate("/cart");
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Form */}
                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">

                    {/* Shipping Info */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Shipping Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input required type="text" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 outline-none" placeholder="John Doe" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input required type="email" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 outline-none" placeholder="john@example.com" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input required type="text" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 outline-none" placeholder="123 Main St" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input required type="text" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Los Angeles" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                <input required type="text" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 outline-none" placeholder="90001" />
                            </div>
                        </div>
                    </section>

                    {/* Payment Info */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment Details</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                <input required type="text" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 outline-none" placeholder="0000 0000 0000 0000" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input required type="text" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 outline-none" placeholder="MM/YY" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                    <input required type="text" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 outline-none" placeholder="123" />
                                </div>
                            </div>
                        </div>
                    </section>

                </form>

                {/* Order Summary */}
                <div>
                    <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
                        <h2 className="text-lg font-bold mb-4">Your Order</h2>
                        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4 flex justify-between font-bold text-lg mb-6">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>

                        <button
                            form="checkout-form"
                            disabled={loading}
                            className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Processing..." : `Pay $${cartTotal.toFixed(2)}`}
                        </button>

                        <p className="text-xs text-center text-gray-500 mt-4">
                            Secure Payment powered by MockPay™
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
