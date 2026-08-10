import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getDbInstance } from "../../Firebase/firebase";

const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "In Progress",
  "Completed",
  "Cancelled",
];

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const db = await getDbInstance();

        // Fetch bookings and customers together
        const [bookingsSnapshot, customersSnapshot] =
          await Promise.all([
            getDocs(collection(db, "bookings")),
            getDocs(collection(db, "customers")),
          ]);

        // Create a quick UID → email lookup
        const customerMap = {};

        customersSnapshot.docs.forEach((customerDoc) => {
          const customer = customerDoc.data();

          if (customer.uid) {
            customerMap[customer.uid] = customer.email;
          }
        });

        const bookingData = bookingsSnapshot.docs.map(
          (bookingDoc) => {
            const booking = bookingDoc.data();

            return {
              id: bookingDoc.id,
              ...booking,

              // Connect booking to customer
              customerEmail:
                customerMap[booking.userId] || "Unknown customer",
            };
          }
        );

        setBookings(bookingData);
      } catch (error) {
        console.error("Bookings Error:", error);
        setError("Unable to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleStatusChange = async (
    bookingId,
    newStatus
  ) => {
    try {
      setUpdatingId(bookingId);
      setError("");

      const db = await getDbInstance();

      await updateDoc(
        doc(db, "bookings", bookingId),
        {
          status: newStatus,
        }
      );

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: newStatus,
              }
            : booking
        )
      );
    } catch (error) {
      console.error(
        "Status Update Error:",
        error
      );

      setError(
        "Unable to update booking status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

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

  return (
    <div className="p-6 md:p-8">

      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Bookings
        </h1>

        <p className="mt-2 text-slate-500">
          Manage customer bookings and job status.
        </p>
      </div>


      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}


      {/* LOADING */}

      {loading ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="text-slate-500">
            Loading bookings...
          </p>
        </div>

      ) : bookings.length === 0 ? (

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="text-slate-500">
            No bookings found.
          </p>
        </div>

      ) : (

        <>
          {/* DESKTOP */}

          <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm md:block">

            <table className="w-full min-w-[1200px]">

              <thead className="border-b bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Service
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Location
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Description
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Date
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y">

                {bookings.map((booking) => (

                  <tr
                    key={booking.id}
                    className="transition hover:bg-slate-50"
                  >

                    {/* CUSTOMER */}

                    <td className="px-6 py-5">

                      <p className="max-w-[220px] truncate font-medium text-slate-900">
                        {booking.customerEmail}
                      </p>

                      <p className="mt-1 max-w-[220px] truncate text-xs text-slate-400">
                        {booking.userId || "—"}
                      </p>

                    </td>


                    {/* SERVICE */}

                    <td className="px-6 py-5 font-medium text-slate-900">
                      {booking.service || "—"}
                    </td>


                    {/* LOCATION */}

                    <td className="px-6 py-5 text-slate-600">
                      {booking.location || "—"}
                    </td>


                    {/* DESCRIPTION */}

                    <td className="max-w-sm px-6 py-5 text-slate-600">

                      <p className="truncate">
                        {booking.description || "—"}
                      </p>

                    </td>


                    {/* STATUS */}

                    <td className="px-6 py-5">

                      <select
                        value={
                          booking.status ||
                          "Pending"
                        }
                        disabled={
                          updatingId === booking.id
                        }
                        onChange={(e) =>
                          handleStatusChange(
                            booking.id,
                            e.target.value
                          )
                        }
                        className={`rounded-full border-0 px-3 py-2 text-xs font-semibold outline-none ${getStatusStyle(
                          booking.status
                        )}`}
                      >

                        {STATUS_OPTIONS.map(
                          (status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          )
                        )}

                      </select>

                    </td>


                    {/* DATE */}

                    <td className="px-6 py-5 text-sm text-slate-500">

                      {booking.createdAt?.toDate
                        ? booking.createdAt
                            .toDate()
                            .toLocaleDateString()
                        : "—"}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>


          {/* MOBILE */}

          <div className="space-y-4 md:hidden">

            {bookings.map((booking) => (

              <div
                key={booking.id}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >

                {/* CUSTOMER */}

                <div className="mb-5">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Customer
                  </p>

                  <p className="mt-1 break-all font-medium text-slate-900">
                    {booking.customerEmail}
                  </p>

                </div>


                {/* SERVICE */}

                <h3 className="font-semibold text-slate-900">
                  {booking.service ||
                    "Unknown Service"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {booking.location ||
                    "No location"}
                </p>


                {/* DESCRIPTION */}

                <div className="mt-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Description
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {booking.description ||
                      "No description"}
                  </p>

                </div>


                {/* STATUS */}

                <div className="mt-5">

                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </label>

                  <select
                    value={
                      booking.status ||
                      "Pending"
                    }
                    disabled={
                      updatingId === booking.id
                    }
                    onChange={(e) =>
                      handleStatusChange(
                        booking.id,
                        e.target.value
                      )
                    }
                    className={`mt-2 w-full rounded-xl border-0 px-4 py-3 text-sm font-semibold outline-none ${getStatusStyle(
                      booking.status
                    )}`}
                  >

                    {STATUS_OPTIONS.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}

                  </select>

                </div>


                {/* DATE */}

                <p className="mt-4 text-xs text-slate-400">

                  {booking.createdAt?.toDate
                    ? booking.createdAt
                        .toDate()
                        .toLocaleDateString()
                    : "Date unavailable"}

                </p>

              </div>

            ))}

          </div>
        </>

      )}

    </div>
  );
};

export default Bookings;