// ── FinTrack API Client ──────────────────────────────────────────
// Replace this URL with your actual Railway backend URL
export const API_URL = "https://fintrack-backend-production.up.railway.app";

// Token stored in memory (not localStorage for security)
let _token = null;

export const setToken = (t) => { _token = t; };
export const getToken = ()  => _token;
export const clearToken= () => { _token = null; };

// Core fetch wrapper
async function req(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  if (_token) headers["Authorization"] = `Bearer ${_token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

// ── Auth ─────────────────────────────────────────────────────────
export const api = {
  auth: {
    register:      (name, email, password) => req("POST", "/api/auth/register",       { name, email, password }),
    login:         (email, password)        => req("POST", "/api/auth/login",          { email, password }),
    firebaseSync:  (idToken)                => req("POST", "/api/auth/firebase",       {}, { Authorization: `Bearer ${idToken}` }),
    me:            ()                       => req("GET",  "/api/auth/me"),
    updateProfile: (name)                   => req("PATCH","/api/auth/profile",        { name }),
  },

  // ── Transactions ───────────────────────────────────────────────
  txns: {
    getAll:   (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return req("GET", `/api/transactions${q ? "?" + q : ""}`);
    },
    summary:  (month, year) => req("GET",    `/api/transactions/summary?month=${month}&year=${year}`),
    create:   (data)        => req("POST",   "/api/transactions",    data),
    update:   (id, data)    => req("PATCH",  `/api/transactions/${id}`, data),
    remove:   (id)          => req("DELETE", `/api/transactions/${id}`),
  },

  // ── Assets ─────────────────────────────────────────────────────
  assets: {
    getAll: ()          => req("GET",    "/api/assets"),
    create: (data)      => req("POST",   "/api/assets",      data),
    update: (id, data)  => req("PATCH",  `/api/assets/${id}`,data),
    remove: (id)        => req("DELETE", `/api/assets/${id}`),
  },

  // ── Liabilities ────────────────────────────────────────────────
  liabs: {
    getAll: ()          => req("GET",    "/api/liabilities"),
    create: (data)      => req("POST",   "/api/liabilities",      data),
    update: (id, data)  => req("PATCH",  `/api/liabilities/${id}`,data),
    remove: (id)        => req("DELETE", `/api/liabilities/${id}`),
  },

  // ── Loans ──────────────────────────────────────────────────────
  loans: {
    getAll:      ()            => req("GET",   "/api/loans"),
    getOne:      (id)          => req("GET",   `/api/loans/${id}`),
    create:      (data)        => req("POST",  "/api/loans",              data),
    update:      (id, data)    => req("PATCH", `/api/loans/${id}`,         data),
    close:       (id)          => req("PATCH", `/api/loans/${id}/close`),
    addPayment:  (id, data)    => req("POST",  `/api/loans/${id}/payments`,data),
    remove:      (id)          => req("DELETE",`/api/loans/${id}`),
  },

  // ── Goals ──────────────────────────────────────────────────────
  goals: {
    getAll:     ()          => req("GET",    "/api/goals"),
    create:     (data)      => req("POST",   "/api/goals",               data),
    update:     (id, data)  => req("PATCH",  `/api/goals/${id}`,          data),
    addSavings: (id, amount)=> req("POST",   `/api/goals/${id}/add-savings`,{ amount }),
    remove:     (id)        => req("DELETE", `/api/goals/${id}`),
  },

  // ── Budgets ────────────────────────────────────────────────────
  budgets: {
    getAll: (month, year) => req("GET",    `/api/budgets?month=${month}&year=${year}`),
    create: (data)        => req("POST",   "/api/budgets",      data),
    update: (id, data)    => req("PATCH",  `/api/budgets/${id}`,data),
    remove: (id)          => req("DELETE", `/api/budgets/${id}`),
  },

  // ── Analysis ───────────────────────────────────────────────────
  analysis: {
    score:      ()              => req("GET", "/api/analysis/score"),
    networth:   ()              => req("GET", "/api/analysis/networth"),
    report:     (months = 6)    => req("GET", `/api/analysis/report?months=${months}`),
    categories: (month, year)   => req("GET", `/api/analysis/categories?month=${month}&year=${year}`),
  },
};
