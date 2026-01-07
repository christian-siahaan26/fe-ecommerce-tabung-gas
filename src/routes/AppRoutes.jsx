import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";

// Public Pages
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Customer Pages
import CustomerDashboard from "../pages/customer/Dashboard";
import CustomerBuy from "../pages/customer/Buy";
import CustomerOrders from "../pages/customer/Orders";
import CustomerOrderDetail from "../pages/customer/CustomerOrderDetail";

// Driver Pages
import DriverDashboard from "../pages/driver/Dashboard";
import DriverTasks from "../pages/driver/Tasks";

// Owner Pages (placeholder)
import OwnerDashboard from "../pages/owner/Dashboard";

// Admin Pages
import AdminDashboard from "../pages/admin/Dashboard";
import AdminOrders from "../pages/admin/Orders";
import AdminOrderDetail from "../pages/admin/AdminOrderDetail";
import AdminDeliveries from "../pages/admin/Deliveries";
import AdminDrivers from "../pages/admin/Drivers";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer Routes */}
      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/buy"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <CustomerBuy />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/orders"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <CustomerOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/orders/:orderId"
        element={<CustomerOrderDetail />}
      />

      {/* Driver Routes */}
      <Route
        path="/driver/dashboard"
        element={
          <ProtectedRoute allowedRoles={["COURIR"]}>
            <DriverDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/tasks"
        element={
          <ProtectedRoute allowedRoles={["COURIR"]}>
            <DriverTasks />
          </ProtectedRoute>
        }
      />

      {/* --- ADMIN ROUTES --- */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminOrders />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/orders/:orderId" element={<AdminOrderDetail />} />
      <Route
        path="/admin/deliveries"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDeliveries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/drivers"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDrivers />
          </ProtectedRoute>
        }
      />

      {/* Owner Routes */}
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute allowedRoles={["OWNER"]}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
