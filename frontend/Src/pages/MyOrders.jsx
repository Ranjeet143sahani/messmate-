import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_URL from "../api";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login to view your orders");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "#10B981";
      case "Preparing":
        return "#3B82F6";
      case "Pending":
        return "#F59E0B";
      case "Cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return "✅";
      case "Preparing":
        return "👨‍🍳";
      case "Pending":
        return "⏳";
      case "Cancelled":
        return "❌";
      default:
        return "📋";
    }
  };

  const getItemNames = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => item.name || item);
  };

  // ✅ Optimized filtering
  const now = new Date();

  const activeSubscriptions = orders.filter(
    (order) =>
      order.isSubscription &&
      order.paymentStatus === "paid" &&
      new Date(order.endDate) > now
  );

  const regularOrders = orders.filter(
    (order) =>
      !order.isSubscription ||
      order.paymentStatus !== "paid" ||
      new Date(order.endDate) <= now
  );

  return (
    <div style={{ padding: "40px 20px", minHeight: "80vh", background: "#F9FAFB" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "30px", color: "#111" }}>
          📋 My Orders
        </h1>

        {/* Status Legend */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "30px", flexWrap: "wrap" }}>
          <span style={{ background: "#F59E0B", padding: "4px 10px", borderRadius: "20px", color: "white" }}>
            ⏳ Pending
          </span>
          <span style={{ background: "#3B82F6", padding: "4px 10px", borderRadius: "20px", color: "white" }}>
            👨‍🍳 Preparing
          </span>
          <span style={{ background: "#10B981", padding: "4px 10px", borderRadius: "20px", color: "white" }}>
            ✅ Delivered
          </span>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          /* Error */
          <div style={{ background: "white", borderRadius: "10px", padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "60px" }}>⚠️</div>
            <h2>{error}</h2>
            <Link to="/login">Login</Link>
          </div>
        ) : orders.length === 0 ? (
          /* Empty */
          <div style={{ background: "white", borderRadius: "10px", padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "60px" }}>📦</div>
            <h2>No Orders Yet</h2>
            <Link to="/">Browse Menu</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>

            {/* ✅ Active Subscriptions */}
            {activeSubscriptions.length > 0 && (
              <div>
                <h3 style={{ borderBottom: "2px solid #10B981" }}>
                  🎟️ Active Tiffin Subscriptions
                </h3>

                {activeSubscriptions.map((order) => (
                  <div key={order._id} style={{ background: "#F0FDF4", padding: "20px", borderLeft: "4px solid #10B981" }}>
                    <h4>
                      {order.items?.[0]?.planName} ({order.items?.[0]?.duration?.toUpperCase()})
                    </h4>

                    <p>
                      {new Date(order.startDate).toLocaleDateString("en-IN")} →{" "}
                      {new Date(order.endDate).toLocaleDateString("en-IN")}
                    </p>

                    <p>Vendor: {order.vendorId?.restaurantName}</p>
                    <p>₹{order.totalAmount}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ✅ Regular Orders */}
            <h3 style={{ borderBottom: "2px solid #3B82F6" }}>
              📋 Recent Orders
            </h3>

            {regularOrders.map((order) => (
              <div key={order._id} style={{ background: "white", padding: "20px", borderLeft: `4px solid ${getStatusColor(order.status)}` }}>
                
                <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>

                <p>{new Date(order.createdAt).toLocaleDateString()}</p>

                <p>🍽️ {order.vendorId?.restaurantName}</p>

                <div>
                  {getStatusIcon(order.status)} {order.status}
                </div>

                <ul>
                  {getItemNames(order.items).map((item, i) => (
                    <li key={i}>✓ {item}</li>
                  ))}
                </ul>

                <p>₹{order.totalAmount}</p>

                <span>
                  {order.paymentStatus === "paid" ? "✅ Paid" : "⏳ Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;