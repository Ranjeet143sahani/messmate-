 import { useState, useEffect } from "react";

function TiffinPlans({ addToCart }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampus, setSelectedCampus] = useState("");
  const [showVendorPlans, setShowVendorPlans] = useState(false);
  const [vendorPlans, setVendorPlans] = useState([]);
  const [isVendor, setIsVendor] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    planName: "",
    description: "",
    breakfast: false,
    lunch: false,
    dinner: false,
    price: "",
    duration: "monthly",
    serviceAreas: "",
    deliveryRadius: "",
    menu: ""
  });

  // Common campuses for filtering
  const campuses = [
    "All Campuses",
    "IIT kanpur",
    "IIT Delhi",
    "Axis college",
    "Kit  Kanpur",
    "allenhouse kanpur",
    "HBtu kanpur",
    "IIT Roorkee",
    "BBD University",
    "DTU",
    "DU",
    "JNU",
    "Other"
  ];

  useEffect(() => {
    checkUserType();
    fetchPlans();
  }, [selectedCampus]);

  const checkUserType = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setIsVendor(user.userType === "vendor");
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const campusParam = selectedCampus && selectedCampus !== "All Campuses" 
        ? `?campus=${encodeURIComponent(selectedCampus)}` 
        : "";
      
      const res = await fetch(`http://localhost:5000/api/tiffin${campusParam}`);
      const data = await res.json();
      
      if (res.ok) {
        setPlans(data);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorPlans = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/tiffin/vendor", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setVendorPlans(data);
      }
    } catch (err) {
      console.error("Error fetching vendor plans:", err);
    }
  };

  const handleCampusChange = (e) => {
    setSelectedCampus(e.target.value);
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const menuArray = newPlan.menu.split(",").map(item => item.trim()).filter(item => item);
      
      const res = await fetch("http://localhost:5000/api/tiffin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          planName: newPlan.planName,
          description: newPlan.description,
          meals: {
            breakfast: newPlan.breakfast,
            lunch: newPlan.lunch,
            dinner: newPlan.dinner
          },
          price: parseFloat(newPlan.price),
          duration: newPlan.duration,
          serviceAreas: newPlan.serviceAreas ? newPlan.serviceAreas.split(",").map(s => s.trim()) : [],
          deliveryRadius: newPlan.deliveryRadius ? parseFloat(newPlan.deliveryRadius) : null,
          menu: menuArray
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        alert("✅ Tiffin plan created successfully!");
        setShowCreateForm(false);
        setNewPlan({
          planName: "",
          description: "",
          breakfast: false,
          lunch: false,
          dinner: false,
          price: "",
          duration: "monthly",
          serviceAreas: "",
          deliveryRadius: "",
          menu: ""
        });
        fetchVendorPlans();
      } else {
        alert(data.message || "Failed to create plan");
      }
    } catch (err) {
      console.error("Error creating plan:", err);
      alert("Error creating plan");
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/tiffin/${planId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert("✅ Plan deleted successfully!");
        fetchVendorPlans();
      } else {
        alert("Failed to delete plan");
      }
    } catch (err) {
      console.error("Error deleting plan:", err);
    }
  };

  const handleSubscribe = (plan) => {
    addToCart({ 
      ...plan, 
      type: "tiffin",
      tiffinPlanId: plan._id,
      planName: plan.planName 
    });
    alert(`✅ ${plan.planName} plan added to cart!`);
  };

  const handleViewVendorPlans = () => {
    setShowVendorPlans(!showVendorPlans);
    if (!showVendorPlans) {
      fetchVendorPlans();
    }
  };

  const getDurationLabel = (duration) => {
    switch(duration) {
      case "daily": return "Daily";
      case "weekly": return "Weekly";
      case "monthly": return "Monthly";
      default: return duration;
    }
  };

  const getMealOptions = (meals) => {
    const opts = [];
    if (meals.breakfast) opts.push("Breakfast");
    if (meals.lunch) opts.push("Lunch");
    if (meals.dinner) opts.push("Dinner");
    return opts.join(" + ");
  };

  // Static plans for non-logged in users
  const staticPlans = [
    {
      _id: "static1",
      planName: "Starter",
      duration: "weekly",
      price: 700,
      color: "#da6bff",
      features: ["Home Delivery", "Fresh Meals", "No Hidden Charges"],
      image: "🍱",
      vendor: { restaurantName: "Messmate Kitchen" }
    },
    {
      _id: "static2",
      planName: "Smart Pack",
      duration: "weekly",
      price: 1200,
      color: "#69cd4e",
      features: ["Home Delivery", "Fresh Meals", "Menu Variety", "10% Discount"],
      image: "🍲",
      popular: true,
      vendor: { restaurantName: "Messmate Kitchen" }
    },
    {
      _id: "static3",
      planName: "Premium",
      duration: "monthly",
      price: 2200,
      color: "#ff3d4a",
      features: ["Home Delivery", "Fresh Meals", "Menu Variety", "15% Discount", "Priority Support"],
      image: "🍛",
      vendor: { restaurantName: "Messmate Kitchen" }
    }
  ];

  const displayPlans = plans.length > 0 ? plans : staticPlans;

  return (
    <div style={{ padding: "40px 20px", minHeight: "80vh", background: "linear-gradient(135deg, #8066ea 0%, #764ba2 100%)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", color: "white", marginBottom: "10px", fontSize: "36px" }}>
          📦 Student Tiffin Plans
        </h1>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.9)", marginBottom: "30px", fontSize: "16px" }}>
          Choose the perfect meal plan for your college life
        </p>

        {/* Campus Filter */}
        <div style={{ 
          background: "white", 
          padding: "20px", 
          borderRadius: "10px", 
          marginBottom: "30px",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          <label style={{ fontWeight: "bold", color: "#333" }}>📍 Select Your Campus:</label>
          <select 
            value={selectedCampus}
            onChange={handleCampusChange}
            style={{
              padding: "10px 15px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              fontSize: "14px",
              minWidth: "200px",
              cursor: "pointer"
            }}
          >
            {campuses.map(campus => (
              <option key={campus} value={campus}>{campus}</option>
            ))}
          </select>
          
          {isVendor && (
            <button
              onClick={handleViewVendorPlans}
              style={{
                padding: "10px 20px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              {showVendorPlans ? "👁️ Hide My Plans" : "🍔 My Vendor Plans"}
            </button>
          )}
          
          {isVendor && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{
                padding: "10px 20px",
                background: "#4ECDC4",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              {showCreateForm ? "✖ Cancel" : "+ Create Plan"}
            </button>
          )}
        </div>

        {/* Vendor Create Plan Form */}
        {showCreateForm && isVendor && (
          <div style={{ 
            background: "white", 
            padding: "40px", 
            borderRadius: "15px", 
            marginBottom: "30px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
          }}>
            <h2 style={{ marginBottom: "25px", color: "#333", fontSize: "28px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "32px" }}>🍱</span> Create New Tiffin Plan
            </h2>
            <form onSubmit={handleCreatePlan}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "16px", color: "#333" }}>Plan Name *</label>
                  <input
                    type="text"
                    value={newPlan.planName}
                    onChange={(e) => setNewPlan({...newPlan, planName: e.target.value})}
                    required
                    style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "2px solid #e0e0e0", fontSize: "15px", transition: "border-color 0.3s", outline: "none" }}
                    placeholder="e.g., Monthly Thali"
                    onFocus={(e) => e.target.style.borderColor = "#4ECDC4"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "16px", color: "#333" }}>Price (₹) *</label>
                  <input
                    type="number"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({...newPlan, price: e.target.value})}
                    required
                    style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "2px solid #e0e0e0", fontSize: "15px", transition: "border-color 0.3s", outline: "none" }}
                    placeholder="e.g., 1500"
                    onFocus={(e) => e.target.style.borderColor = "#4ECDC4"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "16px", color: "#333" }}>Duration</label>
                  <select
                    value={newPlan.duration}
                    onChange={(e) => setNewPlan({...newPlan, duration: e.target.value})}
                    style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "2px solid #e0e0e0", fontSize: "15px", transition: "border-color 0.3s", outline: "none", backgroundColor: "white" }}
                    onFocus={(e) => e.target.style.borderColor = "#4ECDC4"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "16px", color: "#333" }}>Service Areas (comma separated)</label>
                  <input
                    type="text"
                    value={newPlan.serviceAreas}
                    onChange={(e) => setNewPlan({...newPlan, serviceAreas: e.target.value})}
                    style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "2px solid #e0e0e0", fontSize: "15px", transition: "border-color 0.3s", outline: "none" }}
                    placeholder="e.g., IIT Delhi, DTU, DU"
                    onFocus={(e) => e.target.style.borderColor = "#4ECDC4"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "16px", color: "#333" }}>Delivery Radius (km)</label>
                  <input
                    type="number"
                    value={newPlan.deliveryRadius}
                    onChange={(e) => setNewPlan({...newPlan, deliveryRadius: e.target.value})}
                    style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "2px solid #e0e0e0", fontSize: "15px", transition: "border-color 0.3s", outline: "none" }}
                    placeholder="e.g., 5"
                    onFocus={(e) => e.target.style.borderColor = "#4ECDC4"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>
              </div>
              
              <div style={{ marginTop: "25px" }}>
                <label style={{ display: "block", marginBottom: "12px", fontWeight: "bold", fontSize: "16px", color: "#333" }}>Meals Included</label>
                <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "16px", color: "#333", fontWeight: "500" }}>
                    <input
                      type="checkbox"
                      checked={newPlan.breakfast}
                      onChange={(e) => setNewPlan({...newPlan, breakfast: e.target.checked})}
                      style={{ width: "20px", height: "20px", accentColor: "#4ECDC4", cursor: "pointer" }}
                    /> 
                    <span>🌅 Breakfast</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "16px", color: "#333", fontWeight: "500" }}>
                    <input
                      type="checkbox"
                      checked={newPlan.lunch}
                      onChange={(e) => setNewPlan({...newPlan, lunch: e.target.checked})}
                      style={{ width: "20px", height: "20px", accentColor: "#4ECDC4", cursor: "pointer" }}
                    /> 
                    <span>☀️ Lunch</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "16px", color: "#333", fontWeight: "500" }}>
                    <input
                      type="checkbox"
                      checked={newPlan.dinner}
                      onChange={(e) => setNewPlan({...newPlan, dinner: e.target.checked})}
                      style={{ width: "20px", height: "20px", accentColor: "#4ECDC4", cursor: "pointer" }}
                    /> 
                    <span>🌙 Dinner</span>
                  </label>
                </div>
              </div>

              <div style={{ marginTop: "25px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "16px", color: "#333" }}>Description</label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                  style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "2px solid #e0e0e0", fontSize: "15px", minHeight: "100px", transition: "border-color 0.3s", outline: "none", fontFamily: "inherit", resize: "vertical" }}
                  placeholder="Describe your tiffin plan..."
                  onFocus={(e) => e.target.style.borderColor = "#4ECDC4"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>

              <div style={{ marginTop: "25px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "16px", color: "#333" }}>Menu Items (comma separated)</label>
                <input
                  type="text"
                  value={newPlan.menu}
                  onChange={(e) => setNewPlan({...newPlan, menu: e.target.value})}
                  style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "2px solid #e0e0e0", fontSize: "15px", transition: "border-color 0.3s", outline: "none" }}
                  placeholder="e.g., Dal, Rice, Roti, Sabzi, Pickle"
                  onFocus={(e) => e.target.style.borderColor = "#4ECDC4"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: "30px",
                  padding: "16px 40px",
                  background: "linear-gradient(135deg, #4ECDC4 0%, #44a08d 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "18px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(78, 205, 196, 0.4)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(78, 205, 196, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(78, 205, 196, 0.4)";
                }}
              >
                ✨ Create Plan
              </button>
            </form>
          </div>
        )}

        {/* Vendor Plans Section */}
        {showVendorPlans && isVendor && (
          <div style={{ 
            background: "white", 
            padding: "30px", 
            borderRadius: "10px", 
            marginBottom: "30px" 
          }}>
            <h2 style={{ marginBottom: "20px", color: "#333" }}>Your Tiffin Plans ({vendorPlans.length})</h2>
            {vendorPlans.length === 0 ? (
              <p style={{ textAlign: "center", color: "#666" }}>You haven't created any tiffin plans yet.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                {vendorPlans.map(plan => (
                  <div key={plan._id} style={{ 
                    border: "2px solid #4ECDC4", 
                    borderRadius: "10px", 
                    padding: "20px",
                    background: "#f9f9f9"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>{plan.planName}</h3>
                      <span style={{ 
                        background: plan.isActive ? "#4ECDC4" : "#ccc",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "3px",
                        fontSize: "12px"
                      }}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p style={{ margin: "5px 0", color: "#666" }}>{plan.description || "No description"}</p>
                    <p style={{ margin: "5px 0", color: "#666" }}>Meals: {getMealOptions(plan.meals)}</p>
                    <p style={{ margin: "5px 0", color: "#FF6B6B", fontWeight: "bold", fontSize: "24px" }}>₹{plan.price}/{getDurationLabel(plan.duration)}</p>
                    <p style={{ margin: "5px 0", color: "#666", fontSize: "14px" }}>
                      Service Areas: {plan.serviceAreas?.join(", ") || "All Areas"}
                    </p>
                    <button
                      onClick={() => handleDeletePlan(plan._id)}
                      style={{
                        marginTop: "10px",
                        padding: "8px 15px",
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: "center", color: "white", padding: "50px" }}>
            <div style={{ fontSize: "24px" }}>Loading tiffin plans...</div>
          </div>
        ) : (
          /* Tiffin Plans Grid */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", marginBottom: "50px" }}>
            {displayPlans.map((plan) => (
              <div
                key={plan._id}
                style={{
                  background: "white",
                  borderRadius: "10px",
                  overflow: "hidden",
                  boxShadow: plan.popular ? "0 10px 30px rgba(0,0,0,0.3)" : "0 5px 15px rgba(0,0,0,0.1)",
                  transform: plan.popular ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.2)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = plan.popular ? "0 10px 30px rgba(0,0,0,0.3)" : "0 5px 15px rgba(0,0,0,0.1)")}
              >
                {plan.popular && (
                  <div style={{ background: "#FF6B6B", color: "white", textAlign: "center", padding: "8px", fontWeight: "bold", fontSize: "12px" }}>
                    ⭐ MOST POPULAR
                  </div>
                )}

                <div style={{ background: plan.color || "#4ECDC4", padding: "30px", textAlign: "center", color: "white" }}>
                  <div style={{ fontSize: "50px", marginBottom: "10px" }}>{plan.image || "🍱"}</div>
                  <h2 style={{ margin: "0 0 5px 0", fontSize: "28px" }}>{plan.planName}</h2>
                  <p style={{ margin: "0", fontSize: "14px", opacity: 0.9 }}>{getDurationLabel(plan.duration)}</p>
                </div>

                <div style={{ padding: "30px" }}>
                  {/* Vendor Info */}
                  {plan.vendor && (
                    <div style={{ marginBottom: "15px", padding: "10px", background: "#f5f5f5", borderRadius: "5px" }}>
                      <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>By: <strong>{plan.vendor.restaurantName || plan.vendor.name}</strong></p>
                      {plan.vendor.city && <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#666" }}>📍 {plan.vendor.city}</p>}
                    </div>
                  )}

                  {/* Meal Options */}
                  {plan.meals && (
                    <div style={{ marginBottom: "15px" }}>
                      <p style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Meals Included:</p>
                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                        {plan.meals.breakfast && <span style={{ background: "#FFF3CD", padding: "3px 8px", borderRadius: "3px", fontSize: "12px" }}>🌅 Breakfast</span>}
                        {plan.meals.lunch && <span style={{ background: "#D4EDDA", padding: "3px 8px", borderRadius: "3px", fontSize: "12px" }}>☀️ Lunch</span>}
                        {plan.meals.dinner && <span style={{ background: "#E2D5F1", padding: "3px 8px", borderRadius: "3px", fontSize: "12px" }}>🌙 Dinner</span>}
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: "20px", textAlign: "center" }}>
                    <p style={{ fontSize: "12px", color: "#666", margin: "0 0 5px 0" }}>Price</p>
                    <div style={{ fontSize: "36px", fontWeight: "bold", color: plan.color || "#4ECDC4" }}>₹{plan.price}</div>
                    <p style={{ fontSize: "12px", color: "#999", margin: "5px 0 0 0" }}>/{getDurationLabel(plan.duration)}</p>
                  </div>

                  <ul style={{ listStyle: "none", padding: "0", margin: "20px 0" }}>
                    {(plan.features || ["Home Delivery", "Fresh Meals", "No Hidden Charges"]).map((feature, idx) => (
                      <li key={idx} style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: "14px" }}>
                        ✓ {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: plan.color || "#4ECDC4",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      marginTop: "20px"
                    }}
                    onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
                    onMouseLeave={(e) => (e.target.style.opacity = "1")}
                  >
                    Subscribe Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Why Choose Section */}
        <div style={{ background: "white", borderRadius: "10px", padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>Why Choose Our Tiffin Service?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px" }}>
            {[
              { icon: "🏠", title: "Free Delivery", desc: "Delivered to your hostel" },
              { icon: "👨‍🍳", title: "Expert Chefs", desc: "Experienced cooking team" },
              { icon: "🥗", title: "Healthy Food", desc: "Nutritious & balanced meals" },
              { icon: "⏰", title: "On Time", desc: "Delivered on schedule" }
            ].map((item, idx) => (
              <div key={idx} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>{item.icon}</div>
                <h4 style={{ margin: "0 0 5px 0", fontSize: "14px" }}>{item.title}</h4>
                <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TiffinPlans;
