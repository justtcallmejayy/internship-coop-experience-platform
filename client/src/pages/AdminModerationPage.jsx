import { useEffect, useState } from "react";
import AppNav from "../components/AppNav";
import { adminApi } from "../api/apiClient";

export default function AdminModerationPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadEntries() {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.getPendingEntries();
      setEntries(data.entries || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load moderation queue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  async function reviewEntry(entryId, action) {
    setBusyId(entryId);
    setError("");
    setMessage("");
    try {
      const data =
        action === "approve"
          ? await adminApi.approveEntry(entryId)
          : await adminApi.rejectEntry(entryId);
      setEntries((current) =>
        current.filter((entry) => entry.entry_id !== entryId),
      );
      setMessage(data.message);
    } catch (reviewError) {
      setError(reviewError.message || "Unable to update entry.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <AppNav />
      <main className="page-shell">
        <section className="hero-card">
          <p className="eyebrow">Administrator</p>
          <h1>Moderation queue</h1>
          <p className="muted">
            Review pending student experience submissions.
          </p>
        </section>

        {message && <p className="success-message" role="status">{message}</p>}
        {error && <p className="error-message" role="alert">{error}</p>}
        {loading && <p className="status-text">Loading moderation queue...</p>}
        {!loading && entries.length === 0 && (
          <section className="summary-card">
            <p className="muted">There are no pending entries.</p>
          </section>
        )}
        <section className="browse-grid">
          {!loading &&
            entries.map((entry) => (
              <article className="summary-card experience-card" key={entry.entry_id}>
                <p className="eyebrow">{entry.industry_name}</p>
                <h2>{entry.role_title} at {entry.company_name}</h2>
                <p>
                  <strong>Submitted by:</strong> {entry.author_name} (
                  {entry.author_email})
                </p>
                <p className="muted">
                  {entry.work_term_type} · {entry.work_mode} ·{" "}
                  {entry.location_city}, {entry.location_province}
                </p>
                <p className="pre-wrap">{entry.learning_outcomes}</p>
                <p>
                  <strong>Technologies:</strong>{" "}
                  {entry.technologies.map((technology) => technology.tech_name).join(", ")}
                </p>
                <div className="action-row">
                  <button
                    type="button"
                    disabled={busyId === entry.entry_id}
                    onClick={() => reviewEntry(entry.entry_id, "approve")}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    disabled={busyId === entry.entry_id}
                    onClick={() => reviewEntry(entry.entry_id, "reject")}
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
        </section>
      </main>
    </>
  );
}