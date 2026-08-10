import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { getDbInstance } from "../../Firebase/firebase";

const CustomerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        setError("");

        const db = await getDbInstance();

        const [
          customersSnapshot,
          bookingsSnapshot,
        ] = await Promise.all([
          getDocs(collection(db, "customers")),
          getDocs(collection(db, "bookings")),
        ]);

        const customerDoc =
          customersSnapshot.docs.find(
            (doc) =>
              doc.id === customerId ||
              doc.data().uid === customerId
          );

        if (!customerDoc) {
          setError("Customer not found.");
          return;
        }

        const customerData = {
          id: customerDoc.id,
          ...customerDoc.data(),
        };

        const customerBookings =
          bookingsSnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter(
              (booking) =>
                booking.userId === customerData.uid
            )
            .sort((a, b) => {
              const dateA =
                a.createdAt?.toMillis?.() || 0;

              const dateB =
                b.createdAt?.toMillis?.() || 0;

              return dateB - dateA;
            });

        setCustomer(customerData);
        setBookings(customerBookings);

      } catch (error) {
        console.error(
          "Customer Details Error:",
          error
        );

        setError(
          "Unable to load customer details."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

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

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          Loading customer...
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-6 md:p-8">

        <button
          onClick={() =>
            navigate("/adminDashboard/customers")
          }
          className="mb-6 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to Customers
        </button>

        <div className="rounded-2xl bg-red-50 p-6 text-red-700">
          {error || "Customer not found."}
        </div>

      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">

      {/* BACK */}

      <button
        onClick={() =>
          navigate("/adminDashboard/customers")
        }
        className="mb-6 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        ← Back to Customers
      </button>


      {/* CUSTOMER INFO */}

      <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-2xl font-bold text-slate-900">
              Customer Details
            </h1>

            <p className="mt-2 text-slate-500">
              {customer.email}
            </p>

          </div>


          <div className="rounded-xl bg-slate-50 px-5 py-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Bookings
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {bookings.length}
            </p>

          </div>

        </div>


        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Email
            </p>

            <p className="mt-1 break-all text-slate-700">
              {customer.email || "—"}
            </p>

          </div>


          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Customer ID
            </p>

            <p className="mt-1 break-all text-sm text-slate-700">
              {customer.uid}
            </p>

          </div>


          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Joined
            </p>

            <p className="mt-1 text-slate-700">

              {customer.createdAt?.toDate
                ? customer.createdAt
                    .toDate()
                    .toLocaleDateString()
                : "—"}

            </p>

          </div>

        </div>

      </div>


      {/* BOOKING HISTORY */}

      <div className="mt-8">

        <div className="mb-5">

          <h2 className="text-xl font-bold text-slate-900">
            Booking History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            All bookings associated with this customer.
          </p>

        </div>


        {bookings.length === 0 ? (

          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

            <p className="text-slate-500">
              This customer has no bookings yet.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {bookings.map((booking) => (

              <div
                key={booking.id}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  <div>

                    <h3 className="font-semibold text-slate-900">
                      {booking.service || "Unknown Service"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {booking.location || "No location"}
                    </p>

                  </div>


                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                      booking.status
                    )}`}
                  >
                    {booking.status || "Pending"}
                  </span>

                </div>


                <div className="mt-4">

                  <p className="text-sm text-slate-600">
                    {booking.description ||
                      "No description provided."}
                  </p>

                </div>


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

        )}

      </div>

    </div>
  );
};

export default CustomerDetails;