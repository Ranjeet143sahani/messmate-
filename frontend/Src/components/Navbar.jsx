import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assests/NewLogo2.png";

function Navbar({ cartCount = 0, isLoggedIn = false, setIsLoggedIn, userType = "consumer" }) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Update login state
    if (setIsLoggedIn) {
      setIsLoggedIn(false);
    }
    
    // Close menu and navigate to home
    setShowMenu(false);
    navigate("/");
  };

  return (
    <nav
      style={{
        padding: "15px 20px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        position: "sticky",
        top: "0",
        zIndex: "100"
      }}
    >
      <Link
        to="/"
        style={{
          color: "white",
          textDecoration: "none",
          fontSize: "22px",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >
        <img src={logo} alt="Logo" style={{ width: "50px", height: "50px" }} />
         Messmate
      </Link>

      <div
        style={{
          display: showMenu ? "flex" : "none",
          position: "absolute",
          top: "60px",
          right: "20px",
          background: "white",
          color: "#333",
          flexDirection: "column",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          minWidth: "180px",
          zIndex: "200"
        }}
      >
        <Link to="/" style={{ padding: "12px 16px", textDecoration: "none", color: "#333", borderBottom: "1px solid #f0f0f0" }} onClick={() => setShowMenu(false)}>
          🏠 Home
        </Link>
        <Link to="/tiffin-plans" style={{ padding: "12px 16px", textDecoration: "none", color: "#333", borderBottom: "1px solid #f0f0f0" }} onClick={() => setShowMenu(false)}>
          📦 Tiffin Plans
        </Link>
        {isLoggedIn && userType === "vendor" && (
          <>
            <Link to="/add-food" style={{ padding: "12px 16px", textDecoration: "none", color: "#333", borderBottom: "1px solid #f0f0f0" }} onClick={() => setShowMenu(false)}>
              🍔 Add Food
            </Link>
            <Link to="/vendor-orders" style={{ padding: "12px 16px", textDecoration: "none", color: "#333", borderBottom: "1px solid #f0f0f0" }} onClick={() => setShowMenu(false)}>
              📋 Vendor Orders
            </Link>
          </>
        )}
        {isLoggedIn && userType === "consumer" && (
          <Link to="/my-orders" style={{ padding: "12px 16px", textDecoration: "none", color: "#333", borderBottom: "1px solid #f0f0f0" }} onClick={() => setShowMenu(false)}>
            📋 My Orders
          </Link>
        )}
        {isLoggedIn && (
          <>
            <Link to="/profile" style={{ padding: "12px 16px", textDecoration: "none", color: "#333", borderBottom: "1px solid #f0f0f0" }} onClick={() => setShowMenu(false)}>
              👤 Profile
            </Link>
          </>
        )}
        {isLoggedIn ? (
          <button 
            onClick={handleLogout}
            style={{ 
              padding: "12px 16px", 
              textAlign: "left",
              background: "none", 
              border: "none", 
              width: "100%",
              cursor: "pointer",
              color: "#667eea",
              fontSize: "14px"
            }}
          >
            🔐 Logout
          </button>
        ) : (
          <Link to="/login" style={{ padding: "12px 16px", textDecoration: "none", color: "#667eea" }} onClick={() => setShowMenu(false)}>
            🔐 Login
          </Link>
        )}
      </div>

      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <Link
          to="/cart"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "18px",
            position: "relative"
          }}
        >
          🛒
          {cartCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                background: "#FF6B6B",
                color: "white",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold"
              }}
            >
              {cartCount}
            </span>
          )}
        </Link>

        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            color: "white",
            padding: "8px 12px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "18px"
          }}
        >
          ☰
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
