import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import {
    FiChevronLeft,
    FiMapPin,
    FiTruck,
    FiCreditCard,
    FiLock,
    FiShield,
    FiCheckCircle,
    FiChevronRight
} from "react-icons/fi";

type Step = "shipping" | "delivery" | "payment";

export default function Checkout() {
    const { items, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState<Step>("shipping");

    // Form States
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        address: "",
        city: "",
        postalCode: "",
        deliveryMethod: "standard",
        paymentMethod: "card",
        cardName: "",
        cardNumber: "",
        expiry: "",
        cvc: ""
    });

    const shippingFee = formData.deliveryMethod === "express" ? 15.00 : 0.00;
    const finalTotal = cartTotal + shippingFee;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = (next: Step) => {
        // Simple validation before moving
        if (currentStep === "shipping") {
            if (!formData.fullName || !formData.email || !formData.address) {
                toast.error("Please fill in all shipping details");
                return;
            }
        }
        setCurrentStep(next);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error("Please log in to complete your order");
            navigate("/login");
            return;
        }

        setLoading(true);

        try {
            // 1. Create the Order
            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .insert({
                    user_id: user.id,
                    full_name: formData.fullName,
                    email: formData.email,
                    address: formData.address,
                    city: formData.city,
                    postal_code: formData.postalCode,
                    delivery_method: formData.deliveryMethod,
                    payment_method: formData.paymentMethod,
                    total: finalTotal
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItems = items.map(item => ({
                order_id: orderData.id,
                product_id: item.id,
                quantity: item.quantity,
                price: item.price,
                image_url: item.image
            }));

            const { error: itemsError } = await supabase
                .from("order_items")
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Success!
            clearCart();
            toast.success("Order placed successfully!");
            navigate("/order-success");
        } catch (error: any) {
            console.error("Error placing order:", error);
            toast.error(error.message || "Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        useEffect(() => { navigate("/cart"); }, []);
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header/Back Link */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/cart")}
                        className="flex items-center text-gray-500 hover:text-pink-500 transition-colors font-medium gap-2"
                    >
                        <FiChevronLeft /> Back to Cart
                    </button>
                    <h1 className="text-4xl font-black text-gray-900 mt-4 tracking-tight">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Main Flow */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Step 1: Shipping */}
                        <div className={`bg-white rounded-3xl shadow-sm border ${currentStep === "shipping" ? "border-pink-200 ring-4 ring-pink-50" : "border-gray-100"}`}>
                            <div className="p-6 md:p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${currentStep === "shipping" ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-400"}`}>1</div>
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <FiMapPin className="text-pink-500" /> Shipping Address
                                        </h2>
                                    </div>
                                    {currentStep !== "shipping" && (
                                        <button onClick={() => setCurrentStep("shipping")} className="text-pink-500 font-bold text-sm hover:underline">Edit</button>
                                    )}
                                </div>

                                {currentStep === "shipping" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                                            <input name="fullName" value={formData.fullName} onChange={handleInputChange} required type="text" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" placeholder="John Doe" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                                            <input name="email" value={formData.email} onChange={handleInputChange} required type="email" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" placeholder="john@example.com" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Street Address</label>
                                            <input name="address" value={formData.address} onChange={handleInputChange} required type="text" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" placeholder="123 Main St, Apartment 4B" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">City</label>
                                            <input name="city" value={formData.city} onChange={handleInputChange} required type="text" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" placeholder="New York" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Postal Code</label>
                                            <input name="postalCode" value={formData.postalCode} onChange={handleInputChange} required type="text" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" placeholder="10001" />
                                        </div>
                                        <div className="md:col-span-2 pt-4">
                                            <button
                                                onClick={() => nextStep("delivery")}
                                                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all flex items-center justify-center gap-2 group"
                                            >
                                                Continue to Delivery <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm ml-14">{formData.fullName}, {formData.address}, {formData.city}</p>
                                )}
                            </div>
                        </div>

                        {/* Step 2: Delivery */}
                        <div className={`bg-white rounded-3xl shadow-sm border ${currentStep === "delivery" ? "border-pink-200 ring-4 ring-pink-50" : "border-gray-100"}`}>
                            <div className="p-6 md:p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${currentStep === "delivery" ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-400"}`}>2</div>
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <FiTruck className="text-pink-500" /> Delivery Method
                                        </h2>
                                    </div>
                                    {currentStep === "payment" && (
                                        <button onClick={() => setCurrentStep("delivery")} className="text-pink-500 font-bold text-sm hover:underline">Edit</button>
                                    )}
                                </div>

                                {currentStep === "delivery" && (
                                    <div className="space-y-4">
                                        <div
                                            onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'standard' }))}
                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${formData.deliveryMethod === 'standard' ? 'border-pink-500 bg-pink-50' : 'border-gray-100 hover:border-gray-200'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.deliveryMethod === 'standard' ? 'border-pink-500' : 'border-gray-300'}`}>
                                                    {formData.deliveryMethod === 'standard' && <div className="w-2.5 h-2.5 bg-pink-500 rounded-full" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">Standard Shipping</p>
                                                    <p className="text-xs text-gray-500">Delivered within 3-5 business days</p>
                                                </div>
                                            </div>
                                            <p className="font-black text-gray-900">FREE</p>
                                        </div>
                                        <div
                                            onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'express' }))}
                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${formData.deliveryMethod === 'express' ? 'border-pink-500 bg-pink-50' : 'border-gray-100 hover:border-gray-200'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.deliveryMethod === 'express' ? 'border-pink-500' : 'border-gray-300'}`}>
                                                    {formData.deliveryMethod === 'express' && <div className="w-2.5 h-2.5 bg-pink-500 rounded-full" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">Express Shipping</p>
                                                    <p className="text-xs text-gray-500">Delivered within 1-2 business days</p>
                                                </div>
                                            </div>
                                            <p className="font-black text-gray-900">$15.00</p>
                                        </div>
                                        <div className="pt-4">
                                            <button
                                                onClick={() => nextStep("payment")}
                                                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all flex items-center justify-center gap-2 group"
                                            >
                                                Continue to Payment <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {currentStep === "payment" && (
                                    <p className="text-gray-500 text-sm ml-14 capitalize">{formData.deliveryMethod} Shipping</p>
                                )}
                            </div>
                        </div>

                        {/* Step 3: Payment */}
                        <div className={`bg-white rounded-3xl shadow-sm border ${currentStep === "payment" ? "border-pink-200 ring-4 ring-pink-50" : "border-gray-100"}`}>
                            <div className="p-6 md:p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${currentStep === "payment" ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-400"}`}>3</div>
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <FiCreditCard className="text-pink-500" /> Payment Method
                                    </h2>
                                </div>

                                {currentStep === "payment" && (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Payment Selector */}
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { id: 'card', name: 'Card', icon: <FiCreditCard /> },
                                                { id: 'paypal', name: 'PayPal', icon: 'P' },
                                                { id: 'cod', name: 'Cash', icon: 'COD' }
                                            ].map(method => (
                                                <div
                                                    key={method.id}
                                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${formData.paymentMethod === method.id ? 'border-pink-500 bg-pink-50 text-pink-500' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                                >
                                                    <span className="text-xl font-black">{method.icon}</span>
                                                    <span className="text-[10px] uppercase font-black tracking-widest">{method.name}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {formData.paymentMethod === 'card' && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div>
                                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Cardholder Name</label>
                                                    <input name="cardName" value={formData.cardName} onChange={handleInputChange} required type="text" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none" placeholder="FULL NAME" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Card Number</label>
                                                    <div className="relative">
                                                        <input name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} required type="text" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none" placeholder="0000 0000 0000 0000" />
                                                        <FiLock className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Expiry</label>
                                                        <input name="expiry" value={formData.expiry} onChange={handleInputChange} required type="text" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none" placeholder="MM/YY" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">CVC</label>
                                                        <input name="cvc" value={formData.cvc} onChange={handleInputChange} required type="text" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none" placeholder="123" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {formData.paymentMethod === 'paypal' && (
                                            <div className="p-8 bg-blue-50 rounded-3xl text-center space-y-4 animate-in fade-in duration-300">
                                                <div className="text-4xl italic font-black text-blue-800">PayPal</div>
                                                <p className="text-sm text-blue-600">You will be redirected to PayPal to complete your purchase safely.</p>
                                            </div>
                                        )}

                                        {formData.paymentMethod === 'cod' && (
                                            <div className="p-8 bg-green-50 rounded-3xl text-center space-y-4 animate-in fade-in duration-300">
                                                <div className="text-4xl italic font-black text-green-800">Cash on Delivery</div>
                                                <p className="text-sm text-green-600">Pay with cash when your order reaches your doorstep.</p>
                                            </div>
                                        )}

                                        <button
                                            disabled={loading}
                                            className="w-full bg-pink-500 text-white py-5 rounded-2xl font-black text-xl hover:bg-pink-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-pink-100 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                                        >
                                            {loading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                                    Processing...
                                                </div>
                                            ) : (
                                                <>Secure Pay ${finalTotal.toFixed(2)}</>
                                            )}
                                        </button>

                                        <div className="flex items-center justify-center gap-6 pt-4 grayscale opacity-40">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="Paypal" />
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Column */}
                    <div className="lg:col-span-4 sticky top-24">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                <h2 className="text-lg font-black text-gray-900">Order Summary</h2>
                                <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">{items.length} Items</span>
                            </div>

                            <div className="p-6 max-h-[400px] overflow-y-auto scrollbar-hide space-y-6">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                                            <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                            <p className="text-sm font-black text-pink-500 mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-gray-50/50 space-y-3">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Shipping</span>
                                    <span className="font-bold text-gray-900">{shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Taxes</span>
                                    <span className="font-bold text-gray-900">$0.00</span>
                                </div>
                                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                    <span className="font-black text-gray-900 text-lg">Total</span>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-pink-600 leading-none">${finalTotal.toFixed(2)}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-1">Including VAT</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-pink-50/50 flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-pink-600">
                                    <FiShield className="shrink-0" />
                                    <p className="text-[10px] font-bold uppercase tracking-wider">Payments are 100% secure</p>
                                </div>
                                <div className="flex items-center gap-3 text-pink-600">
                                    <FiCheckCircle className="shrink-0" />
                                    <p className="text-[10px] font-bold uppercase tracking-wider">Hills Shop Genuine Guarantee</p>
                                </div>
                            </div>
                        </div>

                        {/* Promo Code Mock */}
                        <div className="mt-6 p-4 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-between group cursor-pointer hover:border-pink-300 transition-all">
                            <span className="text-gray-400 font-bold text-sm group-hover:text-pink-500">Have a promo code?</span>
                            <FiChevronRight className="text-gray-300 group-hover:text-pink-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
