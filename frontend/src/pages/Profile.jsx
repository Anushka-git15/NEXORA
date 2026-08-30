import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../CSS/Profile.css";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data.user);
      } catch (error) {
        console.log("PROFILE ERROR:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (!user) {
    return <div className="profile-loading">User not found.</div>;
  }

  return (
    <div className="profile-page">

      <div className="profile-container">

        <div className="profile-header">
          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>

          <p>NEXORA PROFILE</p>
          <h1>Your Profile</h1>
          <span>Manage and view your account information.</span>
        </div>

        <div className="profile-card">

          <div className="profile-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <div className="profile-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>

            <span className="account-badge">
              ✓ Active Account
            </span>
          </div>

        </div>

        <div className="details-card">

          <h3>Personal Information</h3>

          <div className="details-grid">

            <div className="detail-item">
              <span>Full Name</span>
              <strong>{user.name}</strong>
            </div>

            <div className="detail-item">
              <span>Email Address</span>
              <strong>{user.email}</strong>
            </div>

            <div className="detail-item">
              <span>Account Status</span>
              <strong>Active</strong>
            </div>

            <div className="detail-item">
              <span>Authentication</span>
              <strong>JWT Protected</strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;