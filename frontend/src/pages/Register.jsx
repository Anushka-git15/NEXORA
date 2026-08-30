import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "../CSS/Login.css";

const registerSchema = Yup.object({
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
    .email("Enter a valid email address")
    .required("Email is required"),

  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /[A-Z]/,
      "Password must contain at least one uppercase letter"
    )
    .matches(
      /[a-z]/,
      "Password must contain at least one lowercase letter"
    )
    .matches(
      /[0-9]/,
      "Password must contain at least one number"
    )
    .matches(
      /[@$!%*?&]/,
      "Password must contain at least one special symbol"
    ),
});

const Register = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },

    validationSchema: registerSchema,

    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/register",
          {
            name: values.name.trim(),
            email: values.email.trim(),
            password: values.password,
          }
        );

        console.log("REGISTER SUCCESS:", response.data);

        alert(response.data.message);

        navigate("/login");
      } catch (error) {
        console.log(
          "REGISTER ERROR:",
          error.response?.data
        );

        alert(
          error.response?.data?.message ||
          "Registration failed"
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-brand">

          <div className="brand-icon">
            N
          </div>

          <h1>NEXORA</h1>

        </div>

        <div className="auth-heading">

          <h2>
            Create your account ✨
          </h2>

          <p>
            Join NEXORA and manage everything in one place.
          </p>

        </div>

        <form
          className="auth-form"
          onSubmit={formik.handleSubmit}
        >

          {/* NAME */}

          <div className="form-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            {formik.touched.name && formik.errors.name && (
              <small className="error-message">
                {formik.errors.name}
              </small>
            )}

          </div>

          {/* EMAIL */}

          <div className="form-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            {formik.touched.email && formik.errors.email && (
              <small className="error-message">
                {formik.errors.email}
              </small>
            )}

          </div>

          {/* PASSWORD */}

          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            {formik.touched.password && formik.errors.password && (
              <small className="error-message">
                {formik.errors.password}
              </small>
            )}

          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <p className="auth-switch">

          Already have an account?

          <Link to="/login">
            {" "}Sign in
          </Link>

        </p>

      </div>

    </div>
  );
};

export default Register;