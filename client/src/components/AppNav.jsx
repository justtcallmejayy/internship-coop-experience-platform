import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

export default function AppNav() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="top-nav">
      <Link className="brand" to="/">Co-op Experiences</Link>
      <nav className="nav-links">
        <Link to="/" aria-current={location.pathname === "/" ? "page" : undefined}>Dashboard</Link>
        <Link to="/browse" aria-current={location.pathname.startsWith("/browse") ? "page" : undefined}>Browse</Link>
        <Link to="/profile" aria-current={location.pathname === "/profile" ? "page" : undefined}>Profile</Link>
        {user?.role === "Admin" && (
          <Link to="/admin/moderation" aria-current={location.pathname.startsWith("/admin") ? "page" : undefined}>
            Moderation
          </Link>
        )}
        <button type="button" className="secondary-button" onClick={handleLogout}>
          Log Out
        </button>
      </nav>
    </header>
  );
}
