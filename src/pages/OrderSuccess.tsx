import { Link } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";

export default function OrderSuccess() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="text-green-500 mb-6">
                <FiCheckCircle size={80} />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Thank You for Your Order!</h1>
            <p className="text-gray-600 mb-8 max-w-md">
                Your order has been placed successfully. You will receive an email confirmation shortly.
            </p>

            <div className="space-x-4">
                <Link
                    to="/"
                    className="inline-block bg-pink-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-pink-600 transition"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}
