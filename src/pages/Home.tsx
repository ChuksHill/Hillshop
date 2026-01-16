// src/pages/Home.jsx
import ProductGrid from "../components/ProductGrid";
import Category from "../components/CategoryNav";
import Banner from "../components/Banner"; // ✅ banner included

const Home = () => {
  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 px-4 sm:px-6 lg:px-8">
      {/* Banner Section  */}
      <section className="mx-4 sm:mx-6 lg:mx-8 mt-6">
        <Banner />
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          <Category />
        </section>

        {/* Products */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
          <ProductGrid />
        </section>
      </main>
    </div>
  );
};

export default Home;
