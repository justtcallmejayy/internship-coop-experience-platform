import { useEffect, useState } from "react";
import { profileApi } from "../api/apiClient";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    role: "",
    program: "",
    graduation_year: "",
    linkedin_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await profileApi.getProfile();

        setProfile({
          full_name: data.user.full_name || "",
          email: data.user.email || "",
          role: data.user.role || "",
          program: data.user.program || "",
          graduation_year: data.user.graduation_year || "",
          linkedin_url: data.user.linkedin_url || "",
        });
      } catch (err) {
        setError(err.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = {
        full_name: profile.full_name,
        program: profile.program || null,
        graduation_year: profile.graduation_year
          ? Number(profile.graduation_year)
          : null,
        linkedin_url: profile.linkedin_url || null,
      };

      const data = await profileApi.updateProfile(payload);

      setProfile({
        full_name: data.user.full_name || "",
        email: data.user.email || "",
        role: data.user.role || "",
        program: data.user.program || "",
        graduation_year: data.user.graduation_year || "",
        linkedin_url: data.user.linkedin_url || "",
      });

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update profile.");
    }
  }

  if (loading) {
    return <p className="status-text">Loading profile...</p>;
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">User Profile</p>
        <h1>My Profile</h1>
        <p className="muted">
          View and update your student profile information.
        </p>
      </section>

      <section className="summary-card">
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              name="full_name"
              value={profile.full_name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email
            <input value={profile.email} disabled />
          </label>

          <label>
            Role
            <input value={profile.role} disabled />
          </label>

          <label>
            Program
            <input
              name="program"
              value={profile.program}
              onChange={handleChange}
              placeholder="CST - Software Development"
            />
          </label>

          <label>
            Graduation Year
            <input
              name="graduation_year"
              type="number"
              value={profile.graduation_year}
              onChange={handleChange}
              placeholder="2026"
            />
          </label>

          <label>
            LinkedIn URL
            <input
              name="linkedin_url"
              value={profile.linkedin_url}
              onChange={handleChange}
              placeholder="https://www.linkedin.com/in/yourname"
            />
          </label>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          <button type="submit">Save Profile</button>
        </form>
      </section>
    </main>
  );
}
