import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/adminDashboard/sidebar";
import Topbar from "../Components/adminDashboard/topBar";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden">
            <Sidebar
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="min-w-0 flex-1 overflow-y-auto">

        <Topbar
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <Outlet />

      </main>

    </div>
  );
};

export default AdminLayout;