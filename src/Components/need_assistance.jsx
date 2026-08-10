import { Link } from "react-router-dom";

const NeedAssistance = () => {
    return (
        <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-yellow-500 via-blue-500 to-slake-700 bg-[length:200%_200%] animate-pulse rounded-3xl p-10 md:p-16 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Text */}
            <div className="max-w-2xl">
              <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-5">
                Need Help?
              </span>

              <h2 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
                Need Professional Assistance?
              </h2>

              <p className="mt-5 text-lg text-white/90 leading-relaxed">
                Book a service, request a consultation, or chat with our
                support team today. Our experienced technicians are ready to
                provide fast, reliable, and affordable solar solutions.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-xl transition duration-300">
                <Link to="/booking" className="text-bold">
                  Book a Session
                </Link>
              </button>

              <a
               href = "https://wa.me/message/P2QEZXQMFJH6N1"
               className="bg-white hover:bg-gray-100 text-slate-900 font-semibold px-8 py-4 rounded-xl transition duration-300">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
    );
};

export default NeedAssistance;

