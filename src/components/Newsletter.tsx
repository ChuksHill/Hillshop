import { useState } from "react";
import { FiSend, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";

export default function Newsletter() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from("newsletter_subscriptions")
                .insert([{ email }]);

            if (error) {
                console.error("Supabase Insert Error:", error);
                if (error.code === "23505") {
                    toast.error("You're already subscribed!");
                } else {
                    toast.error(`Subscription failed: ${error.message}`);
                }
            } else {
                console.log("Subscription successful!");
                toast.success("Thank you for subscribing!");
                setEmail("");
            }
        } catch (error: any) {
            console.error("Subscription error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-gray-900 rounded-3xl overflow-hidden my-16 relative">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/5 rounded-full translate-y-32 -translate-x-32 blur-3xl" />

            <div className="px-6 py-10 md:px-16 md:py-20 relative z-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                <div className="max-w-md">
                    <h2 className="text-2xl md:text-4xl font-black text-white mb-3 tracking-tight">
                        Stay in the <span className="text-pink-500">Loop</span>
                    </h2>
                    <p className="text-gray-400 text-base md:text-lg">
                        Subscribe to our newsletter and get updates on new arrivals, exclusive offers and more.
                    </p>
                </div>

                <form onSubmit={handleSubscribe} className="w-full max-w-md">
                    <div className="flex flex-col xs:flex-row bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 focus-within:ring-2 focus-within:ring-pink-500 transition-all">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email"
                            className="bg-transparent border-none flex-1 px-4 py-3 text-white placeholder:text-gray-500 outline-none text-sm"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-pink-500 text-white px-6 md:px-8 py-3 rounded-xl font-bold hover:bg-pink-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2 xs:mt-0"
                        >
                            {loading ? (
                                <FiLoader className="animate-spin" />
                            ) : (
                                <>
                                    Subscribe
                                    <FiSend />
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-4 text-center md:text-left tracking-wider uppercase font-bold">
                        We respect your privacy. Unsubscribe at any time.
                    </p>
                </form>
            </div>
        </section>
    );
}
