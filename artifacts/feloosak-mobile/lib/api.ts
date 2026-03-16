import AsyncStorage from "@react-native-async-storage/async-storage";

const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN || "";
const BASE_URL = DOMAIN ? `https://${DOMAIN}/api-server/api` : "/api-server/api";
const SESSION_KEY = "feloosak_session_cookie";

let sessionCookie: string | null = null;

async function loadSession() {
  if (sessionCookie === null) {
    sessionCookie = await AsyncStorage.getItem(SESSION_KEY);
  }
  return sessionCookie;
}

async function saveSession(cookie: string | null) {
  sessionCookie = cookie;
  if (cookie) {
    await AsyncStorage.setItem(SESSION_KEY, cookie);
  } else {
    await AsyncStorage.removeItem(SESSION_KEY);
  }
}

function extractSessionCookie(headers: Headers): string | null {
  const setCookie = headers.get("set-cookie");
  if (!setCookie) return null;
  const match = setCookie.match(/connect\.sid=[^;]+/);
  return match ? match[0] : null;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  await loadSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (sessionCookie) {
    headers["Cookie"] = sessionCookie;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const newCookie = extractSessionCookie(res.headers);
  if (newCookie) {
    await saveSession(newCookie);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (data: { email: string; password: string; name: string; region?: string }) =>
      request<{ user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => request<{ user: User }>("/auth/me"),
    logout: async () => {
      await request<{ ok: boolean }>("/auth/logout", { method: "POST" });
      await saveSession(null);
    },
    updateProfile: (data: { name?: string; region?: string }) =>
      request<{ user: User }>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
  books: {
    list: () => request<BookWithDetails[]>("/books"),
    create: (data: { name: string; type?: string; icon?: string; color?: string }) =>
      request<BookWithDetails>("/books", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: { name?: string; type?: string; icon?: string; color?: string }) =>
      request<BookWithDetails>(`/books/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ ok: boolean }>(`/books/${id}`, { method: "DELETE" }),
  },
  transactions: {
    list: (bookId: number) => request<Transaction[]>(`/transactions/${bookId}`),
    create: (data: {
      bookId: number;
      type: string;
      amount: number;
      category: string;
      note?: string;
      date?: string;
      payMode?: string;
    }) =>
      request<Transaction>("/transactions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ ok: boolean }>(`/transactions/${id}`, { method: "DELETE" }),
  },
  customers: {
    list: () => request<Customer[]>("/customers"),
    create: (data: { name: string; phone?: string; owed?: number; paid?: number; trust?: number }) =>
      request<Customer>("/customers", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Customer>) =>
      request<Customer>(`/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ ok: boolean }>(`/customers/${id}`, { method: "DELETE" }),
  },
  invoices: {
    list: () => request<Invoice[]>("/invoices"),
    create: (data: Partial<Invoice>) =>
      request<Invoice>("/invoices", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Invoice>) =>
      request<Invoice>(`/invoices/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ ok: boolean }>(`/invoices/${id}`, { method: "DELETE" }),
  },
  seed: () => request<any>("/seed", { method: "POST" }),
};

export interface User {
  id: number;
  email: string;
  name: string;
  region: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  bookId: number;
  type: string;
  amount: string;
  category: string;
  note: string;
  date: string;
  payMode: string;
  proof: string | null;
  createdAt: string;
}

export interface BookMember {
  id: number;
  bookId: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface BookWithDetails {
  id: number;
  userId: number;
  name: string;
  type: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  tx: Transaction[];
  members: BookMember[];
}

export interface Customer {
  id: number;
  userId: number;
  name: string;
  phone: string;
  owed: string;
  paid: string;
  trust: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: number;
  userId: number;
  customerId: number | null;
  invoiceNo: string;
  status: string;
  subtotal: string;
  vatAmount: string;
  total: string;
  terms: string;
  billingAddress: string;
  notes: string;
  items: any[];
  invoiceDate: string;
  createdAt: string;
  updatedAt: string;
}
