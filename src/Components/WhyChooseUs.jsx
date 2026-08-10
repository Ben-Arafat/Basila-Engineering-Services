import { Link } from "react-router-dom";

const WhyChooseUs = () => {
  return (
    
    <section className="bg-slate-950 overflow-hidden pb-20">

  <div className="relative max-w-7xl mx-auto px-6">

    {/* Stylish Border Container */}
    <div className="
      w-full
      md:w-full
      relative
      rounded-3xl
      bg-gradient-to- from-yellow-400 via-orange-500 to-yellow-400 animate-border
      shadow-2xl
      shadow-yellow-500/20
    ">

      <div className="
        rounded-3xl
        bg-slate-950/90
        backdrop-blur-xl
        px-6
        py-16
        md:px-12
      ">
      <div className="max-w-7xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <div className="text-center lg:text-left">
            <p className="text-yellow-400 text-5xl  font-extrabold uppercase tracking-widest">
              Why Choose Us
            </p>

            <h2 className="text-4xl md:text-6xl font-bold text-white mt-4">
              Building Trust Through
              <span className="text-yellow-400"> Engineering Excellence</span>
            </h2>

            <p className="text-white text-lg mt-6 max-w-xl">
              We deliver innovative electrical, energy, automation, and building
              solutions with quality, safety, and reliability at the core of
              every project.
            </p>

            <button className="mt-8 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition">
            <Link to="/services" className="text-bold">
              Discover More
            </Link>
            </button>
          </div>


          {/* Right Animated Stats */}
          <div className="relative flex justify-center">

            {/* Glow Background */}
            <div className="absolute w-72 h-72 bg-yellow-400/30 rounded-full blur-3xl animate-pulse"></div>


            {/* Main Number */}
            <div className="relative w-72 h-72 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex flex-col items-center justify-center shadow-2xl animate-bounce">

              <h3 className="text-7xl font-bold text-yellow-400">
                100%
              </h3>

              <p className="text-white text-lg">
                Quality Delivery
              </p>

            </div>

          </div>

        </div>


        {/* Trust Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
            <h3 className="text-3xl font-bold text-yellow-400">
              10+
            </h3>
            <p className="text-gray-400 mt-2">
              Years Experience
            </p>
          </div>


          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
            <h3 className="text-3xl font-bold text-yellow-400">
              24/7
            </h3>
            <p className="text-gray-400 mt-2">
              Technical Support
            </p>
          </div>


          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
            <h3 className="text-3xl font-bold text-yellow-400">
              100%
            </h3>
            <p className="text-gray-400 mt-2">
              Quality Delivery
            </p>
          </div>

        </div>

      </div>

      </div>

    </div>

  </div>

    </section>
  );
};

export default WhyChooseUs;