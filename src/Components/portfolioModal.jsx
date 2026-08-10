import { useEffect, useState } from "react";
import {
  X,
  MapPin,
  Calendar,
  CheckCircle,
} from "lucide-react";

const PortfolioModal = ({ project, onClose }) => {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!project) return null;

  const images = project.images?.length ? project.images : [project.image];
  const services = project.services?.length ? project.services : ["Solar Installation"];

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl animate-[fadeIn_.3s_ease]"
      >
        {/* Header */}

        <div className="sticky top-0 bg-white z-20 flex justify-between items-center p-6 border-b">
          <h2 className="text-3xl font-bold text-slate-900">
            {project.title}
          </h2>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <X size={24} />
          </button>
        </div>

        {/* Featured Image */}

        <img
          src={images[activeImage] || project.image}
          alt={project.title}
          className="w-full h-[450px] object-cover"
        />

        {/* Thumbnails */}

        <div className="flex gap-3 overflow-x-auto p-5">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt=""
              onClick={() => setActiveImage(index)}
              className={`w-28 h-20 rounded-xl object-cover cursor-pointer border-4 transition
                ${
                  activeImage === index
                    ? "border-yellow-500"
                    : "border-transparent"
                }`}
            />
          ))}
        </div>

        {/* Content */}

        <div className="grid lg:grid-cols-3 gap-10 p-8">
          {/* Left */}

          <div className="lg:col-span-2">

            <h3 className="text-2xl font-bold mb-4">
              Project Overview
            </h3>

            <p className="text-gray-600 leading-8">
              {project.description || "A tailored engineering solution built to meet the client’s energy needs with quality and reliability."}
            </p>


            <div className="mt-10">
              <h3 className="text-2xl font-bold mb-4">
                Solution
              </h3>

              <p className="text-gray-600 leading-8">
                {project.solution || "Our team delivered a practical and efficient solution tailored to the site and client requirements."}
              </p>
            </div>
          </div>

          {/* Right */}

          <div>

            <div className="bg-gray-50 rounded-3xl p-6">

              <h3 className="font-bold text-xl mb-6">
                Project Details
              </h3>

              <div className="space-y-5">

                <div className="flex items-center gap-3">
                  <MapPin className="text-yellow-500" />
                  <span>{project.location || "Location available on request"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="text-yellow-500" />
                  <span>{project.completed || "Completed recently"}</span>
                </div>


              </div>

              <hr className="my-8" />

              <h4 className="font-bold mb-5">
                Services Provided
              </h4>

              <div className="space-y-4">

                {services.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle
                      className="text-green-500"
                      size={18}
                    />

                    <span>{service}</span>
                  </div>
                ))}

              </div>

              <button
                className="mt-8 w-full bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-xl font-semibold transition"
              >
                Book Similar Project
              </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioModal;