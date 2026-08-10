

const Expertise = () => {
    const experts = [
    {
      title: "Electrical Engineers",
      icon: "⚡",
      description:
        "Design, install, and optimize electrical systems for safe and efficient solar power generation.",
    },
    {
      title: "Mechanical Engineers",
      icon: "⚙️",
      description:
        "Develop durable mounting structures and ensure the mechanical integrity of every installation.",
    },
    {
      title: "Project Managers",
      icon: "📋",
      description:
        "Coordinate every phase of your project, ensuring timely delivery and quality control.",
    },
    {
      title: "Energy Specialists",
      icon: "🌱",
      description:
        "Assess your energy needs and recommend efficient, cost-effective solar solutions.",
    },
     {
      title: "Certified Technicians",
      icon: "🛠️",
      description:
        "Carry out installations, repairs, inspections, and preventive maintenance with precision.",
    },
    ]


 return (
    <section className="h-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-2xl lg:text-5xl text-yellow-500 font-extrabold uppercase tracking-wider">
            Our Team
          </p>

          <h2 className="text-xl font-bold text-white mt-3">
            Powered by a Multidisciplinary Team of Experts
          </h2>

          <p className="text-white mt-5">
            We combine engineering expertise, technical excellence, and project
            management experience to deliver reliable solar energy solutions
            tailored to every client's needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-14">
          {experts.map((expert) => (
            <div
              key={expert.title}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-8 hover:shadow-xl transition duration-300"
            >
              <div className="text-5xl ">{expert.icon}</div>

              <h3 className="text-2xl text-white font-bold mt-5">
                {expert.title}
              </h3>

              <p className="text-white mt-3">
                {expert.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Expertise;