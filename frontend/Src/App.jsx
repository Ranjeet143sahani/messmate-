import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./components/Cart";
import TiffinPlans from "./pages/TiffinPlans";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import AddFood from "./pages/AddFood";
import VendorOrders from "./pages/VendorOrders";

function App() {
  const [cart, setCart] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState("consumer"); // "consumer" or "vendor"

  // Load user data from localStorage on app start
  useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserType(user.userType || "consumer");
      setIsLoggedIn(true);
    }
  }, []);

  const addToCart = (food) => {
    setCart([...cart, food]);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Function to update userType (called after login)
  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setUserType(user.userType || "consumer");
  };

  return (
    <BrowserRouter>
<Navbar cartCount={cart.length} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} userType={userType} />
      <Routes>
        <Route path="/" element={<Home addToCart={addToCart} userType={userType} />} />
        <Route path="/login" element={<Login setIsLoggedIn={handleLoginSuccess} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tiffin-plans" element={<TiffinPlans addToCart={addToCart} />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} />} />
        <Route path="/add-food" element={<AddFood />} />
        <Route path="/vendor-orders" element={<VendorOrders />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
