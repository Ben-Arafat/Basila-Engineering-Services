import Navbar from '../Components/navbar';
import PageHero from "../Components/pageHero";
import Footer from "../Components/footer";
import {
  FaSolarPanel,
  FaBolt,
  FaBuilding,
  FaTools,
  FaCogs,
  FaHardHat,
  FaArrowRight,
  FaUsers,
  FaShieldAlt,
  FaHandshake,

} from "react-icons/fa";
import CTA from "../Components/CTA";


const serviceList = [
  {
    icon: <FaSolarPanel />,
    title: "Solar Energy Solutions",
    description:
      "We design and install safe, reliable, and efficient electrical systems for residential, commercial, and industrial projects, ensuring compliance with industry standards and long-term performance.",
  },
  {
    icon: <FaBolt />,
    title: "HVAC & Mechanical Systems Integration",
    description:
      "We integrate HVAC and mechanical systems to improve comfort, energy efficiency, and seamless operation in residential, commercial, and industrial facilities.",
  },
  {
    icon: <FaBuilding />,
    title: "Plumbing & Water System",
    description:
      "We design and install reliable plumbing and water systems that ensure efficient water supply, drainage, and long-lasting performance for every project.",
  },
  {
    icon: <FaTools />,
    title: "Solar Power System Design & Installation",
    description:
      "We design and install reliable plumbing and water systems that ensure efficient water supply, drainage, and long-lasting performance for every project.",
  },
  {
    icon: <FaCogs />,
    title: "Hybrid Energy System (Solar + Grid + Generator)",
    description:
      "We design and integrate hybrid energy systems that combine solar, grid, and generator power for uninterrupted, efficient, and cost-effective energy supply.",
  },
  {
    icon: <FaHardHat />,
    title: "Energy Optimization & Cost Reduction Solution",
    description:
      "We help reduce energy costs by optimizing power usage, improving system efficiency, and implementing smart energy management solutions.",
  },
  {
    icon: <FaHardHat />,
    title: "Smart Home & Building Automation",
    description:
      "We deliver smart automation solutions that enhance comfort, security, and energy efficiency through intelligent control of lighting, HVAC, security, and other building systems.",
  },
  {
    icon: <FaHardHat />,
    title: "CCTV, Access Control & Surveillance System",
    description:
      "We install advanced CCTV, access control, and surveillance systems to enhance security, monitor activities, and protect your property 24/7.",
  },
  {
    icon: <FaHardHat />,
    title: "Networking & Communication System",
    description:
      "We design and install reliable network infrastructure and communication systems to ensure seamless connectivity, data transfer, and efficient operations.",
  },

];




const Services = () => {
    return (
        <div className="h-auto w-auto">
           

            <div className="w-full">
                <PageHero             
                    title="Services"
                    subtitle="From solar installation to maintenance and energy consultation, we provide comprehensive engineering solutions tailored to your needs."
                />
            </div>

            <div>
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-6">

                    <div className="text-center max-w-3xl mx-auto">

                        <span className="text-yellow-500 uppercase text-4xl lg:text-7xl font-extrabold tracking-widest">
                        WHAT WE DO
                        </span>

                        <h2 className="text-4xl md:text-5xl font-bold mt-4">
                        Comprehensive Engineering Services
                        </h2>

                        <p className="mt-6 text-gray-600 leading-8">
                        From renewable energy installations to HVAC & Mechanical Systems,
                        we provide innovative engineering solutions that improve
                        efficiency, reliability, and sustainability.
                        </p>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">

                        {serviceList.map((serviceList, index) => (

                        <div
                            key={index}
                            className="group bg-white border rounded-3xl p-8 hover:shadow-2xl transition duration-300"
                        >

                            <div className="w-16 h-16 rounded-2xl bg-yellow-100 text-yellow-500 flex items-center justify-center text-3xl group-hover:bg-yellow-500 group-hover:text-white transition">

                            {serviceList.icon}

                            </div>

                            <h3 className="text-2xl text-black font-bold mt-8">
                            {serviceList.title}
                            </h3>

                            <p className="mt-5 text-gray-600 leading-7">
                            {serviceList.description}
                            </p>

                            <button className="mt-8 flex items-center gap-2 text-yellow-500 font-semibold hover:gap-3 transition-all">
                            BOOK SERVICE
                            <FaArrowRight />
                            </button>

                        </div>

                        ))}

                    </div>

                    </div>
                </section>

                {/* HOW WE WORK */}

                <section className="bg-slate-100 py-20">

                    <div className="max-w-7xl mx-auto px-6">

                    <div className="text-center">

                        <h2 className="text-4xl lg:text-7xl font-extrabold">
                        How We Work
                        </h2>

                        <p className="mt-5 text-gray-600">
                        Our proven engineering process ensures quality from start to finish.
                        </p>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">

                        {[
                        "Consultation",
                        "Site Assessment",
                        "Engineering Design",
                        "Installation & Support",
                        ].map((step, index) => (

                        <div
                            key={step}
                            className="bg-white rounded-3xl shadow-lg p-8 text-center"
                        >

                            <div className="w-14 h-14 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xl font-bold mx-auto">
                            {index + 1}
                            </div>

                            <h3 className="mt-6 text-xl font-semibold">
                            {step}
                            </h3>

                        </div>

                        ))}

                    </div>

                    </div>

                </section>

                 {/* WHY CHOOSE US */}
                
                <section className="py-20 bg-white">

                    <div className="max-w-7xl mx-auto px-6">

                    <div className="text-center mb-16">

                        <h2 className="text-4xl lg:text-7xl font-extrabold">
                        WHY CHOOOSE US
                        </h2>

                        <p className="mt-5 text-gray-600 max-w-3xl mx-auto">
                        We combine engineering expertise, innovation, and customer-focused
                        solutions to deliver projects that stand the test of time.
                        </p>

                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                        {[
                        {
                            icon: <FaUsers />,
                            title: "Experienced Engineers",
                            desc: "Highly qualified multidisciplinary professionals.",
                        },
                        {
                            icon: <FaSolarPanel />,
                            title: "Renewable Energy Experts",
                            desc: "Delivering reliable solar and energy solutions.",
                        },
                        {
                            icon: <FaShieldAlt />,
                            title: "Safety First",
                            desc: "Every project follows industry safety standards.",
                        },
                        {
                            icon: <FaTools />,
                            title: "Quality Workmanship",
                            desc: "Attention to detail from design to commissioning.",
                        },
                        {
                            icon: <FaHandshake />,
                            title: "Client Focused",
                            desc: "Your satisfaction remains our highest priority.",
                        },
                        {
                            icon: <FaBolt />,
                            title: "Modern Technology",
                            desc: "Using innovative engineering tools and practices.",
                        },
                        ].map((item) => (

                        <div
                            key={item.title}
                            className="rounded-3xl border p-8 hover:shadow-xl transition duration-300"
                        >
                            <div className="text-5xl text-yellow-500 mb-6">
                            {item.icon}
                            </div>

                            <h3 className="text-2xl font-semibold">
                            {item.title}
                            </h3>

                            <p className="mt-4 text-gray-600 leading-7">
                            {item.desc}
                            </p>

                        </div>

                        ))}

                    </div>

                    </div>

                </section>

                <CTA />
            </div>

            <div>
                <Footer />
            </div>
        </div>
    )
}

export default Services;