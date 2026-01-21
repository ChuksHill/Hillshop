import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const navigate = useNavigate();
    const { resetPassword } = useAuth();

    const handleForgotPassword = async () => {
        if (!email) {
            setError("Please enter your email address first.");
            return;
        }
        setLoading(true);
        const { error } = await resetPassword(email);
        setLoading(false);
        if (error) {
            setError(error.message);
        } else {
            toast.success("Password reset email sent!");
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) {
                    // Handle specific error cases
                    if (error.message.includes("already registered")) {
                        throw new Error("This email is already registered. Please sign in instead.");
                    }
                    throw error;
                }

                // Check if email confirmation is required
                if (data.user && !data.session) {
                    toast.success("Account created! Check your email for confirmation (or check spam folder).");
                } else {
                    toast.success("Account created successfully! You're now signed in.");
                    navigate("/");
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) {
                    if (error.message.includes("Invalid login credentials")) {
                        throw new Error("Invalid email or password. Please try again.");
                    }
                    throw error;
                }
                toast.success("Welcome back!");
                navigate("/");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12 pt-28 overflow-hidden">
            {/* Logo / Branding */}
            <div className="mb-8 text-center">
                <Link to="/" className="flex items-center gap-1 justify-center scale-125">
                    <span className="text-3xl font-bold text-pink-500 tracking-tight">
                        hills
                    </span>
                    <span className="text-sm tracking-[0.25em] font-medium pt-1">
                        Shop
                    </span>
                </Link>
            </div>

            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {isSignUp ? "Create your account" : "Sign in to your account"}
                </h2>
                <p className="text-sm text-gray-500 mb-8">
                    {isSignUp ? "Join Hills Shop for the best experience." : "Welcome back! Please enter your details."}
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all placeholder:text-gray-400"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all placeholder:text-gray-400 pr-12"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors focus:outline-none"
                            >
                                {showPassword ? <FiEyeOff size={22} /> : <FiEye size={22} />}
                            </button>
                        </div>
                    </div>

                    {!isSignUp && (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm font-medium text-pink-500 hover:text-pink-600 transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 text-white py-3.5 rounded-xl hover:bg-black transition-all disabled:opacity-50 font-bold shadow-lg shadow-gray-200"
                    >
                        {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white text-gray-400 font-medium">Or continue with</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-sm active:scale-[0.98]"
                    >
                        <FcGoogle size={24} />
                        Continue with Google
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-gray-600 text-sm">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-pink-500 font-bold hover:underline"
                        >
                            {isSignUp ? "Sign In" : "Sign Up"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
