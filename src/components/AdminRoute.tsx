import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
    const { user, isAdmin, loading } = useAuth();

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    if (!user || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
