import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "../CSS/Login.css";

const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),

  password: Yup.string()
    .required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },

    validationSchema: loginSchema,

    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log("SENDING:", values);

        const response = await axios.post(
          "http://localhost:5000/api/auth/login",
          {
            email: values.email.trim(),
            password: values.password,
          }
        );

        localStorage.setItem("token", response.data.token);

        alert("Login successful!");

        navigate("/dashboard");
      } catch (error) {
        console.log(
          "LOGIN ERROR:",
          error.response?.data
        );

        alert(
          error.response?.data?.message ||
          "Login failed"
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
          <div className="brand-icon">N</div>
          <h1>NEXORA</h1>
        </div>

        <div className="auth-heading">
          <h2>Welcome back 👋</h2>
          <p>Sign in to continue to your dashboard.</p>
        </div>

        <form
          className="auth-form"
          onSubmit={formik.handleSubmit}
        >

          {/* EMAIL */}

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            {formik.touched.email &&
              formik.errors.email && (
                <p className="error-message">
                  {formik.errors.email}
                </p>
              )}
          </div>

          {/* PASSWORD */}

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            {formik.touched.password &&
              formik.errors.password && (
                <p className="error-message">
                  {formik.errors.password}
                </p>
              )}
          </div>

          <div className="form-options">

            <label className="remember">
              <input type="checkbox" />
              Remember me
            </label>

            <a href="#" className="forgot">
              Forgot password?
            </a>

          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting
              ? "Signing In..."
              : "Sign In"}
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?
          <Link to="/register"> Create account</Link>
        </p>

      </div>

    </div>
  );
};

export default Login;