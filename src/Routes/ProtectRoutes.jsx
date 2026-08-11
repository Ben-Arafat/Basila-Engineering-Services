import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.jsx";
import Preloader from "../Components/preloader";

const ProtectedRoute = ({ children }) => {
  const {
    currentUser,
    loading,
    openLogin,
    openSignup,
  } = useAuth();

  // Firebase is still checking authentication
  if (loading) {
    return <Preloader />;
  }

  // User is authenticated
  if (currentUser) {
    return children;
  }

  // User is NOT authenticated
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-16 bg-slate-50">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">

        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
          <span className="text-3xl">
            🔐
          </span>
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Login Required
        </h1>

        {/* Description */}
        <p className="mt-3 leading-relaxed text-gray-500">
          You need an account to access this page.
          Please log in if you already have an account,
          or sign up to get started.
        </p>

        {/* Buttons */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">

          <button
            type="button"
            onClick={openLogin}
            className="flex-1 rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-white transition hover:bg-yellow-600"
          >
            Login
          </button>

          <button
            type="button"
            onClick={openSignup}
            className="flex-1 rounded-xl border border-yellow-500 px-5 py-3 font-semibold text-yellow-600 transition hover:bg-yellow-50"
          >
            Sign Up
          </button>

        </div>

        {/* Back */}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="mt-6 text-sm text-gray-500 transition hover:text-gray-800"
        >
          ← Go Back
        </button>

      </div>
    </div>
  );
};

export default ProtectedRoute;