import { useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import AuthModal from "./Auth/AuthModal";
import { useAuth } from "../Context/AuthContext.jsx";
import { getAuthInstance } from "../Firebase/firebase";
import Swal from "sweetalert2";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { currentUser, loading } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const location = useLocation();

  const isAdminPage =
    location.pathname.startsWith("/adminDashboard");

  const ADMIN_UID = "tjoY9a9YqGQ8aU0Zbayc0OO93pp1";

  const isAdmin =
    currentUser?.uid === ADMIN_UID;

  // Don't show the public navbar inside the admin dashboard
  if (isAdminPage) {
    return null;
  }

  const handleLogout = async () => {
    try {
      const auth = await getAuthInstance();
      const { signOut } = await import("firebase/auth");

      await signOut(auth);

      setIsMenuOpen(false);
      setIsAuthOpen(false);
      setShowProfileMenu(false);

      await Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: "You have been successfully logged out.",
        confirmButtonColor: "#EAB308",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Logout Error:", error);

      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#DC2626",
      });
    }
  };

  return (
    <header className="sticky top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md">
      <nav
        className="mx-auto place-items-center flex max-w-7xl items-center justify-between p-6 lg:px-10"
        aria-label="Global"
      >

        {/* LOGO */}
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <img
              src="basila logo.png"
              alt="Basila logo"
              className="h-15 w-auto dark:hidden"
            />

            <img
              src="basila logo.png"
              alt="Basila logo"
              className="h-15 w-auto hidden dark:block"
            />
          </a>
        </div>


        {/* MOBILE MENU BUTTON */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
            onClick={() => setIsMenuOpen(true)}
            aria-expanded={isMenuOpen}
            aria-label="Open mobile menu"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
              className="h-6 w-6 text-blue-500"
            >
              <path
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>


        {/* DESKTOP NAVIGATION */}
        <div className="hidden lg:flex lg:gap-x-12">

          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="text-sm font-semibold text-gray-900 dark:text-black"
          >
            Home
          </Link>

          <Link
            to="/services"
            onClick={() => setIsMenuOpen(false)}
            className="text-sm font-semibold text-gray-900 dark:text-black"
          >
            Services
          </Link>

          <Link
            to="/about"
            onClick={() => setIsMenuOpen(false)}
            className="text-sm font-semibold text-gray-900 dark:text-black"
          >
            About
          </Link>

          <Link
            to="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="text-sm font-semibold text-gray-900 dark:text-black"
          >
            Contact
          </Link>

          <Link
            to="/portfolio"
            onClick={() => setIsMenuOpen(false)}
            className="text-sm font-semibold text-gray-900 dark:text-black"
          >
            Portfolio
          </Link>

          <Link
            to="/dashboard"
            onClick={() => setIsMenuOpen(false)}
            className="text-sm font-semibold text-gray-900 dark:text-black"
          >
            Dashboard
          </Link>

        </div>


        {/* DESKTOP USER SECTION */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">

          {loading ? (
            <span>Loading...</span>
          ) : currentUser ? (

            <div className="relative">

              <button
                className="flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-gray-100 transition"
                onClick={() =>
                  setShowProfileMenu(!showProfileMenu)
                }
              >

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-500 text-white font-bold">
                  {currentUser.email
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <span className="font-medium">
                  {currentUser.email?.split("@")[0]}
                </span>

              </button>


              {showProfileMenu && (

                <div className="absolute right-0 mt-3 w-60 rounded-xl border bg-white shadow-xl overflow-hidden">

                  {/* PROFILE INFO */}
                  <div className="px-4 py-3 border-b">

                    <p className="font-semibold">
                      {currentUser.email?.split("@")[0]}
                    </p>

                    <p className="text-sm text-gray-500 truncate">
                      {currentUser.email}
                    </p>

                  </div>


                  {/* ADMIN DASHBOARD */}
                  {isAdmin && (
                    <Link
                      to="/adminDashboard"
                      onClick={() =>
                        setShowProfileMenu(false)
                      }
                      className="block px-4 py-3 font-semibold text-yellow-700 hover:bg-yellow-50"
                    >
                      🛠️ Admin Dashboard
                    </Link>
                  )}


                  {/* CUSTOMER DASHBOARD */}
                  <Link
                    to="/dashboard"
                    onClick={() =>
                      setShowProfileMenu(false)
                    }
                    className="block px-4 py-3 hover:bg-gray-100"
                  >
                    📊 Dashboard
                  </Link>


                  {/* BOOKING */}
                  <Link
                    to="/booking"
                    onClick={() =>
                      setShowProfileMenu(false)
                    }
                    className="block px-4 py-3 hover:bg-gray-100"
                  >
                    📅 Book a Service
                  </Link>


                  {/* TRACK REPAIR */}
                  <Link
                    to="/trackRepair"
                    onClick={() =>
                      setShowProfileMenu(false)
                    }
                    className="block px-4 py-3 hover:bg-gray-100"
                  >
                    🔧 Track Repair
                  </Link>


                  {/* HOMEPAGE */}
                  <Link
                    to="/"
                    onClick={() =>
                      setShowProfileMenu(false)
                    }
                    className="block px-4 py-3 hover:bg-gray-100"
                  >
                    🏠 Homepage
                  </Link>


                  {/* LOGOUT */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50"
                  >
                    🚪 Logout
                  </button>

                </div>

              )}

            </div>

          ) : (

            <button
              onClick={() => setIsAuthOpen(true)}
              className="text-sm font-semibold text-gray-900"
            >
              Log in →
            </button>

          )}

        </div>

      </nav>


      {/* MOBILE MENU */}
      {isMenuOpen && (

        <div className="lg:hidden min-h-screen">

          {/* OVERLAY */}
          <div
            className="fixed inset-0 z-50 bg-black/30"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />


          {/* MOBILE PANEL */}
          <div className="fixed inset-0 z-50 flex">

            <div className="ml-auto w-full max-w-sm h-full overflow-y-auto backdrop-blur-md bg-white p-6 shadow-x">

              {/* MOBILE HEADER */}
              <div className="flex items-center justify-between">

                <a href="#" className="-m-1.5 p-1.5">

                  <img
                    src="basila logo.png"
                    alt="Basila logo"
                    className="h-15 w-auto dark:hidden"
                  />

                  <img
                    src="basila logo.png"
                    alt="Basila logo"
                    className="h-15 w-auto hidden dark:block"
                  />

                </a>


                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close mobile menu"
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                    className="h-6 w-6"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                </button>

              </div>


              {/* MOBILE CONTENT */}
              <div className="mt-6 flow-root">

                <div className="-my-6 divide-y divide-gray-200 dark:divide-gray-700">

                  {/* MOBILE NAVIGATION */}
                  <div className="space-y-2 py-6">

                    <Link
                      to="/"
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      Home
                    </Link>

                    <Link
                      to="/services"
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      Services
                    </Link>

                    <Link
                      to="/about"
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      About
                    </Link>

                    <Link
                      to="/contact"
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      Contact
                    </Link>

                    <Link
                      to="/portfolio"
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      Portfolio
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      Dashboard
                    </Link>

                  </div>


                  {/* MOBILE USER SECTION */}
                  <div className="py-6">

                    {loading ? (

                      <p className="px-3 text-gray-500">
                        Loading...
                      </p>

                    ) : currentUser ? (

                      <div className="space-y-4">

                        {/* USER INFO */}
                        <div className="flex items-center gap-3 px-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 text-white font-bold">
                            {currentUser.email
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <p className="font-semibold text-gray-900">
                              {currentUser.email?.split("@")[0]}
                            </p>

                            <p className="text-sm text-gray-500 truncate">
                              {currentUser.email}
                            </p>

                          </div>

                        </div>


                        {/* USER LINKS */}
                        <div className="border-t pt-3">

                          {/* ADMIN */}
                          {isAdmin && (
                            <Link
                              to="/adminDashboard"
                              onClick={() =>
                                setIsMenuOpen(false)
                              }
                              className="block px-4 py-3 font-semibold text-yellow-700 hover:bg-yellow-50"
                            >
                              🛠️ Admin Dashboard
                            </Link>
                          )}


                          {/* DASHBOARD */}
                          <Link
                            to="/dashboard"
                            onClick={() =>
                              setIsMenuOpen(false)
                            }
                            className="block rounded-lg px-3 py-2 text-slate-900 text-base font-medium hover:bg-gray-100"
                          >
                            📊 Dashboard
                          </Link>


                          {/* BOOKING */}
                          <Link
                            to="/booking"
                            onClick={() =>
                              setIsMenuOpen(false)
                            }
                            className="block rounded-lg px-3 py-2 text-slate-900 text-base font-medium hover:bg-gray-100"
                          >
                            📅 Book a Service
                          </Link>


                          {/* TRACK REPAIR */}
                          <Link
                            to="/trackRepair"
                            onClick={() =>
                              setIsMenuOpen(false)
                            }
                            className="block rounded-lg px-3 py-2 text-slate-900 text-base font-medium hover:bg-gray-100"
                          >
                            🔧 Track Repair
                          </Link>


                          {/* HOMEPAGE */}
                          <Link
                            to="/"
                            onClick={() =>
                              setIsMenuOpen(false)
                            }
                            className="block rounded-lg px-3 py-2 text-slate-900 text-base font-medium hover:bg-gray-100"
                          >
                            🏠 Homepage
                          </Link>


                          {/* LOGOUT */}
                          <button
                            onClick={handleLogout}
                            className="block w-full rounded-lg px-3 py-2 text-left text-base font-medium text-red-600 hover:bg-red-50"
                          >
                            🚪 Logout
                          </button>

                        </div>

                      </div>

                    ) : (

                      <button
                        onClick={() => {
                          setIsAuthOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="block w-full rounded-lg px-3 py-2.5 text-left text-base font-semibold text-gray-900 hover:bg-gray-50"
                      >
                        Log in →
                      </button>

                    )}

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* AUTH MODAL */}
      {typeof document !== "undefined" &&
        createPortal(
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
          />,
          document.body
        )}

    </header>
  );
};

export default Navbar;