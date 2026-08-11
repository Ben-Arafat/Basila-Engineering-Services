import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiCalendar,
  FiMail,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../Context/AuthContext.jsx";
import { signOut } from "firebase/auth";
import { getAuthInstance } from "../../Firebase/firebase.js";

const Sidebar = ({ onClose }) => {
  const { currentUser } = useAuth();

  const menuItems = [
    {
      name: "Overview",
      path: "/adminDashboard",
      icon: <FiHome />,
    },
    {
      name: "Bookings",
      path: "/adminDashboard/bookings",
      icon: <FiCalendar />,
    },
    {
      name: "Messages",
      path: "/adminDashboard/messages",
      icon: <FiMail />,
    },
    {
      name: "Customers",
      path: "/adminDashboard/customers",
      icon: <FiUsers />,
    },
    {
      name: "Settings",
      path: "/adminDashboard/settings",
      icon: <FiSettings />,
    },
  ];

  const handleLogout = async () => {
    try {
      const auth = await getAuthInstance();

      await signOut(auth);

      onClose?.();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <aside className="flex h-screen w-full flex-col bg-slate-900 p-6 text-white">

      {/* HEADER */}
      <div className="flex shrink-0 items-start justify-between">

        <div>
          <h1 className="text-2xl font-bold text-yellow-400">
            Basila Admin
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Control Panel
          </p>
        </div>

        {/* MOBILE CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-gray-400 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <FiX size={22} />
        </button>

      </div>

      {/* NAVIGATION */}
      <nav className="mt-10 flex-1 space-y-2 overflow-y-auto">

        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                isActive
                  ? "bg-yellow-500 text-white"
                  : "text-gray-300 hover:bg-slate-800"
              }`
            }
          >
            {item.icon}

            <span>
              {item.name}
            </span>
          </NavLink>
        ))}

      </nav>

      {/* USER + LOGOUT */}
      <div className="mt-5 shrink-0 border-t border-slate-700 pt-5">

        <p className="truncate text-sm text-gray-400">
          {currentUser?.email || "Admin"}
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-400 transition hover:bg-red-500 hover:text-white"
        >
          <FiLogOut />

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
};

export default Sidebar;