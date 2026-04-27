import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("consumer"); // "consumer" or "vendor"
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);

    try {
      const endpoint = userType === "vendor" ? "/login/vendor" : "/login";
      const res = await fetch(`http://localhost:5000/api/users${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // Save token and user data to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Update the login state in App.jsx
        if (setIsLoggedIn) {
          setIsLoggedIn(true);
        }
        
        alert("Login Successful! Redirecting to Home...");
        navigate("/");
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Login Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "10px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        padding: "40px",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h2 style={{ 
          textAlign: "center", 
          color: "#333",
          marginBottom: "30px",
          fontSize: "28px",
          fontWeight: "600"
        }}>
          Welcome Back
        </h2>

        {/* User Type Selection */}
        <div style={{ 
          display: "flex", 
          gap: "10px", 
          marginBottom: "20px",
          justifyContent: "center"
        }}>
          <button
            type="button"
            onClick={() => setUserType("consumer")}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              background: userType === "consumer" ? "#667eea" : "#e0e0e0",
              color: userType === "consumer" ? "white" : "#333",
              fontWeight: "600",
              transition: "all 0.3s"
            }}
          >
            Consumer
          </button>
          <button
            type="button"
            onClick={() => setUserType("vendor")}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              background: userType === "vendor" ? "#667eea" : "#e0e0e0",
              color: userType === "vendor" ? "white" : "#333",
              fontWeight: "600",
              transition: "all 0.3s"
            }}
          >
            Vendor
          </button>
        </div>

        {error && (
          <div style={{
            background: "#fee2e2",
            color: "#dc2626",
            padding: "12px",
            borderRadius: "5px",
            marginBottom: "20px",
            textAlign: "center",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "500" }}>
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ 
                padding: "12px", 
                fontSize: "14px", 
                border: "1px solid #ddd", 
                borderRadius: "5px",
                width: "100%",
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.3s"
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "500" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ 
                  padding: "12px", 
                  paddingRight: "40px",
                  fontSize: "14px", 
                  border: "1px solid #ddd", 
                  borderRadius: "5px",
                  width: "100%",
                  boxSizing: "border-box",
                  outline: "none",
                  transition: "border-color 0.3s"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#666",
                  fontSize: "14px"
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: "14px", 
              fontSize: "16px", 
              background: loading ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
              color: "white", 
              border: "none", 
              borderRadius: "5px", 
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
              width: "100%",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
          >
            {loading ? "Logging in..." : `Login as ${userType === "vendor" ? "Vendor" : "Consumer"}`}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "25px", color: "#666" }}>
          Don't have an account?{" "}
          <Link 
            to="/register" 
            style={{ 
              color: "#667eea", 
              textDecoration: "none",
              fontWeight: "600"
            }}
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
