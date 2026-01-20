import { FiTruck, FiShield, FiRotateCcw, FiAward } from "react-icons/fi";

export default function FeaturesBar() {
    const features = [
        {
            icon: <FiTruck className="text-pink-500" size={24} />,
            title: "Free Delivery",
            desc: "On all orders over $50",
        },
        {
            icon: <FiShield className="text-pink-500" size={24} />,
            title: "Secure Payment",
            desc: "100% secure checkout",
        },
        {
            icon: <FiRotateCcw className="text-pink-500" size={24} />,
            title: "Free Returns",
            desc: "30-day money back",
        },
        {
            icon: <FiAward className="text-pink-500" size={24} />,
            title: "Official Stores",
            desc: "100% Genuine products",
        },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 my-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4 group transition-transform hover:translate-y-[-2px]">
                        <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            {feature.icon}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm tracking-tight">{feature.title}</h4>
                            <p className="text-xs text-gray-500">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
