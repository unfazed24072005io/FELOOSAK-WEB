const API_BASE = import.meta.env.DEV
  ? "/api-server/api"
  : "/api";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers as any },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    register: (email: string, password: string, name: string, region: string) => request("/auth/register", { method: "POST", body: JSON.stringify({ email, password, name, region }) }),
    me: () => request("/auth/me"),
    logout: () => request("/auth/logout", { method: "POST" }),
    updateProfile: (data: any) => request("/auth/profile", { method: "PUT", body: JSON.stringify(data) }),
  },
  books: {
    list: () => request("/books"),
    create: (data: any) => request("/books", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/books/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/books/${id}`, { method: "DELETE" }),
  },
  transactions: {
    list: (bookId: number) => request(`/transactions/${bookId}`),
    create: (data: any) => request("/transactions", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/transactions/${id}`, { method: "DELETE" }),
  },
  members: {
    list: (bookId: number) => request(`/members/${bookId}`),
    create: (data: any) => request("/members", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/members/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/members/${id}`, { method: "DELETE" }),
  },
  customers: {
    list: () => request("/customers"),
    create: (data: any) => request("/customers", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/customers/${id}`, { method: "DELETE" }),
  },
  invoices: {
    list: () => request("/invoices"),
    create: (data: any) => request("/invoices", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/invoices/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/invoices/${id}`, { method: "DELETE" }),
  },
  seed: () => request("/seed", { method: "POST" }),
};
