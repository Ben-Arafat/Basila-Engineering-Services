import { useEffect, useMemo, useState } from "react";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import {
  FiPlus,
  FiFolder,
  FiX,
  FiFileText,
  FiTrash2,
  FiSend,
  FiPlusCircle,
  FiSettings,
  FiLoader,
  FiCreditCard,
  FiEye,
  FiCheckCircle,
  FiDollarSign,
} from "react-icons/fi";

import { getDbInstance } from "../../../Firebase/firebase";

import ManageProjectModal from "./manageProjectModal";

const ADMIN_UID = "tjoY9a9YqGQ8aU0Zbayc0OO93pp1";
const ADMIN_EMAIL = "admin@basilaengineering.com";

const emptyProjectForm = {
  customerId: "",
  projectName: "",
  description: "",
  location: "",
  status: "Pending",
  progress: 0,
  startDate: "",
  expectedEndDate: "",
};

const createEmptyInvoiceItem = () => ({
  id: `${Date.now()}-${Math.random()}`,
  description: "",
  quantity: 1,
  unitPrice: "",
});

const emptyInvoiceForm = {
  invoiceNumber: "",
  issueDate: new Date().toISOString().split("T")[0],
  dueDate: "",

  title: "",
  description: "",

  items: [createEmptyInvoiceItem()],

  discount: 0,
  tax: 0,
  otherCharges: 0,
  amountPaid: 0,

  currency: "NGN",

  bankName: "",
  accountName: "",
  accountNumber: "",
  paymentInstructions: "",

  notes: "",
  terms: "",
};

const emptyPaymentForm = {
  amount: "",
  method: "Bank Transfer",
  reference: "",
  date: new Date().toISOString().split("T")[0],
  note: "",
};

