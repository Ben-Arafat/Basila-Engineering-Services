import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { getDbInstance } from "../../Firebase/firebase";
import { useNavigate } from "react-router-dom";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
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

        const bookings = bookingsSnapshot.docs.map(
          (bookingDoc) => ({
            id: bookingDoc.id,
            ...bookingDoc.data(),
          })
        );

        const customerData =
          customersSnapshot.docs.map((customerDoc) => {
            const customer = {
              id: customerDoc.id,
              ...customerDoc.data(),
            };

            const customerBookings = bookings.filter(
              (booking) =>
                booking.userId === customer.uid
            );

            const sortedBookings =
              [...customerBookings].sort((a, b) => {
                const dateA =
                  a.createdAt?.toMillis?.() || 0;

                const dateB =
                  b.createdAt?.toMillis?.() || 0;

                return dateB - dateA;
              });

            return {
              ...customer,
              bookingCount: customerBookings.length,
              latestBooking:
                sortedBookings[0] || null,
            };
          });

        setCustomers(customerData);

      } catch (error) {
        console.error(
          "Customers Error:",
          error
        );

        setError(
          "Unable to load customers."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers =
    customers.filter((customer) => {
      const searchText =
        search.toLowerCase().trim();

      return (
        customer.email
          ?.toLowerCase()
          .includes(searchText) ||
        customer.uid
          ?.toLowerCase()
          .includes(searchText)
      );
    });

  return (
    <div className="p-6 md:p-8">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-900">
          Customers
        </h1>

        <p className="mt-2 text-slate-500">
          Manage customer accounts and booking history.
        </p>

      </div>


      {/* SEARCH */}

      <div className="mb-6">

        <input
          type="search"
          placeholder="Search by email or customer ID..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
        />

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
            Loading customers...
          </p>

        </div>

      ) : filteredCustomers.length === 0 ? (

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <p className="text-slate-500">
            {search
              ? "No customers match your search."
              : "No customers found."}
          </p>

        </div>

      ) : (

        <>

          {/* DESKTOP */}

          <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm md:block">

            <table className="w-full min-w-[900px]">

              <thead className="border-b bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Bookings
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Latest Service
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Joined
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y">

                {filteredCustomers.map(
                  (customer) => (

                    <tr
                      key={customer.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-5">

                        <p className="font-medium text-slate-900">
                          {customer.email || "—"}
                        </p>

                        <p className="mt-1 max-w-[250px] truncate text-xs text-slate-400">
                          {customer.uid}
                        </p>

                      </td>

                      <td className="px-6 py-5">
                        <button
                            onClick={() =>
                            navigate(`/adminDashboard/customers/${customer.uid}`)
                            }
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                        >
                            View
                        </button>
                      </td>
                      
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Action
                      </th>


                      <td className="px-6 py-5">

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          {customer.bookingCount}
                        </span>

                      </td>


                      <td className="px-6 py-5 text-sm text-slate-600">

                        {customer.latestBooking?.service ||
                          "No bookings"}

                      </td>


                      <td className="px-6 py-5 text-sm text-slate-500">

                        {customer.createdAt?.toDate
                          ? customer.createdAt
                              .toDate()
                              .toLocaleDateString()
                          : "—"}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>


          {/* MOBILE */}

          <div className="space-y-4 md:hidden">

            {filteredCustomers.map(
              (customer) => (

                <div
                  key={customer.id}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >

                  <p className="font-semibold text-slate-900">
                    {customer.email || "—"}
                  </p>


                  <p className="mt-1 break-all text-xs text-slate-400">
                    {customer.uid}
                  </p>


                  <div className="mt-5 grid grid-cols-2 gap-4">

                    <div>

                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Bookings
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {customer.bookingCount}
                      </p>

                    </div>


                    <div>

                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Latest Service
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {customer.latestBooking?.service ||
                          "None"}
                      </p>

                    </div>

                  </div>


                  <p className="mt-5 text-xs text-slate-400">

                    Joined{" "}

                    {customer.createdAt?.toDate
                      ? customer.createdAt
                          .toDate()
                          .toLocaleDateString()
                      : "—"}

                  </p>

                </div>

              )
            )}

          </div>

        </>

      )}

    </div>
  );
};

export default Customers;