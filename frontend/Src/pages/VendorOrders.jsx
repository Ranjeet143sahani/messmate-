import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const fetchVendorOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login as vendor");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:5000/api/orders/vendor", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } else {
          throw new Error("Failed to fetch orders");
        }
        return;
      }

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    setUpdatingOrder(orderId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/accept`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchVendorOrders(); // Refresh list
      } else {
        alert("Failed to accept order");
      }
    } catch (err) {
      alert("Error accepting order");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleReadyOrder = async (orderId) => {
    setUpdatingOrder(orderId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/ready`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchVendorOrders(); // Refresh list
      } else {
        alert("Failed to mark ready");
      }
    } catch (err) {
      alert("Error marking ready");
    } finally {
      setUpdatingOrder(null);
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}><p>Loading your orders...</p></div>;
  if (error) return <div style={{ padding: "40px", textAlign: "center", color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "40px 20px", minHeight: "80vh", background: "#F9FAFB" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "30px", color: "#111" }}>📋 Vendor Orders</h1>
        
        {orders.length === 0 ? (
          <div style={{ background: "white", borderRadius: "10px", padding: "60px 20px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>📦</div>
            <h2 style={{ color: "#666", marginBottom: "10px" }}>No Pending Orders</h2>
            <p style={{ color: "#999", marginBottom: "30px" }}>Orders will appear here when customers place orders with your restaurant.</p>
            <Link to="/add-food" style={{ background: "#ff6347", color: "white", padding: "10px 20px", textDecoration: "none", borderRadius: "5px" }}>
              Add More Food Items
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {orders.map((order) => (
              <div key={order._id} style={{ background: "white", borderRadius: "10px", padding: "25px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "20px", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 5px 0", color: "#111" }}>Order #{order._id.slice(-8).toUpperCase()}</h3>
                    <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>{order.userId?.name || 'Customer'} - {order.userId?.phone || 'N/A'}</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ background: "#F59E0B", color: "white", padding: "8px 16px", borderRadius: "25px", fontWeight: "bold" }}>
                      ⏳ Pending
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button 
                      onClick={() => handleAcceptOrder(order._id)}
                      disabled={updatingOrder === order._id}
                      style={{
                        padding: "10px 20px",
                        background: "#3B82F6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: updatingOrder === order._id ? "not-allowed" : "pointer",
                        fontWeight: "bold"
                      }}
                    >
                      {updatingOrder === order._id ? "⏳" : "👨‍🍳"} Accept
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", marginBottom: "20px" }}>
                  <div style={{ background: "#F3F4F6", padding: "15px", borderRadius: "8px" }}>
                    <p style={{ margin: "0 0 10px 0", fontWeight: "bold", color: "#666" }}>Items:</p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {order.items.map((item, idx) => (
                        <li key={idx} style={{ padding: "5px 0", color: "#333", borderBottom: "1px solid #E5E7EB" }}>
                          {item.name} - ₹{item.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: "0 0 10px 0", fontSize: "24px", fontWeight: "bold", color: "#111" }}>₹{order.totalAmount}</p>
                    <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>Placed: {new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorOrders;

