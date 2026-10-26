import { Navigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

export default function AdminRoute({ children }) {
  const { authLoading, isAuthenticated, user } = useAuth();

  if (authLoading) {
    return <p className="status-text">Checking session...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "Admin") {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}