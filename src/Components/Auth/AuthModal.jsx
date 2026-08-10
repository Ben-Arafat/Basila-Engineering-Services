import { FaGoogle, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import { useState } from "react";
import { getAuthInstance, getGoogleProvider } from "../../Firebase/firebase";
import SignUp from "./SignUp";
import { useNavigate } from "react-router-dom";

const AuthModal = ({ isOpen, onClose, goToSignUp, goToforgot }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  if (!email || !password) {
    setError("Please enter your email and password.");
    return;
  }

  try {
    setLoading(true);

    const auth = await getAuthInstance();

    const {
      signInWithEmailAndPassword,
      browserLocalPersistence,
      browserSessionPersistence,
      setPersistence,
    } = await import("firebase/auth");

    // Remember Me
    await setPersistence(
      auth,
      rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence
    );

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    await signInWithEmailAndPassword(
  auth,
  email,
  password
);


    await Swal.fire({
      icon: "success",
      title: "Welcome Back!",
      text: "You have successfully logged in.",
      timer: 1800,
      showConfirmButton: false,
    });

onClose?.();
navigate("/dashboard");

    onClose?.();

  } catch (err) {
    console.error(err);

    switch (err.code) {
      case "auth/invalid-credential":
        setError("Invalid email or password.");
        break;

      case "auth/user-not-found":
        setError("No account found with this email.");
        break;

      case "auth/wrong-password":
        setError("Incorrect password.");
        break;

      case "auth/too-many-requests":
        setError("Too many attempts. Please try again later.");
        break;

      default:
        setError(err.message);
    }

  } finally {
    setLoading(false);
  }
};

  const handleGoogleSignIn = async () => {
    setError("");

    try {
      setLoading(true);
      const auth = await getAuthInstance();
      const googleProvider = await getGoogleProvider();
      const { signInWithPopup } = await import("firebase/auth");
      await signInWithPopup(auth, googleProvider);
      alert("Google sign-in successful!");
      onClose?.();
    } catch (err) {
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex min-h-screen items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div className="relative my-auto w-full max-w-md rounded-3xl bg-white shadow-2xl p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-500 hover:text-red-500 transition"
        >
          <FaTimes size={22} />
        </button>

        {view === "signup" ? (
          <SignUp
            goToLogin={() => setView("login")}
            onClose={onClose}
          />
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-800">
                Welcome Back 👋
              </h2>

              <p className="text-gray-500 mt-3">
                Login to your Basila Engineering account
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <input
                type="email"
                placeholder="Email Address"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-yellow-500"
              />

              <input
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-yellow-500"
              />

              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={() => goToforgot?.()}
                  className="text-yellow-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-yellow-500 py-3 font-semibold text-white hover:bg-yellow-600 transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t"></div>
              <span className="px-4 text-gray-400 text-sm">OR</span>
              <div className="flex-1 border-t"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full border rounded-xl py-3 flex items-center justify-center gap-3 hover:bg-gray-100 transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FaGoogle className="text-red-500" />
              Continue with Google
            </button>

            <p className="text-center mt-8 text-gray-500">
              Don't have an account?
              <button
                type="button"
                onClick={() => {
                  setView("signup");
                  goToSignUp?.();
                }}
                className="ml-2 font-semibold text-yellow-600 hover:underline"
              >
                Sign Up
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;