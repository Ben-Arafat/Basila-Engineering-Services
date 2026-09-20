import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { getApp } from "firebase/app";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFile,
  FiFileText,
  FiImage,
  FiLoader,
  FiMapPin,
  FiSave,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { getDbInstance } from "../../../Firebase/firebase";

const ADMIN_UID = "tjoY9a9YqGQ8aU0Zbayc0OO93pp1";

const STATUS_OPTIONS = [
  "Pending",
  "In Progress",
  "On Hold",
  "Completed",
  "Cancelled",
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024;

function getStorageInstance() {
  return getStorage(getApp());
}

function formatDate(value) {
  if (!value) return "—";

  if (typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
  }

  if (value?.toDate) {
    return value.toDate().toLocaleDateString();
  }

  return "—";
}

function getTimestampValue(value) {
  if (!value) return 0;

  if (typeof value?.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value === "string") {
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  return 0;
}

function safeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${
    units[index]
  }`;
}

export default function ManageProjectModal({
  project,
  onClose,
  onProjectUpdated,
}) {
  const [activeTab, setActiveTab] = useState("Overview");

  const [formData, setFormData] = useState({
    projectName: project?.projectName || "",
    location: project?.location || "",
    status: project?.status || "Pending",
    progress: Number(project?.progress || 0),
    startDate: project?.startDate || "",
    expectedEndDate: project?.expectedEndDate || "",
    description: project?.description || "",
  });

  const [updates, setUpdates] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const [saving, setSaving] = useState(false);

  const [updateForm, setUpdateForm] = useState({
    title: "",
    description: "",
    progress: Number(project?.progress || 0),
    status: project?.status || "In Progress",
  });

  const [addingUpdate, setAddingUpdate] = useState(false);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const [photoProgress, setPhotoProgress] = useState(0);
  const [documentProgress, setDocumentProgress] = useState(0);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!project?.id) return;

    loadUpdates();
    loadPhotos();
    loadDocuments();
  }, [project?.id]);

  async function loadUpdates() {
    try {
      setLoadingUpdates(true);

      const db = await getDbInstance();

      const snapshot = await getDocs(
        collection(db, "projects", project.id, "updates")
      );

      const data = snapshot.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .sort(
          (a, b) =>
            getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt)
        );

      setUpdates(data);
    } catch (err) {
      console.error("Error loading project updates:", err);
      setError("Unable to load project updates.");
    } finally {
      setLoadingUpdates(false);
    }
  }

  async function loadPhotos() {
    try {
      setLoadingPhotos(true);

      const db = await getDbInstance();

      const snapshot = await getDocs(
        collection(db, "projects", project.id, "photos")
      );

      const data = snapshot.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .sort(
          (a, b) =>
            getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt)
        );

      setPhotos(data);
    } catch (err) {
      console.error("Error loading project photos:", err);
      setError("Unable to load project photos.");
    } finally {
      setLoadingPhotos(false);
    }
  }

  async function loadDocuments() {
    try {
      setLoadingDocuments(true);

      const db = await getDbInstance();

      const snapshot = await getDocs(
        collection(db, "projects", project.id, "documents")
      );

      const data = snapshot.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .sort(
          (a, b) =>
            getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt)
        );

      setDocuments(data);
    } catch (err) {
      console.error("Error loading project documents:", err);
      setError("Unable to load project documents.");
    } finally {
      setLoadingDocuments(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function saveProject() {
    setError("");

    if (!formData.projectName.trim()) {
      setError("Project name is required.");
      return;
    }

    try {
      setSaving(true);

      const db = await getDbInstance();

      const progress = Math.min(
        100,
        Math.max(0, Number(formData.progress) || 0)
      );

      const projectRef = doc(db, "projects", project.id);

      const changes = {
        projectName: formData.projectName.trim(),
        location: formData.location.trim(),
        status: formData.status,
        progress,
        startDate: formData.startDate,
        expectedEndDate: formData.expectedEndDate,
        description: formData.description.trim(),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(projectRef, changes);

      const updatedProject = {
        ...project,
        ...changes,
        progress,
      };

      onProjectUpdated?.(updatedProject);

      setFormData((prev) => ({
        ...prev,
        progress,
      }));
    } catch (err) {
      console.error("Error updating project:", err);
      setError("Unable to save project changes.");
    } finally {
      setSaving(false);
    }
  }

  async function addProjectUpdate(event) {
    event.preventDefault();

    setError("");

    if (!updateForm.title.trim()) {
      setError("Update title is required.");
      return;
    }

    try {
      setAddingUpdate(true);

      const db = await getDbInstance();

      const progress = Math.min(
        100,
        Math.max(0, Number(updateForm.progress) || 0)
      );

      await addDoc(collection(db, "projects", project.id, "updates"), {
        title: updateForm.title.trim(),
        description: updateForm.description.trim(),
        progress,
        status: updateForm.status,
        createdAt: serverTimestamp(),
        createdBy: ADMIN_UID,
      });

      await updateDoc(doc(db, "projects", project.id), {
        progress,
        status: updateForm.status,
        updatedAt: serverTimestamp(),
      });

      const updatedProject = {
        ...project,
        progress,
        status: updateForm.status,
      };

      onProjectUpdated?.(updatedProject);

      setFormData((prev) => ({
        ...prev,
        progress,
        status: updateForm.status,
      }));

      setUpdateForm({
        title: "",
        description: "",
        progress,
        status: updateForm.status,
      });

      await loadUpdates();
    } catch (err) {
      console.error("Error adding project update:", err);
      setError("Unable to add project update.");
    } finally {
      setAddingUpdate(false);
    }
  }

  async function uploadPhoto(file) {
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError(`${file.name} is not an image file.`);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError(`${file.name} is larger than 10 MB.`);
      return;
    }

    try {
      setUploadingPhoto(true);
      setPhotoProgress(0);

      await getDbInstance();

      const storage = getStorageInstance();

      const fileName = `${Date.now()}_${safeFileName(file.name)}`;

      const storagePath = `projects/${project.id}/photos/${fileName}`;

      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
      });

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

            setPhotoProgress(Math.round(progress));
          },
          reject,
          resolve
        );
      });

      const url = await getDownloadURL(uploadTask.snapshot.ref);

      const db = await getDbInstance();

      await addDoc(collection(db, "projects", project.id, "photos"), {
        name: file.name,
        url,
        storagePath,
        contentType: file.type,
        size: file.size,
        createdAt: serverTimestamp(),
        uploadedBy: ADMIN_UID,
      });

      await loadPhotos();
    } catch (err) {
      console.error("Photo upload error:", err);
      setError(err?.message || "Unable to upload photo.");
    } finally {
      setUploadingPhoto(false);
      setPhotoProgress(0);
    }
  }

  async function uploadDocument(file) {
    if (!file) return;

    setError("");

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];

    const extension = file.name.split(".").pop()?.toLowerCase();

    const allowedExtensions = [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "txt",
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(extension)
    ) {
      setError(`${file.name} is not a supported document.`);
      return;
    }

    if (file.size > MAX_DOCUMENT_SIZE) {
      setError(`${file.name} is larger than 25 MB.`);
      return;
    }

    try {
      setUploadingDocument(true);
      setDocumentProgress(0);

      await getDbInstance();

      const storage = getStorageInstance();

      const fileName = `${Date.now()}_${safeFileName(file.name)}`;

      const storagePath = `projects/${project.id}/documents/${fileName}`;

      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type || "application/octet-stream",
      });

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

            setDocumentProgress(Math.round(progress));
          },
          reject,
          resolve
        );
      });

      const url = await getDownloadURL(uploadTask.snapshot.ref);

      const db = await getDbInstance();

      await addDoc(collection(db, "projects", project.id, "documents"), {
        name: file.name,
        url,
        storagePath,
        contentType: file.type || "application/octet-stream",
        size: file.size,
        createdAt: serverTimestamp(),
        uploadedBy: ADMIN_UID,
      });

      await loadDocuments();
    } catch (err) {
      console.error("Document upload error:", err);
      setError(err?.message || "Unable to upload document.");
    } finally {
      setUploadingDocument(false);
      setDocumentProgress(0);
    }
  }

  async function deletePhoto(photo) {
    if (!window.confirm(`Delete "${photo.name}"?`)) return;

    try {
      setError("");

      await getDbInstance();

      if (photo.storagePath) {
        try {
          const storage = getStorageInstance();
          await deleteObject(ref(storage, photo.storagePath));
        } catch (storageError) {
          if (storageError?.code !== "storage/object-not-found") {
            throw storageError;
          }
        }
      }

      const db = await getDbInstance();

      await deleteDoc(
        doc(db, "projects", project.id, "photos", photo.id)
      );

      await loadPhotos();
    } catch (err) {
      console.error("Photo deletion error:", err);
      setError("Unable to delete photo.");
    }
  }

  async function deleteDocument(document) {
    if (!window.confirm(`Delete "${document.name}"?`)) return;

    try {
      setError("");

      await getDbInstance();

      if (document.storagePath) {
        try {
          const storage = getStorageInstance();
          await deleteObject(ref(storage, document.storagePath));
        } catch (storageError) {
          if (storageError?.code !== "storage/object-not-found") {
            throw storageError;
          }
        }
      }

      const db = await getDbInstance();

      await deleteDoc(
        doc(db, "projects", project.id, "documents", document.id)
      );

      await loadDocuments();
    } catch (err) {
      console.error("Document deletion error:", err);
      setError("Unable to delete document.");
    }
  }

  const tabs = [
    { name: "Overview", icon: FiFileText },
    { name: "Updates", icon: FiClock },
    { name: "Photos", icon: FiImage },
    { name: "Documents", icon: FiFile },
  ];

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-5 md:px-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                <span>Project Management</span>
                <span>•</span>
                <span>{project.customerEmail || "Customer"}</span>
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                {project.projectName}
              </h1>

              <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                {project.location && (
                  <span className="flex items-center gap-1.5">
                    <FiMapPin size={15} />
                    {project.location}
                  </span>
                )}

                <span className="flex items-center gap-1.5">
                  <FiCalendar size={15} />
                  Started {formatDate(project.startDate)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <FiX size={22} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto border-b border-slate-200">
          <div className="flex min-w-max px-6 md:px-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.name}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.name);
                    setError("");
                  }}
                  className={`flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition ${
                    activeTab === tab.name
                      ? "border-yellow-500 text-yellow-600"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Icon size={17} />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 md:mx-8">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* OVERVIEW */}
          {activeTab === "Overview" && (
            <div className="space-y-8">
              {/* Progress summary */}
              <div className="rounded-2xl bg-slate-900 p-6 text-white">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-400">
                      Current project progress
                    </p>

                    <p className="mt-1 text-4xl font-bold">
                      {formData.progress}%
                    </p>
                  </div>

                  <div className="min-w-[240px]">
                    <div className="mb-2 flex justify-between text-xs text-slate-400">
                      <span>Progress</span>
                      <span>{formData.progress}%</span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-700">
                      <div
                        className="h-full rounded-full bg-yellow-500 transition-all"
                        style={{
                          width: `${formData.progress}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Project Name
                  </label>

                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Progress (%)
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    name="progress"
                    value={formData.progress}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Expected End Date
                  </label>

                  <input
                    type="date"
                    name="expectedEndDate"
                    value={formData.expectedEndDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Project Description
                  </label>

                  <textarea
                    name="description"
                    rows="6"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the project..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={saveProject}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <FiLoader className="animate-spin" size={17} />
                  ) : (
                    <FiSave size={17} />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* UPDATES */}
          {activeTab === "Updates" && (
            <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
              {/* Add update */}
              <form
                onSubmit={addProjectUpdate}
                className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <h2 className="text-lg font-bold text-slate-900">
                  Add Progress Update
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Keep the customer informed about project progress.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Update Title
                    </label>

                    <input
                      type="text"
                      value={updateForm.title}
                      onChange={(e) =>
                        setUpdateForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="e.g. Foundation completed"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Status
                    </label>

                    <select
                      value={updateForm.status}
                      onChange={(e) =>
                        setUpdateForm((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-yellow-500"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Progress
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={updateForm.progress}
                      onChange={(e) =>
                        setUpdateForm((prev) => ({
                          ...prev,
                          progress: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Description
                    </label>

                    <textarea
                      rows="5"
                      value={updateForm.description}
                      onChange={(e) =>
                        setUpdateForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="What happened on the project?"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-yellow-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={addingUpdate}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {addingUpdate ? (
                      <FiLoader className="animate-spin" size={17} />
                    ) : (
                      <FiCheckCircle size={17} />
                    )}
                    {addingUpdate ? "Adding..." : "Add Update"}
                  </button>
                </div>
              </form>

              {/* Timeline */}
              <div>
                <h2 className="mb-5 text-lg font-bold text-slate-900">
                  Project History
                </h2>

                {loadingUpdates ? (
                  <div className="flex justify-center py-12">
                    <FiLoader
                      className="animate-spin text-yellow-500"
                      size={28}
                    />
                  </div>
                ) : updates.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                    <FiClock
                      size={32}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-700">
                      No updates yet
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Add the first project progress update.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {updates.map((item) => (
                      <div
                        key={item.id}
                        className="relative rounded-2xl border border-slate-200 bg-white p-5"
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row">
                          <div>
                            <h3 className="font-bold text-slate-900">
                              {item.title}
                            </h3>

                            <p className="mt-1 text-xs font-medium text-slate-400">
                              {formatDate(item.createdAt)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                              {item.status}
                            </span>

                            <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">
                              {item.progress}%
                            </span>
                          </div>
                        </div>

                        {item.description && (
                          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PHOTOS */}
          {activeTab === "Photos" && (
            <div>
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Project Photos
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload site photos and progress images for the customer.
                  </p>
                </div>

                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
                  {uploadingPhoto ? (
                    <FiLoader className="animate-spin" size={17} />
                  ) : (
                    <FiUpload size={17} />
                  )}

                  {uploadingPhoto
                    ? `Uploading ${photoProgress}%`
                    : "Upload Photos"}

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingPhoto}
                    className="hidden"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);

                      for (const file of files) {
                        await uploadPhoto(file);
                      }

                      e.target.value = "";
                    }}
                  />
                </label>
              </div>

              {uploadingPhoto && (
                <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-yellow-500 transition-all"
                    style={{
                      width: `${photoProgress}%`,
                    }}
                  />
                </div>
              )}

              {loadingPhotos ? (
                <div className="flex justify-center py-12">
                  <FiLoader
                    className="animate-spin text-yellow-500"
                    size={28}
                  />
                </div>
              ) : photos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                  <FiImage
                    size={40}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-4 font-semibold text-slate-700">
                    No project photos
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload photos from the project site.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                    >
                      <a
                        href={photo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block aspect-[4/3] overflow-hidden bg-slate-100"
                      >
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        />
                      </a>

                      <div className="p-4">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {photo.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatFileSize(photo.size)} •{" "}
                          {formatDate(photo.createdAt)}
                        </p>

                        <button
                          type="button"
                          onClick={() => deletePhoto(photo)}
                          className="mt-3 flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTS */}
          {activeTab === "Documents" && (
            <div>
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Project Documents
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Store drawings, reports, quotations, certificates and
                    other project files.
                  </p>
                </div>

                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
                  {uploadingDocument ? (
                    <FiLoader className="animate-spin" size={17} />
                  ) : (
                    <FiUpload size={17} />
                  )}

                  {uploadingDocument
                    ? `Uploading ${documentProgress}%`
                    : "Upload Documents"}

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    multiple
                    disabled={uploadingDocument}
                    className="hidden"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);

                      for (const file of files) {
                        await uploadDocument(file);
                      }

                      e.target.value = "";
                    }}
                  />
                </label>
              </div>

              {uploadingDocument && (
                <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-yellow-500 transition-all"
                    style={{
                      width: `${documentProgress}%`,
                    }}
                  />
                </div>
              )}

              {loadingDocuments ? (
                <div className="flex justify-center py-12">
                  <FiLoader
                    className="animate-spin text-yellow-500"
                    size={28}
                  />
                </div>
              ) : documents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                  <FiFile
                    size={40}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-4 font-semibold text-slate-700">
                    No project documents
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload documents associated with this project.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                          <FiFileText size={21} />
                        </div>

                        <div className="min-w-0">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block truncate text-sm font-bold text-slate-900 hover:text-yellow-600"
                          >
                            {item.name}
                          </a>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatFileSize(item.size)} •{" "}
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-bold text-slate-700 hover:text-yellow-600"
                        >
                          Open
                        </a>

                        <button
                          type="button"
                          onClick={() => deleteDocument(item)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete document"
                        >
                          <FiTrash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4 md:px-8">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}