// this is the API client for the application, it handles all the HTTP requests to the backend server..
import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/apiClient";

const AuthContext = createContext(null);

// The AuthProvider component is responsible for managing the authentication state of the application. It provides the current user, loading state, and authentication functions (login and logout) to its children components via the AuthContext.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const data = await authApi.me();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  async function login({ email, password }) {
    const data = await authApi.login({ email, password });
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

// this gives the frontend one shared source of truth for login state.