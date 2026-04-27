import { useState } from "react";

function ProductCard({ food, addToCart }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      style={{
        background: "white",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        cursor: "pointer",
        transform: "translateY(0)"
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
      {/* Food Image */}
      <div
        style={{
          height: "200px",
          overflow: "hidden",
          background: "#f5f5f5"
        }}
      >
        {food.image ? (
          <img 
            src={food.image} 
            alt={food.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        ) : (
          <div
            style={{
              background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "60px",
              color: "white"
            }}
          >
            🍽️
          </div>
        )}
      </div>

      {/* Food Details */}
      <div style={{ padding: "20px" }}>
        <h3 style={{ margin: "0 0 8px 0", color: "#111", fontSize: "16px", fontWeight: "bold" }}>
          {food.name}
        </h3>

{food.category && (
          <p style={{ margin: "0 0 5px 0", color: "#666", fontSize: "12px" }}>
            📁 {food.category}
          </p>
        )}
        {food.vendor?.restaurantName && (
          <p style={{ margin: "0 0 10px 0", color: "#999", fontSize: "11px" }}>
            🍽️ {food.vendor.restaurantName}
          </p>
        )}

        {food.description && (
          <p style={{ margin: "0 0 12px 0", color: "#999", fontSize: "13px", lineHeight: "1.4" }}>
            {food.description}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#ff6347" }}>₹{food.price}</div>
          {food.rating && (
            <div style={{ color: "#FFD93D", fontSize: "14px" }}>
              ⭐ {food.rating} ({food.reviews || 0})
            </div>
          )}
        </div>

        <button
          onClick={() => {
            addToCart({ ...food, vendorId: food.vendor?._id });
            alert(`✓ ${food.name} added to cart!`);
          }}
          style={{
            width: "100%",
            padding: "10px",
            background: "#ff6347",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => (e.target.style.background = "#ff5337")}
          onMouseLeave={(e) => (e.target.style.background = "#ff6347")}
        >
          🛒 Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
