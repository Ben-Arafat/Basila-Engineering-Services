import { Link } from "react-router-dom";
import { FaCalendarAlt, FaTools, FaUser } from "react-icons/fa";
import { useAuth } from "../Context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { getDbInstance } from "../Firebase/firebase";



const Dashboard = () => {
  const { currentUser, loading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    let unsubscribe = null;

    const initializeBookings = async () => {
  try {
    const db = await getDbInstance();

    const {
      collection,
      query,
      where,
      onSnapshot,
    } = await import("firebase/firestore");

    const q = query(
      collection(db, "bookings"),
      where("userId", "==", currentUser.uid)
    );

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBookings(data);
        setBookingsLoading(false);
        setError("");
      },
      (error) => {
        console.error("Dashboard Bookings Error:", error);

        setBookingsLoading(false);

        if (error.code === "permission-denied") {
          setError(
            "You don't have permission to view your bookings. Please log in again."
          );
        } else {
          setError(
            "Unable to load your bookings. Please check your internet connection and try again."
          );
        }
      }
    );
  } catch (error) {
    console.error("Dashboard Initialization Error:", error);

    setBookingsLoading(false);

    setError(
      "Unable to load your bookings. Please check your internet connection and try again."
    );
  }
};
    initializeBookings();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
        <p className="text-lg text-gray-600">Please log in to view your dashboard.</p>
        <Link to="/login" className="ml-4 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      {/* Header */}
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentUser?.email?.split("@")[0]} 👋
            </h1>

            <p className="text-gray-500 mt-2">
              Manage your services and bookings here.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">

                <Link
                to="/"
                className="bg-white border border-gray-300 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition text-center"
                >
                ← Back to Website
                </Link>


                <Link
                    to="/booking"
                    className="mt-4 md:mt-0 bg-yellow-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-600 transition"
                >
                    Book a Service
                </Link>

            </div>



        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
            {error}
          </div>
        )}


        {/* Cards */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


          <div className="bg-white rounded-2xl p-6 shadow">

            <FaCalendarAlt 
              className="text-yellow-500 text-3xl mb-4"
            />

            <h2 className="font-bold text-xl">
              My Bookings
            </h2>

            <h3 className="text-4xl font-bold mt-3">
              {bookingsLoading ? "..." : bookings.length}
            </h3>

            <p className="text-gray-500 mt-2">
              View your upcoming services.
            </p>

          </div>



          <div className="bg-white rounded-2xl p-6 shadow">

            <FaTools 
              className="text-yellow-500 text-3xl mb-4"
            />

            <h2 className="font-bold text-xl">
              Repair Status
            </h2>

            <h3 className="text-4xl font-bold mt-3">
              {bookingsLoading
                ? "..."
                : bookings.filter(
                    booking =>
                      booking.status === "Pending" ||
                      booking.status === "In Progress"
                  ).length}
            </h3>

            <p className="text-gray-500 mt-2">
              Track your ongoing repairs.
            </p>

          </div>



          <div className="bg-white rounded-2xl p-6 shadow">

            <FaUser 
              className="text-yellow-500 text-3xl mb-4"
            />

            <h2 className="font-bold text-xl">
              Profile
            </h2>

            <h3 className="text-1xl font-bold mt-3">
              {currentUser?.email}
            </h3>

            <p className="text-gray-500 mt-2">
              Manage your account details.
            </p>

          </div>


        </div>


        {/* Recent Activity */}

        <div className="bg-white rounded-2xl shadow p-6 mt-8">

          <h2 className="text-xl font-bold">
            Recent Activity
          </h2>

          {bookingsLoading ? (
            <div className="mt-5 text-gray-500">
              Loading your bookings...
            </div>
          ) : bookings.length === 0 ? (
            <>

              <div className="mt-5 text-gray-500">
                No bookings yet.
              </div>
                <Link
                to="/booking"
                className="text-yellow-600 font-semibold"
                >
                Click Here to Create a New Request
                </Link>
            </>
            ) : (
            <div className="space-y-4 mt-6">
                {bookings.map((booking) => (
                <Link
                  key={booking.id}
                  to={`/dashboard/booking/${booking.id}`}
                  className="border rounded-xl p-4 flex justify-between items-center hover:bg-gray-50 transition"
                >
                    <div>
                    <h3 className="font-bold">
                        {booking.service}
                    </h3>

                    <p className="text-gray-500">
                        📍 {booking.location}
                    </p>
                    </div>

                    <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold
                    ${
                        booking.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : booking.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                    >
                    {booking.status}
                    </span>
                </Link>
                ))}
            </div>
            )}



        </div>


      </div>

    </div>
  );
};


export default Dashboard;