import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../CSS/Admin.css";

// ===============================
// CONTENT VALIDATION
// ===============================

const contentSchema = Yup.object({
  title: Yup.string()
    .trim()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),

  description: Yup.string()
    .trim()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),

  status: Yup.string()
    .required("Status is required")
    .oneOf(
      ["active", "inactive"],
      "Status must be active or inactive"
    ),
});

const Admin = () => {
  const navigate = useNavigate();

  const [content, setContent] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ===============================
  // FETCH CONTENT
  // ===============================

  const fetchContent = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/content",
        config
      );

      setContent(response.data.content);
    } catch (error) {
      console.log(
        "FETCH CONTENT ERROR:",
        error.response?.data
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // ===============================
  // ADD CONTENT - FORMIK
  // ===============================

  const addFormik = useFormik({
    initialValues: {
      title: "",
      description: "",
      status: "active",
    },

    validationSchema: contentSchema,

    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const newContent = {
          title: values.title.trim(),
          description: values.description.trim(),
          status: values.status,
        };

        await axios.post(
          "http://localhost:5000/api/admin/content",
          newContent,
          config
        );

        alert("Content added successfully!");

        resetForm();

        fetchContent();
      } catch (error) {
        console.log(
          "ADD CONTENT ERROR:",
          error.response?.data
        );

        alert(
          error.response?.data?.message ||
            "Failed to add content"
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ===============================
  // EDIT CONTENT - FORMIK
  // ===============================

  const editFormik = useFormik({
    initialValues: {
      title: "",
      description: "",
      status: "active",
    },

    validationSchema: contentSchema,

    onSubmit: async (values, { setSubmitting }) => {
      const currentContent = content.find(
        (item) => item._id === editingId
      );

      if (!currentContent) {
        setSubmitting(false);
        return;
      }

      // OLD VALUES
      const oldValues = {
        title: (currentContent.title || "").trim(),
        description: (
          currentContent.description || ""
        ).trim(),
        status: currentContent.status,
      };

      // NEW VALUES
      const newValues = {
        title: values.title.trim(),
        description: values.description.trim(),
        status: values.status,
      };

      // ===============================
      // NO CHANGES
      // ===============================

      const noChanges =
        oldValues.title === newValues.title &&
        oldValues.description === newValues.description &&
        oldValues.status === newValues.status;

      if (noChanges) {
        alert("No changes made");
        setSubmitting(false);
        return;
      }

      // ===============================
      // UPDATE
      // ===============================

      try {
        const response = await axios.put(
          `http://localhost:5000/api/admin/content/${editingId}`,
          newValues,
          config
        );

        alert("Content updated successfully!");

        setContent((prevContent) =>
          prevContent.map((item) =>
            item._id === editingId
              ? response.data.content
              : item
          )
        );

        setEditingId(null);
        editFormik.resetForm();
      } catch (error) {
        console.log(
          "UPDATE CONTENT ERROR:",
          error.response?.data
        );

        alert(
          error.response?.data?.message ||
            "Failed to update content"
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ===============================
  // START EDIT
  // ===============================

  const handleEdit = (item) => {
    setEditingId(item._id);

    editFormik.setValues({
      title: item.title || "",
      description: item.description || "",
      status: item.status || "active",
    });

    editFormik.setTouched({});
  };

  // ===============================
  // CANCEL EDIT
  // ===============================

  const handleCancelEdit = () => {
    setEditingId(null);
    editFormik.resetForm();
  };

  // ===============================
  // DELETE CONTENT
  // ===============================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this content?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(id);

      await axios.delete(
        `http://localhost:5000/api/admin/content/${id}`,
        config
      );

      alert("Content deleted successfully!");

      setContent((prevContent) =>
        prevContent.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.log(
        "DELETE ERROR:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete content"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-page">

      <div className="admin-container">

        {/* ===============================
            HEADER
        =============================== */}

        <div className="admin-header">

          <div>
            <p>ADMIN PANEL</p>

            <h1>
              Manage Content 👑
            </h1>

            <span>
              Add, update and remove NEXORA content.
            </span>
          </div>

          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>

        </div>

        {/* ===============================
            ADD CONTENT FORM
        =============================== */}

        <div className="admin-form-card">

          <h2>
            Add New Content
          </h2>

          <form onSubmit={addFormik.handleSubmit}>

            {/* TITLE */}

            <div className="admin-form-group">

              <label>
                Title
              </label>

              <input
                type="text"
                name="title"
                placeholder="Enter content title"
                value={addFormik.values.title}
                onChange={addFormik.handleChange}
                onBlur={addFormik.handleBlur}
              />

              {addFormik.touched.title &&
                addFormik.errors.title && (
                  <small className="error-message">
                    {addFormik.errors.title}
                  </small>
                )}

            </div>

            {/* DESCRIPTION */}

            <div className="admin-form-group">

              <label>
                Description
              </label>

              <textarea
                name="description"
                placeholder="Enter content description"
                value={addFormik.values.description}
                onChange={addFormik.handleChange}
                onBlur={addFormik.handleBlur}
                rows="4"
              />

              {addFormik.touched.description &&
                addFormik.errors.description && (
                  <small className="error-message">
                    {addFormik.errors.description}
                  </small>
                )}

            </div>

            {/* STATUS */}

            <div className="admin-form-group">

              <label>
                Status
              </label>

              <select
                name="status"
                value={addFormik.values.status}
                onChange={addFormik.handleChange}
                onBlur={addFormik.handleBlur}
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>

              {addFormik.touched.status &&
                addFormik.errors.status && (
                  <small className="error-message">
                    {addFormik.errors.status}
                  </small>
                )}

            </div>

            <div className="admin-form-actions">

              <button
                type="submit"
                className="admin-submit"
                disabled={addFormik.isSubmitting}
              >
                {addFormik.isSubmitting
                  ? "Saving..."
                  : "Add Content"}
              </button>

            </div>

          </form>

        </div>

        {/* ===============================
            CONTENT LIST
        =============================== */}

        <div className="content-section">

          <div className="section-heading">

            <h2>
              All Content
            </h2>

            <span>
              {content.length} items
            </span>

          </div>

          {content.length === 0 ? (

            <div className="empty-content">
              <p>No content available.</p>
            </div>

          ) : (

            <div className="content-grid">

              {content.map((item) => {

                const isEditing =
                  editingId === item._id;

                return (
                  <div
                    className="content-card"
                    key={item._id}
                  >

                    {isEditing ? (

                      /* ===============================
                         INLINE EDIT MODE
                      =============================== */

                      <div className="inline-content-edit">

                        <h3>
                          Edit Content
                        </h3>

                        {/* TITLE */}

                        <div className="admin-form-group">

                          <label>
                            Title
                          </label>

                          <input
                            type="text"
                            name="title"
                            value={editFormik.values.title}
                            onChange={editFormik.handleChange}
                            onBlur={editFormik.handleBlur}
                            placeholder="Enter title"
                          />

                          {editFormik.touched.title &&
                            editFormik.errors.title && (
                              <small className="error-message">
                                {editFormik.errors.title}
                              </small>
                            )}

                        </div>

                        {/* DESCRIPTION */}

                        <div className="admin-form-group">

                          <label>
                            Description
                          </label>

                          <textarea
                            name="description"
                            value={
                              editFormik.values.description
                            }
                            onChange={editFormik.handleChange}
                            onBlur={editFormik.handleBlur}
                            rows="4"
                            placeholder="Enter description"
                          />

                          {editFormik.touched.description &&
                            editFormik.errors.description && (
                              <small className="error-message">
                                {
                                  editFormik.errors
                                    .description
                                }
                              </small>
                            )}

                        </div>

                        {/* STATUS */}

                        <div className="admin-form-group">

                          <label>
                            Status
                          </label>

                          <select
                            name="status"
                            value={editFormik.values.status}
                            onChange={editFormik.handleChange}
                            onBlur={editFormik.handleBlur}
                          >

                            <option value="active">
                              Active
                            </option>

                            <option value="inactive">
                              Inactive
                            </option>

                          </select>

                          {editFormik.touched.status &&
                            editFormik.errors.status && (
                              <small className="error-message">
                                {editFormik.errors.status}
                              </small>
                            )}

                        </div>

                        {/* ACTIONS */}

                        <div className="content-actions">

                          <button
                            type="button"
                            className="edit-button"
                            onClick={
                              editFormik.submitForm
                            }
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
                            className="delete-button"
                            onClick={
                              handleCancelEdit
                            }
                            disabled={
                              editFormik.isSubmitting
                            }
                          >
                            ✕ Cancel
                          </button>

                        </div>

                      </div>

                    ) : (

                      /* ===============================
                         NORMAL CONTENT MODE
                      =============================== */

                      <>

                        <div className="content-card-top">

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

                        <div className="content-actions">

                          <button
                            className="edit-button"
                            onClick={() =>
                              handleEdit(item)
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(item._id)
                            }
                            disabled={
                              deletingId === item._id
                            }
                          >
                            {deletingId === item._id
                              ? "Deleting..."
                              : "🗑️ Delete"}
                          </button>

                        </div>

                      </>

                    )}

                  </div>
                );
              })}

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default Admin;