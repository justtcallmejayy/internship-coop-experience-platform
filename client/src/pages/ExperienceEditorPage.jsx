import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import AppNav from "../components/AppNav";
import ExperienceForm from "../components/ExperienceForm";
import { experienceApi } from "../api/apiClient";

export default function ExperienceEditorPage() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(Boolean(entryId));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!entryId) return;
    experienceApi.getEntry(entryId)
      .then((data) => setEntry(data.entry))
      .catch((loadError) => setError(loadError.message || "Unable to load entry."))
      .finally(() => setLoading(false));
  }, [entryId]);

  async function handleSubmit(payload, validationError) {
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const data = entry
        ? await experienceApi.updateEntry(entry.entry_id, payload)
        : await experienceApi.createEntry(payload);
      navigate(`/experiences/${data.entry.entry_id}`);
    } catch (submitError) {
      setError(submitError.data?.details?.join(" ") || submitError.message || "Unable to save entry.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="status-text">Loading experience...</p>;
  if (entry && entry.moderation_status === "Pending") {
    return <><AppNav /><main className="page-shell"><p className="error-message">Entries under review cannot be edited.</p><Link to={`/experiences/${entry.entry_id}`}>Back to entry</Link></main></>;
  }

  return (
    <>
      <AppNav />
      <main className="page-shell">
        <section className="hero-card"><p className="eyebrow">Student submission</p><h1>{entry ? "Edit experience" : "Create experience"}</h1><p className="muted">Save your experience as a draft, then submit it for review when complete.</p></section>
        <section className="summary-card"><ExperienceForm entry={entry} onSubmit={handleSubmit} submitting={submitting} error={error} /></section>
      </main>
    </>
  );
}
