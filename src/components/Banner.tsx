import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Banner() {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch banners from Supabase Storage
  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase.storage
        .from("products")
        .list("banner", {
          limit: 10,
          sortBy: { column: "name", order: "asc" },
        });

      if (error) {
        console.error("Error fetching banners:", error);
        return;
      }

      if (!data || data.length === 0) return;

      const bannerUrls = data
        .filter((file) => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
        .map((file) =>
          supabase.storage
            .from("products")
            .getPublicUrl(`banner/${file.name}`).data.publicUrl
        );

      setImages(bannerUrls);
    };

    fetchBanners();
  }, []);

  // Auto slide
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images]);

  if (!images.length) return null;

  return (
    <section className="relative w-full bg-gray-100">
      {/* Main banner with moderate height */}
      <div
        className="relative w-full h-[35vh] sm:h-[40vh] md:h-[45vh] lg:h-[50vh] 
                   transition-all duration-700 bg-cover bg-center"
        style={{
          backgroundImage: `url(${images[currentIndex]})`,
        }}
      >
        {/* Subtle overlay - much lighter than before */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Content positioned to match your screenshot */}
        <div className="relative z-10 h-full">
          <div className="container mx-auto h-full px-4 sm:px-6 lg:px-8">
            <div className="h-full flex flex-col justify-center">
              {/* Content container matching your design */}
              <div className="max-w-xl">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-white">
                  Welcome to Hills Shop
                </h1>

                <p className="mb-4 md:mb-6 text-white/90 text-sm sm:text-base md:text-lg leading-relaxed">
                  Discover the best products at amazing prices. Fast delivery,
                  easy returns, and top-notch quality.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/shop"
                    className="inline-flex items-center justify-center 
                             bg-pink-500 hover:bg-pink-600 
                             px-5 py-2.5 rounded-lg 
                             transition-all font-medium 
                             text-white text-sm sm:text-base
                             active:scale-95 w-full sm:w-auto"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links/categories below banner - matching your screenshot */}
      <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {["TV & Accessories", "Phones & Accessories", "Watches & Accessories"].map((category) => (
              <div key={category} className="text-center">
                <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                  {category}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  {category === "TV & Accessories" && "Up to 70% Off Tech"}
                  {category === "Phones & Accessories" && "Latest Models"}
                  {category === "Watches & Accessories" && "New Arrivals"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}