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

      // Only allow images
      const bannerUrls = data
        .filter((file) =>
          file.name.match(/\.(jpg|jpeg|png|webp)$/i)
        )
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
    <section
      className="relative w-full h-[70vh] transition-all duration-700 bg-cover bg-center"
      style={{
        backgroundImage: `url(${images[currentIndex]})`,
        backgroundPosition: "50% 20%",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center pb-16 sm:pb-22 pt-8 sm:pt-0 -mt-14">
        <div className="text-center md:text-left max-w-xl text-white">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
              Welcome to Hills Shop
            </h1>
          </div>

          <p className="mb-6 md:mb-8 text-base sm:text-lg md:text-xl leading-relaxed md:leading-relaxed">
            Discover the best products at amazing prices. Fast delivery,
            easy returns, and top-notch quality.
          </p>

          <Link
            to="/shop"
            className="inline-block bg-pink-500 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl hover:bg-pink-600 transition-all font-bold shadow-lg shadow-pink-500/20 active:scale-95 text-sm sm:text-base"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
