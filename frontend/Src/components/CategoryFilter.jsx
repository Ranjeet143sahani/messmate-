function CategoryFilter({ categories, selectedCategory, onCategoryChange }) {
  return (
    <div style={{ marginBottom: "30px" }}>
      <h3 style={{ marginBottom: "15px", color: "#333" }}>Filter by Category</h3>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            style={{
              padding: "8px 16px",
              border: selectedCategory === category ? "2px solid #ff6347" : "1px solid #ddd",
              background: selectedCategory === category ? "#ff6347" : "white",
              color: selectedCategory === category ? "white" : "#333",
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: selectedCategory === category ? "bold" : "normal",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#ff6347";
              if (selectedCategory !== category) {
                e.target.style.background = "#fff5f5";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = selectedCategory === category ? "#ff6347" : "#ddd";
              if (selectedCategory !== category) {
                e.target.style.background = "white";
              }
            }}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryFilter;
