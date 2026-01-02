import { useState } from "react";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
  // State untuk mengontrol Sidebar (Buka/Tutup)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Pass props ke Sidebar:
         - isOpen: true/false
         - onClose: fungsi untuk mengubah state jadi false
      */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {" "}
        {/* min-w-0 mencegah overflow konten */}
        {/* Header Mobile dengan Tombol Hamburger */}
        <header className="bg-white shadow-sm p-4 md:hidden flex items-center justify-between">
          <h1 className="font-bold text-lg">Gas 3Kg</h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
          >
            {/* Icon Hamburger Menu */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </header>
        {/* Konten Utama */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
