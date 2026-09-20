import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  query,
  where,
  serverTimestamp,
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
  const [creatingProjectId, setCreatingProjectId] = useState(null);
  const [projectBookingIds, setProjectBookingIds] = useState([]);
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
                customerMap[booking.userId] ||
                booking.userEmail ||
                "Unknown customer",
            };
          }
        );

        bookingData.sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() || 0) -
            (a.createdAt?.toMillis?.() || 0)
        );

        setBookings(bookingData);

        // Check which bookings already have projects
        const projectsSnapshot = await getDocs(
          collection(db, "projects")
        );

        const existingProjectBookingIds =
          projectsSnapshot.docs
            .map((projectDoc) => projectDoc.data().bookingId)
            .filter(Boolean);

        setProjectBookingIds(
          existingProjectBookingIds
        );
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

  // ==========================================
  // CREATE PROJECT FROM BOOKING
  // ==========================================

  const handleCreateProject = async (booking) => {
    try {
      setCreatingProjectId(booking.id);
      setError("");

      const db = await getDbInstance();

      // Check if this booking already has a project
      const projectsQuery = query(
        collection(db, "projects"),
        where("bookingId", "==", booking.id)
      );

      const existingProjects =
        await getDocs(projectsQuery);

      if (!existingProjects.empty) {
        setProjectBookingIds((previous) =>
          previous.includes(booking.id)
            ? previous
            : [...previous, booking.id]
        );

        setError(
          "A project already exists for this booking."
        );

        return;
      }

      // Create the project using the booking information
      await addDoc(collection(db, "projects"), {
        bookingId: booking.id,

        customerId: booking.userId,

        customerEmail:
          booking.customerEmail ||
          booking.userEmail ||
          "",

        projectName:
          booking.service ||
          "New Project",

        description:
          booking.description ||
          "",

        location:
          booking.location ||
          "",

        status: "Planning",

        progress: 0,

        startDate: null,

        expectedEndDate: null,

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),
      });

      // Mark booking as having a project
      setProjectBookingIds((previous) => [
        ...previous,
        booking.id,
      ]);
    } catch (error) {
      console.error(
        "Create Project Error:",
        error
      );

      setError(
        "Unable to create project. Please try again."
      );
    } finally {
      setCreatingProjectId(null);
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

            <table className="w-full min-w-[1350px]">

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

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Action
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


                    {/* ACTION */}

                    <td className="px-6 py-5">

                      <button
                        type="button"
                        disabled={
                          creatingProjectId ===
                            booking.id ||
                          projectBookingIds.includes(
                            booking.id
                          )
                        }
                        onClick={() =>
                          handleCreateProject(
                            booking
                          )
                        }
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                          projectBookingIds.includes(
                            booking.id
                          )
                            ? "cursor-not-allowed bg-green-100 text-green-700"
                            : "bg-yellow-500 text-white hover:bg-yellow-600"
                        }`}
                      >

                        {creatingProjectId ===
                        booking.id
                          ? "Creating..."
                          : projectBookingIds.includes(
                              booking.id
                            )
                          ? "Project Created"
                          : "Create Project"}

                      </button>

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


                {/* CREATE PROJECT */}

                <button
                  type="button"
                  disabled={
                    creatingProjectId ===
                      booking.id ||
                    projectBookingIds.includes(
                      booking.id
                    )
                  }
                  onClick={() =>
                    handleCreateProject(
                      booking
                    )
                  }
                  className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    projectBookingIds.includes(
                      booking.id
                    )
                      ? "cursor-not-allowed bg-green-100 text-green-700"
                      : "bg-yellow-500 text-white hover:bg-yellow-600"
                  }`}
                >

                  {creatingProjectId ===
                  booking.id
                    ? "Creating Project..."
                    : projectBookingIds.includes(
                        booking.id
                      )
                    ? "Project Created"
                    : "Create Project"}

                </button>

              </div>

            ))}

          </div>

        </>

      )}

    </div>
  );
};

export default Bookings;