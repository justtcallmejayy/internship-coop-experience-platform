import { Link, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

export default function AppNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="top-nav">
      <strong>Co-op Experiences</strong>
      <nav className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/browse">Browse</Link>
        <Link to="/profile">Profile</Link>
        <button type="button" className="secondary-button" onClick={handleLogout}>
          Log Out
        </button>
      </nav>
    </header>
  );
}
