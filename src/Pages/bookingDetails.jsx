import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDbInstance } from "../Firebase/firebase";
import { useAuth } from "../Context/AuthContext.jsx";

const BookingDetails = () => {
  const { bookingId } = useParams();
  const { currentUser, loading: authLoading } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser || !bookingId) return;

    const loadBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const db = await getDbInstance();

        const {
          doc,
          getDoc,
        } = await import("firebase/firestore");

        const bookingRef = doc(db, "bookings", bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (!bookingSnap.exists()) {
          setError("This booking could not be found.");
          return;
        }

        const data = bookingSnap.data();

        // Make sure the customer owns this booking
        if (data.userId !== currentUser.uid) {
          setError("You don't have permission to view this booking.");
          return;
        }

        setBooking({
          id: bookingSnap.id,
          ...data,
        });
      } catch (error) {
        console.error("Booking Details Error:", error);

        if (error.code === "permission-denied") {
          setError(
            "You don't have permission to view this booking."
          );
        } else {
          setError(
            "Unable to load this booking. Please check your internet connection and try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [currentUser, bookingId]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-gray-500">
          Loading booking details...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Login Required
          </h2>

          <p className="text-gray-500 mt-2">
            Please log in to view this booking.
          </p>

          <Link
            to="/"
            className="inline-block mt-5 bg-yellow-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-600 transition"
          >
            Back to Website
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 p-5 md:p-10">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/dashboard"
            className="inline-block mb-6 text-yellow-600 font-semibold"
          >
            ← Back to Dashboard
          </Link>

          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Unable to Load Booking
            </h2>

            <p className="text-red-500 mt-3">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-5 md:p-10">

      <div className="max-w-3xl mx-auto">

        <Link
          to="/dashboard"
          className="inline-block mb-6 text-yellow-600 font-semibold hover:text-yellow-700"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl shadow p-6 md:p-10">

          <div className="flex flex-col sm:flex-row justify-between gap-4">

            <div>
              <p className="text-sm text-gray-500">
                Service Request
              </p>

              <h1 className="text-3xl font-bold text-gray-900 mt-1">
                {booking?.service}
              </h1>
            </div>

            <span
              className={`self-start px-4 py-2 rounded-full text-sm font-semibold
                ${
                  booking?.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : booking?.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
            >
              {booking?.status || "Pending"}
            </span>

          </div>

          <div className="border-t mt-8 pt-8 space-y-6">

            <div>
              <p className="text-sm text-gray-500">
                Location
              </p>

              <p className="font-semibold text-gray-900 mt-1">
                📍 {booking?.location}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Description
              </p>

              <p className="text-gray-800 mt-1 leading-relaxed">
                {booking?.description}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Account Email
              </p>

              <p className="font-semibold text-gray-900 mt-1">
                {booking?.userEmail || currentUser.email}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default BookingDetails;