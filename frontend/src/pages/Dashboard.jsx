import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "../CSS/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [content, setContent] = useState([]);

  const fetchContent = async (token) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/content",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setContent(response.data.content);
    } catch (error) {
      console.log(
        "FETCH CONTENT ERROR:",
        error.response?.data
      );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      setUserEmail(decoded.email);
      setUserRole(decoded.role);

      fetchContent(token);
    } catch (error) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="brand-icon">N</div>
          <h2>NEXORA</h2>
        </div>

        <nav className="sidebar-nav">

          <Link to="/dashboard" className="nav-item">
            <span>⌂</span>
            Dashboard
          </Link>

          <Link to="/profile" className="nav-item">
            <span>👤</span>
            Profile
          </Link>

          <Link to="/settings" className="nav-item">
            <span>⚙</span>
            Settings
          </Link>

          {/* ADMIN OPTIONS */}

          {userRole === "admin" && (
            <>
              <div className="admin-section-title">
                ADMIN
              </div>

              <Link to="/admin" className="nav-item">
                <span>👑</span>
                Admin Panel
              </Link>

              <Link to="/admin/users" className="nav-item">
                <span>👥</span>
                Users
              </Link>

              <Link to="/admin/analytics" className="nav-item">
                <span>📊</span>
                Analytics
              </Link>
            </>
          )}

        </nav>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>

      </aside>

      {/* MAIN DASHBOARD */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>
            <p>Overview</p>

            <h1>
              Welcome back, {userEmail} 👋
            </h1>
          </div>

          <div className="user-avatar">
            {userEmail
              ? userEmail.charAt(0).toUpperCase()
              : "U"}
          </div>

        </header>

        {/* STATS */}

        <section className="stats-grid">

          <div className="stat-card">
            <span>👤</span>
            <p>Account</p>
            <h2>Active</h2>
          </div>

          <div className="stat-card">
            <span>🔐</span>
            <p>Security</p>
            <h2>Protected</h2>
          </div>

          <div className="stat-card">
            <span>⚡</span>
            <p>Status</p>
            <h2>Online</h2>
          </div>

        </section>

        {/* WELCOME + ACTIVITY */}

        <section className="dashboard-content">

          <div className="welcome-card">

            <p>NEXORA WORKSPACE</p>

            <h2>
              Your workspace is ready.
            </h2>

            <p>
              Manage your account, explore your dashboard
              and keep everything organized in one place.
            </p>

          </div>

          <div className="activity-card">

            <h3>Recent Activity</h3>

            <div className="activity">

              <span>✓</span>

              <div>
                <strong>
                  Successfully logged in
                </strong>

                <p>
                  Your account is secure.
                </p>
              </div>

            </div>

            <div className="activity">

              <span>🔐</span>

              <div>
                <strong>
                  JWT authentication active
                </strong>

                <p>
                  Protected session detected.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* =========================
            CONTENT SECTION
        ========================== */}

        <section className="user-content-section">

          <div className="content-section-heading">

            <div>
              <p>NEXORA CONTENT</p>

              <h2>
                Explore Workspace
              </h2>
            </div>

            <span>
              {content.length} items
            </span>

          </div>

          {/* NO CONTENT */}

          {content.length === 0 ? (

            <div className="no-content">
              <p>
                No content available yet.
              </p>
            </div>

          ) : (

            /* CONTENT CARDS */

            <div className="user-content-grid">

              {content.map((item) => (

                <div
                  className="user-content-card"
                  key={item._id}
                >

                  <div className="user-content-top">

                    <span
                      className={`status-badge ${item.status}`}
                    >
                      {item.status}
                    </span>

                  </div>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.description}
                  </p>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
};

export default Dashboard;