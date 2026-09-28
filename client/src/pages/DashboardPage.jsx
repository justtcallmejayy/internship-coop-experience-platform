import { useAuth } from "../auth/AuthContext";

export function DashboardContent({ user }) {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">Student Dashboard</p>
        <h1>Welcome{user?.full_name ? `, ${user.full_name}` : ""}</h1>
        <p className="muted">
          This dashboard will show your recent submissions, approval status, and
          quick actions for creating or browsing experience entries.
        </p>
      </section>

      <section className="grid">
        <article className="summary-card">
          <h2>My Entries</h2>
          <p>Coming next in frontend implementation.</p>
        </article>

        <article className="summary-card">
          <h2>Browse Experiences</h2>
          <p>Approved experiences will be searchable and filterable here.</p>
        </article>

        <article className="summary-card">
          <h2>Profile</h2>
          <p>Profile editing will connect to the existing backend API.</p>
        </article>
      </section>
    </main>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="top-nav">
        <strong>Co-op Experiences</strong>
        <button type="button" className="secondary-button" onClick={logout}>
          Log Out
        </button>
      </header>

      <DashboardContent user={user} />
    </>
  );
}
