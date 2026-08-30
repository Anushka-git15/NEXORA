import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "../CSS/AdminUsers.css";

const editUserSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must not exceed 50 characters")
    .matches(
      /^[A-Za-z]+(?: [A-Za-z]+)*$/,
      "Name can contain only letters and single spaces"
    ),

  email: Yup.string()
    .trim()
    .required("Email is required")
    .email("Enter a valid email address"),

  role: Yup.string()
    .required("Role is required")
    .oneOf(["user", "admin"], "Invalid role"),
});

const AdminUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // FETCH USERS
  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/users",
        config
      );

      setUsers(response.data.users);
    } catch (error) {
      console.log(
        "FETCH USERS ERROR:",
        error.response?.data
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // DELETE USER
  const handleDeleteUser = async (userId, userName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove ${userName}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(userId);

      await axios.delete(
        `http://localhost:5000/api/admin/users/${userId}`,
        config
      );

      alert("User removed successfully!");

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userId)
      );
    } catch (error) {
      console.log(
        "DELETE USER ERROR:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Failed to remove user"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // START EDIT
  const handleEditUser = (user) => {
    setEditingId(user._id);

    editFormik.setValues({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
    });

    editFormik.setTouched({});
  };

  // CANCEL EDIT
  const handleCancelEdit = () => {
    setEditingId(null);
    editFormik.resetForm();
  };

  // FORMIK
  const editFormik = useFormik({
    initialValues: {
      name: "",
      email: "",
      role: "user",
    },

    validationSchema: editUserSchema,

    onSubmit: async (values, { setSubmitting }) => {
      const currentUser = users.find(
        (user) => user._id === editingId
      );

      if (!currentUser) {
        setSubmitting(false);
        return;
      }

      const oldValues = {
        name: (currentUser.name || "").trim(),
        email: (currentUser.email || "").trim(),
        role: currentUser.role,
      };

      const newValues = {
        name: values.name.trim(),
        email: values.email.trim(),
        role: values.role,
      };

      // NO CHANGES
      const noChanges =
        oldValues.name === newValues.name &&
        oldValues.email === newValues.email &&
        oldValues.role === newValues.role;

      if (noChanges) {
        alert("No changes made");
        setSubmitting(false);
        return;
      }

      try {
        const response = await axios.put(
          `http://localhost:5000/api/admin/users/${editingId}`,
          newValues,
          config
        );

        alert("User updated successfully!");

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === editingId
              ? response.data.user
              : user
          )
        );

        setEditingId(null);
        editFormik.resetForm();
      } catch (error) {
        console.log(
          "UPDATE USER ERROR:",
          error.response?.data
        );

        alert(
          error.response?.data?.message ||
            "Failed to update user"
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="admin-users-page">

      <div className="admin-users-container">

        {/* HEADER */}

        <div className="admin-users-header">

          <div>
            <p>ADMIN PANEL</p>

            <h1>Users 👥</h1>

            <span>
              Manage and view registered NEXORA users.
            </span>
          </div>

          <button
            className="users-back-button"
            onClick={() => navigate("/admin")}
          >
            ← Admin Panel
          </button>

        </div>

        {/* USER COUNT */}

        <div className="users-summary">

          <div className="users-summary-icon">
            👥
          </div>

          <div>
            <p>Total Users</p>
            <h2>{users.length}</h2>
          </div>

        </div>

        {/* USERS */}

        <div className="users-section">

          <div className="users-section-heading">

            <h2>Registered Users</h2>

            <span>
              {users.length} users
            </span>

          </div>

          {loading ? (

            <div className="users-empty">
              <p>Loading users...</p>
            </div>

          ) : users.length === 0 ? (

            <div className="users-empty">
              <p>No users registered yet.</p>
            </div>

          ) : (

            <div className="users-table-wrapper">

              <table className="users-table">

                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {users.map((user) => {

                    const isEditing =
                      editingId === user._id;

                    return (
                      <tr key={user._id}>

                        {/* USER */}

                        <td>

                          {isEditing ? (

                            <div className="inline-edit-field">

                              <input
                                type="text"
                                name="name"
                                value={editFormik.values.name}
                                onChange={editFormik.handleChange}
                                onBlur={editFormik.handleBlur}
                                placeholder="Full Name"
                              />

                              {editFormik.touched.name &&
                                editFormik.errors.name && (
                                  <small className="error-message">
                                    {editFormik.errors.name}
                                  </small>
                                )}

                            </div>

                          ) : (

                            <div className="user-info">

                              <div className="user-table-avatar">
                                {user.name
                                  ? user.name
                                      .charAt(0)
                                      .toUpperCase()
                                  : "U"}
                              </div>

                              <div>

                                <strong>
                                  {user.name}
                                </strong>

                                <small>
                                  ID: {user._id.slice(-6)}
                                </small>

                              </div>

                            </div>

                          )}

                        </td>

                        {/* EMAIL */}

                        <td>

                          {isEditing ? (

                            <div className="inline-edit-field">

                              <input
                                type="email"
                                name="email"
                                value={editFormik.values.email}
                                onChange={editFormik.handleChange}
                                onBlur={editFormik.handleBlur}
                                placeholder="Email"
                              />

                              {editFormik.touched.email &&
                                editFormik.errors.email && (
                                  <small className="error-message">
                                    {editFormik.errors.email}
                                  </small>
                                )}

                            </div>

                          ) : (

                            user.email

                          )}

                        </td>

                        {/* ROLE */}

                        <td>

                          {isEditing ? (

                            <div className="inline-edit-field">

                              <select
                                name="role"
                                value={editFormik.values.role}
                                onChange={editFormik.handleChange}
                                onBlur={editFormik.handleBlur}
                              >

                                <option value="user">
                                  User
                                </option>

                                <option value="admin">
                                  Admin
                                </option>

                              </select>

                              {editFormik.touched.role &&
                                editFormik.errors.role && (
                                  <small className="error-message">
                                    {editFormik.errors.role}
                                  </small>
                                )}

                            </div>

                          ) : (

                            <span
                              className={`role-badge ${user.role}`}
                            >
                              {user.role}
                            </span>

                          )}

                        </td>

                        {/* STATUS */}

                        <td>

                          <span className="user-status">
                            Active
                          </span>

                        </td>

                        {/* ACTION */}

                        <td>

                          {isEditing ? (

                            <div className="inline-edit-actions">

                              <button
                                type="button"
                                className="save-user-button"
                                onClick={editFormik.submitForm}
                                disabled={
                                  editFormik.isSubmitting
                                }
                              >
                                {editFormik.isSubmitting
                                  ? "Saving..."
                                  : "💾 Save"}
                              </button>

                              <button
                                type="button"
                                className="cancel-edit-button"
                                onClick={handleCancelEdit}
                                disabled={
                                  editFormik.isSubmitting
                                }
                              >
                                ✕ Cancel
                              </button>

                            </div>

                          ) : (

                            <div className="user-actions">

                              <button
                                type="button"
                                className="edit-user-button"
                                onClick={() =>
                                  handleEditUser(user)
                                }
                              >
                                ✏️ Edit
                              </button>

                              {user.role === "admin" ? (

                                <span className="protected-user">
                                  Protected
                                </span>

                              ) : (

                                <button
                                  type="button"
                                  className="remove-user-button"
                                  onClick={() =>
                                    handleDeleteUser(
                                      user._id,
                                      user.name
                                    )
                                  }
                                  disabled={
                                    deletingId === user._id
                                  }
                                >
                                  {deletingId === user._id
                                    ? "Removing..."
                                    : "🗑️ Remove"}
                                </button>

                              )}

                            </div>

                          )}

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default AdminUsers;