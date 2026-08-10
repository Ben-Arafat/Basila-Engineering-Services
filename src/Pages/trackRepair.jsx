import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import {
  getAuthInstance,
  getDbInstance,
} from "../Firebase/firebase";

const TrackRepair = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

useEffect(() => {
  let unsubscribe = null;

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const auth = await getAuthInstance();
      const user = auth.currentUser;

      if (!user) {
        setError("Please log in to track your bookings.");
        setLoading(false);
        return;
      }

      const db = await getDbInstance();

      const bookingsQuery = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      unsubscribe = onSnapshot(
        bookingsQuery,
        (snapshot) => {
          const userBookings = snapshot.docs.map(
            (bookingDoc) => ({
              id: bookingDoc.id,
              ...bookingDoc.data(),
            })
          );

          setBookings(userBookings);
          setLoading(false);
        },
        (error) => {
          console.error(
            "Track Repair Listener Error:",
            error
          );

          setError(
            "Unable to load your bookings. Please try again."
          );

          setLoading(false);
        }
      );

    } catch (error) {
      console.error(
        "Track Repair Error:",
        error
      );

      setError(
        "Unable to load your bookings. Please try again."
      );

      setLoading(false);
    }
  };

  loadBookings();

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-blue-100 text-blue-700";

      case "In Progress":
        return "bg-purple-100 text-purple-700";

      case "Completed":
        return "bg-green-100 text-green-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case "Confirmed":
        return 2;

      case "In Progress":
        return 3;

      case "Completed":
        return 4;

      default:
        return 1;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Track Your Repair
          </h1>

          <p className="mt-2 text-slate-500">
            View the current status of your service requests.
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* LOADING */}

        {loading && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading your bookings...
            </p>
          </div>
        )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          bookings.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

              <h2 className="text-lg font-semibold text-slate-900">
                No bookings found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                You haven't submitted any service requests yet.
              </p>

            </div>
          )}


        {/* BOOKINGS */}

        {!loading && bookings.length > 0 && (

          <div className="space-y-6">

            {bookings.map((booking) => {

              const currentStep =
                getStatusStep(
                  booking.status
                );

              const isCancelled =
                booking.status === "Cancelled";

              return (

                <div
                  key={booking.id}
                  className="rounded-2xl bg-white p-6 shadow-sm md:p-8"
                >

                  {/* TOP */}

                  <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-start md:justify-between">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Service
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-slate-900">
                        {booking.service ||
                          "Service Request"}
                      </h2>

                    </div>


                    <span
                      className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusStyle(
                        booking.status
                      )}`}
                    >
                      {booking.status ||
                        "Pending"}
                    </span>

                  </div>


                  {/* DETAILS */}

                  <div className="grid grid-cols-1 gap-5 py-6 md:grid-cols-2">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Location
                      </p>

                      <p className="mt-1 text-slate-700">
                        {booking.location ||
                          "Not provided"}
                      </p>

                    </div>


                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Request Date
                      </p>

                      <p className="mt-1 text-slate-700">

                        {booking.createdAt?.toDate
                          ? booking.createdAt
                              .toDate()
                              .toLocaleDateString()
                          : "—"}

                      </p>

                    </div>

                  </div>


                  {/* DESCRIPTION */}

                  {booking.description && (

                    <div className="border-t pt-6">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Description
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {booking.description}
                      </p>

                    </div>

                  )}


                  {/* PROGRESS */}

                  <div className="mt-8 border-t pt-8">

                    <p className="mb-6 text-sm font-semibold text-slate-900">
                      Job Progress
                    </p>


                    {isCancelled ? (

                      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                        This service request has been cancelled.
                      </div>

                    ) : (

                      <div className="grid grid-cols-4 gap-2">

                        {[
                          "Pending",
                          "Confirmed",
                          "In Progress",
                          "Completed",
                        ].map(
                          (step, index) => {

                            const stepNumber =
                              index + 1;

                            const active =
                              stepNumber <=
                              currentStep;

                            return (

                              <div
                                key={step}
                                className="text-center"
                              >

                                <div
                                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                                    active
                                      ? "bg-slate-900 text-white"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {stepNumber}
                                </div>

                                <p
                                  className={`mt-2 text-[11px] font-medium md:text-xs ${
                                    active
                                      ? "text-slate-900"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {step}
                                </p>

                              </div>

                            );
                          }
                        )}

                      </div>

                    )}

                  </div>

                </div>

              );
            })}

          </div>

        )}

      </div>

    </main>
  );
};

export default TrackRepair;