import { motion } from "framer-motion";

import electrical_design from "../assets/electrical_design.jpg";
import HVAC from "../assets/HVAC.jpg";
import Water_System from "../assets/Water System.jpg";
import Fire from "../assets/Fire Alarm.jpg";
import Solar from "../assets/Solar.jpg";
import Reduction from "../assets/Reduction.jpg";
import Smart from "../assets/Smart Home.jpg"
import CCTV from "../assets/CCTV.jpg";
import Network from "../assets/Network.jpg";
import { Link } from "react-router-dom";



const services = [
  {
    title: "Electrical System Design & Installation",
    description:
      "We design and install safe, reliable, and efficient electrical systems for residential, commercial, and industrial projects, ensuring compliance with industry standards and long-term performance.",
    image: electrical_design,
  },
 
  {
    title: "HVAC & Mechanical Systems Integration",
    description:
      "We integrate HVAC and mechanical systems to improve comfort, energy efficiency, and seamless operation in residential, commercial, and industrial facilities.",
    image: HVAC
  },
  {
    title: "Plumbing & Water System",
    description:
      "We design and install reliable plumbing and water systems that ensure efficient water supply, drainage, and long-lasting performance for every project.",
    image: Water_System
  },
  {
    title: "Solar Power System Design & Installation",
    description:
      "We design and install efficient solar power systems that deliver reliable, cost-effective, and sustainable energy solutions for homes, businesses, and industries.",
    image: Fire

  },
  {
    title: "Hybrid Energy System (Solar + Grid + Generator)",
    description:"We design and integrate hybrid energy systems that combine solar, grid, and generator power for uninterrupted, efficient, and cost-effective energy supply.",
    image: Solar
  },
  {
    title: "Energy Optimization & Cost Reduction Solution",
    description: "We help reduce energy costs by optimizing power usage, improving system efficiency, and implementing smart energy management solutions.",
    image: Reduction
  },
  {
    title: "Smart Home & Building Automation",
    description: "We deliver smart automation solutions that enhance comfort, security, and energy efficiency through intelligent control of lighting, HVAC, security, and other building systems.",

    image: Smart
  },
  {
    title: "CCTV, Access Control & Surveillance System",
    description: "We install advanced CCTV, access control, and surveillance systems to enhance security, monitor activities, and protect your property 24/7.",
    image: CCTV
  },
  {
    title: "Networking & Communication System",
    description: "We design and install reliable network infrastructure and communication systems to ensure seamless connectivity, data transfer, and efficient operations.",
    image: Network
  }
];

export default function Services() {
  return (
    <motion.section
    initial = {{opacity: 0, y:50 }}
    whileInView = {{ opacity: 1, y:0 }}
    transition = {{ duration: 2.5 }}
    viewport = {{ once: true}}
     className = "py-10">
      <div className="max-w-7xl mx-auto text-center">

        <div className="place-items-center grid md:grid-cols-2 lg:grid-cols-4 gap-8">
           

                {services.map((service, index) => (
                    <div
                    key={index}
                    className="h-150 w-full group rounded-3xl bg-white/5 backdrop-blur-md border border-white/10  hover:border-yellow-500 transition duration-500 hover:-translate-y-3"
                    >
                        <motion.section
                            initial = {{opacity: 0, y:50 }}
                            whileInView = {{ opacity: 1, y:0 }}
                            transition = {{ duration: 2 }}
                            viewport = {{ once: true}}>
                            <div className="h-60 w-full mx-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-yellow-500/30">
                                <img 
                                    src = {service.image}
                                    alt = {service.title}
                                    className = "rounded-2xl object-fill sm:object-fill h-60 w-full md:object-fill"
                                />
                            </div>

                            <h3 className="mx-5 text-white text-2xl font-extrabold mb-4 mt-4">
                                {service.title}
                            </h3>

                            <p className="mx-4 m-4 text-white font-thin text-sm">
                                {service.description}
                            </p>

                            <button className="w-50 py-3 bg-yellow-400 rounded-3xl"> 
                              <Link to="/services">
                                Learn More
                              </Link>
                            </button>

                            <button className="w-50 text-white py-3 mt-3 text-bold border border-slate-100/40 bg-slate-50/20 backdrop-blur-xl transition-300 rounded-3xl"> 
                              <Link to="/booking">
                                Book Service
                              </Link>
                            </button>
                        </motion.section>
                            </div>
                    
                ))}

            

        </div>
      </div>
    </motion.section>
  );
}