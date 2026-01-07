import { useState } from "react";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. HEADER MOBILE */}
        <header className="bg-white shadow-sm p-4 md:hidden flex items-center justify-between z-20 relative">
          <h1 className="font-bold text-lg">Gas 3Kg</h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
          >
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

        {/* 3. MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
