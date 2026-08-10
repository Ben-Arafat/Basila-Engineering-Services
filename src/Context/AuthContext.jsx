import { useEffect, useState, useMemo, useContext, createContext } from "react";
import { getAuthInstance } from "../Firebase/firebase";

const AuthContext = createContext({
  currentUser: null,
  loading: true,
});

export function AuthProvider({ children }) {

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    let unsubscribe;


    const setupAuth = async () => {

      const auth = await getAuthInstance();

      const { onAuthStateChanged } = await import("firebase/auth");


      unsubscribe = onAuthStateChanged(auth, (user) => {

        setCurrentUser(user);
        setLoading(false);

      });

    };


    setupAuth();


    return () => {
      if (unsubscribe) unsubscribe();
    };


  }, []);


  const value = useMemo(
    () => ({
      currentUser,
      loading
    }),
    [currentUser, loading]
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