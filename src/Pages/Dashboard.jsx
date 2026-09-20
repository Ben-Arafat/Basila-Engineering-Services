import { Link, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaTools,
  FaUser,
  FaFolderOpen,
} from "react-icons/fa";
import {
  FiBell,
  FiCheck,
  FiX,
  FiFileText,
} from "react-icons/fi";
import { useAuth } from "../Context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { getDbInstance } from "../Firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

const Dashboard = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  // ==============================
  // STATE
  // ==============================

  const [bookings, setBookings] = useState([]);
  const [projects, setProjects] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [error, setError] = useState("");
  const [projectsError, setProjectsError] = useState("");

  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // ==============================
  // LOAD CUSTOMER NOTIFICATIONS
  // ==============================

  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      return;
    }

    let unsubscribe = null;

    const initializeNotifications = async () => {
      const db = await getDbInstance();

      const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.uid)
      );

      unsubscribe = onSnapshot(
        notificationsQuery,
        (snapshot) => {
          const notificationData = snapshot.docs
            .map((notificationDoc) => ({
              id: notificationDoc.id,
              ...notificationDoc.data(),
            }))
            .sort((a, b) => {
              const aTime = a.createdAt?.toMillis?.() || 0;
              const bTime = b.createdAt?.toMillis?.() || 0;

              return bTime - aTime;
            });

          setNotifications(notificationData);
        },
        (snapshotError) => {
          console.error(
            "Dashboard Notifications Error:",
            snapshotError
          );

          setNotifications([]);
        }
      );
    };

    initializeNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  // ==============================
  // LOAD CUSTOMER BOOKINGS
  // ==============================

  useEffect(() => {
    if (!currentUser) {
      setBookingsLoading(false);
      return;
    }

    let unsubscribe = null;

    const initializeBookings = async () => {
      try {
        setBookingsLoading(true);

        const db = await getDbInstance();

        const q = query(
          collection(db, "bookings"),
          where("userId", "==", currentUser.uid)
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const data = snapshot.docs
              .map((bookingDoc) => ({
                id: bookingDoc.id,
                ...bookingDoc.data(),
              }))
              .sort(
                (a, b) =>
                  (b.createdAt?.toMillis?.() || 0) -
                  (a.createdAt?.toMillis?.() || 0)
              );

            setBookings(data);
            setBookingsLoading(false);
            setError("");
          },
          (snapshotError) => {
            console.error(
              "Dashboard Bookings Error:",
              snapshotError
            );

            setBookingsLoading(false);

            if (snapshotError.code === "permission-denied") {
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
      } catch (bookingError) {
        console.error(
          "Dashboard Initialization Error:",
          bookingError
        );

        setBookingsLoading(false);

        setError(
          "Unable to load your bookings. Please check your internet connection and try again."
        );
      }
    };

    initializeBookings();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  // ==============================
  // LOAD CUSTOMER PROJECTS
  // ==============================

  useEffect(() => {
    if (!currentUser) {
      setProjectsLoading(false);
      return;
    }

    let unsubscribe = null;

    const initializeProjects = async () => {
      try {
        setProjectsLoading(true);
        setProjectsError("");

        const db = await getDbInstance();

        const q = query(
          collection(db, "projects"),
          where("customerId", "==", currentUser.uid)
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const data = snapshot.docs
              .map((projectDoc) => ({
                id: projectDoc.id,
                ...projectDoc.data(),
              }))
              .sort(
                (a, b) =>
                  (b.createdAt?.toMillis?.() || 0) -
                  (a.createdAt?.toMillis?.() || 0)
              );

            setProjects(data);
            setProjectsLoading(false);
          },
          (snapshotError) => {
            console.error(
              "Dashboard Projects Error:",
              snapshotError
            );

            setProjectsLoading(false);

            if (snapshotError.code === "permission-denied") {
              setProjectsError(
                "You don't have permission to view your projects."
              );
            } else {
              setProjectsError(
                "Unable to load your projects."
              );
            }
          }
        );
      } catch (projectError) {
        console.error(
          "Projects Initialization Error:",
          projectError
        );

        setProjectsLoading(false);

        setProjectsError(
          "Unable to load your projects."
        );
      }
    };

    initializeProjects();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  // ==============================
  // NOTIFICATION HELPERS
  // ==============================

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  );

  const markNotificationAsRead = async (notificationId) => {
    try {
      const db = await getDbInstance();

      await updateDoc(
        doc(db, "notifications", notificationId),
        {
          read: true,
          readAt: serverTimestamp(),
        }
      );
    } catch (notificationError) {
      console.error(
        "Error marking notification as read:",
        notificationError
      );
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const unread = notifications.filter(
        (notification) => !notification.read
      );

      if (unread.length === 0) {
        return;
      }

      const db = await getDbInstance();
      const batch = writeBatch(db);

      unread.forEach((notification) => {
        batch.update(
          doc(db, "notifications", notification.id),
          {
            read: true,
            readAt: serverTimestamp(),
          }
        );
      });

      await batch.commit();
    } catch (notificationError) {
      console.error(
        "Error marking notifications as read:",
        notificationError
      );
    }
  };

  // ==============================
  // HANDLE NOTIFICATION CLICK
  // ==============================

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);
      }

      setNotificationsOpen(false);

      // Invoice notification
      if (
        notification.type === "invoice" &&
        notification.projectId
      ) {
        navigate(
          `/dashboard/project/${notification.projectId}`
        );
        return;
      }

      // Project-related notification
      if (notification.projectId) {
        navigate(
          `/dashboard/project/${notification.projectId}`
        );
        return;
      }

      // Booking-related notification
      if (notification.bookingId) {
        navigate(
          `/dashboard/booking/${notification.bookingId}`
        );
        return;
      }
    } catch (notificationError) {
      console.error(
        "Error opening notification:",
        notificationError
      );
    }
  };

  // ==============================
  // FORMAT NOTIFICATION TIME
  // ==============================

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) {
      return "";
    }

    try {
      const date = timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp);

      const now = new Date();
      const difference = now.getTime() - date.getTime();

      const seconds = Math.floor(difference / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 60) {
        return "Just now";
      }

      if (minutes < 60) {
        return `${minutes}m ago`;
      }

      if (hours < 24) {
        return `${hours}h ago`;
      }

      if (days < 7) {
        return `${days}d ago`;
      }

      return date.toLocaleDateString();
    } catch {
      return "";
    }
  };

  // ==============================
  // INITIAL LOADING
  // ==============================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  // ==============================
  // NOT LOGGED IN
  // ==============================

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">
            Please log in to view your dashboard.
          </p>

          <Link
            to="/login"
            className="inline-block mt-4 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // ==============================
  // DASHBOARD
  // ==============================

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* ============================== */}
        {/* HEADER */}
        {/* ============================== */}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-5">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentUser?.email?.split("@")[0]} 👋
            </h1>

            <p className="text-gray-500 mt-2">
              Manage your services, projects and bookings here.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">

            {/* NOTIFICATION BELL */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setNotificationsOpen(
                    (previous) => !previous
                  )
                }
                className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
              >
                <FiBell className="text-xl" />

                {unreadNotifications.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                    {unreadNotifications.length > 9
                      ? "9+"
                      : unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN */}

              {notificationsOpen && (
                <div className="fixed left-1/2 top-24 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96 sm:translate-x-0">

                  {/* DROPDOWN HEADER */}

                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">

                    <div>
                      <h3 className="font-bold text-gray-900">
                        Notifications
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        {notifications.length === 0
                          ? "You're all caught up"
                          : unreadNotifications.length > 0
                          ? `${unreadNotifications.length} unread`
                          : "All notifications read"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setNotificationsOpen(false)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Close notifications"
                    >
                      <FiX />
                    </button>
                  </div>

                  {/* MARK ALL */}

                  {unreadNotifications.length > 0 && (
                    <div className="border-b border-gray-100 px-4 py-2">
                      <button
                        type="button"
                        onClick={markAllNotificationsAsRead}
                        className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <FiCheck />
                        Mark all as read
                      </button>
                    </div>
                  )}

                  {/* NOTIFICATIONS */}

                  <div className="max-h-[420px] overflow-y-auto">

                    {notifications.length === 0 ? (
                      <div className="px-6 py-10 text-center">

                        <FiBell className="mx-auto text-3xl text-gray-300" />

                        <p className="mt-3 text-sm font-medium text-gray-600">
                          No notifications yet
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          New updates about your projects,
                          bookings and invoices will appear here.
                        </p>

                      </div>
                    ) : (
                      notifications
                        .slice(0, 15)
                        .map((notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className={`block w-full border-b border-gray-100 px-4 py-4 text-left transition hover:bg-gray-50 ${
                              !notification.read
                                ? "bg-blue-50/60"
                                : "bg-white"
                            }`}
                          >
                            <div className="flex gap-3">

                              {/* ICON */}

                              <div
                                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                  notification.type === "invoice"
                                    ? "bg-green-100 text-green-700"
                                    : notification.type ===
                                      "booking"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {notification.type === "invoice" ? (
                                  <FiFileText />
                                ) : notification.type ===
                                  "booking" ? (
                                  <FaCalendarAlt />
                                ) : (
                                  <FiBell />
                                )}
                              </div>

                              {/* CONTENT */}

                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-2">

                                  <h4
                                    className={`text-sm leading-5 ${
                                      !notification.read
                                        ? "font-bold text-gray-900"
                                        : "font-semibold text-gray-700"
                                    }`}
                                  >
                                    {notification.title ||
                                      "Notification"}
                                  </h4>

                                  {!notification.read && (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                  )}

                                </div>

                                <p className="mt-1 text-xs leading-5 text-gray-600">
                                  {notification.message}
                                </p>

                                {notification.createdAt && (
                                  <p className="mt-2 text-[11px] text-gray-400">
                                    {formatNotificationTime(
                                      notification.createdAt
                                    )}
                                  </p>
                                )}

                              </div>
                            </div>
                          </button>
                        ))
                    )}

                  </div>

                  {/* FOOTER */}

                  {notifications.length > 15 && (
                    <div className="border-t border-gray-100 px-4 py-3 text-center">
                      <p className="text-xs text-gray-400">
                        Showing your 15 most recent notifications
                      </p>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* WEBSITE BUTTON */}

            <Link
              to="/"
              className="hidden sm:block bg-white border border-gray-300 text-gray-800 px-5 py-3 rounded-xl font-semibold hover:bg-gray-100 transition text-center"
            >
              ← Back to Website
            </Link>

            {/* BOOKING BUTTON */}

            <Link
              to="/booking"
              className="bg-yellow-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-yellow-600 transition text-center"
            >
              Book a Service
            </Link>

          </div>
        </div>

        {/* ============================== */}
        {/* BOOKING ERROR */}
        {/* ============================== */}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* ============================== */}
        {/* DASHBOARD CARDS */}
        {/* ============================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* BOOKINGS */}

          <div className="bg-white rounded-2xl p-6 shadow">

            <FaCalendarAlt className="text-yellow-500 text-3xl mb-4" />

            <h2 className="font-bold text-xl">
              My Bookings
            </h2>

            <h3 className="text-4xl font-bold mt-3">
              {bookingsLoading
                ? "..."
                : bookings.length}
            </h3>

            <p className="text-gray-500 mt-2">
              View your upcoming services.
            </p>

          </div>

          {/* REPAIR STATUS */}

          <div className="bg-white rounded-2xl p-6 shadow">

            <FaTools className="text-yellow-500 text-3xl mb-4" />

            <h2 className="font-bold text-xl">
              Repair Status
            </h2>

            <h3 className="text-4xl font-bold mt-3">
              {bookingsLoading
                ? "..."
                : bookings.filter(
                    (booking) =>
                      booking.status === "Pending" ||
                      booking.status === "In Progress"
                  ).length}
            </h3>

            <p className="text-gray-500 mt-2">
              Track your ongoing repairs.
            </p>

          </div>

          {/* PROFILE */}

          <div className="bg-white rounded-2xl p-6 shadow">

            <FaUser className="text-yellow-500 text-3xl mb-4" />

            <h2 className="font-bold text-xl">
              Profile
            </h2>

            <h3 className="text-sm font-bold mt-3 break-all">
              {currentUser?.email}
            </h3>

            <p className="text-gray-500 mt-2">
              Manage your account details.
            </p>

          </div>

        </div>

        {/* ============================== */}
        {/* MY PROJECTS */}
        {/* ============================== */}

        <div className="bg-white rounded-2xl shadow p-6 mt-8">

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">

            <div>

              <div className="flex items-center gap-3">

                <FaFolderOpen className="text-yellow-500 text-2xl" />

                <h2 className="text-xl font-bold">
                  My Projects
                </h2>

              </div>

              <p className="text-gray-500 mt-2">
                Track the progress of your active projects.
              </p>

            </div>

            {!projectsLoading &&
              projects.length > 0 && (
                <span className="text-sm font-semibold text-gray-500">
                  {projects.length}{" "}
                  {projects.length === 1
                    ? "Project"
                    : "Projects"}
                </span>
              )}

          </div>

          {/* PROJECT ERROR */}

          {projectsError && (
            <div className="mt-5 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
              {projectsError}
            </div>
          )}

          {/* PROJECT LOADING */}

          {projectsLoading ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center">
              <p className="text-gray-500">
                Loading your projects...
              </p>
            </div>
          ) : projects.length === 0 ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center">

              <FaFolderOpen className="mx-auto text-4xl text-gray-300" />

              <p className="mt-4 text-gray-500">
                You don't have any projects yet.
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Once a project is created for you,
                it will appear here.
              </p>

            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">

              {projects.map((project) => {
                const progress = Math.min(
                  100,
                  Math.max(
                    0,
                    Number(project.progress) || 0
                  )
                );

                return (
                  <Link
                    key={project.id}
                    to={`/dashboard/project/${project.id}`}
                    className="block border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-yellow-400 transition"
                  >

                    {/* PROJECT HEADER */}

                    <div className="flex justify-between items-start gap-4">

                      <div>

                        <h3 className="font-bold text-lg text-gray-900">
                          {project.projectName ||
                            "Untitled Project"}
                        </h3>

                        {project.location && (
                          <p className="text-sm text-gray-500 mt-1">
                            📍 {project.location}
                          </p>
                        )}

                      </div>

                      {/* STATUS */}

                      <span
                        className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                          project.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : project.status ===
                              "In Progress"
                            ? "bg-blue-100 text-blue-700"
                            : project.status ===
                              "On Hold"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {project.status || "Pending"}
                      </span>

                    </div>

                    {/* DESCRIPTION */}

                    {project.description && (
                      <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                        {project.description}
                      </p>
                    )}

                    {/* PROGRESS */}

                    <div className="mt-5">

                      <div className="flex justify-between items-center mb-2">

                        <span className="text-sm font-medium text-gray-600">
                          Project Progress
                        </span>

                        <span className="text-sm font-bold text-gray-900">
                          {progress}%
                        </span>

                      </div>

                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            project.status === "Completed"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                          style={{
                            width: `${progress}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* DATES */}

                    <div className="grid grid-cols-2 gap-4 mt-5">

                      <div>

                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                          Start Date
                        </p>

                        <p className="text-sm font-semibold text-gray-700 mt-1">
                          {project.startDate ||
                            "Not set"}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                          Expected Completion
                        </p>

                        <p className="text-sm font-semibold text-gray-700 mt-1">
                          {project.expectedEndDate ||
                            "Not set"}
                        </p>

                      </div>

                    </div>

                    {/* VIEW PROJECT */}

                    <div className="mt-5 pt-4 border-t border-gray-100">

                      <p className="text-sm font-semibold text-yellow-600">
                        View Project Details →
                      </p>

                    </div>

                  </Link>
                );
              })}

            </div>
          )}

        </div>

        {/* ============================== */}
        {/* RECENT ACTIVITY */}
        {/* ============================== */}

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
                className="inline-block mt-2 text-yellow-600 font-semibold"
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
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      booking.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : booking.status ===
                          "Completed"
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