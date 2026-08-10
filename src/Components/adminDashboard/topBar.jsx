import { Link } from "react-router-dom";

const Topbar = ({ onMenuClick }) => {
  return (
    <header className="flex items-center justify-between bg-white px-6 py-5 shadow-sm">

      <div className="flex items-center">

        {/* Mobile Menu */}
        <button
          onClick={onMenuClick}
          className="mr-4 rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label="Open admin menu"
        >
          ☰
        </button>

        <div>
          <h2 className="text-3xl font-bold">
            Dashboard
          </h2>

          <p className="text-gray-500">
            Welcome back 👋
          </p>
        </div>

      </div>

      {/* Back to Website */}
      <Link
        to="/"
        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        ← Back to Website
      </Link>

    </header>
  );
};

export default Topbar;