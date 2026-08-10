import { ArrowRight } from "lucide-react";

const projects = [
  {
    id: 1,
    title: "LAN Networking, CCTV & Fire Alarm Installation",
    location: "Abuja, Nigeria",
    image:
      "https://res.cloudinary.com/cwshpuof/image/upload/v1785491110/902b9868-c48c-4a01-9017-c465e64f4964_xbwffm.jpg",
  },
  {
    id: 2,
    title: "Full Smart Home Automation, Netoworking & CCTV Installation",
    location: "Kaduna, Nigeria",
    image:
      "https://res.cloudinary.com/cwshpuof/image/upload/v1785791884/35e52192-6262-44d2-bbc2-9f3ae8505f4e_ifhcfp.jpg",
  },
  {
    id: 3,
    title: "Residential Solar Installation",
    location: "Abuja, Nigeria",
    image:
      "https://res.cloudinary.com/cwshpuof/image/upload/v1785490990/bd85f8e3-10ce-470b-b47c-13daca8a6bd9_tugpmr.jpg",
  },
];

const Portfolio = () => {
  return (
    <section className="pt-25 pb-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">

          <div>
            <span className="text-white  font-extrabold uppercase tracking-wider">
              Our Portfolio
            </span>

            <h2 className="text-5xl font-extrabold text-white mt-2">
              Recent Projects
            </h2>

            <p className="mt-4 text-white max-w-2xl">
              Explore some of our recent residential, commercial, and industrial
              solar installations that demonstrate our commitment to quality,
              innovation, and sustainable energy solutions.
            </p>
          </div>

          <a
            href="/portfolio"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            View All Projects
            <ArrowRight size={20} />
          </a>

        </div>

        {/* Projects */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {projects.map((project) => (
            <div
              key={project.id}
              className="group overflow-hidden rounded-2xl bg-white shadow hover:shadow-xl transition"
            >
              <div className="overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-72 w-full object-cover group-hover:scale-110 transition duration-500"
                />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  {project.title}
                </h3>

                <p className="text-gray-500 mt-2">
                  {project.location}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default Portfolio;