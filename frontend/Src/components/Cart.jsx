import { useState } from "react";
import API_URL from "../api";
import PaymentModal from "./PaymentModal";

function Cart({ cart, removeFromCart, clearCart }) {
  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }
    setIsProcessing(true);
    try {
      const userId = localStorage.getItem("userId") || "user123";
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(localStorage.getItem("token") && { Authorization: `Bearer ${localStorage.getItem("token")}` })
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            ...item,
            vendorId: item.vendorId || (item.vendor?._id ? item.vendor._id.toString() : item.vendorId),  // Ensure ObjectId string present
            tiffinPlanId: item.tiffinPlanId  // Pass through for backend processing
          })),
          totalAmount: Math.floor(total * 0.9)
        })

      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Order creation failed:", response.status, errorData);
        alert(`❌ Order failed (${response.status}): ${errorData.message || 'Unknown error'}`);
        return;
      }
      
      const data = await response.json();
      console.log("Order created:", data);
      
      if (data._id) {
        setCurrentOrder({
          orderId: data._id,
          totalAmount: Math.floor(total * 0.9)
        });
        setShowPaymentModal(true);
      } else {
        alert("❌ Failed to create order: " + (data.message || 'No order ID received'));
      }
    } catch (err) {
      console.log("Error placing order:", err);
      alert("❌ Error placing order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    alert("✅ Payment Successful! Your order has been placed.");
    setShowPaymentModal(false);
    clearCart();
    setCurrentOrder(null);
  };

  const handlePaymentFailure = (errorData) => {
    console.log("Payment failed:", errorData);
  };

  const handleClosePayment = () => {
    setShowPaymentModal(false);
    setCurrentOrder(null);
  };

  return (
    <div style={{ padding: "40px 20px", minHeight: "80vh", background: "#F9FAFB" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "30px", color: "#111" }}>🛒 Shopping Cart</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "30px" }}>
          <div>
            {cart.length === 0 ? (
              <div style={{
                background: "white",
                borderRadius: "10px",
                padding: "60px 20px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <div style={{ fontSize: "60px", marginBottom: "20px" }}>📦</div>
                <h2 style={{ color: "#666", marginBottom: "10px" }}>Cart is Empty</h2>
                <p style={{ color: "#999", marginBottom: "30px" }}>Start ordering your favorite meals!</p>
                <a href="/" style={{ background: "#667eea", color: "white", padding: "10px 20px", textDecoration: "none", borderRadius: "5px" }}>
                  Browse Menu
                </a>
              </div>
            ) : (
              <div>
                {cart.map((item, index) => (
                  <div key={index} style={{
                    background: "white",
                    borderRadius: "10px",
                    padding: "20px",
                    marginBottom: "15px",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "20px",
                    alignItems: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                  }}>
                    <div>
                      <h3 style={{ margin: "0 0 8px 0", color: "#111" }}>{item.name}</h3>
                      <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                        {item.type === "subscription" ? `${item.duration} Plan` : item.category || "Fresh Meal"}
                      </p>
                      <p style={{ margin: "8px 0 0 0", fontSize: "18px", fontWeight: "bold", color: "#667eea" }}>
                        ₹{item.price}
                      </p>
                    </div>
                    <button onClick={() => removeFromCart(index)} style={{
                      background: "#EF4444",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold"
                    }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div style={{
              background: "white",
              borderRadius: "10px",
              padding: "25px",
              height: "fit-content",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              position: "sticky",
              top: "100px"
            }}>
              <h2 style={{ margin: "0 0 20px 0", fontSize: "18px", color: "#111" }}>Order Summary</h2>

              <div style={{ borderBottom: "1px solid #E5E7EB", paddingBottom: "15px", marginBottom: "15px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", marginBottom: "10px" }}>
                  <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>Subtotal ({cart.length} items)</p>
                  <p style={{ margin: "0", color: "#111", fontWeight: "bold" }}>₹{total}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", marginBottom: "10px" }}>
                  <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>Delivery Charge</p>
                  <p style={{ margin: "0", color: "#10B981", fontWeight: "bold" }}>FREE</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                  <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>Discount (10%)</p>
                  <p style={{ margin: "0", color: "#10B981", fontWeight: "bold" }}>-₹{Math.floor(total * 0.1)}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", marginBottom: "25px", paddingBottom: "15px", borderBottom: "1px solid #E5E7EB" }}>
                <p style={{ margin: "0", fontSize: "16px", fontWeight: "bold", color: "#111" }}>Total</p>
                <p style={{ margin: "0", fontSize: "20px", fontWeight: "bold", color: "#667eea" }}>₹{Math.floor(total * 0.9)}</p>
              </div>

              <button
                onClick={placeOrder}
                disabled={isProcessing}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: isProcessing ? "#9CA3AF" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: isProcessing ? "not-allowed" : "pointer",
                  marginBottom: "10px"
                }}
              >
                {isProcessing ? "⏳ Processing..." : "💳 Proceed to Checkout"}
              </button>

              <button
                onClick={() => clearCart()}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#E5E7EB",
                  color: "#374151",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClosePayment}
        orderDetails={currentOrder}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
      />
    </div>
  );
}

export default Cart;
