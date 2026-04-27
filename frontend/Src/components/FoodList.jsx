import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

function FoodList({ addToCart, selectedCategory = "All", searchQuery = "" }) {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real foods from API
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:5000/api/foods");
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const data = await res.json();
        setFoods(data);
      } catch (err) {
        console.error("Failed to fetch foods:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  // Filter foods (unchanged logic)
  useEffect(() => {
    let result = foods;
    
    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter(food => food.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(food => 
        food.name.toLowerCase().includes(query) || 
        food.description?.toLowerCase().includes(query)
      );
    }
    
    setFilteredFoods(result);
  }, [foods, selectedCategory, searchQuery]);

  // Loading state
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "10px" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>🍳</div>
        <h2 style={{ color: "#666" }}>Loading delicious meals...</h2>
        <p style={{ color: "#999" }}>Fetching from restaurants</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "10px" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px", color: "#ef4444" }}>⚠️</div>
        <h2 style={{ color: "#ef4444" }}>Failed to load foods</h2>
        <p style={{ color: "#999" }}>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            padding: "10px 20px", 
            background: "#3b82f6", 
            color: "white", 
            border: "none", 
            borderRadius: "5px", 
            cursor: "pointer",
            marginTop: "10px"
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {filteredFoods.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          {filteredFoods.map(food => (
            <ProductCard key={food._id} food={food} addToCart={addToCart} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px", background: "white", borderRadius: "10px" }}>
          <div style={{ fontSize: "48px", marginBottom: "15px" }}>🔍</div>
          <h2 style={{ color: "#666" }}>No items found</h2>
          <p style={{ color: "#999" }}>Try searching for a different category or food</p>
        </div>
      )}
    </div>
  );
}

export default FoodList;

