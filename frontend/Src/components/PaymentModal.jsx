import { useState } from "react";

function PaymentModal({ isOpen, onClose, orderDetails, onPaymentSuccess, onPaymentFailure }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("razorpay"); // "razorpay" | "cod"

  if (!isOpen) return null;

  const token = localStorage.getItem("token");

  const handleRazorpayPayment = async () => {
    setError("");
    setIsProcessing(true);

    try {
      // Step 1: Create Razorpay order on backend
      const orderResponse = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          orderId: orderDetails.orderId
        })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Failed to create payment order");
      }

      // Step 2: Load Razorpay script and open checkout
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        const options = {
          key: orderData.key, // Publishable key
          amount: orderData.amount,
          currency: orderData.currency,
          name: "FD App",
          description: `Order #${orderDetails.orderId.slice(-6)}`,
          order_id: orderData.razorpayOrderId,
          handler: async function (response) {
            // Step 3: Verify payment on backend
            const verifyResponse = await fetch("http://localhost:5000/api/payment/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` })
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: orderDetails.orderId
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              setSuccess(true);
              setTimeout(() => {
                onPaymentSuccess(verifyData);
              }, 1500);
            } else {
              setError("Payment verification failed. Please contact support.");
              onPaymentFailure && onPaymentFailure(verifyData);
            }
          },
          prefill: {
            name: localStorage.getItem("userName") || "Customer",
            email: localStorage.getItem("userEmail") || ""
          },
          theme: {
            color: "#667eea"
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };

      document.body.appendChild(script);

    } catch (err) {
      setError(err.message);
      console.error("Payment error:", err);
      setIsProcessing(false);
      onPaymentFailure && onPaymentFailure({ message: err.message });
    }
  };

  const handleCODPayment = async () => {
    setError("");
    setIsProcessing(true);

    try {
      const response = await fetch("http://localhost:5000/api/payment/cod", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          orderId: orderDetails.orderId
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onPaymentSuccess(data);
        }, 1500);
      } else {
        throw new Error(data.message || "COD confirmation failed");
      }
    } catch (err) {
      setError(err.message);
      console.error("COD error:", err);
      setIsProcessing(false);
      onPaymentFailure && onPaymentFailure({ message: err.message });
    }
  };

  const handlePayment = () => {
    if (selectedPaymentMethod === "razorpay") {
      handleRazorpayPayment();
    } else {
      handleCODPayment();
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>💳 Secure Payment</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        {success ? (
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>✅</div>
            <h3 style={styles.successTitle}>Payment Successful!</h3>
            <p style={styles.successMessage}>Order confirmed. Check your My Orders.</p>
          </div>
        ) : (
          <div style={styles.content}>
            <div style={styles.orderSummary}>
              <p style={styles.summaryTitle}>Order Summary</p>
              <div style={styles.summaryRow}>
                <span>Order ID:</span>
                <span>#{orderDetails?.orderId?.slice(-6) || "N/A"}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Total Amount:</span>
                <span style={styles.amount}>₹{orderDetails?.totalAmount || 0}</span>
              </div>
            </div>

            {/* NEW: Payment Method Selector */}
            <div style={styles.paymentSelector}>
              <p style={styles.selectorTitle}>Choose Payment Method</p>
              <div style={styles.radioGroup}>
                <label style={{ ...styles.radioLabel, ...(selectedPaymentMethod === "razorpay" && styles.radioLabelSelected) }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={selectedPaymentMethod === "razorpay"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    style={styles.radioInput}
                  />
                  <span style={styles.radioIcon}>💳</span>
                  <div>
                    <div style={styles.methodTitle}>Razorpay (Cards/UPI)</div>
                    <div style={styles.methodDesc}>Secure online payment</div>
                  </div>
                </label>
                <label style={{ ...styles.radioLabel, ...(selectedPaymentMethod === "cod" && styles.radioLabelSelected) }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={selectedPaymentMethod === "cod"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    style={styles.radioInput}
                  />
                  <span style={styles.radioIcon}>💰</span>
                  <div>
                    <div style={styles.methodTitle}>Cash on Delivery</div>
                    <div style={styles.methodDesc}>Pay when delivered</div>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div style={styles.error}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              style={isProcessing ? styles.buttonDisabled : styles.button}
            >
              {isProcessing ? (
                <span>⏳ Processing...</span>
              ) : selectedPaymentMethod === "cod" ? (
                <span>🚚 Confirm COD Order</span>
              ) : (
                <span>🚀 Pay with Razorpay</span>
              )}
            </button>

            <div style={styles.info}>
              <p style={styles.infoText}>🔒 All payments secured</p>
              <p style={styles.infoText}>COD: Cash collected on delivery</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles unchanged + new payment selector styles
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px"
  },
  modal: {
    background: "white",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "450px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    borderBottom: "1px solid #E5E7EB"
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827"
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#6B7280",
    padding: 0,
    lineHeight: 1,
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      backgroundColor: "#F3F4F6"
    }
  },
  content: {
    padding: "32px 24px"
  },
  orderSummary: {
    background: "#F8FAFC",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px"
  },
  summaryTitle: {
    margin: "0 0 16px 0",
    fontSize: "14px",
    fontWeight: "500",
    color: "#64748B"
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    fontSize: "16px"
  },
  amount: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1E40AF"
  },
  // NEW: Payment Selector Styles
  paymentSelector: {
    marginBottom: "24px",
    padding: "20px",
    background: "#F8FAFC",
    borderRadius: "12px",
    border: "2px solid #E5E7EB"
  },
  selectorTitle: {
    margin: "0 0 16px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#374151"
  },
  radioGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    border: "2px solid transparent",
    background: "white"
  },
  radioLabelSelected: {
    borderColor: "#3B82F6",
    background: "#EFF6FF",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
  },
  radioInput: {
    margin: 0,
    accentColor: "#3B82F6",
    width: "18px",
    height: "18px"
  },
  radioIcon: {
    fontSize: "20px",
    flexShrink: 0
  },
  methodTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "2px"
  },
  methodDesc: {
    fontSize: "13px",
    color: "#6B7280"
  },
  error: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#DC2626",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px"
  },
  button: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.4)",
    marginBottom: "20px"
  },
  buttonDisabled: {
    width: "100%",
    padding: "16px",
    background: "#9CA3AF",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "not-allowed",
    marginBottom: "20px"
  },
  successContainer: {
    padding: "48px 32px",
    textAlign: "center"
  },
  successIcon: {
    fontSize: "64px",
    marginBottom: "20px"
  },
  successTitle: {
    margin: "0 0 12px 0",
    fontSize: "28px",
    color: "#059669",
    fontWeight: "700"
  },
  successMessage: {
    margin: 0,
    fontSize: "16px",
    color: "#6B7280"
  },
  info: {
    marginTop: "0",
    paddingTop: "20px",
    borderTop: "1px solid #E5E7EB",
    textAlign: "center"
  },
  infoText: {
    margin: "0 0 8px 0",
    fontSize: "14px",
    color: "#6B7280"
  }
};

export default PaymentModal;
