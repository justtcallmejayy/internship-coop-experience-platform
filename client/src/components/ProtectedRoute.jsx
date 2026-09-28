// this is a protected route component that checks if the user is authenticated before rendering the desired component. If the user is not authenticated, they will be redirected to the login page.

import { Navigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children }) {
  const { authLoading, isAuthenticated } = useAuth();

  if (authLoading) {
    return <p className="status-text">Checking session...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
// it blocks unauthenticated users from protected frontend pages.