import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AddFood() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("North Indian");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const categories = ["North Indian", "South Indian", "Chinese", "Beverages", "Desserts"];

  useEffect(() => {
    // Check if user is logged in and is a vendor
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || user.userType !== "vendor") {
      alert("Please login as a vendor to access this page");
      navigate("/login");
      return;
    }
    
    // Load vendor's foods
    fetchVendorFoods();
  }, [navigate]);

  const fetchVendorFoods = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/foods/vendor", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setFoods(data);
      }
    } catch (err) {
      console.error("Error fetching foods:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/foods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          price: parseFloat(price),
          category,
          description,
          image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Food item added successfully!");
        setName("");
        setPrice("");
        setDescription("");
        setImage("");
        fetchVendorFoods();
      } else {
        setMessage(data.message || "Failed to add food item");
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (foodId) => {
    if (!confirm("Are you sure you want to delete this food item?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/foods/${foodId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        setMessage("Food item deleted successfully!");
        fetchVendorFoods();
      } else {
        const data = await res.json();
        setMessage(data.message || "Failed to delete food item");
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#333", marginBottom: "10px" }}>Vendor Dashboard</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Welcome, {user.name}! Manage your restaurant's food items here.
      </p>

      {/* Add Food Form */}
      <div style={{ 
        background: "white", 
        padding: "30px", 
        borderRadius: "10px", 
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        marginBottom: "40px"
      }}>
        <h2 style={{ color: "#333", marginBottom: "20px" }}>Add New Food Item</h2>
        
        {message && (
          <div style={{
            padding: "12px",
            borderRadius: "5px",
            marginBottom: "20px",
            background: message.includes("success") ? "#dcfce7" : "#fee2e2",
            color: message.includes("success") ? "#16a34a" : "#dc2626"
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "500" }}>
                Food Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., Butter Chicken"
                style={{ 
                  padding: "12px", 
                  fontSize: "14px", 
                  border: "1px solid #ddd", 
                  borderRadius: "5px",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "500" }}>
                Price (₹) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                placeholder="e.g., 250"
                style={{ 
                  padding: "12px", 
                  fontSize: "14px", 
                  border: "1px solid #ddd", 
                  borderRadius: "5px",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "500" }}>
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                style={{ 
                  padding: "12px", 
                  fontSize: "14px", 
                  border: "1px solid #ddd", 
                  borderRadius: "5px",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "500" }}>
                Image URL
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                style={{ 
                  padding: "12px", 
                  fontSize: "14px", 
                  border: "1px solid #ddd", 
                  borderRadius: "5px",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "500" }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your food item..."
              rows="3"
              style={{ 
                padding: "12px", 
                fontSize: "14px", 
                border: "1px solid #ddd", 
                borderRadius: "5px",
                width: "100%",
                boxSizing: "border-box",
                resize: "vertical"
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: "20px",
              padding: "14px 30px", 
              fontSize: "16px", 
              background: loading ? "#ccc" : "#ff6347", 
              color: "white", 
              border: "none", 
              borderRadius: "5px", 
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600"
            }}
          >
            {loading ? "Adding..." : "Add Food Item"}
          </button>
        </form>
      </div>

      {/* Food Items List */}
      <div style={{ 
        background: "white", 
        padding: "30px", 
        borderRadius: "10px", 
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ color: "#333", marginBottom: "20px" }}>Your Food Items ({foods.length})</h2>
        
        {foods.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", padding: "40px" }}>
            No food items yet. Add your first food item above!
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
            {foods.map(food => (
              <div key={food._id} style={{ 
                border: "1px solid #ddd", 
                borderRadius: "10px", 
                overflow: "hidden" 
              }}>
                <img 
                  src={food.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"} 
                  alt={food.name}
                  style={{ width: "100%", height: "150px", objectFit: "cover" }}
                />
                <div style={{ padding: "15px" }}>
                  <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>{food.name}</h3>
                  <p style={{ margin: "0 0 5px 0", color: "#666", fontSize: "14px" }}>
                    Category: {food.category}
                  </p>
                  <p style={{ margin: "0 0 10px 0", color: "#ff6347", fontSize: "18px", fontWeight: "bold" }}>
                    ₹{food.price}
                  </p>
                  <button 
                    onClick={() => handleDelete(food._id)}
                    style={{ 
                      padding: "8px 15px", 
                      background: "#dc2626", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "5px", 
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddFood;
