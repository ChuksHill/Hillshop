import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { clearPendingPaystackOrder, getPendingPaystackOrder } from "../lib/paystackCheckout";

type CompletionState = "idle" | "processing" | "success" | "error";

export default function OrderSuccess() {
    const { clearCart } = useCart();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [completionState, setCompletionState] = useState<CompletionState>("idle");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const reference = searchParams.get("reference") || searchParams.get("trxref");
        const pendingOrder = getPendingPaystackOrder();

        if (!reference || !pendingOrder) {
            return;
        }

        if (!user) {
            setCompletionState("error");
            setErrorMessage("Please log in again before we finish your paid order.");
            return;
        }

        let cancelled = false;

        const finalizeCardOrder = async () => {
            setCompletionState("processing");

            try {
                const userPayload = { id: user.id, email: user.email };
                const { error: profilesError } = await supabase.from("profiles").upsert(userPayload, { onConflict: "id" });

                if (profilesError) {
                    console.error("Failed to upsert to 'profiles' table:", profilesError);
                }

                const orderItems = pendingOrder.items.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price_id: item.price_id,
                }));

                const { data, error: rpcError } = await supabase.rpc("handle_place_order", {
                    p_full_name: pendingOrder.formData.fullName,
                    p_email: pendingOrder.formData.email,
                    p_address: pendingOrder.formData.address,
                    p_city: pendingOrder.formData.city,
                    p_postal_code: pendingOrder.formData.postalCode,
                    p_delivery_method: pendingOrder.formData.deliveryMethod,
                    p_payment_method: "card",
                    p_items: orderItems,
                });

                if (rpcError) {
                    throw rpcError;
                }

                if (data && data.success === false) {
                    throw new Error(data.error || "Failed to place order");
                }

                const orderId = data?.order_id || data?.id || reference;
                supabase.functions.invoke("send-order-email", {
                    body: {
                        to: pendingOrder.formData.email,
                        customer_name: pendingOrder.formData.fullName,
                        order_id: orderId,
                        items: pendingOrder.items.map(item => ({
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                        total: pendingOrder.finalTotal,
                        delivery_method: pendingOrder.formData.deliveryMethod,
                        address: pendingOrder.formData.address,
                        city: pendingOrder.formData.city,
                    },
                }).then(({ error: emailError }) => {
                    if (emailError) {
                        console.warn("Email notification failed (non-critical):", emailError);
                    }
                });

                if (!cancelled) {
                    clearPendingPaystackOrder();
                    clearCart();
                    setCompletionState("success");
                }
            } catch (error: any) {
                console.error("Error finalizing paid order:", error);
                if (!cancelled) {
                    setCompletionState("error");
                    setErrorMessage(error.message || "We received your payment, but couldn't finish the order automatically.");
                }
            }
        };

        void finalizeCardOrder();

        return () => {
            cancelled = true;
        };
    }, [clearCart, searchParams, user]);

    const title = completionState === "processing"
        ? "Finalizing Your Order"
        : completionState === "error"
            ? "We Need One More Step"
            : "Thank You for Your Order!";

    const description = completionState === "processing"
        ? "Your payment went through. We're finishing the order details now."
        : completionState === "error"
            ? errorMessage || "Please return to checkout and contact support if the issue continues."
            : "Your order has been placed successfully. You will receive an email confirmation shortly.";

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
            <div className={`mb-6 ${completionState === "error" ? "text-amber-500" : "text-green-500"}`}>
                {completionState === "error" ? <FiAlertCircle size={80} /> : <FiCheckCircle size={80} />}
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">{title}</h1>
            <p className="text-gray-600 mb-8 max-w-md">
                {description}
            </p>

            <div className="space-x-4">
                {completionState === "error" && (
                    <Link
                        to="/checkout"
                        className="inline-block border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                        Back to Checkout
                    </Link>
                )}
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
