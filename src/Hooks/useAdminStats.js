import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getDbInstance } from "../Firebase/firebase";

const useAdminStats = () => {
  const [stats, setStats] = useState({
    bookings: 0,
    messages: 0,
    customers: 0,
    pendingJobs: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const db = await getDbInstance();

        const [
          bookingsSnapshot,
          messagesSnapshot,
          customersSnapshot,
        ] = await Promise.all([
          getDocs(collection(db, "bookings")),
          getDocs(collection(db, "contactMessages")),
          getDocs(collection(db, "customers")),
        ]);

        const pendingJobs = bookingsSnapshot.docs.filter(
          (doc) => doc.data().status === "Pending"
        ).length;

        setStats({
          bookings: bookingsSnapshot.size,
          messages: messagesSnapshot.size,
          customers: customersSnapshot.size,
          pendingJobs,
        });

      } catch (error) {
        console.error("Admin Stats Error:", error);
        setError(
          "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
  };
};

export default useAdminStats;