import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { experienceApi } from "../api/apiClient";
import { useAuth } from "../auth/AuthContext";

function countByStatus(entries, status) {
  return entries.filter((entry) => entry.moderation_status === status).length;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEntries() {
      try {
        const data = await experienceApi.getMyEntries();
        setEntries(data.entries || []);
      } catch (err) {
        setError(err.message || "Unable to load entries.");
      } finally {
        setLoadingEntries(false);
      }
    }

    loadEntries();
  }, []);

  const counts = useMemo(() => {
    return {
      total: entries.length,
      draft: countByStatus(entries, "Draft"),
      pending: countByStatus(entries, "Pending"),
      approved: countByStatus(entries, "Approved"),
      rejected: countByStatus(entries, "Rejected")
    };
  }, [entries]);

  return (
    <>
      <header className="top-nav">
        <strong>Co-op Experiences</strong>

        <nav className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/profile">Profile</Link>
          <button type="button" className="secondary-button" onClick={logout}>
            Log Out
          </button>
        </nav>
      </header>

      <main className="page-shell">
        <section className="hero-card">
          <p className="eyebrow">Student Dashboard</p>
          <h1>Welcome{user?.full_name ? `, ${user.full_name}` : ""}</h1>
          <p className="muted">
            Track your internship and co-op experience submissions.
          </p>
        </section>

        <section className="grid">
          <article className="summary-card">
            <h2>{counts.total}</h2>
            <p>Total Entries</p>
          </article>

          <article className="summary-card">
            <h2>{counts.draft}</h2>
            <p>Draft</p>
          </article>

          <article className="summary-card">
            <h2>{counts.pending}</h2>
            <p>Pending</p>
          </article>

          <article className="summary-card">
            <h2>{counts.approved}</h2>
            <p>Approved</p>
          </article>

          <article className="summary-card">
            <h2>{counts.rejected}</h2>
            <p>Rejected</p>
          </article>
        </section>

        <section className="summary-card">
          <div className="section-header">
            <h2>My Recent Submissions</h2>
            <Link className="button-link" to="/experiences/new">
              Create New Experience
            </Link>
          </div>

          {loadingEntries && <p>Loading entries...</p>}
          {error && <p className="error-message">{error}</p>}

          {!loadingEntries && entries.length === 0 && (
            <p className="muted">No experience entries yet.</p>
          )}

          {!loadingEntries && entries.length > 0 && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.entry_id}>
                    <td>{entry.company_name}</td>
                    <td>{entry.role_title}</td>
                    <td>{entry.moderation_status}</td>
                    <td>
                      {entry.last_updated_date
                        ? new Date(entry.last_updated_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </>
  );
}