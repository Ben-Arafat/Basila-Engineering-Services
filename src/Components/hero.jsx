import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const slides = [
  {
    title: "Powering Homes with Solar Energy",
    description: "Reliable solar installations for homes and businesses.",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1600",
  },
  {
    title: "Professional Engineering Services",
    description: "Expert installation, maintenance, and consultation.",
    image: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1600",
  },
  {
    title: "Clean Energy, Brighter Future",
    description: "Save money while protecting the environment.",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1600",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000); // Change this value to adjust the duration

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="min-h-180 overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background Image */}
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60"></div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="text-center max-w-7xl mx-auto px-6 text-white">
              <h1 className="text-center text-5xl md:text-7xl font-bold">
                {slide.title}
              </h1>

              <p className="text-center mt-6 text-lg">
                {slide.description}
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-6">
                <Link to="/dashboard" className="w-70 border border-slate-100/40 bg-slate-50/20 backdrop-blur-xl transition-300 hover:bg-yellow-400 text-white px-6 py-4 rounded-3xl font-semibold">
                  Get Started
                </Link>

                <Link to="/about" className="w-70 bg-yellow-500 hover:bg-slate-400 text-black px-6 py-4 rounded-3xl font-semibold backdrop-blur-md border-white/20">
                  Learn More
                </Link>
              </div>
              
            </div>
          </div>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-1 h-1 rounded-full transition ${
              current === index ? "bg-yellow-500" : "bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}