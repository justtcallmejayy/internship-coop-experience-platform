import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import AppNav from "../components/AppNav";
import { browseApi } from "../api/apiClient";

export default function BrowseDetailPage() {
  const { entryId } = useParams();
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    browseApi.getEntry(entryId).then((data) => setEntry(data.entry)).catch((loadError) => setError(loadError.message));
  }, [entryId]);

  if (!entry && !error) return <p className="status-text">Loading experience...</p>;
  return (
    <>
      <AppNav />
      <main className="page-shell">
        {error && <p className="error-message">{error}</p>}
        {entry && <section className="summary-card detail-card">
          <p className="eyebrow">{entry.industry_name}</p><h1>{entry.role_title} at {entry.company_name}</h1>
          <p className="muted">Shared by {entry.author_name} · {entry.work_term_type} · {entry.work_mode}</p>
          <p><strong>Location:</strong> {entry.location_city}, {entry.location_province}</p>
          <p><strong>Dates:</strong> {entry.start_month}/{entry.start_year} - {entry.end_month}/{entry.end_year}</p>
          <p><strong>Interview:</strong> {entry.interview_format}</p>
          <h2>Technologies</h2><p>{entry.technologies.map((technology) => technology.tech_name).join(", ")}</p>
          <h2>Learning outcomes</h2><p className="pre-wrap">{entry.learning_outcomes}</p>
          <Link to="/browse">Back to browse</Link>
        </section>}
      </main>
    </>
  );
}
