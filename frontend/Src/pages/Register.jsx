import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("consumer"); // "consumer" or "vendor"
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Consumer specific fields
  const [college, setCollege] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Vendor specific fields
  const [restaurantName, setRestaurantName] = useState("");
  const [vendorCity, setVendorCity] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      let requestBody;
      
      if (userType === "consumer") {
        requestBody = { name, email, password, phone, address, college, city };
      } else {
        requestBody = { 
          name, 
          email, 
          password, 
          restaurantName, 
          phone: vendorPhone, 
          address: vendorAddress, 
          city: vendorCity 
        };
      }

      const endpoint = userType === "vendor" ? "/register/vendor" : "/register";
      const res = await fetch(`${API_URL}/api/users${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Registration Error: " + err.message);
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
        maxWidth: "450px"
      }}>
        <h2 style={{ 
          textAlign: "center", 
          color: "#333",
          marginBottom: "20px",
          fontSize: "28px",
          fontWeight: "600"
        }}>
          Create Account
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

        {success && (
          <div style={{
            background: "#dcfce7",
            color: "#16a34a",
            padding: "12px",
            borderRadius: "5px",
            marginBottom: "20px",
            textAlign: "center",
            fontSize: "14px"
          }}>
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "500" }}>
              Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ 
                padding: "12px", 
                fontSize: "14px", 
                border: "1px solid #ddd", 
                borderRadius: "5px",
                width: "100%",
                boxSizing: "border-box",
                outline: "none"
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
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
                outline: "none"
              }}
            />
          </div>

          {/* Vendor specific field */}
          {userType === "vendor" && (
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "500" }}>
                Restaurant Name
              </label>
              <input
                type="text"
                placeholder="Enter restaurant name"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
                style={{ 
                  padding: "12px", 
                  fontSize: "14px", 
                  border: "1px solid #ddd", 
                  borderRadius: "5px",
                  width: "100%",
                  boxSizing: "border-box",
                  outline: "none"
                }}
              />
            </div>
          )}

          {/* Phone - common for both */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "500" }}>
              Phone
            </label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={userType === "vendor" ? vendorPhone : phone}
              onChange={(e) => userType === "vendor" ? setVendorPhone(e.target.value) : setPhone(e.target.value)}
              required
              style={{ 
                padding: "12px", 
                fontSize: "14px", 
                border: "1px solid #ddd", 
                borderRadius: "5px",
                width: "100%",
                boxSizing: "border-box",
                outline: "none"
              }}
            />
          </div>

          {/* Address - common for both */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "500" }}>
              Address
            </label>
            <input
              type="text"
              placeholder="Enter address"
              value={userType === "vendor" ? vendorAddress : address}
              onChange={(e) => userType === "vendor" ? setVendorAddress(e.target.value) : setAddress(e.target.value)}
              required
              style={{ 
                padding: "12px", 
                fontSize: "14px", 
                border: "1px solid #ddd", 
                borderRadius: "5px",
                width: "100%",
                boxSizing: "border-box",
                outline: "none"
              }}
            />
          </div>

          {/* City - common for both */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "500" }}>
              City
            </label>
            <input
              type="text"
              placeholder="Enter city"
              value={userType === "vendor" ? vendorCity : city}
              onChange={(e) => userType === "vendor" ? setVendorCity(e.target.value) : setCity(e.target.value)}
              required
              style={{ 
                padding: "12px", 
                fontSize: "14px", 
                border: "1px solid #ddd", 
                borderRadius: "5px",
                width: "100%",
                boxSizing: "border-box",
                outline: "none"
              }}
            />
          </div>

          {/* Consumer specific fields */}
          {userType === "consumer" && (
            <>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "500" }}>
                  College
                </label>
                <input
                  type="text"
                  placeholder="Enter college name"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                  style={{ 
                    padding: "12px", 
                    fontSize: "14px", 
                    border: "1px solid #ddd", 
                    borderRadius: "5px",
                    width: "100%",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "500" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
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
                  outline: "none"
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

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "500" }}>
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ 
                padding: "12px", 
                fontSize: "14px", 
                border: "1px solid #ddd", 
                borderRadius: "5px",
                width: "100%",
                boxSizing: "border-box",
                outline: "none"
              }}
            />
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
            {loading ? "Creating Account..." : `Register as ${userType === "vendor" ? "Vendor" : "Consumer"}`}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "25px", color: "#666" }}>
          Already have an account?{" "}
          <Link 
            to="/login" 
            style={{ 
              color: "#667eea", 
              textDecoration: "none",
              fontWeight: "600"
            }}
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
