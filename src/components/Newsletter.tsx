import { FiSend } from "react-icons/fi";
import toast from "react-hot-toast";

export default function Newsletter() {
    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Thank you for subscribing!");
    };

    return (
        <section className="bg-gray-900 rounded-3xl overflow-hidden my-16 relative">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/5 rounded-full translate-y-32 -translate-x-32 blur-3xl" />

            <div className="px-8 py-16 md:px-16 md:py-20 relative z-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="max-w-md">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                        Stay in the <span className="text-pink-500">Loop</span>
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Subscribe to our newsletter and get updates on new arrivals, exclusive offers and more.
                    </p>
                </div>

                <form onSubmit={handleSubscribe} className="w-full max-w-md">
                    <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 focus-within:ring-2 focus-within:ring-pink-500 transition-all">
                        <input
                            type="email"
                            required
                            placeholder="Enter your email address"
                            className="bg-transparent border-none flex-1 px-4 py-3 text-white placeholder:text-gray-500 outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-600 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-pink-500/20"
                        >
                            Subscribe
                            <FiSend />
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
