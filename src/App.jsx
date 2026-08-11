import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  Suspense,
  lazy,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./Context/AuthContext.jsx";

import Navbar from "./Components/Navbar";
import Preloader from "./Components/preloader";

import AuthModal from "./Components/Auth/AuthModal";
import ScrollToTop from "./Components/ScrollToTop";

import CustomerDetails from "./Pages/adminDashboard/CustomerDetails";

import { isAdmin } from "./utils/admin";
import AdminLayout from "./Layout/adminLayout";

const Home = lazy(() => import("./Pages/Home"));
const About = lazy(() => import("./Pages/About"));
const Services = lazy(() => import("./Pages/Services"));
const Portfolio = lazy(() => import("./Pages/Portfolio"));
const Contact = lazy(() => import("./Pages/Contact"));
const TrackRepair = lazy(() => import("./Pages/trackRepair"));
const Dashboard = lazy(() => import("./Pages/Dashboard"));
const Booking = lazy(() => import("./Pages/Booking"));
const BookingDetails = lazy(
  () => import("./Pages/BookingDetails")
);

import AdminDashboard from "./Pages/adminDashboard/adminDashboard";
import Bookings from "./Pages/adminDashboard/Bookings";
import Messages from "./Pages/adminDashboard/Messages";
import Customers from "./Pages/adminDashboard/Customers";
import Settings from "./Pages/adminDashboard/Settings";


// ======================================================
// PROTECTED ROUTE
// ======================================================

function ProtectedRoute({ children }) {
  const {
    currentUser,
    loading,
    openLogin,
    openSignup,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return <Preloader />;
  }

  // User is authenticated
  if (currentUser) {
    return children;
  }

  // User is NOT authenticated
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
          <span className="text-3xl">
            🔐
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Login Required
        </h1>

        <p className="mt-3 text-gray-500 leading-relaxed">
          You need to have an account to access this page.
          Please log in if you already have an account or
          sign up to create one.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row gap-3">

          <button
            type="button"
            onClick={openLogin}
            className="flex-1 rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-white transition hover:bg-yellow-600"
          >
            Login
          </button>

          <button
            type="button"
            onClick={openSignup}
            className="flex-1 rounded-xl border border-yellow-500 px-5 py-3 font-semibold text-yellow-600 transition hover:bg-yellow-50"
          >
            Sign Up
          </button>

        </div>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="mt-5 text-sm text-gray-500 hover:text-gray-800"
        >
          ← Go Back
        </button>

      </div>
    </div>
  );
}


// ======================================================
// ADMIN ROUTE
// ======================================================

function AdminRoute({ children }) {
  const {
    currentUser,
    loading,
    openLogin,
  } = useAuth();

  if (loading) {
    return <Preloader />;
  }

  // Not logged in
  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <span className="text-3xl">
              🔒
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Login Required
          </h1>

          <p className="mt-3 text-gray-500">
            Please log in to access this area.
          </p>

          <button
            type="button"
            onClick={openLogin}
            className="mt-7 w-full rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-white hover:bg-yellow-600 transition"
          >
            Login
          </button>

        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin(currentUser)) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}


// ======================================================
// APP
// ======================================================

function App() {
  const [loading, setLoading] = useState(true);

  const {
    authModalOpen,
    closeAuthModal,
  } = useAuth();

  useEffect(() => {
    const timer = setTimeout(
      () => setLoading(false),
      2000
    );

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Preloader />;
  }

  return (
    <>
      {/* Internet connection status */}
      

      {/* Main Navbar */}
      <Navbar />

      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
      />

      <Suspense fallback={<Preloader />}>

        <ScrollToTop />

        <Routes>

          {/* ========================================= */}
          {/* PUBLIC PAGES */}
          {/* ========================================= */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/services"
            element={<Services />}
          />

          <Route
            path="/portfolio"
            element={<Portfolio />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/trackRepair"
            element={<TrackRepair />}
          />


          {/* ========================================= */}
          {/* BOOKING DETAILS */}
          {/* ========================================= */}

          <Route
            path="/dashboard/booking/:bookingId"
            element={
              <ProtectedRoute>
                <BookingDetails />
              </ProtectedRoute>
            }
          />


          {/* ========================================= */}
          {/* CUSTOMER DASHBOARD */}
          {/* ========================================= */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />


          {/* ========================================= */}
          {/* BOOKING */}
          {/* ========================================= */}

          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            }
          />


          {/* ========================================= */}
          {/* ADMIN AREA */}
          {/* ========================================= */}

          <Route
            path="/adminDashboard"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >

            {/* /adminDashboard */}
            <Route
              index
              element={<AdminDashboard />}
            />

            {/* /adminDashboard/bookings */}
            <Route
              path="bookings"
              element={<Bookings />}
            />

            {/* /adminDashboard/messages */}
            <Route
              path="messages"
              element={<Messages />}
            />

            {/* /adminDashboard/customers */}
            <Route
              path="customers"
              element={<Customers />}
            />

            {/* /adminDashboard/customers/:customerId */}
            <Route
              path="customers/:customerId"
              element={<CustomerDetails />}
            />

            {/* /adminDashboard/settings */}
            <Route
              path="settings"
              element={<Settings />}
            />

          </Route>

        </Routes>

      </Suspense>
    </>
  );
}

export default App;