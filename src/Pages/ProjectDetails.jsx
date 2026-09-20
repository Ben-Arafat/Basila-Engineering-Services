
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import {
  FiArrowLeft,
  FiFolder,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiFileText,
  FiImage,
  FiDownload,
  FiCreditCard,
  FiCheckCircle,
  FiActivity,
  FiAlertCircle,
  FiExternalLink,
} from "react-icons/fi";
import { getDbInstance } from "../Firebase/firebase";
import { useAuth } from "../Context/AuthContext.jsx";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  const [project, setProject] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setLoading(false);
      setError("Please log in to view this project.");
      return;
    }

    const fetchProject = async () => {
      try {
        setLoading(true);
        setError("");

        const db = await getDbInstance();

        // ---------------------------------------------------------
        // PROJECT
        // ---------------------------------------------------------
        const projectRef = doc(db, "projects", projectId);
        const projectSnapshot = await getDoc(projectRef);

        if (!projectSnapshot.exists()) {
          setError("Project not found.");
          return;
        }

        const projectData = {
          id: projectSnapshot.id,
          ...projectSnapshot.data(),
        };

        
        // Client-side ownership check.
        if (projectData.customerId !== currentUser.uid) {
          setError("You don't have permission to view this project.");
          return;
        }

        setProject(projectData);

        // ---------------------------------------------------------
        // SUBCOLLECTIONS
        // ---------------------------------------------------------
        const updatesRef = collection(
          db,
          "projects",
          projectId,
          "updates"
        );

        const photosRef = collection(
          db,
          "projects",
          projectId,
          "photos"
        );

        const documentsRef = collection(
          db,
          "projects",
          projectId,
          "documents"
        );

        const invoicesRef = collection(
          db,
          "projects",
          projectId,
          "invoices"
        );

        // We intentionally do not use orderBy() here.
        // This avoids requiring Firestore indexes and lets us
        // sort safely on the client even when timestamps are null.
        const [
          updatesSnapshot,
          photosSnapshot,
          documentsSnapshot,
          invoicesSnapshot,
        ] = await Promise.all([
          getDocs(updatesRef),
          getDocs(photosRef),
          getDocs(documentsRef),
          getDocs(invoicesRef),
        ]);

        const updatesData = updatesSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        const photosData = photosSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        const documentsData = documentsSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        const invoicesData = invoicesSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        const sortNewestFirst = (a, b) => {
          const aTime = getTimestampValue(a.createdAt);
          const bTime = getTimestampValue(b.createdAt);

          return bTime - aTime;
        };

        updatesData.sort(sortNewestFirst);
        photosData.sort(sortNewestFirst);
        documentsData.sort(sortNewestFirst);
        invoicesData.sort((a, b) => {
          const aTime =
            getTimestampValue(a.createdAt) ||
            getTimestampValue(a.issueDate);

          const bTime =
            getTimestampValue(b.createdAt) ||
            getTimestampValue(b.issueDate);

          return bTime - aTime;
        });

        setUpdates(updatesData);
        setPhotos(photosData);
        setDocuments(documentsData);
        setInvoices(invoicesData);
      } catch (error) {
        console.error("Project Details Error:", error);

        if (error.code === "permission-denied") {
          setError("You don't have permission to view this project.");
        } else if (error.code === "unavailable") {
          setError(
            "Unable to connect to the server. Please try again."
          );
        } else {
          setError("Unable to load this project.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, currentUser, authLoading]);

  // -------------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------------

  function getTimestampValue(value) {
    if (!value) return 0;

    if (typeof value.toMillis === "function") {
      return value.toMillis();
    }

    if (value instanceof Date) {
      return value.getTime();
    }

    if (typeof value === "string") {
      const time = new Date(value).getTime();
      return Number.isNaN(time) ? 0 : time;
    }

    if (typeof value === "number") {
      return value;
    }

    if (value.seconds) {
      return Number(value.seconds) * 1000;
    }

    return 0;
  }

  function formatDate(value) {
    if (!value) return "—";

    let date;

    if (typeof value.toDate === "function") {
      date = value.toDate();
    } else if (value instanceof Date) {
      date = value;
    } else if (typeof value === "string") {
      date = new Date(value);
    } else if (typeof value === "number") {
      date = new Date(value);
    } else if (value.seconds) {
      date = new Date(Number(value.seconds) * 1000);
    }

    if (!date || Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatCurrency(amount, currency = "NGN") {
    const value = Number(amount) || 0;

    try {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `${currency} ${value.toLocaleString()}`;
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case "Completed":
      case "Paid":
        return "bg-green-100 text-green-700";

      case "In Progress":
      case "Partially Paid":
        return "bg-blue-100 text-blue-700";

      case "On Hold":
      case "Overdue":
        return "bg-red-100 text-red-700";

      case "Sent":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  function getFileType(name = "") {
    const extension = name.split(".").pop()?.toLowerCase();

    if (!extension) return "FILE";

    return extension.toUpperCase();
  }

  const progress = Math.min(
    100,
    Math.max(0, Number(project?.progress) || 0)
  );

  const totalInvoiced = useMemo(
    () =>
      invoices.reduce(
        (sum, invoice) => sum + (Number(invoice.total) || 0),
        0
      ),
    [invoices]
  );

  const totalPaid = useMemo(
    () =>
      invoices.reduce(
        (sum, invoice) => sum + (Number(invoice.amountPaid) || 0),
        0
      ),
    [invoices]
  );

  const totalBalance = useMemo(
    () =>
      invoices.reduce(
        (sum, invoice) =>
          sum +
          (Number(
            invoice.balanceDue ??
              (Number(invoice.total) || 0) -
                (Number(invoice.amountPaid) || 0)
          ) || 0),
        0
      ),
    [invoices]
  );

  // -------------------------------------------------------------
  // LOADING
  // -------------------------------------------------------------

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-2xl bg-white px-8 py-10 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-yellow-500" />

          <p className="mt-4 font-medium text-slate-600">
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ERROR
  // -------------------------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mb-6 flex items-center gap-2 font-medium text-slate-600 transition hover:text-slate-900"
          >
            <FiArrowLeft />
            Back to Dashboard
          </button>

          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <FiAlertCircle
                size={26}
                className="text-red-600"
              />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Unable to Load Project
            </h1>

            <p className="mt-3 text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  // -------------------------------------------------------------
  // PAGE
  // -------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 font-medium text-slate-600 transition hover:text-slate-900"
        >
          <FiArrowLeft />
          Back to Dashboard
        </button>

        {/* =======================================================
            PROJECT HEADER
        ======================================================= */}
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-100">
                <FiFolder
                  size={26}
                  className="text-yellow-600"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  {project.projectName}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  {project.customerEmail || currentUser.email}
                </p>

                {project.location && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <FiMapPin className="text-yellow-600" />
                    {project.location}
                  </div>
                )}
              </div>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
                project.status
              )}`}
            >
              {project.status || "Pending"}
            </span>
          </div>

          {/* PROGRESS */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">
                Project Progress
              </h2>

              <span className="font-bold text-slate-900">
                {progress}%
              </span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-yellow-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Updates
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {updates.length}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Photos
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {photos.length}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Documents
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {documents.length}
              </p>
            </div>
          </div>
        </div>

        {/* =======================================================
            PROJECT INFORMATION
        ======================================================= */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* DESCRIPTION */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Project Description
            </h2>

            <p className="mt-4 leading-relaxed text-slate-600">
              {project.description ||
                "No project description has been provided yet."}
            </p>
          </div>

          {/* DETAILS */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Project Details
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <FiMapPin className="mt-1 shrink-0 text-yellow-600" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Location
                  </p>

                  <p className="mt-1 text-slate-700">
                    {project.location || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiCalendar className="mt-1 shrink-0 text-yellow-600" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Start Date
                  </p>

                  <p className="mt-1 text-slate-700">
                    {formatDate(project.startDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiClock className="mt-1 shrink-0 text-yellow-600" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Expected Completion
                  </p>

                  <p className="mt-1 text-slate-700">
                    {formatDate(project.expectedEndDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiActivity className="mt-1 shrink-0 text-yellow-600" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Current Status
                  </p>

                  <p className="mt-1 font-medium text-slate-700">
                    {project.status || "Pending"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================
            PROGRESS UPDATES
        ======================================================= */}
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Progress Updates
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest updates from the engineering team.
              </p>
            </div>

            <FiActivity
              size={24}
              className="text-yellow-600"
            />
          </div>

          {updates.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <FiActivity
                size={28}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-medium text-slate-600">
                No progress updates yet.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Updates will appear here as the project progresses.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {updates.map((update, index) => (
                <div
                  key={update.id}
                  className="relative pl-8"
                >
                  {index !== updates.length - 1 && (
                    <div className="absolute left-[7px] top-5 h-full w-px bg-slate-200" />
                  )}

                  <div className="absolute left-0 top-1 h-4 w-4 rounded-full border-4 border-yellow-100 bg-yellow-500" />

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {update.title || "Project Update"}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(update.createdAt)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {update.status && (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              update.status
                            )}`}
                          >
                            {update.status}
                          </span>
                        )}

                        {update.progress !== undefined && (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            {Number(update.progress) || 0}% complete
                          </span>
                        )}
                      </div>
                    </div>

                    {update.description && (
                      <p className="mt-4 whitespace-pre-wrap leading-relaxed text-slate-600">
                        {update.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =======================================================
            PHOTOS
        ======================================================= */}
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Project Photos
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Photos uploaded by the engineering team.
              </p>
            </div>

            <FiImage
              size={24}
              className="text-yellow-600"
            />
          </div>

          {photos.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <FiImage
                size={28}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-medium text-slate-600">
                No project photos yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo) => (
                <button
                  type="button"
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100"
                >
                  <img
                    src={photo.url}
                    alt={photo.name || "Project photo"}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-left opacity-0 transition group-hover:opacity-100">
                    <p className="truncate text-xs font-medium text-white">
                      {photo.name || "Project photo"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* =======================================================
            DOCUMENTS
        ======================================================= */}
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Project Documents
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Important documents related to this project.
              </p>
            </div>

            <FiFileText
              size={24}
              className="text-yellow-600"
            />
          </div>

          {documents.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <FiFileText
                size={28}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-medium text-slate-600">
                No documents available yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-100">
                      <FiFileText className="text-yellow-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {document.name || "Project document"}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                        <span>
                          {getFileType(document.name)}
                        </span>

                        <span>
                          {formatDate(document.createdAt)}
                        </span>

                        {document.size && (
                          <span>
                            {(
                              Number(document.size) /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {document.url && (
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <FiDownload size={16} />
                      Open Document
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =======================================================
            INVOICES
        ======================================================= */}
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Payment & Invoices
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View invoices and payment information for this project.
              </p>
            </div>

            <FiCreditCard
              size={24}
              className="text-yellow-600"
            />
          </div>

          {/* PAYMENT SUMMARY */}
          {invoices.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Total Invoiced
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {formatCurrency(
                    totalInvoiced,
                    invoices[0]?.currency || "NGN"
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                  Amount Paid
                </p>

                <p className="mt-2 text-xl font-bold text-green-700">
                  {formatCurrency(
                    totalPaid,
                    invoices[0]?.currency || "NGN"
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-yellow-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700">
                  Balance Due
                </p>

                <p className="mt-2 text-xl font-bold text-yellow-700">
                  {formatCurrency(
                    totalBalance,
                    invoices[0]?.currency || "NGN"
                  )}
                </p>
              </div>
            </div>
          )}

          {invoices.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <FiCreditCard
                size={28}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-medium text-slate-600">
                No invoices have been issued for this project.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {invoices.map((invoice) => {
                const currency = invoice.currency || "NGN";

                const total =
                  Number(invoice.total) || 0;

                const amountPaid =
                  Number(invoice.amountPaid) || 0;

                const balance =
                  Number(invoice.balanceDue) ||
                  Math.max(total - amountPaid, 0);

                return (
                  <div
                    key={invoice.id}
                    className="overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <div className="flex flex-col gap-4 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-bold text-slate-900">
                            {invoice.invoiceNumber ||
                              "Invoice"}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              invoice.status
                            )}`}
                          >
                            {invoice.status || "Sent"}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          Issued{" "}
                          {formatDate(invoice.issueDate)}
                          {invoice.dueDate
                            ? ` • Due ${formatDate(
                                invoice.dueDate
                              )}`
                            : ""}
                        </p>
                      </div>

                      {invoice.url && (
                        <a
                          href={invoice.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <FiExternalLink size={16} />
                          View Invoice
                        </a>
                      )}
                    </div>

                    <div className="grid gap-4 p-5 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Invoice Total
                        </p>

                        <p className="mt-1 font-bold text-slate-900">
                          {formatCurrency(
                            total,
                            currency
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Amount Paid
                        </p>

                        <p className="mt-1 font-bold text-green-600">
                          {formatCurrency(
                            amountPaid,
                            currency
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Balance Due
                        </p>

                        <p className="mt-1 font-bold text-yellow-600">
                          {formatCurrency(
                            balance,
                            currency
                          )}
                        </p>
                      </div>
                    </div>

                    {/* INVOICE ITEMS */}
                    {Array.isArray(invoice.items) &&
                      invoice.items.length > 0 && (
                        <div className="border-t border-slate-100 p-5">
                          <h4 className="mb-3 text-sm font-bold text-slate-900">
                            Invoice Items
                          </h4>

                          <div className="space-y-2">
                            {invoice.items.map(
                              (item, index) => (
                                <div
                                  key={`${invoice.id}-item-${index}`}
                                  className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 p-3"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-slate-800">
                                      {item.description ||
                                        "Item"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                      Qty:{" "}
                                      {Number(
                                        item.quantity
                                      ) || 0}{" "}
                                      ×{" "}
                                      {formatCurrency(
                                        item.unitPrice,
                                        currency
                                      )}
                                    </p>
                                  </div>

                                  <p className="shrink-0 text-sm font-bold text-slate-900">
                                    {formatCurrency(
                                      item.amount,
                                      currency
                                    )}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* PAYMENT INFORMATION */}
                    {invoice.paymentInformation && (
                      <div className="border-t border-slate-100 p-5">
                        <h4 className="mb-4 text-sm font-bold text-slate-900">
                          Payment Information
                        </h4>

                        <div className="grid gap-4 sm:grid-cols-3">
                          {invoice.paymentInformation
                            .bankName && (
                            <div>
                              <p className="text-xs text-slate-400">
                                Bank
                              </p>

                              <p className="mt-1 text-sm font-medium text-slate-700">
                                {
                                  invoice
                                    .paymentInformation
                                    .bankName
                                }
                              </p>
                            </div>
                          )}

                          {invoice.paymentInformation
                            .accountName && (
                            <div>
                              <p className="text-xs text-slate-400">
                                Account Name
                              </p>

                              <p className="mt-1 text-sm font-medium text-slate-700">
                                {
                                  invoice
                                    .paymentInformation
                                    .accountName
                                }
                              </p>
                            </div>
                          )}

                          {invoice.paymentInformation
                            .accountNumber && (
                            <div>
                              <p className="text-xs text-slate-400">
                                Account Number
                              </p>

                              <p className="mt-1 text-sm font-medium text-slate-700">
                                {
                                  invoice
                                    .paymentInformation
                                    .accountNumber
                                }
                              </p>
                            </div>
                          )}
                        </div>

                        {invoice.paymentInformation
                          .paymentInstructions && (
                          <p className="mt-4 rounded-xl bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-800">
                            {
                              invoice
                                .paymentInformation
                                .paymentInstructions
                            }
                          </p>
                        )}
                      </div>
                    )}

                    {/* NOTES / TERMS */}
                    {(invoice.notes ||
                      invoice.terms) && (
                      <div className="border-t border-slate-100 p-5">
                        {invoice.notes && (
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              Notes
                            </h4>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                              {invoice.notes}
                            </p>
                          </div>
                        )}

                        {invoice.terms && (
                          <div
                            className={
                              invoice.notes
                                ? "mt-5"
                                : ""
                            }
                          >
                            <h4 className="text-sm font-bold text-slate-900">
                              Terms & Conditions
                            </h4>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                              {invoice.terms}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* =======================================================
            PROJECT ACTIVITY
        ======================================================= */}
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
              <FiCheckCircle className="text-yellow-600" />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Project Activity
              </h2>

              <p className="text-sm text-slate-500">
                Your project information is kept up to date by
                the engineering team.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Project Created
              </p>

              <p className="mt-1 font-medium text-slate-700">
                {formatDate(project.createdAt)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Last Updated
              </p>

              <p className="mt-1 font-medium text-slate-700">
                {formatDate(project.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          PHOTO LIGHTBOX
      ========================================================= */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={selectedPhoto.url}
              alt={
                selectedPhoto.name ||
                "Project photo"
              }
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />

            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="truncate text-sm font-medium text-white">
                {selectedPhoto.name ||
                  "Project photo"}
              </p>

              <a
                href={selectedPhoto.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900"
              >
                <FiExternalLink size={15} />
                Open
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;