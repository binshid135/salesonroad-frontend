import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login/");
    if (
      error.response?.status === 401 &&
      !isLoginRequest &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data: RegisterPayload) => api.post("/auth/register/", data),
  login: (email: string, password: string) =>
    api.post("/auth/login/", { email, password }),
  logout: () => api.post("/auth/logout/"),
  me: () => api.get("/auth/me/"),
};

// Items
export const itemsAPI = {
  list: (search?: string) =>
    api.get("/items/", { params: search ? { search } : {} }),
  get: (id: string) => api.get(`/items/${id}/`),
  create: (data: Partial<Item>) => api.post("/items/", data),
  update: (id: string, data: Partial<Item>) => api.patch(`/items/${id}/`, data),
  delete: (id: string) => api.delete(`/items/${id}/`),
};

// Orders
export const ordersAPI = {
  list: (search?: string) =>
    api.get("/orders/", { params: search ? { search } : {} }),
  get: (id: string) => api.get(`/orders/${id}/`),
  create: (data: CreateOrderPayload) => api.post("/orders/create/", data),
};

// Dashboard
export const dashboardAPI = {
  stats: () => api.get("/dashboard/stats/"),
};

// Team
export const teamAPI = {
  list: () => api.get("/team/"),
  invite: (email: string, full_name: string, password: string) =>
    api.post("/team/invite/", { email, full_name, password }),
  update: (id: string, data: Partial<User> & { password?: string }) =>
    api.patch(`/team/${id}/`, data),
  delete: (id: string) => api.delete(`/team/${id}/`),
};

// Billing
export const billingAPI = {
  current: () => api.get("/billing/current/"),
  checkout: (tier: string) => api.post("/billing/checkout/", { tier }),
  portal: () => api.post("/billing/portal/"),
};

// Super Admin
export const superAdminAPI = {
  stats: () => api.get("/super-admin/stats/"),
  organizations: (params?: { search?: string; tier?: string; status?: string }) =>
    api.get("/super-admin/organizations/", { params }),
  orgDetail: (id: string) => api.get(`/super-admin/organizations/${id}/`),
  updateOrg: (id: string, data: Partial<OrgRow>) =>
    api.patch(`/super-admin/organizations/${id}/update/`, data),
};

export interface OrgRow {
  id: string;
  name: string;
  subdomain: string;
  subscription_tier: string;
  subscription_status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  user_count: number;
  order_count: number;
  created_at: string;
}

export interface SuperAdminStats {
  total_organizations: number;
  active_organizations: number;
  mrr: number;
  total_users: number;
  total_orders: number;
  orders_this_month: number;
  tier_breakdown: Record<string, number>;
  recent_signups: {
    id: string;
    name: string;
    subdomain: string;
    subscription_tier: string;
    subscription_status: string;
    created_at: string;
  }[];
}

export interface BillingInfo {
  tier: string;
  status: string;
  price_per_month: number;
  limits: { salesmen: number; items: number; orders_month: number };
  usage: { salesmen: number; items: number; orders_month: number };
  current_period_end: string | null;
  stripe_subscription_id: string | null;
}

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "super_admin" | "org_admin" | "salesman";
  organization: string | null;
  organization_name: string | null;
  is_active: boolean;
}

export interface Item {
  id: string;
  name: string;
  sku: string;
  price: string;
  gst_rate: string;
  unit: string;
  image_url: string | null;
  is_active: boolean;
}

export interface OrderItem {
  id: string;
  item: string;
  item_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_amount: string;
  gst_amount: string;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  order_items: OrderItem[];
  salesman_name: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  organization_name: string;
  subdomain: string;
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_phone?: string;
  payment_method?: string;
  payment_status?: string;
  device_id?: string;
  items: { item_id: string; quantity: number }[];
}
