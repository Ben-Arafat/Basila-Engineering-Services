import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { useAuth } from "./Context/AuthContext.jsx";
import Navbar from "./Components/Navbar";
import Preloader from "./Components/preloader";
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
const BookingDetails = lazy(() => import("./Pages/BookingDetails"));

import AdminDashboard from "./Pages/adminDashboard/adminDashboard";
import Bookings from "./Pages/adminDashboard/Bookings";
import Messages from "./Pages/adminDashboard/Messages";
import Customers from "./Pages/adminDashboard/Customers";
import Settings from "./Pages/adminDashboard/Settings";
import ScrollToTop from "./Components/ScrollToTop";


function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Preloader />;
  }

  return currentUser ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
}

function AdminRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Preloader />;
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin(currentUser)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}


function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);

    return () => clearTimeout(timer);
  }, []);


  if (loading) {
    return <Preloader />;
  }


  return (
    <>
      <Navbar />

      <Suspense fallback={<Preloader />}>

      <ScrollToTop />

        <Routes>

          {/* PUBLIC PAGES */}

          <Route path="/" element={<Home />} />

          <Route path="/about" element={<About />} />

          <Route path="/services" element={<Services />} />

          <Route path="/portfolio" element={<Portfolio />} />

          <Route path="/contact" element={<Contact />} />

          <Route path="/trackRepair" element={<TrackRepair />} />

          {/* BOOKING DETAILS */}

          <Route
            path="/dashboard/booking/:bookingId"
            element={
              <ProtectedRoute>
                <BookingDetails />
              </ProtectedRoute>
            }
          />


          {/* ADMIN AREA */}

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

            {/* /adminDashboard/customerDetails */}
            <Route
              path="customers/:customerId"
              element={<CustomerDetails />}
            />

            {/* /adminDashboard/customers */}
            <Route
              path="customers"
              element={<Customers />}
            />

            {/* /adminDashboard/settings */}
            <Route
              path="settings"
              element={<Settings />}
            />

          </Route>


          {/* CUSTOMER DASHBOARD */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />


          {/* BOOKING */}

          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            }
          />

        </Routes>

      </Suspense>
    </>
  );
}


export default App;