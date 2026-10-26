import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(formData);
      navigate("/");
    } catch (err) {
      setError(err.message || "Unable to register.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Capstone Project</p>
        <h1>Create your account</h1>
        <p className="muted">
          Register to submit, manage, and browse internship/co-op experiences.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Full Name
            <input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting}>
            {submitting ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="helper-text">
          Passwords must include uppercase, lowercase, number, and special
          character.
        </p>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </section>
    </main>
  );
}