const Projects = () => {
  // ======================================================
  // PROJECT STATE
  // ======================================================

  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // ======================================================
  // MANAGE PROJECT STATE
  // ======================================================

  const [manageProject, setManageProject] = useState(null);

  // ======================================================
  // INVOICE STATE
  // ======================================================

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [savingInvoice, setSavingInvoice] = useState(false);

  const [invoiceFormData, setInvoiceFormData] = useState(
    emptyInvoiceForm
  );

  // ======================================================
  // EXISTING INVOICES
  // ======================================================

  const [projectInvoices, setProjectInvoices] = useState({});
  // ======================================================
  // VIEW INVOICE
  // ======================================================

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceDetailsModal, setShowInvoiceDetailsModal] =
    useState(false);

  // ======================================================
  // PAYMENT STATE
  // ======================================================

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [savingPayment, setSavingPayment] = useState(false);

  // ======================================================
  // ERROR / SUCCESS
  // ======================================================

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ======================================================
  // PROJECT FORM
  // ======================================================

  const [formData, setFormData] = useState(emptyProjectForm);

  // ======================================================
  // LOAD CUSTOMERS
  // ======================================================

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true);

        const db = await getDbInstance();

        const snapshot = await getDocs(
          collection(db, "customers")
        );

        const customerData = snapshot.docs.map((customerDoc) => {
          const data = customerDoc.data();

          return {
            id: customerDoc.id,
            ...data,
            uid: data.uid || customerDoc.id,
          };
        });

        customerData.sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() || 0) -
            (a.createdAt?.toMillis?.() || 0)
        );

        setCustomers(customerData);
      } catch (err) {
        console.error("Customers Error:", err);
        setError("Unable to load customers.");
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  // ======================================================
  // LOAD PROJECTS
  // ======================================================

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);

        const db = await getDbInstance();

        const snapshot = await getDocs(
          collection(db, "projects")
        );

        const projectData = snapshot.docs
          .map((projectDoc) => ({
            id: projectDoc.id,
            ...projectDoc.data(),
          }))
          .sort(
            (a, b) =>
              (b.createdAt?.toMillis?.() || 0) -
              (a.createdAt?.toMillis?.() || 0)
          );

        setProjects(projectData);
      } catch (err) {
        console.error("Projects Error:", err);

        setError("Unable to load projects.");
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // ======================================================
  // LOAD ALL PROJECT INVOICES
  // ======================================================

  useEffect(() => {
    if (!projects.length) {
      setProjectInvoices({});
      return;
    }

    const fetchInvoices = async () => {
      try {
        const db = await getDbInstance();

        const invoiceEntries = await Promise.all(
          projects.map(async (project) => {
            try {
              const snapshot = await getDocs(
                collection(
                  db,
                  "projects",
                  project.id,
                  "invoices"
                )
              );

              const invoices = snapshot.docs
                .map((invoiceDoc) => ({
                  id: invoiceDoc.id,
                  projectId: project.id,
                  ...invoiceDoc.data(),
                }))
                .sort(
                  (a, b) =>
                    (b.createdAt?.toMillis?.() || 0) -
                    (a.createdAt?.toMillis?.() || 0)
                );

              return [project.id, invoices];
            } catch (invoiceError) {
              console.error(
                `Invoices Error for ${project.id}:`,
                invoiceError
              );

              return [project.id, []];
            }
          })
        );

        setProjectInvoices(
          Object.fromEntries(invoiceEntries)
        );
      } catch (err) {
        console.error("Load Invoices Error:", err);
      }
    };

    fetchInvoices();
  }, [projects]);

  // ======================================================
  // PROJECT INPUT
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // CREATE PROJECT
  // ======================================================

  const handleCreateProject = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!formData.customerId) {
      setError("Please select a customer.");
      return;
    }

    if (!formData.projectName.trim()) {
      setError("Please enter a project name.");
      return;
    }

    if (
      formData.startDate &&
      formData.expectedEndDate &&
      formData.expectedEndDate < formData.startDate
    ) {
      setError(
        "Expected end date cannot be before the start date."
      );
      return;
    }

    try {
      setSaving(true);

      const db = await getDbInstance();

      const selectedCustomer = customers.find(
        (customer) =>
          customer.uid === formData.customerId
      );

      if (!selectedCustomer) {
        setError("Selected customer could not be found.");
        return;
      }

      const progress = Math.min(
        Math.max(Number(formData.progress) || 0, 0),
        100
      );

      const projectData = {
        customerId: selectedCustomer.uid,

        customerEmail:
          selectedCustomer.email || "",

        customerName:
          selectedCustomer.name ||
          selectedCustomer.displayName ||
          "",

        projectName:
          formData.projectName.trim(),

        description:
          formData.description.trim(),

        location:
          formData.location.trim(),

        status:
          formData.status,

        progress,

        startDate:
          formData.startDate || null,

        expectedEndDate:
          formData.expectedEndDate || null,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      };

      const projectRef = await addDoc(
        collection(db, "projects"),
        projectData
      );

      setProjects((previous) => [
        {
          id: projectRef.id,
          ...projectData,
        },
        ...previous,
      ]);

      setFormData({
        ...emptyProjectForm,
      });

      setShowModal(false);

      setSuccessMessage(
        "Project created successfully."
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err) {
      console.error(
        "Create Project Error:",
        err
      );

      if (err.code === "permission-denied") {
        setError(
          "You don't have permission to create projects."
        );
      } else if (err.code === "unavailable") {
        setError(
          "Firestore is currently unavailable. Please try again."
        );
      } else {
        setError(
          "Unable to create project. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // OPEN MANAGE PROJECT
  // ======================================================

  const openManageProject = (project) => {
    setError("");
    setSuccessMessage("");
    setManageProject(project);
  };

  // ======================================================
  // PROJECT UPDATED CALLBACK
  // ======================================================

  const handleProjectUpdated = (updatedProject) => {
    setProjects((previous) =>
      previous.map((project) =>
        project.id === updatedProject.id
          ? {
              ...project,
              ...updatedProject,
            }
          : project
      )
    );

    setManageProject((previous) =>
      previous
        ? {
            ...previous,
            ...updatedProject,
          }
        : null
    );
  };

  // ======================================================
  // OPEN INVOICE MODAL
  // ======================================================

  const openInvoiceModal = (project) => {
    setError("");
    setSuccessMessage("");

    const today =
      new Date().toISOString().split("T")[0];

    setSelectedProject(project);

    setInvoiceFormData({
      ...emptyInvoiceForm,

      invoiceNumber: `INV-${Date.now()
        .toString()
        .slice(-6)}`,

      issueDate: today,

      dueDate: today,

      currency: "NGN",

      title: `Invoice for ${
        project.projectName || "Project"
      }`,

      description:
        project.description || "",

      items: [
        {
          ...createEmptyInvoiceItem(),

          description:
            project.projectName || "",
        },
      ],
    });

    setShowInvoiceModal(true);
  };

  // ======================================================
  // CLOSE INVOICE MODAL
  // ======================================================

  const closeInvoiceModal = () => {
    if (savingInvoice) return;

    setShowInvoiceModal(false);

    setSelectedProject(null);

    setInvoiceFormData({
      ...emptyInvoiceForm,

      items: [
        createEmptyInvoiceItem(),
      ],
    });

    setError("");
  };

  // ======================================================
  // INVOICE INPUT
  // ======================================================

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;

    setInvoiceFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // INVOICE ITEM CHANGE
  // ======================================================

  const handleInvoiceItemChange = (
    itemId,
    field,
    value
  ) => {
    setInvoiceFormData((previous) => ({
      ...previous,

      items: previous.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  };

  // ======================================================
  // ADD INVOICE ITEM
  // ======================================================

  const addInvoiceItem = () => {
    setInvoiceFormData((previous) => ({
      ...previous,

      items: [
        ...previous.items,
        createEmptyInvoiceItem(),
      ],
    }));
  };

  // ======================================================
  // REMOVE INVOICE ITEM
  // ======================================================

  const removeInvoiceItem = (itemId) => {
    setInvoiceFormData((previous) => {
      if (previous.items.length === 1) {
        return previous;
      }

      return {
        ...previous,

        items: previous.items.filter(
          (item) => item.id !== itemId
        ),
      };
    });
  };

  // ======================================================
  // CALCULATE INVOICE TOTALS
  // ======================================================

  const invoiceTotals = useMemo(() => {
    const subtotal =
      invoiceFormData.items.reduce(
        (total, item) => {
          const quantity =
            Number(item.quantity) || 0;

          const unitPrice =
            Number(item.unitPrice) || 0;

          return (
            total +
            quantity * unitPrice
          );
        },
        0
      );

    const discount =
      Number(invoiceFormData.discount) || 0;

    const tax =
      Number(invoiceFormData.tax) || 0;

    const otherCharges =
      Number(
        invoiceFormData.otherCharges
      ) || 0;

    const amountPaid =
      Number(
        invoiceFormData.amountPaid
      ) || 0;

    const total =
      Math.max(
        subtotal - discount,
        0
      ) +
      tax +
      otherCharges;

    const balanceDue =
      Math.max(
        total - amountPaid,
        0
      );

    return {
      subtotal,
      discount,
      tax,
      otherCharges,
      amountPaid,
      total,
      balanceDue,
    };
  }, [invoiceFormData]);

  // ======================================================
  // FORMAT MONEY
  // ======================================================

  const formatAmount = (
    amount,
    currency = "NGN"
  ) => {
    try {
      return new Intl.NumberFormat(
        "en-NG",
        {
          style: "currency",
          currency:
            currency || "NGN",
          maximumFractionDigits: 2,
        }
      ).format(
        Number(amount) || 0
      );
    } catch {
      return `${
        currency || "NGN"
      } ${
        Number(amount) || 0
      }`;
    }
  };

  // ======================================================
  // GET PAYMENT STATUS
  // ======================================================

  const getPaymentStatus = (
    invoice
  ) => {
    const total =
      Number(invoice?.total) || 0;

    const amountPaid =
      Number(invoice?.amountPaid) || 0;

    if (total > 0 && amountPaid >= total) {
      return "Paid";
    }

    if (amountPaid > 0) {
      return "Partially Paid";
    }

    return "Unpaid";
  };

  // ======================================================
  // PAYMENT STATUS STYLE
  // ======================================================

  const getPaymentStatusClasses = (
    status
  ) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";

      case "Partially Paid":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  // ======================================================
  // CREATE / SEND INVOICE
  // ======================================================

  const handleCreateInvoice = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!selectedProject) {
      setError("Please select a project.");
      return;
    }

    if (
      !invoiceFormData.invoiceNumber.trim()
    ) {
      setError(
        "Please enter an invoice number."
      );
      return;
    }

    if (!invoiceFormData.title.trim()) {
      setError(
        "Please enter an invoice title."
      );
      return;
    }

    if (!invoiceFormData.issueDate) {
      setError(
        "Please select an invoice date."
      );
      return;
    }

    if (!invoiceFormData.dueDate) {
      setError(
        "Please select a due date."
      );
      return;
    }

    const invalidItem =
      invoiceFormData.items.some(
        (item) =>
          !item.description.trim() ||
          Number(item.quantity) <= 0 ||
          Number(item.unitPrice) < 0
      );

    if (invalidItem) {
      setError(
        "Please complete all invoice items correctly."
      );
      return;
    }

    if (invoiceTotals.total <= 0) {
      setError(
        "Invoice total must be greater than zero."
      );
      return;
    }

    if (
      invoiceTotals.amountPaid >
      invoiceTotals.total
    ) {
      setError(
        "Amount paid cannot be greater than the invoice total."
      );
      return;
    }

    try {
      setSavingInvoice(true);

      const db = await getDbInstance();

      const customer =
        customers.find(
          (item) =>
            item.uid ===
            selectedProject.customerId
        );

      const cleanedItems =
        invoiceFormData.items.map(
          (item) => {
            const quantity =
              Number(item.quantity) || 0;

            const unitPrice =
              Number(item.unitPrice) || 0;

            return {
              description:
                item.description.trim(),

              quantity,

              unitPrice,

              amount:
                quantity *
                unitPrice,
            };
          }
        );

      let paymentStatus =
        "Unpaid";

      if (
        invoiceTotals.amountPaid >=
        invoiceTotals.total
      ) {
        paymentStatus = "Paid";
      } else if (
        invoiceTotals.amountPaid > 0
      ) {
        paymentStatus =
          "Partially Paid";
      }

      const invoiceData = {
        projectId:
          selectedProject.id,

        customerId:
          selectedProject.customerId,

        customer: {
          id:
            selectedProject.customerId,

          name:
            selectedProject.customerName ||
            customer?.name ||
            customer?.displayName ||
            "",

          email:
            selectedProject.customerEmail ||
            customer?.email ||
            "",

          phone:
            customer?.phone ||
            customer?.phoneNumber ||
            "",

          address:
            customer?.address ||
            "",
        },

        project: {
          id:
            selectedProject.id,

          name:
            selectedProject.projectName ||
            "",

          location:
            selectedProject.location ||
            "",

          description:
            selectedProject.description ||
            "",
        },

        invoiceNumber:
          invoiceFormData.invoiceNumber.trim(),

        issueDate:
          invoiceFormData.issueDate,

        dueDate:
          invoiceFormData.dueDate,

        title:
          invoiceFormData.title.trim(),

        description:
          invoiceFormData.description.trim(),

        items:
          cleanedItems,

        subtotal:
          invoiceTotals.subtotal,

        discount:
          invoiceTotals.discount,

        tax:
          invoiceTotals.tax,

        otherCharges:
          invoiceTotals.otherCharges,

        total:
          invoiceTotals.total,

        amountPaid:
          invoiceTotals.amountPaid,

        balanceDue:
          invoiceTotals.balanceDue,

        currency:
          invoiceFormData.currency,

        status:
          "Sent",

        paymentStatus,

        paymentHistory:
          invoiceTotals.amountPaid > 0
            ? [
                {
                  id: `PAY-${Date.now()}`,
                  amount:
                    invoiceTotals.amountPaid,
                  method:
                    "Initial Payment",
                  reference: "",
                  date:
                    invoiceFormData.issueDate,
                  note:
                    "Payment recorded when invoice was created.",
                  recordedBy:
                    ADMIN_UID,
                  recordedByEmail:
                    ADMIN_EMAIL,
                },
              ]
            : [],

        paymentInformation: {
          bankName:
            invoiceFormData.bankName.trim(),

          accountName:
            invoiceFormData.accountName.trim(),

          accountNumber:
            invoiceFormData.accountNumber.trim(),

          paymentInstructions:
            invoiceFormData.paymentInstructions.trim(),
        },

        notes:
          invoiceFormData.notes.trim(),

        terms:
          invoiceFormData.terms.trim(),

        createdBy:
          ADMIN_UID,

        createdByEmail:
          ADMIN_EMAIL,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),

        sentAt:
          serverTimestamp(),
      };

      const invoiceRef =
        await addDoc(
          collection(
            db,
            "projects",
            selectedProject.id,
            "invoices"
          ),
          invoiceData
        );

        try {
          await addDoc(collection(db, "notifications"), {
            userId: selectedProject.customerId,
            type: "invoice",
            title: "New Invoice Available",
            message: `A new invoice ${invoiceFormData.invoiceNumber.trim()} has been added to your project "${selectedProject.projectName || "Project"}".`,
            projectId: selectedProject.id,
            invoiceId: invoiceRef.id,
            invoiceNumber: invoiceFormData.invoiceNumber.trim(),
            read: false,
            createdAt: serverTimestamp(),
          });
        } catch (notificationError) {
          console.error("Notification creation failed:", notificationError);
        }

      const createdInvoice = {
        id: invoiceRef.id,
        projectId: selectedProject.id,
        ...invoiceData,
      };

      setProjectInvoices((previous) => ({
        ...previous,

        [selectedProject.id]: [
          createdInvoice,
          ...(previous[selectedProject.id] || []),
        ],
      }));

      setInvoiceFormData({
        ...emptyInvoiceForm,

        items: [
          createEmptyInvoiceItem(),
        ],
      });

      setSelectedProject(null);
      setShowInvoiceModal(false);

      setSuccessMessage(
        "Invoice sent successfully."
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (err) {
      console.error(
        "Create Invoice Error:",
        err
      );

      if (
        err.code ===
        "permission-denied"
      ) {
        setError(
          "You don't have permission to create invoices."
        );
      } else if (
        err.code ===
        "unavailable"
      ) {
        setError(
          "Firestore is currently unavailable. Please try again."
        );
      } else {
        setError(
          "Unable to send invoice. Please try again."
        );
      }
    } finally {
      setSavingInvoice(false);
    }
  };

  // ======================================================
  // OPEN INVOICE DETAILS
  // ======================================================

  const openInvoiceDetails = (
    invoice
  ) => {
    setError("");
    setSelectedInvoice(invoice);
    setShowInvoiceDetailsModal(true);
  };

  // ======================================================
  // OPEN PAYMENT MODAL
  // ======================================================

  const openPaymentModal = (
    invoice
  ) => {
    const total =
      Number(invoice?.total) || 0;

    const amountPaid =
      Number(invoice?.amountPaid) || 0;

    const balance =
      Math.max(
        total - amountPaid,
        0
      );

    if (balance <= 0) {
      setError(
        "This invoice has already been fully paid."
      );
      return;
    }

    setError("");
    setSuccessMessage("");

    setPaymentInvoice(invoice);

    setPaymentForm({
      ...emptyPaymentForm,
      date:
        new Date()
          .toISOString()
          .split("T")[0],
    });

    setShowPaymentModal(true);
  };

  // ======================================================
  // CLOSE PAYMENT MODAL
  // ======================================================

  const closePaymentModal = () => {
    if (savingPayment) return;

    setShowPaymentModal(false);
    setPaymentInvoice(null);
    setPaymentForm(emptyPaymentForm);
    setError("");
  };

  // ======================================================
  // PAYMENT INPUT
  // ======================================================

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;

    setPaymentForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // RECORD PAYMENT
  // ======================================================

  const handleRecordPayment = async (
    e
  ) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!paymentInvoice) {
      setError(
        "No invoice selected."
      );
      return;
    }

    const paymentAmount =
      Number(paymentForm.amount);

    const invoiceTotal =
      Number(paymentInvoice.total) || 0;

    const currentAmountPaid =
      Number(paymentInvoice.amountPaid) || 0;

    const currentBalance =
      Math.max(
        invoiceTotal -
          currentAmountPaid,
        0
      );

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      setError(
        "Please enter a valid payment amount."
      );
      return;
    }

    if (paymentAmount > currentBalance) {
      setError(
        `Payment cannot be greater than the outstanding balance of ${formatAmount(
          currentBalance,
          paymentInvoice.currency
        )}.`
      );
      return;
    }

    if (!paymentForm.date) {
      setError(
        "Please select the payment date."
      );
      return;
    }

    try {
      setSavingPayment(true);

      const db = await getDbInstance();

      const newAmountPaid =
        currentAmountPaid +
        paymentAmount;

      const newBalance =
        Math.max(
          invoiceTotal -
            newAmountPaid,
          0
        );

      let newPaymentStatus =
        "Unpaid";

      if (
        newAmountPaid >=
        invoiceTotal
      ) {
        newPaymentStatus = "Paid";
      } else if (
        newAmountPaid > 0
      ) {
        newPaymentStatus =
          "Partially Paid";
      }

      const paymentRecord = {
        id: `PAY-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

        amount:
          paymentAmount,

        method:
          paymentForm.method,

        reference:
          paymentForm.reference.trim(),

        date:
          paymentForm.date,

        note:
          paymentForm.note.trim(),

        recordedBy:
          ADMIN_UID,

        recordedByEmail:
          ADMIN_EMAIL,

        recordedAt:
          new Date().toISOString(),
      };

      const existingHistory =
        Array.isArray(
          paymentInvoice.paymentHistory
        )
          ? paymentInvoice.paymentHistory
          : [];

      const updatedPaymentHistory = [
        ...existingHistory,
        paymentRecord,
      ];

      const invoiceRef = doc(
        db,
        "projects",
        paymentInvoice.projectId,
        "invoices",
        paymentInvoice.id
      );

      await updateDoc(
        invoiceRef,
        {
          amountPaid:
            newAmountPaid,

          balanceDue:
            newBalance,

          paymentStatus:
            newPaymentStatus,

          paymentHistory:
            updatedPaymentHistory,

          updatedAt:
            serverTimestamp(),

          lastPaymentAt:
            serverTimestamp(),
        }
      );

      const updatedInvoice = {
        ...paymentInvoice,

        amountPaid:
          newAmountPaid,

        balanceDue:
          newBalance,

        paymentStatus:
          newPaymentStatus,

        paymentHistory:
          updatedPaymentHistory,
      };

      setProjectInvoices((previous) => ({
        ...previous,

        [paymentInvoice.projectId]: (
          previous[
            paymentInvoice.projectId
          ] || []
        ).map((invoice) =>
          invoice.id ===
          paymentInvoice.id
            ? updatedInvoice
            : invoice
        ),
      }));

      setSelectedInvoice((previous) =>
        previous &&
        previous.id ===
          paymentInvoice.id
          ? updatedInvoice
          : previous
      );

      setPaymentInvoice(null);
      setPaymentForm(emptyPaymentForm);
      setShowPaymentModal(false);

      setSuccessMessage(
        newPaymentStatus === "Paid"
          ? "Payment recorded. Invoice is now fully paid."
          : "Payment recorded successfully."
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (err) {
      console.error(
        "Record Payment Error:",
        err
      );

      if (
        err.code ===
        "permission-denied"
      ) {
        setError(
          "You don't have permission to record payments."
        );
      } else {
        setError(
          "Unable to record payment. Please try again."
        );
      }
    } finally {
      setSavingPayment(false);
    }
  };

  // ======================================================
  // CLOSE CREATE PROJECT MODAL
  // ======================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setError("");
  };

  // ======================================================
  // STATUS STYLE
  // ======================================================

  const getStatusClasses = (
    status
  ) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";

      case "In Progress":
        return "bg-blue-100 text-blue-700";

      case "On Hold":
        return "bg-orange-100 text-orange-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="p-5 sm:p-7 lg:p-10">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Projects
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer projects, track
            progress, upload project files,
            send invoices, and record payments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccessMessage("");
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-white transition hover:bg-yellow-600"
        >
          <FiPlus size={18} />

          New Project
        </button>
      </div>

      {/* SUCCESS */}

      {successMessage &&
        !showModal &&
        !showInvoiceModal &&
        !showPaymentModal && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            {successMessage}
          </div>
        )}

      {/* GENERAL ERROR */}

      {error &&
        !showModal &&
        !showInvoiceModal &&
        !showPaymentModal && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

      {/* PROJECT LIST */}

      <div className="mt-8">

        {loadingProjects ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="flex items-center justify-center gap-3 text-slate-500">
              <FiLoader
                className="animate-spin"
                size={20}
              />

              Loading projects...
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center shadow-sm">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <FiFolder
                size={30}
                className="text-yellow-600"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              No Projects Yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              Create your first project to
              start tracking project progress
              and sending invoices to customers.
            </p>

            <button
              type="button"
              onClick={() => {
                setError("");
                setShowModal(true);
              }}
              className="mt-6 flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-white transition hover:bg-yellow-600"
            >
              <FiPlus size={18} />

              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {projects.map((project) => {
              const progress =
                Math.min(
                  Math.max(
                    Number(project.progress) || 0,
                    0
                  ),
                  100
                );

              const invoices =
                projectInvoices[
                  project.id
                ] || [];

              const invoiceTotal =
                invoices.reduce(
                  (sum, invoice) =>
                    sum +
                    (Number(
                      invoice.total
                    ) || 0),
                  0
                );

              const invoicePaid =
                invoices.reduce(
                  (sum, invoice) =>
                    sum +
                    (Number(
                      invoice.amountPaid
                    ) || 0),
                  0
                );

              const invoiceBalance =
                Math.max(
                  invoiceTotal -
                    invoicePaid,
                  0
                );

              return (
                <div
                  key={project.id}
                  className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
                >

                  {/* CARD TOP */}

                  <div className="flex items-start justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100">
                      <FiFolder
                        className="text-yellow-600"
                        size={20}
                      />
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        project.status
                      )}`}
                    >
                      {project.status ||
                        "Pending"}
                    </span>
                  </div>

                  {/* PROJECT INFO */}

                  <h2 className="mt-5 text-lg font-bold text-slate-900">
                    {project.projectName}
                  </h2>

                  <p className="mt-2 break-words text-sm text-slate-500">
                    {project.customerEmail ||
                      "No customer email"}
                  </p>

                  {project.customerName && (
                    <p className="mt-1 text-sm text-slate-400">
                      {project.customerName}
                    </p>
                  )}

                  {project.location && (
                    <p className="mt-1 text-sm text-slate-400">
                      📍 {project.location}
                    </p>
                  )}

                  {/* PROGRESS */}

                  <div className="mt-5">

                    <div className="mb-2 flex justify-between text-xs">

                      <span className="text-slate-500">
                        Progress
                      </span>

                      <span className="font-semibold text-slate-700">
                        {progress}%
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">

                      <div
                        className="h-full rounded-full bg-yellow-500 transition-all"
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                    </div>
                  </div>

                  {/* INVOICE SUMMARY */}

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-2">
                        <FiFileText
                          className="text-slate-500"
                        />

                        <span className="text-sm font-semibold text-slate-700">
                          Invoices
                        </span>
                      </div>

                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600">
                        {invoices.length}
                      </span>

                    </div>

                    {invoices.length > 0 ? (
                      <div className="mt-3 grid grid-cols-2 gap-3">

                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-slate-400">
                            Paid
                          </p>

                          <p className="mt-1 text-sm font-bold text-green-600">
                            {formatAmount(
                              invoicePaid,
                              "NGN"
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-slate-400">
                            Balance
                          </p>

                          <p className="mt-1 text-sm font-bold text-orange-600">
                            {formatAmount(
                              invoiceBalance,
                              "NGN"
                            )}
                          </p>
                        </div>

                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-slate-400">
                        No invoices created yet.
                      </p>
                    )}

                  </div>

                  {/* INVOICE LIST */}

                  {invoices.length > 0 && (
                    <div className="mt-4 space-y-2">

                      {invoices.map(
                        (invoice) => {
                          const paymentStatus =
                            getPaymentStatus(
                              invoice
                            );

                          return (
                            <div
                              key={
                                invoice.id
                              }
                              className="rounded-xl border border-slate-200 p-3"
                            >

                              <div className="flex items-start justify-between gap-3">

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-bold text-slate-800">
                                    {
                                      invoice.invoiceNumber
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {formatAmount(
                                      invoice.total,
                                      invoice.currency
                                    )}
                                  </p>

                                </div>

                                <span
                                  className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${getPaymentStatusClasses(
                                    paymentStatus
                                  )}`}
                                >
                                  {
                                    paymentStatus
                                  }
                                </span>

                              </div>

                              <div className="mt-3 flex gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    openInvoiceDetails(
                                      invoice
                                    )
                                  }
                                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                  <FiEye />

                                  View
                                </button>

                                {paymentStatus !==
                                  "Paid" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openPaymentModal(
                                        invoice
                                      )
                                    }
                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-2 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                                  >
                                    <FiCreditCard />

                                    Payment
                                  </button>
                                )}

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>
                  )}

                  {/* PROJECT ACTIONS */}

                  <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">

                    <button
                      type="button"
                      onClick={() =>
                        openManageProject(
                          project
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <FiSettings size={17} />

                      Manage Project
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openInvoiceModal(
                          project
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-500 px-4 py-3 text-sm font-semibold text-yellow-600 transition hover:bg-yellow-50"
                    >
                      <FiFileText
                        size={17}
                      />

                      Send Invoice
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* MANAGE PROJECT MODAL */}
      {/* ================================================= */}

      {manageProject && (
        <ManageProjectModal
          project={manageProject}
          onClose={() =>
            setManageProject(null)
          }
          onProjectUpdated={
            handleProjectUpdated
          }
        />
      )}

      {/* ================================================= */}
      {/* CREATE PROJECT MODAL */}
      {/* ================================================= */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">

            <div className="flex items-start justify-between">

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Create New Project
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add a project for an existing
                  customer.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <FiX size={22} />
              </button>

            </div>

            <form
              onSubmit={
                handleCreateProject
              }
              className="mt-7 space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Customer
                </label>

                <select
                  name="customerId"
                  value={
                    formData.customerId
                  }
                  onChange={handleChange}
                  disabled={
                    loadingCustomers ||
                    saving
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                >

                  <option value="">
                    {loadingCustomers
                      ? "Loading customers..."
                      : "Select a customer"}
                  </option>

                  {customers.map(
                    (customer) => (
                      <option
                        key={
                          customer.id
                        }
                        value={
                          customer.uid
                        }
                      >
                        {customer.name ||
                          customer.displayName ||
                          customer.email ||
                          customer.uid}
                      </option>
                    )
                  )}

                </select>
              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Project Name
                </label>

                <input
                  type="text"
                  name="projectName"
                  value={
                    formData.projectName
                  }
                  onChange={handleChange}
                  placeholder="e.g. Solar Installation"
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  placeholder="Describe the project..."
                  rows={4}
                  disabled={saving}
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={
                    formData.location
                  }
                  onChange={handleChange}
                  placeholder="Project location"
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                />

              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-yellow-500"
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="On Hold">
                      On Hold
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>

                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Progress (%)
                  </label>

                  <input
                    type="number"
                    name="progress"
                    min="0"
                    max="100"
                    value={
                      formData.progress
                    }
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                  />

                </div>

              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={
                      formData.startDate
                    }
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Expected Completion
                  </label>

                  <input
                    type="date"
                    name="expectedEndDate"
                    value={
                      formData.expectedEndDate
                    }
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                  />

                </div>

              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Creating Project..."
                    : "Create Project"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* SEND INVOICE MODAL */}
      {/* ================================================= */}

      {showInvoiceModal &&
        selectedProject && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden bg-black/60 px-4 py-5 backdrop-blur-sm">

            <div className="flex max-h-[calc(100dvh-2.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

              <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">

                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100">
                      <FiFileText
                        size={22}
                        className="text-yellow-600"
                      />
                    </div>

                    <div>

                      <h2 className="text-2xl font-bold text-slate-900">
                        Send Invoice
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Create a professional
                        invoice for this project.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      closeInvoiceModal
                    }
                    disabled={
                      savingInvoice
                    }
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                  >
                    <FiX size={22} />
                  </button>

                </div>
              </div>

              <form
                onSubmit={
                  handleCreateInvoice
                }
                className="min-h-0 flex-1 space-y-8 overflow-y-auto overscroll-contain p-6 sm:p-8"
              >

                {/* PROJECT / CUSTOMER */}

                <section>

                  <div className="mb-4">

                    <h3 className="text-lg font-bold text-slate-900">
                      Project & Customer
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      This invoice will be
                      connected to the selected
                      project.
                    </p>

                  </div>

                  <div className="grid gap-4 md:grid-cols-2">

                    <div className="rounded-2xl bg-slate-50 p-5">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Project
                      </p>

                      <p className="mt-2 text-lg font-bold text-slate-900">
                        {
                          selectedProject.projectName
                        }
                      </p>

                      {selectedProject.location && (
                        <p className="mt-1 text-sm text-slate-500">
                          {
                            selectedProject.location
                          }
                        </p>
                      )}

                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Customer
                      </p>

                      <p className="mt-2 font-semibold text-slate-900">
                        {
                          selectedProject.customerName ||
                          "Customer"
                        }
                      </p>

                      <p className="mt-1 break-all text-sm text-slate-500">
                        {
                          selectedProject.customerEmail ||
                          "No customer email"
                        }
                      </p>

                    </div>

                  </div>
                </section>

                {/* INVOICE DETAILS */}

                <section>

                  <h3 className="mb-4 text-lg font-bold text-slate-900">
                    Invoice Details
                  </h3>

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Invoice Number
                      </label>

                      <input
                        type="text"
                        name="invoiceNumber"
                        value={
                          invoiceFormData.invoiceNumber
                        }
                        onChange={
                          handleInvoiceChange
                        }
                        disabled={
                          savingInvoice
                        }
                        placeholder="INV-0001"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Currency
                      </label>

                      <select
                        name="currency"
                        value={
                          invoiceFormData.currency
                        }
                        onChange={
                          handleInvoiceChange
                        }
                        disabled={
                          savingInvoice
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-yellow-500"
                      >
                        <option value="NGN">
                          Nigerian Naira (NGN)
                        </option>

                        <option value="USD">
                          US Dollar (USD)
                        </option>

                        <option value="GBP">
                          British Pound (GBP)
                        </option>

                        <option value="EUR">
                          Euro (EUR)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Invoice Date
                      </label>

                      <input
                        type="date"
                        name="issueDate"
                        value={
                          invoiceFormData.issueDate
                        }
                        onChange={
                          handleInvoiceChange
                        }
                        disabled={
                          savingInvoice
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Due Date
                      </label>

                      <input
                        type="date"
                        name="dueDate"
                        value={
                          invoiceFormData.dueDate
                        }
                        onChange={
                          handleInvoiceChange
                        }
                        disabled={
                          savingInvoice
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                      />
                    </div>

                  </div>
                </section>

                {/* TITLE / DESCRIPTION */}

                <section>

                  <div className="grid gap-5">

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Invoice Title
                      </label>

                      <input
                        type="text"
                        name="title"
                        value={
                          invoiceFormData.title
                        }
                        onChange={
                          handleInvoiceChange
                        }
                        disabled={
                          savingInvoice
                        }
                        placeholder="Project Invoice"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Invoice Description
                      </label>

                      <textarea
                        name="description"
                        value={
                          invoiceFormData.description
                        }
                        onChange={
                          handleInvoiceChange
                        }
                        rows={4}
                        disabled={
                          savingInvoice
                        }
                        placeholder="Describe what this invoice is for..."
                        className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                      />
                    </div>

                  </div>
                </section>

                {/* ITEMS */}

                <section>

                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <h3 className="text-lg font-bold text-slate-900">
                        Invoice Items
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Add services, materials,
                        or charges.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={
                        addInvoiceItem
                      }
                      disabled={
                        savingInvoice
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-yellow-500 px-4 py-2.5 text-sm font-semibold text-yellow-600 transition hover:bg-yellow-50"
                    >
                      <FiPlusCircle />

                      Add Item
                    </button>

                  </div>

                  <div className="space-y-4">

                    {invoiceFormData.items.map(
                      (item, index) => {

                        const lineTotal =
                          (Number(
                            item.quantity
                          ) || 0) *
                          (Number(
                            item.unitPrice
                          ) || 0);

                        return (
                          <div
                            key={
                              item.id
                            }
                            className="rounded-2xl border border-slate-200 p-4"
                          >

                            <div className="mb-4 flex items-center justify-between">

                              <p className="font-semibold text-slate-700">
                                Item{" "}
                                {index + 1}
                              </p>

                              {invoiceFormData.items.length >
                                1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeInvoiceItem(
                                      item.id
                                    )
                                  }
                                  disabled={
                                    savingInvoice
                                  }
                                  className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                >
                                  <FiTrash2 />
                                </button>
                              )}

                            </div>

                            <div className="grid gap-4 lg:grid-cols-12">

                              <div className="lg:col-span-6">
                                <label className="mb-2 block text-xs font-semibold text-slate-500">
                                  Description
                                </label>

                                <input
                                  type="text"
                                  value={
                                    item.description
                                  }
                                  onChange={(e) =>
                                    handleInvoiceItemChange(
                                      item.id,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    savingInvoice
                                  }
                                  placeholder="e.g. Electrical installation"
                                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                                />
                              </div>

                              <div className="lg:col-span-2">
                                <label className="mb-2 block text-xs font-semibold text-slate-500">
                                  Quantity
                                </label>

                                <input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={
                                    item.quantity
                                  }
                                  onChange={(e) =>
                                    handleInvoiceItemChange(
                                      item.id,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    savingInvoice
                                  }
                                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                                />
                              </div>

                              <div className="lg:col-span-2">
                                <label className="mb-2 block text-xs font-semibold text-slate-500">
                                  Unit Price
                                </label>

                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={
                                    item.unitPrice
                                  }
                                  onChange={(e) =>
                                    handleInvoiceItemChange(
                                      item.id,
                                      "unitPrice",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    savingInvoice
                                  }
                                  placeholder="0.00"
                                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                                />
                              </div>

                              <div className="lg:col-span-2">
                                <label className="mb-2 block text-xs font-semibold text-slate-500">
                                  Amount
                                </label>

                                <div className="flex min-h-[50px] items-center rounded-xl bg-slate-50 px-4 font-semibold text-slate-800">
                                  {formatAmount(
                                    lineTotal,
                                    invoiceFormData.currency
                                  )}
                                </div>
                              </div>

                            </div>
                          </div>
                        );
                      }
                    )}

                  </div>
                </section>

                {/* TOTALS */}

                <section>

                  <h3 className="mb-4 text-lg font-bold text-slate-900">
                    Invoice Totals
                  </h3>

                  <div className="grid gap-6 lg:grid-cols-2">

                    <div className="space-y-4">

                      {[
                        ["Discount", "discount"],
                        ["Tax / VAT", "tax"],
                        ["Other Charges", "otherCharges"],
                      ].map(
                        ([label, name]) => (
                          <div key={name}>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              {label}
                            </label>

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              name={name}
                              value={
                                invoiceFormData[
                                  name
                                ]
                              }
                              onChange={
                                handleInvoiceChange
                              }
                              disabled={
                                savingInvoice
                              }
                              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                            />

                          </div>
                        )
                      )}

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Amount Already Paid
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          name="amountPaid"
                          value={
                            invoiceFormData.amountPaid
                          }
                          onChange={
                            handleInvoiceChange
                          }
                          disabled={
                            savingInvoice
                          }
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                        />

                        <p className="mt-1 text-xs text-slate-400">
                          You can also record future
                          payments from the project card.
                        </p>

                      </div>

                    </div>

                    <div className="rounded-2xl bg-slate-50 p-6">

                      <div className="space-y-4">

                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">
                            Subtotal
                          </span>

                          <span className="font-semibold">
                            {formatAmount(
                              invoiceTotals.subtotal,
                              invoiceFormData.currency
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">
                            Discount
                          </span>

                          <span className="font-semibold">
                            -
                            {formatAmount(
                              invoiceTotals.discount,
                              invoiceFormData.currency
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">
                            Tax / VAT
                          </span>

                          <span className="font-semibold">
                            {formatAmount(
                              invoiceTotals.tax,
                              invoiceFormData.currency
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">
                            Other Charges
                          </span>

                          <span className="font-semibold">
                            {formatAmount(
                              invoiceTotals.otherCharges,
                              invoiceFormData.currency
                            )}
                          </span>
                        </div>

                        <div className="border-t border-slate-200 pt-4">

                          <div className="flex justify-between">

                            <span className="font-bold">
                              Total
                            </span>

                            <span className="text-xl font-bold">
                              {formatAmount(
                                invoiceTotals.total,
                                invoiceFormData.currency
                              )}
                            </span>

                          </div>

                        </div>

                        <div className="flex justify-between text-sm">

                          <span className="text-slate-500">
                            Amount Paid
                          </span>

                          <span className="font-semibold text-green-600">
                            {formatAmount(
                              invoiceTotals.amountPaid,
                              invoiceFormData.currency
                            )}
                          </span>

                        </div>

                        <div className="rounded-xl bg-yellow-100 p-4">

                          <div className="flex justify-between">

                            <span className="font-bold text-yellow-900">
                              Balance Due
                            </span>

                            <span className="text-lg font-bold text-yellow-900">
                              {formatAmount(
                                invoiceTotals.balanceDue,
                                invoiceFormData.currency
                              )}
                            </span>

                          </div>

                        </div>

                      </div>
                    </div>
                  </div>
                </section>

                {/* PAYMENT INFORMATION */}

                <section>

                  <div className="mb-4">

                    <h3 className="text-lg font-bold text-slate-900">
                      Payment Information
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      These details will be shown
                      to the customer on the invoice.
                    </p>

                  </div>

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Bank Name
                      </label>

                      <input
                        type="text"
                        name="bankName"
                        value={
                          invoiceFormData.bankName
                        }
                        onChange={
                          handleInvoiceChange
                        }
                        disabled={
                          savingInvoice
                        }
                        placeholder="Bank name"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Account Name
                      </label>

                      <input
                        type="text"
                        name="accountName"
                        value={
                          invoiceFormData.accountName
                        }
                        onChange={
                          handleInvoiceChange
                        }
                        disabled={
                          savingInvoice
                        }
                        placeholder="Account name"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Account Number
                      </label>

                      <input
                        type="text"
                        name="accountNumber"
                        value={
                          invoiceFormData.accountNumber
                        }
                        onChange={
                          handleInvoiceChange
                        }
                        disabled={
                          savingInvoice
                        }
                        placeholder="Account number"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Payment Instructions
                      </label>

                      <textarea
                        name="paymentInstructions"
                        value={
                          invoiceFormData.paymentInstructions
                        }
                        onChange={
                          handleInvoiceChange
                        }
                        rows={3}
                        disabled={
                          savingInvoice
                        }
                        placeholder="Enter payment instructions..."
                        className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                      />
                    </div>

                  </div>
                </section>

                {/* NOTES / TERMS */}

                <section>

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Invoice Notes
                      </label>

                      <textarea
                        name="notes"
                        value={
                          invoiceFormData.notes
                        }
                        onChange={
                          handleInvoiceChange
                        }
                        rows={5}
                        disabled={
                          savingInvoice
                        }
                        placeholder="Additional notes for the customer..."
                        className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Payment Terms
                      </label>

                      <textarea
                        name="terms"
                        value={
                          invoiceFormData.terms
                        }
                        onChange={
                          handleInvoiceChange
                        }
                        rows={5}
                        disabled={
                          savingInvoice
                        }
                        placeholder="e.g. Payment is due within 14 days..."
                        className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                      />

                    </div>

                  </div>
                </section>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={
                      closeInvoiceModal
                    }
                    disabled={
                      savingInvoice
                    }
                    className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      savingInvoice
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-white transition hover:bg-yellow-600 disabled:opacity-60"
                  >

                    {savingInvoice ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                        Sending Invoice...
                      </>
                    ) : (
                      <>
                        <FiSend />

                        Send Invoice
                      </>
                    )}

                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

      {/* ================================================= */}
      {/* INVOICE DETAILS MODAL */}
      {/* ================================================= */}

      {showInvoiceDetailsModal &&
        selectedInvoice && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-black/60 px-4 py-5 backdrop-blur-sm">

            <div className="flex max-h-[calc(100dvh-2.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

              <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">

                <div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100">
                      <FiFileText
                        className="text-yellow-600"
                        size={22}
                      />
                    </div>

                    <div>

                      <h2 className="text-xl font-bold text-slate-900">
                        {
                          selectedInvoice.invoiceNumber
                        }
                      </h2>

                      <p className="text-sm text-slate-500">
                        {
                          selectedInvoice.title
                        }
                      </p>

                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowInvoiceDetailsModal(
                      false
                    )
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <FiX size={22} />
                </button>

              </div>

              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-6">

                {/* SUMMARY */}

                <div className="grid gap-4 sm:grid-cols-3">

                  <div className="rounded-2xl bg-slate-50 p-5">

                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Invoice Total
                    </p>

                    <p className="mt-2 text-xl font-bold text-slate-900">
                      {formatAmount(
                        selectedInvoice.total,
                        selectedInvoice.currency
                      )}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-green-50 p-5">

                    <p className="text-xs uppercase tracking-wide text-green-600">
                      Amount Paid
                    </p>

                    <p className="mt-2 text-xl font-bold text-green-700">
                      {formatAmount(
                        selectedInvoice.amountPaid,
                        selectedInvoice.currency
                      )}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-yellow-50 p-5">

                    <p className="text-xs uppercase tracking-wide text-yellow-700">
                      Balance Due
                    </p>

                    <p className="mt-2 text-xl font-bold text-yellow-800">
                      {formatAmount(
                        selectedInvoice.balanceDue,
                        selectedInvoice.currency
                      )}
                    </p>

                  </div>

                </div>

                {/* STATUS */}

                <div className="flex flex-wrap items-center gap-3">

                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    Invoice:{" "}
                    {
                      selectedInvoice.status ||
                      "Sent"
                    }
                  </span>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getPaymentStatusClasses(
                      getPaymentStatus(
                        selectedInvoice
                      )
                    )}`}
                  >
                    Payment:{" "}
                    {getPaymentStatus(
                      selectedInvoice
                    )}
                  </span>

                </div>

                {/* DATES */}

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="rounded-xl border border-slate-200 p-4">

                    <p className="text-xs text-slate-400">
                      Issue Date
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {
                        selectedInvoice.issueDate ||
                        "-"
                      }
                    </p>

                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">

                    <p className="text-xs text-slate-400">
                      Due Date
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {
                        selectedInvoice.dueDate ||
                        "-"
                      }
                    </p>

                  </div>

                </div>

                {/* ITEMS */}

                <div>

                  <h3 className="mb-3 font-bold text-slate-900">
                    Invoice Items
                  </h3>

                  <div className="overflow-hidden rounded-2xl border border-slate-200">

                    {(
                      selectedInvoice.items ||
                      []
                    ).map(
                      (item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-4 border-b border-slate-100 p-4 last:border-b-0"
                        >

                          <div>

                            <p className="font-semibold text-slate-800">
                              {
                                item.description
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {item.quantity} ×{" "}
                              {formatAmount(
                                item.unitPrice,
                                selectedInvoice.currency
                              )}
                            </p>

                          </div>

                          <p className="font-bold text-slate-800">
                            {formatAmount(
                              item.amount,
                              selectedInvoice.currency
                            )}
                          </p>

                        </div>
                      )
                    )}

                  </div>

                </div>

                {/* PAYMENT HISTORY */}

                <div>

                  <div className="mb-3 flex items-center justify-between">

                    <div>

                      <h3 className="font-bold text-slate-900">
                        Payment History
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Payments manually recorded
                        by the administrator.
                      </p>

                    </div>

                    {getPaymentStatus(
                      selectedInvoice
                    ) !== "Paid" && (
                      <button
                        type="button"
                        onClick={() =>
                          openPaymentModal(
                            selectedInvoice
                          )
                        }
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        <FiCreditCard />

                        Record Payment
                      </button>
                    )}

                  </div>

                  {selectedInvoice.paymentHistory
                    ?.length ? (
                    <div className="space-y-3">

                      {selectedInvoice.paymentHistory
                        .slice()
                        .reverse()
                        .map(
                          (
                            payment,
                            index
                          ) => (
                            <div
                              key={
                                payment.id ||
                                index
                              }
                              className="rounded-2xl border border-slate-200 p-4"
                            >

                              <div className="flex items-start justify-between gap-4">

                                <div>

                                  <p className="font-semibold text-slate-800">
                                    {
                                      payment.method ||
                                      "Payment"
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    Date:{" "}
                                    {
                                      payment.date ||
                                      "-"
                                    }
                                  </p>

                                  {payment.reference && (
                                    <p className="mt-1 text-xs text-slate-500">
                                      Reference:{" "}
                                      {
                                        payment.reference
                                      }
                                    </p>
                                  )}

                                  {payment.note && (
                                    <p className="mt-2 text-sm text-slate-600">
                                      {
                                        payment.note
                                      }
                                    </p>
                                  )}

                                </div>

                                <p className="whitespace-nowrap font-bold text-green-600">
                                  +{" "}
                                  {formatAmount(
                                    payment.amount,
                                    selectedInvoice.currency
                                  )}
                                </p>

                              </div>

                            </div>
                          )
                        )}

                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">

                      <FiDollarSign
                        className="mx-auto text-slate-300"
                        size={30}
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-600">
                        No payment recorded
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Record a payment when the
                        customer makes a payment.
                      </p>

                    </div>
                  )}

                </div>

                {/* PAYMENT INFORMATION */}

                {selectedInvoice.paymentInformation && (
                  <div className="rounded-2xl bg-slate-50 p-5">

                    <h3 className="font-bold text-slate-900">
                      Payment Information
                    </h3>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">

                      <div>
                        <p className="text-xs text-slate-400">
                          Bank
                        </p>

                        <p className="mt-1 font-semibold">
                          {
                            selectedInvoice
                              .paymentInformation
                              .bankName ||
                            "-"
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Account Name
                        </p>

                        <p className="mt-1 font-semibold">
                          {
                            selectedInvoice
                              .paymentInformation
                              .accountName ||
                            "-"
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Account Number
                        </p>

                        <p className="mt-1 font-semibold">
                          {
                            selectedInvoice
                              .paymentInformation
                              .accountNumber ||
                            "-"
                          }
                        </p>
                      </div>

                    </div>

                    {selectedInvoice
                      .paymentInformation
                      .paymentInstructions && (
                      <div className="mt-4">

                        <p className="text-xs text-slate-400">
                          Instructions
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                          {
                            selectedInvoice
                              .paymentInformation
                              .paymentInstructions
                          }
                        </p>

                      </div>
                    )}

                  </div>
                )}

              </div>

              <div className="flex justify-end border-t border-slate-200 p-5">

                <button
                  type="button"
                  onClick={() =>
                    setShowInvoiceDetailsModal(
                      false
                    )
                  }
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>

              </div>

            </div>
          </div>
        )}

      {/* ================================================= */}
      {/* RECORD PAYMENT MODAL */}
      {/* ================================================= */}

      {showPaymentModal &&
        paymentInvoice && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center overflow-hidden bg-black/60 px-4 py-5 backdrop-blur-sm">

            <div className="flex max-h-[calc(100dvh-2.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

              <div className="border-b border-slate-200 p-6">

                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                      <FiCreditCard
                        className="text-green-600"
                        size={21}
                      />
                    </div>

                    <div>

                      <h2 className="text-xl font-bold text-slate-900">
                        Record Payment
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          paymentInvoice.invoiceNumber
                        }
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      closePaymentModal
                    }
                    disabled={
                      savingPayment
                    }
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                  >
                    <FiX size={22} />
                  </button>

                </div>

              </div>

              <form
                onSubmit={
                  handleRecordPayment
                }
                className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-6"
              >

                {/* BALANCE */}

                <div className="rounded-2xl bg-yellow-50 p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700">
                        Outstanding Balance
                      </p>

                      <p className="mt-2 text-2xl font-bold text-yellow-900">
                        {formatAmount(
                          Math.max(
                            (Number(
                              paymentInvoice.total
                            ) || 0) -
                              (Number(
                                paymentInvoice.amountPaid
                              ) || 0),
                            0
                          ),
                          paymentInvoice.currency
                        )}
                      </p>

                    </div>

                    <FiDollarSign
                      size={30}
                      className="text-yellow-600"
                    />

                  </div>

                </div>

                {/* AMOUNT */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Payment Amount
                  </label>

                  <input
                    type="number"
                    name="amount"
                    min="0.01"
                    step="0.01"
                    value={
                      paymentForm.amount
                    }
                    onChange={
                      handlePaymentChange
                    }
                    disabled={
                      savingPayment
                    }
                    placeholder="0.00"
                    autoFocus
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg font-semibold outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                  />

                </div>

                {/* METHOD */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Payment Method
                  </label>

                  <select
                    name="method"
                    value={
                      paymentForm.method
                    }
                    onChange={
                      handlePaymentChange
                    }
                    disabled={
                      savingPayment
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-yellow-500"
                  >

                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>

                    <option value="Cash">
                      Cash
                    </option>

                    <option value="POS">
                      POS
                    </option>

                    <option value="Cheque">
                      Cheque
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

                {/* DATE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Payment Date
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={
                      paymentForm.date
                    }
                    onChange={
                      handlePaymentChange
                    }
                    disabled={
                      savingPayment
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                  />

                </div>

                {/* REFERENCE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Payment Reference
                  </label>

                  <input
                    type="text"
                    name="reference"
                    value={
                      paymentForm.reference
                    }
                    onChange={
                      handlePaymentChange
                    }
                    disabled={
                      savingPayment
                    }
                    placeholder="e.g. Bank transfer reference"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                  />

                </div>

                {/* NOTE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Note
                  </label>

                  <textarea
                    name="note"
                    value={
                      paymentForm.note
                    }
                    onChange={
                      handlePaymentChange
                    }
                    disabled={
                      savingPayment
                    }
                    rows={3}
                    placeholder="Optional payment note..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-yellow-500"
                  />

                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* ACTIONS */}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={
                      closePaymentModal
                    }
                    disabled={
                      savingPayment
                    }
                    className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      savingPayment
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {savingPayment ? (
                      <>
                        <FiLoader className="animate-spin" />

                        Saving Payment...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle />

                        Record Payment
                      </>
                    )}

                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

    </div>
  );
};

export default Projects;