

const Preloader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">

        {/* Logo */}
        <img
          src="/basila logo.png"
          alt="Basila Engineering"
          className="w-28 h-28 animate-pulse"
        />

        {/* Spinner */}
        <div className="mt-6 h-12 w-12 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>

        {/* Text */}
        <p className="mt-5 text-gray-700 font-semibold tracking-wide">
          Loading...
        </p>

      </div>
    </div>
  );
};

export default Preloader;