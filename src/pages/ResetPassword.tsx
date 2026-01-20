import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { updatePassword } = useAuth();
    const navigate = useNavigate();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        const { error } = await updatePassword(password);
        setLoading(false);

        if (error) {
            setError(error.message);
        } else {
            toast.success("Password updated successfully!");
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12 pt-28 overflow-hidden">
            {/* Logo */}
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

            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-500">
                <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                    Reset Password
                </h2>
                <p className="text-sm text-gray-500 mb-8">
                    Enter your new secure password below to regain access.
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                            <FiLock className="text-pink-500" /> New Password
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

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                            <FiLock className="text-pink-500" /> Confirm New Password
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all placeholder:text-gray-400"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl hover:bg-black transition-all disabled:opacity-50 font-black shadow-2xl shadow-gray-200 active:scale-[0.98]"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>

                    <div className="text-center mt-6">
                        <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-pink-500 transition-colors">
                            Return to Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
