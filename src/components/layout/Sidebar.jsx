import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getMenuItems = () => {
    const menus = {
      OWNER: [
        { path: "/owner/dashboard", label: "Dashboard", icon: "home" },
        { path: "/owner/orders", label: "Penjualan", icon: "chart" },
        { path: "/owner/admins", label: "Kelola Admin", icon: "users" },
      ],
      ADMIN: [
        { path: "/admin/dashboard", label: "Dashboard", icon: "home" },
        { path: "/admin/orders", label: "Daftar Pesanan", icon: "shopping" },
        { path: "/admin/deliveries", label: "Pengantaran", icon: "truck" },
        { path: "/admin/drivers", label: "Pengantar", icon: "users" },
      ],
      COURIR: [
        { path: "/driver/dashboard", label: "Dashboard", icon: "home" },
        { path: "/driver/tasks", label: "Tugas Pengantaran", icon: "list" },
      ],
      CUSTOMER: [
        { path: "/customer/dashboard", label: "Dashboard", icon: "home" },
        { path: "/customer/orders", label: "Pesanan Saya", icon: "shopping" },
        { path: "/customer/buy", label: "Beli Gas", icon: "plus" },
      ],
    };
    return menus[user?.role] || [];
  };

  const getIcon = (iconName) => {
    const icons = {
      home: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      ),
      chart: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      ),
      users: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      ),
      shopping: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      ),
      truck: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
        />
      ),
      list: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 10h16M4 14h16M4 18h16"
        />
      ),
      plus: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      ),
      logout: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      ),
      close: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      ),
    };
    return icons[iconName] || icons.home;
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Overlay Gelap (Mobile Only) */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg flex flex-col transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:inset-auto md:min-h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        `}
      >
        {/* BAGIAN ATAS: Header + Menu (Gunakan flex-1 agar mengisi ruang kosong) */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Header Sidebar */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gas 3Kg</h2>
              <p className="text-sm text-gray-600 mt-1">{user?.role}</p>
            </div>

            {/* Tombol Close (Mobile Only) */}
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {getIcon("close")}
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? "bg-primary-100 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {getIcon(item.icon)}
                  </svg>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BAGIAN BAWAH: Footer/Logout (Akan selalu terdorong ke paling bawah) */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {getIcon("logout")}
            </svg>
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
