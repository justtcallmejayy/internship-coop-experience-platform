import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import AppNav from "../components/AppNav";
import { experienceApi } from "../api/apiClient";

export default function ExperienceDetailPage() {
  const { entryId } = useParams();
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    experienceApi.getEntry(entryId).then((data) => setEntry(data.entry)).catch((loadError) => setError(loadError.message));
  }, [entryId]);

  async function submitEntry() {
    setBusy(true);
    try {
      const data = await experienceApi.submitEntry(entryId);
      setEntry(data.entry);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteEntry() {
    if (!window.confirm("Delete this draft experience?")) return;
    setBusy(true);
    try {
      await experienceApi.deleteEntry(entryId);
      window.location.href = "/";
    } catch (deleteError) {
      setError(deleteError.message);
      setBusy(false);
    }
  }

  if (!entry && !error) return <p className="status-text">Loading experience...</p>;
  if (error && !entry) return <><AppNav /><main className="page-shell"><p className="error-message">{error}</p></main></>;

  const canEdit = entry.moderation_status !== "Pending" && entry.moderation_status !== "Approved";
  return (
    <>
      <AppNav />
      <main className="page-shell">
        <section className="hero-card"><p className="eyebrow">{entry.moderation_status}</p><h1>{entry.role_title} at {entry.company_name}</h1><p className="muted">{entry.location_city}, {entry.location_province} · {entry.work_term_type} · {entry.work_mode}</p></section>
        {error && <p className="error-message" role="alert">{error}</p>}
        <section className="summary-card detail-card">
          <h2>Experience details</h2>
          <p><strong>Industry:</strong> {entry.industry_name}</p>
          <p><strong>Dates:</strong> {entry.start_month}/{entry.start_year} - {entry.end_month}/{entry.end_year}</p>
          <p><strong>Interview:</strong> {entry.interview_format}</p>
          <h2>Technologies</h2><p>{entry.technologies.map((technology) => technology.tech_name).join(", ")}</p>
          <h2>Learning outcomes</h2><p className="pre-wrap">{entry.learning_outcomes}</p>
          <div className="action-row">
            {canEdit && <Link className="button-link" to={`/experiences/${entry.entry_id}/edit`}>Edit</Link>}
            {canEdit && <button type="button" onClick={submitEntry} disabled={busy}>Submit for review</button>}
            {entry.moderation_status === "Draft" && <button type="button" className="danger-button" onClick={deleteEntry} disabled={busy}>Delete draft</button>}
          </div>
        </section>
      </main>
    </>
  );
}
