import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from "react-icons/fi";

const Cart = () => {
    const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-8 text-pink-500 shadow-inner">
                    <FiShoppingBag size={48} />
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Your Cart is Empty</h1>
                <p className="text-gray-500 mb-10 max-w-md mx-auto text-lg">Looks like you haven't added anything yet. Discover our latest collection and find something you love.</p>
                <Link
                    to="/shop"
                    className="group inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-black transition-all shadow-2xl shadow-gray-200 active:scale-95"
                >
                    Start Shopping
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
            <h1 className="text-4xl font-black text-gray-900 mb-12 tracking-tight">Your Shopping Bag</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                    {items.map((item) => (
                        <div key={item.id} className="group flex gap-6 sm:gap-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 relative overflow-hidden">
                            {/* Subtle background accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50/30 rounded-full -translate-y-16 translate-x-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                            <img
                                src={item.image || "/placeholder.png"}
                                alt={item.name}
                                className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-2xl bg-gray-50 shadow-sm transition-transform duration-500 group-hover:scale-105"
                            />

                            <div className="flex-1 flex flex-col justify-between py-2">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-black text-xl text-gray-900 leading-tight mb-2">{item.name}</h3>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-2 -mr-2"
                                            title="Remove Item"
                                        >
                                            <FiTrash2 size={20} />
                                        </button>
                                    </div>
                                    <p className="text-pink-600 font-black text-lg">${item.price.toFixed(2)}</p>
                                </div>

                                <div className="flex items-center justify-between mt-6">
                                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all text-gray-400 hover:text-gray-900"
                                        >
                                            <FiMinus size={16} />
                                        </button>
                                        <span className="w-12 text-center font-black text-gray-900">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all text-gray-400 hover:text-gray-900"
                                        >
                                            <FiPlus size={16} />
                                        </button>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-xs text-gray-400 uppercase font-black tracking-widest block mb-1">Subtotal</span>
                                        <span className="font-black text-gray-900 text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-start">
                        <button
                            onClick={clearCart}
                            className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2"
                        >
                            <FiTrash2 /> Clear Bag
                        </button>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1 animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-gray-100 border border-gray-50 sticky top-32">
                        <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Order Summary</h2>

                        <div className="space-y-5 text-sm mb-8">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                                <span className="font-black text-gray-900 text-lg">${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Shipping</span>
                                <span className="text-green-500 font-bold tracking-widest text-[10px]">FREE</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Tax Estimate</span>
                                <span className="font-black text-gray-900">$0.00</span>
                            </div>
                        </div>

                        <div className="h-[1px] bg-gray-50 w-full mb-8" />

                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Grand Total</span>
                                <p className="text-3xl font-black text-gray-900 tracking-tighter">${cartTotal.toFixed(2)}</p>
                            </div>
                        </div>

                        <Link
                            to="/checkout"
                            className="group block w-full text-center bg-pink-500 text-white py-5 rounded-2xl font-black text-lg hover:bg-pink-600 transition-all shadow-xl shadow-pink-500/20 active:scale-[0.98] relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Checkout Now
                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>

                        <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale saturate-0">
                            <img src="/images/footer/footer-payment.png" className="h-6" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
