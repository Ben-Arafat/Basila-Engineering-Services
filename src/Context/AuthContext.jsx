import {
  useEffect,
  useState,
  useMemo,
  useContext,
  createContext,
} from "react";

import { getAuthInstance } from "../Firebase/firebase";

const AuthContext = createContext({
  currentUser: null,
  loading: true,
  authError: null,

  authModalOpen: false,
  authModalView: "login",

  openLogin: () => {},
  openSignup: () => {},
  closeAuthModal: () => {},
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Authentication modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState("login");

  useEffect(() => {
    let unsubscribe = null;
    let mounted = true;

    const setupAuth = async () => {
      try {
        setLoading(true);
        setAuthError(null);

        const auth = await getAuthInstance();

        const { onAuthStateChanged } =
          await import("firebase/auth");

        if (!mounted) return;

        unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            if (!mounted) return;

            setCurrentUser(user);
            setLoading(false);
            setAuthError(null);
          },
          (error) => {
            console.error(
              "Firebase Auth Error:",
              error
            );

            if (!mounted) return;

            setLoading(false);
            setAuthError(error);
          }
        );
      } catch (error) {
        console.error(
          "Auth initialization error:",
          error
        );

        if (!mounted) return;

        setLoading(false);
        setAuthError(error);
      }
    };

    setupAuth();

    return () => {
      mounted = false;

      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // ==============================
  // OPEN LOGIN
  // ==============================

  const openLogin = () => {
    setAuthModalView("login");
    setAuthModalOpen(true);
  };

  // ==============================
  // OPEN SIGN UP
  // ==============================

  const openSignup = () => {
    setAuthModalView("signup");
    setAuthModalOpen(true);
  };

  // ==============================
  // CLOSE AUTH MODAL
  // ==============================

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      authError,

      authModalOpen,
      authModalView,

      openLogin,
      openSignup,
      closeAuthModal,
    }),
    [
      currentUser,
      loading,
      authError,
      authModalOpen,
      authModalView,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;