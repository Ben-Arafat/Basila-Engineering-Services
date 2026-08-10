import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getDbInstance } from "../../Firebase/firebase";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError("");

        const db = await getDbInstance();

        const snapshot = await getDocs(
          collection(db, "contactMessages")
        );

        const messageData = snapshot.docs.map((messageDoc) => ({
          id: messageDoc.id,
          ...messageDoc.data(),
        }));

        setMessages(messageData);
      } catch (error) {
        console.error("Messages Error:", error);
        setError("Unable to load contact messages.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const filteredMessages = messages.filter((message) => {
    const searchText = search.toLowerCase();

    return (
      message.name?.toLowerCase().includes(searchText) ||
      message.email?.toLowerCase().includes(searchText) ||
      message.service?.toLowerCase().includes(searchText) ||
      message.message?.toLowerCase().includes(searchText)
    );
  });

  const handleDelete = async (messageId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(messageId);

      const db = await getDbInstance();

      await deleteDoc(
        doc(db, "contactMessages", messageId)
      );

      setMessages((previousMessages) =>
        previousMessages.filter(
          (message) => message.id !== messageId
        )
      );

      setSelectedMessage(null);
    } catch (error) {
      console.error("Delete Message Error:", error);
      setError("Unable to delete this message.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-900">
          Messages
        </h1>

        <p className="mt-2 text-slate-500">
          Manage enquiries submitted through your website.
        </p>

      </div>


      {/* SEARCH */}

      <div className="mb-6">

        <input
          type="search"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
            Loading messages...
          </p>

        </div>

      ) : filteredMessages.length === 0 ? (

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <p className="text-slate-500">
            {search
              ? "No messages match your search."
              : "No messages found."}
          </p>

        </div>

      ) : (

        <>
          {/* DESKTOP TABLE */}

          <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm md:block">

            <table className="w-full min-w-[900px]">

              <thead className="border-b bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Service
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Message
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Date
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y">

                {filteredMessages.map((message) => (

                  <tr
                    key={message.id}
                    className="transition hover:bg-slate-50"
                  >

                    <td className="px-6 py-5">

                      <p className="font-semibold text-slate-900">
                        {message.name || "—"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {message.email || "—"}
                      </p>

                    </td>


                    <td className="px-6 py-5">

                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                        {message.service || "—"}
                      </span>

                    </td>


                    <td className="max-w-sm px-6 py-5">

                      <p className="truncate text-slate-600">
                        {message.message || "—"}
                      </p>

                    </td>


                    <td className="px-6 py-5 text-sm text-slate-500">

                      {message.createdAt?.toDate
                        ? message.createdAt
                            .toDate()
                            .toLocaleDateString()
                        : "—"}

                    </td>


                    <td className="px-6 py-5">

                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedMessage(message)
                          }
                          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                        >
                          View
                        </button>


                        <button
                          type="button"
                          disabled={deletingId === message.id}
                          onClick={() =>
                            handleDelete(message.id)
                          }
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === message.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>


          {/* MOBILE CARDS */}

          <div className="space-y-4 md:hidden">

            {filteredMessages.map((message) => (

              <div
                key={message.id}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <h3 className="font-semibold text-slate-900">
                      {message.name || "Unknown"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {message.email || "—"}
                    </p>

                  </div>

                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                    {message.service || "—"}
                  </span>

                </div>


                <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                  {message.message || "No message"}
                </p>


                <div className="mt-5 flex items-center justify-between">

                  <span className="text-xs text-slate-400">
                    {message.createdAt?.toDate
                      ? message.createdAt
                          .toDate()
                          .toLocaleDateString()
                      : "—"}
                  </span>


                  <div className="flex gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedMessage(message)
                      }
                      className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
                    >
                      View
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === message.id}
                      onClick={() =>
                        handleDelete(message.id)
                      }
                      className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 disabled:opacity-50"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>
        </>

      )}


      {/* MESSAGE MODAL */}

      {selectedMessage && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedMessage(null)}
        >

          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-2xl font-bold text-slate-900">
                  Message Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Customer enquiry
                </p>

              </div>


              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="text-2xl leading-none text-slate-400 hover:text-slate-700"
                aria-label="Close message"
              >
                &times;
              </button>

            </div>


            <div className="mt-6 space-y-5">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Name
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {selectedMessage.name || "—"}
                </p>
              </div>


              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 text-slate-700">
                  {selectedMessage.email || "—"}
                </p>
              </div>


              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Phone
                </p>

                <p className="mt-1 text-slate-700">
                  {selectedMessage.phone || "—"}
                </p>
              </div>


              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Service
                </p>

                <p className="mt-1 text-slate-700">
                  {selectedMessage.service || "—"}
                </p>
              </div>


              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Message
                </p>

                <p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 leading-7 text-slate-700">
                  {selectedMessage.message || "—"}
                </p>
              </div>

            </div>


            <div className="mt-6 flex justify-end">

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Messages;