// src/pages/Home.jsx
import ProductGrid from "../components/ProductGrid";
import Banner from "../components/Banner";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner Section - Full Width */}
      <section className="w-full">
        <Banner />
      </section>

      {/* Main Content - Standard Container Alignment */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <main className="pt-4 pb-12">


          {/* Products */}
          <section>
            <ProductGrid />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Home;
