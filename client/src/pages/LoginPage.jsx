import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(formData);
      navigate("/");
    } catch (err) {
      setError(err.message || "Unable to log in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Capstone Project</p>
        <h1>Internship & Co-op Experience Sharing Platform</h1>
        <p className="muted">
          Log in to submit, manage, and browse internship/co-op experiences.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Email
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student1@test.com"
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
              placeholder="P@ssw0rd123"
              required
            />
          </label>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="helper-text">
          Passwords must include uppercase, lowercase, number, and special
          character.
        </p>
      </section>
    </main>
  );
}
