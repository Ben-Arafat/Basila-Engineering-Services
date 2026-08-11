import { useEffect, useState } from "react";

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [checking, setChecking] = useState(false);

  const checkConnection = async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }

    try {
      setChecking(true);

      const response = await fetch(
        "https://www.gstatic.com/generate_204",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      setIsOnline(response.ok || response.status === 204);
    } catch (error) {
      setIsOnline(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      checkConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check when the component starts
    checkConnection();

    // Periodically verify the actual connection
    const interval = setInterval(() => {
      checkConnection();
    }, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[9999] bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white">
      ⚠️ No internet connection. Some features may not work properly.
    </div>
  );
};

export default NetworkStatus;