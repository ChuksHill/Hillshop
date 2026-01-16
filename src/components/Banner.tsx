import { useEffect, useState } from "react";

import banner1 from "../assets/images/Banner/banner-1.jpg";
import banner2 from "../assets/images/Banner/banner-2.jpg";
import banner3 from "../assets/images/Banner/banner-3.jpg";

const images = [banner1, banner2, banner3];

export default function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative w-full h-[70vh] min-h-[420px] transition-all duration-700 bg-cover bg-center"
      style={{
        backgroundImage: `url(${images[currentIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "50% 20%"
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 flex items-center">
        <div className="text-center md:text-left max-w-xl text-white">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Welcome to Hillshop
          </h1>

          <p className="mb-6 text-base sm:text-lg leading-relaxed">
            Discover the best products at amazing prices. Fast delivery,
            easy returns, and top-notch quality.
          </p>

          <button className="bg-pink-500 px-6 py-3 rounded-lg hover:bg-pink-600 transition font-medium">
            Shop Now
          </button>
        </div>
      </div>
    </section>
  );
}
