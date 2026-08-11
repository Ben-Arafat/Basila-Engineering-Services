import { FaGoogle, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import {
  getAuthInstance,
  getGoogleProvider,
} from "../../Firebase/firebase";
import SignUp from "./SignUp";
import { useNavigate } from "react-router-dom";

const AuthModal = ({
  isOpen,
  onClose,
  initialView = "login",
  goToSignUp,
  goToforgot,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState(initialView);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError("");
    }
  }, [isOpen, initialView]);

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

      await setPersistence(
        auth,
        rememberMe
          ? browserLocalPersistence
          : browserSessionPersistence
      );

      // IMPORTANT:
      // Only sign in once.
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

    } catch (err) {
      console.error("Login Error:", err);

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
          setError(
            "Too many attempts. Please try again later."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "No internet connection. Please check your connection and try again."
          );
          break;

        default:
          setError(
            err.message ||
            "Login failed. Please try again."
          );
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

      const { signInWithPopup } =
        await import("firebase/auth");

      await signInWithPopup(
        auth,
        googleProvider
      );

      await Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: "Google sign-in successful.",
        timer: 1800,
        showConfirmButton: false,
      });

      onClose?.();
      navigate("/dashboard");

    } catch (err) {
      console.error("Google Sign-In Error:", err);

      if (
        err.code === "auth/network-request-failed"
      ) {
        setError(
          "No internet connection. Please check your connection and try again."
        );
      } else {
        setError(
          err.message ||
          "Google sign-in failed. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex min-h-screen items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">

      <div className="relative my-auto w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-500 transition hover:text-red-500"
        >
          <FaTimes size={22} />
        </button>

        {/* SIGN UP */}
        {view === "signup" ? (
          <SignUp
            goToLogin={() => setView("login")}
            onClose={onClose}
          />
        ) : (

          /* LOGIN */
          <>
            <div className="text-center">

              <h2 className="text-3xl font-bold text-slate-800">
                Welcome Back 👋
              </h2>

              <p className="mt-3 text-gray-500">
                Login to your Basila Engineering account
              </p>

            </div>

            <form
              onSubmit={handleLogin}
              className="mt-8 space-y-5"
            >

              <input
                type="email"
                placeholder="Email Address"
                autoComplete="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-yellow-500"
              />

              <input
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-yellow-500"
              />

              <div className="flex items-center justify-between text-sm">

                <label className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked
                      )
                    }
                  />

                  Remember me

                </label>

                <button
                  type="button"
                  onClick={() =>
                    goToforgot?.()
                  }
                  className="text-yellow-600 hover:underline"
                >
                  Forgot Password?
                </button>

              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-yellow-500 py-3 font-semibold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading
                  ? "Logging in..."
                  : "Login"}
              </button>

            </form>

            <div className="my-6 flex items-center">

              <div className="flex-1 border-t" />

              <span className="px-4 text-sm text-gray-400">
                OR
              </span>

              <div className="flex-1 border-t" />

            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border py-3 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FaGoogle className="text-red-500" />

              Continue with Google
            </button>

            <p className="mt-8 text-center text-gray-500">

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