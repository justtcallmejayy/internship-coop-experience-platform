const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

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
  register(account) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(account),
    });
  },

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

export const profileApi = {
  getProfile() {
    return apiRequest("/profile");
  },

  updateProfile(profileData) {
    return apiRequest("/profile", {
      method: "PATCH",
      body: JSON.stringify(profileData),
    });
  },
};

export const referenceApi = {
  getIndustries() {
    return apiRequest("/reference/industries");
  },

  getTechnologies() {
    return apiRequest("/reference/technologies");
  },
};

export const experienceApi = {
  getMyEntries() {
    return apiRequest("/experiences/my");
  },

  createEntry(entryData) {
    return apiRequest("/experiences", {
      method: "POST",
      body: JSON.stringify(entryData),
    });
  },

  getEntry(entryId) {
    return apiRequest(`/experiences/${entryId}`);
  },

  updateEntry(entryId, entryData) {
    return apiRequest(`/experiences/${entryId}`, {
      method: "PATCH",
      body: JSON.stringify(entryData),
    });
  },

  deleteEntry(entryId) {
    return apiRequest(`/experiences/${entryId}`, {
      method: "DELETE",
    });
  },

  submitEntry(entryId) {
    return apiRequest(`/experiences/${entryId}/submit`, {
      method: "POST",
    });
  },
};

export const browseApi = {
  getEntries(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    return apiRequest(`/browse/experiences${query ? `?${query}` : ""}`);
  },

  getEntry(entryId) {
    return apiRequest(`/browse/experiences/${entryId}`);
  },
};

export const adminApi = {
  getPendingEntries() {
    return apiRequest("/admin/experiences/pending");
  },

  approveEntry(entryId) {
    return apiRequest(`/admin/experiences/${entryId}/approve`, {
      method: "PATCH",
    });
  },

  rejectEntry(entryId) {
    return apiRequest(`/admin/experiences/${entryId}/reject`, {
      method: "PATCH",
    });
  },
};
