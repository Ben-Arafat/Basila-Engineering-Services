import { useEffect, useState, useMemo, useContext, createContext, createElement } from "react";
import { getAuthInstance } from "../Firebase/firebase";

const AuthContext = createContext({
  currentUser: null,
  loading: true,
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = null;

    const initializeAuth = async () => {
      const auth = await getAuthInstance();
      const { onAuthStateChanged } = await import("firebase/auth");
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
      });
    };

    initializeAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ currentUser, loading }), [currentUser, loading]);

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
