import { useEffect, useState } from "react";
import "./Profile.css";

const API_URL = import.meta.env.VITE_API_URL;

function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    college: "",
    branch: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <p style={{ textAlign: "center", color: "red" }}>
        Please login first
      </p>
    );
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const baseURL = API_URL || "http://localhost:5000";
        const res = await fetch(`${baseURL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to load profile");

        const userData = data.user || data;
        setUser(userData);
        setFormData({
          name: userData.name || "",
          phone: userData.phone || "",
          address: userData.address || "",
          college: userData.college || "",
          branch: userData.branch || "",
        });
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      const baseURL = API_URL || "http://localhost:5000";
      const res = await fetch(`${baseURL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Update failed");

      const userData = data.user || data;
      setUser(userData);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      college: user?.college || "",
      branch: user?.branch || "",
    });
    setIsEditing(false);
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div style={{ padding: "20px", background: "#F0F2F5", minHeight: "100vh" }}>
      {error && <div className="error">{error}</div>}

      <div className="profile-container">
        {/* Cover Photo */}
        <div className="cover-photo">
          <img
            src={
              user?.coverPhoto ||
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=940&h=300&fit=crop"
            }
            alt="Cover"
          />
        </div>

        {/* Profile Section */}
        <div className="profile-info-section">
          <div className="profile-pic-container">
            <img
              src={
                user?.profilePicture ||
                "https://static.vecteezy.com/system/resources/previews/033/633/383/large_2x/a-painting-of-people-eating-at-a-restaurant-ai-generated-free-photo.jpg"
              }
              alt="Profile"
              className="profile-pic"
            />
          </div>

          <div className="profile-name">
            <h1>{user?.name || "John Doe"}</h1>
            <p>1.2k connections</p>
          </div>

          <div className="profile-actions">
            <button
              className="add-story"
              onClick={() => alert("Feature coming soon")}
            >
              + Add to Story
            </button>
            <button
              className="edit-profile"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {isEditing ? (
            <form className="profile-form">
              <h2>Edit Profile</h2>

              <div className="form-group">
                <label>Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>College</label>
                <input
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Branch</label>
                <input
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-form">
                <h2>Profile Information</h2>

                <div className="form-group">
                  <label>Name</label>
                  <p>{user?.name || "Not set"}</p>
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <p>{user?.phone || "Not set"}</p>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <p>{user?.address || "Not set"}</p>
                </div>

                <div className="form-group">
                  <label>College</label>
                  <p>{user?.college || "Not set"}</p>
                </div>

                <div className="form-group">
                  <label>Branch</label>
                  <p>{user?.branch || "Not set"}</p>
                </div>
              </div>

              {/* Active Subscriptions (FIXED SECTION) */}
              <div style={{ marginTop: "40px" }}>
                <h3 style={{ marginBottom: "20px" }}>
                  Active Subscriptions
                </h3>
                <p>No active subscriptions</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;