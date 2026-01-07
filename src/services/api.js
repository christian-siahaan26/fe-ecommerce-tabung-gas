import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname !== "/login"
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCourirs: async () => {
    const response = await api.get("/auth/courirs");
    return response.data;
  },
  updateUser: async (userId, data) => {
    const response = await api.put(`/auth/${userId}`, data);
    return response.data;
  },
  deleteUser: (userId) => api.delete(`/auth/${userId}`),
};

// Order Services
export const salesService = {
  getAll: async () => {
    const response = await api.get("/orders");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (saleData) => {
    const response = await api.post("/orders", saleData);
    return response.data;
  },

  update: async (id, saleData) => {
    const response = await api.put(`/sales/${id}`, saleData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/sales/${id}`);
    return response.data;
  },
};

// Delivery Services
export const deliveryService = {
  getAll: async () => {
    const response = await api.get("/deliveries");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/deliveries/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/deliveries", data);
    return response.data;
  },

  getByDriver: async () => {
    const response = await api.get("/deliveries/my-tasks");
    return response.data;
  },

  updateStatus: async (id, data) => {
    const response = await api.put(`/deliveries/status/${id}`, data);
    return response.data;
  },

  uploadProof: async (id, formData) => {
    const response = await api.post(`/deliveries/${id}/proof`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

// Driver Services
export const driverService = {
  getAll: async () => {
    const response = await api.get("/drivers");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/drivers/${id}`);
    return response.data;
  },

  create: async (driverData) => {
    const response = await api.post("/drivers", driverData);
    return response.data;
  },

  update: async (id, driverData) => {
    const response = await api.put(`/drivers/${id}`, driverData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/drivers/${id}`);
    return response.data;
  },
};

// Payment Services
export const paymentService = {
  createTransaction: async (transactionData) => {
    const response = await api.post(
      "/payments/create-transaction",
      transactionData
    );
    return response.data;
  },

  checkStatus: async (orderId) => {
    const response = await api.get(`/payments/status/${orderId}`);
    return response.data;
  },
};

// Admin Services
export const adminService = {
  getAll: async () => {
    const response = await api.get("/admins");
    return response.data;
  },

  create: async (adminData) => {
    const response = await api.post("/admins", adminData);
    return response.data;
  },

  update: async (id, adminData) => {
    const response = await api.put(`/admins/${id}`, adminData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/admins/${id}`);
    return response.data;
  },
};

export default api;
