import { Link } from "react-router";
import AppNav from "../components/AppNav";

export default function AccessDeniedPage() {
  return (
    <>
      <AppNav />
      <main className="page-shell">
        <section className="hero-card">
          <p className="eyebrow">403 Access denied</p>
          <h1>You do not have permission to view this page.</h1>
          <p className="muted">
            This area is restricted to administrator accounts.
          </p>
          <Link className="button-link" to="/">
            Return to dashboard
          </Link>
        </section>
      </main>
    </>
  );
}