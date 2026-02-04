import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const navigate = useNavigate();

    // For now, redirect to products management as it's the main feature
    useEffect(() => {
        navigate("/admin/products");
    }, [navigate]);

    return (
        <div className="p-10 text-center text-gray-500">
            Redirecting to Products...
        </div>
    );
}
