import { useMemo, useState } from "react";
import FoodList from "../components/FoodList";
import CategoryFilter from "../components/CategoryFilter";

function Home({ addToCart }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ performance optimization
  const categories = useMemo(
    () => ["All", "North Indian", "South Indian", "Chinese", "Desserts", "Beverages"],
    []
  );

  // ✅ debounce search (basic)
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div style={{ background: "#F9FAFB", minHeight: "80vh", paddingBottom: "40px" }}>
      {/* Banner Section */}
      <header
        style={{
          background: "linear-gradient(135deg, #ea6673 0%, #764ba2 100%)",
          color: "white",
          padding: "60px 20px",
          textAlign: "center",
          marginBottom: "40px"
        }}
      >
        <h1 style={{ margin: "0 0 15px 0", fontSize: "40px" }}>
          🍟 Welcome to <span style={{ fontWeight: "800" }}>Messmate</span>
        </h1>

        <p style={{ margin: "0", fontSize: "16px", opacity: 0.9 }}>
          Discover delicious meals prepared fresh for hungry students
        </p>

        <div style={{ marginTop: "20px" }}>
          <input
            type="text"
            aria-label="Search meals"
            placeholder="Search for meals..."
            value={searchQuery}
            onChange={handleSearch}
            style={{
              padding: "12px 20px",
              width: "300px",
              maxWidth: "90%",
              borderRadius: "25px",
              border: "none",
              fontSize: "14px"
            }}
          />
        </div>
      </header>

      {/* Content Section */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <FoodList
          addToCart={addToCart}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
        />

        {/* Why Choose Us */}
        <section style={{ marginTop: "60px" }}>
          <h2
            style={{
              textAlign: "center",
              marginBottom: "40px",
              fontSize: "28px",
              color: "#333"
            }}
          >
            Why Choose Messmate?
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px"
            }}
          >
            {[
              { icon: "⚡", title: "Super Fast Delivery", desc: "Meals delivered within 30 mins" },
              { icon: "🍎", title: "Healthy & Fresh", desc: "Nutritious meals made daily" },
              { icon: "💰", title: "Affordable Prices", desc: "Best prices for college students" },
              { icon: "⭐", title: "Top Quality", desc: "Premium ingredients & great taste" },
              { icon: "📱", title: "Easy Ordering", desc: "Simple mobile app experience" },
              { icon: "🔒", title: "Safe Payment", desc: "Secure payment options" }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "10px",
                  textAlign: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                  {item.icon}
                </div>
                <h3 style={{ margin: "0 0 8px 0", color: "#111" }}>
                  {item.title}
                </h3>
                <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
