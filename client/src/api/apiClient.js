// this is the file for the api client that will be used to make requests to the backend server, the reason it is in a separate file is to keep the code organized and to make it easier to change the base url if needed.
// also this this file will be used to handle the authentication token and to set the headers for the requests. since we are using cookies.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3333"; // server is running on port 3333, this is the base url for the api requests. if the env variable is not set, it will default to localhost:3333

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include", //imp for cookies to be sent with requests, this is needed for authentication since we are using cookies to store the session id.
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error || "Request failed.";
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  login(credentials) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  logout() {
    return apiRequest("/auth/logout", {
      method: "POST",
    });
  },

  me() {
    return apiRequest("/auth/me");
  },
};
