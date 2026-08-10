import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/adminDashboard/Sidebar";
import Topbar from "../Components/adminDashboard/Topbar";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100">

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
      <main className="flex-1 min-w-0">

        <Topbar
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <Outlet />

      </main>

    </div>
  );
};

export default AdminLayout;