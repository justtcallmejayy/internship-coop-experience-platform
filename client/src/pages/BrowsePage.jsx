import { useEffect, useState } from "react";
import { Link } from "react-router";
import AppNav from "../components/AppNav";
import { browseApi, referenceApi } from "../api/apiClient";

export default function BrowsePage() {
  const [filters, setFilters] = useState({ search: "", industry_id: "", work_term_type: "", work_mode: "" });
  const [industries, setIndustries] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    referenceApi.getIndustries()
      .then((data) => setIndustries(data.industries || []))
      .catch((loadError) => setError(loadError.message || "Unable to load industries."));
  }, []);

  useEffect(() => {
    setLoading(true);
    browseApi.getEntries(filters)
      .then((data) => setEntries(data.entries || []))
      .catch((loadError) => setError(loadError.message || "Unable to load experiences."))
      .finally(() => setLoading(false));
  }, [filters]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  return (
    <>
      <AppNav />
      <main className="page-shell">
        <section className="hero-card"><p className="eyebrow">Explore experiences</p><h1>Browse approved experiences</h1><p className="muted">Learn from internship and co-op experiences shared by students.</p></section>
        <section className="summary-card filter-bar">
          <label>Search<input name="search" value={filters.search} onChange={updateFilter} placeholder="Company or role" /></label>
          <label>Industry<select name="industry_id" value={filters.industry_id} onChange={updateFilter}><option value="">All industries</option>{industries.map((industry) => <option key={industry.industry_id} value={industry.industry_id}>{industry.industry_name}</option>)}</select></label>
          <label>Term type<select name="work_term_type" value={filters.work_term_type} onChange={updateFilter}><option value="">All terms</option><option>Internship</option><option>Co-op</option></select></label>
          <label>Work mode<select name="work_mode" value={filters.work_mode} onChange={updateFilter}><option value="">All modes</option><option>In-person</option><option>Hybrid</option><option>Remote</option></select></label>
        </section>
        {error && <p className="error-message" role="alert">{error}</p>}
        {loading && <p className="status-text">Loading experiences...</p>}
        {!loading && entries.length === 0 && <section className="summary-card"><p className="muted">No approved experiences match your search.</p></section>}
        <section className="browse-grid">
          {!loading && entries.map((entry) => (
            <article className="summary-card experience-card" key={entry.entry_id}>
              <p className="eyebrow">{entry.industry_name}</p>
              <h2>{entry.role_title}</h2><p><strong>{entry.company_name}</strong> · {entry.work_mode}</p>
              <p className="muted">{entry.work_term_type} · {entry.location_city}, {entry.location_province}</p>
              <p>{entry.learning_outcomes}</p>
              <Link className="button-link" to={`/browse/${entry.entry_id}`}>View experience</Link>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
