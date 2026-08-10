import '../App.css';
import Navbar from '../Components/navbar';
import PageHero from "../Components/pageHero";
import Footer from "../Components/footer";
import CTA from "../Components/CTA";
import {
  FaBolt,
  FaSolarPanel,
  FaUsers,
  FaShieldAlt,
  FaAward,
  FaTools,
  FaLightbulb,
  FaHandshake,
} from "react-icons/fa";
import Expertise from "../Components/expertise";

const About = () => {
    return (
        <div className="h-auto w-auto">

            <div className=" w-full">
                <PageHero             
                    title="About Us"
                    subtitle="We are a multidisciplinary engineering company committed to delivering reliable solar, electrical, and smart building solutions."
                />
            
            </div>

            <div>
                {/* WHO WE ARE */}
                
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

                    <div>
                        <img
                        src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1200"
                        alt="Engineering Team"
                        className="rounded-3xl shadow-xl object-cover w-full h-[500px]"
                        />
                    </div>

                    <div>

                        <span className="text-yellow-500 font-extrabold uppercase tracking-widest text-4xl lg:text-7xl">
                        WHO WE ARE
                        </span>

                        <h2 className="text-4xl md:text-5xl font-bold mt-4 text-slate-900">
                        Engineering Excellence with Sustainable Innovation
                        </h2>

                        <p className="mt-8 text-gray-600 leading-8">
                        Basila Engineering Services is a multidisciplinary engineering
                        company delivering innovative electrical, renewable energy,
                        automation, and technical consultancy services across residential,
                        commercial, and industrial sectors.
                        </p>

                        <p className="mt-6 text-gray-600 leading-8">
                        Our experienced engineers and certified technicians are committed
                        to delivering safe, efficient, and future-ready engineering
                        solutions that exceed client expectations.
                        </p>

                    </div>

                    </div>
                </section>

                {/* MISSION & VISION */}

                <section className="bg-slate-100 py-20">
                    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">

                    <div className="bg-white rounded-3xl p-10 shadow-lg">
                        <FaLightbulb className="text-5xl text-yellow-500 mb-6" />

                        <h3 className="text-3xl font-bold">
                        Our Mission
                        </h3>

                        <p className="mt-6 text-gray-600 leading-8">
                        To provide innovative engineering and renewable energy solutions
                        that improve lives, enhance business productivity, and promote
                        sustainable development.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-10 shadow-lg">
                        <FaAward className="text-5xl text-yellow-500 mb-6" />

                        <h3 className="text-3xl font-bold">
                        Our Vision
                        </h3>

                        <p className="mt-6 text-gray-600 leading-8">
                        To become one of Africa's most trusted engineering companies,
                        recognized for quality, innovation, and customer satisfaction.
                        </p>
                    </div>

                    </div>
                </section>

                {/* Multidisciplinary Approach */}
                <section className="py-10  bg-slate-800">
                <Expertise />
                </section>

                {/* STATS */}
                
                <section className="bg-slate-900 py-30">

                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">

                    {[
                        ["120+", "Projects Completed"],
                        ["15MW+", "Installed Capacity"],
                        ["40+", "Engineering Experts"],
                        ["98%", "Client Satisfaction"],
                    ].map(([number, title]) => (

                        <div key={title}>
                        <h2 className="text-yellow-500 text-5xl font-bold">
                            {number}
                        </h2>

                        <p className="text-white mt-4 text-lg">
                            {title}
                        </p>
                        </div>

                    ))}

                    </div>

                </section>

                 {/* WHY CHOOSE US */}

                <section className="py-20 bg-white">

                    <div className="max-w-7xl mx-auto px-6">

                    <div className="text-center mb-16">

                        <h2 className="text-4xl font-bold">
                        Why Choose Us
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

                 {/* OUR PROCESS */}

                <section className="bg-slate-100 py-20">

                    <div className="max-w-7xl mx-auto px-6">

                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold">
                        Our Process
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">

                        {[
                        "Consultation",
                        "Site Assessment",
                        "Engineering Design",
                        "Installation",
                        "Maintenance",
                        ].map((step, index) => (

                        <div
                            key={step}
                            className="bg-white rounded-3xl p-8 text-center shadow-md"
                        >
                            <div className="w-14 h-14 mx-auto rounded-full bg-yellow-500 text-white flex items-center justify-center text-xl font-bold">
                            {index + 1}
                            </div>

                            <h3 className="mt-6 font-semibold text-xl">
                            {step}
                            </h3>
                        </div>

                        ))}

                    </div>

                    </div>

                </section>


            </div>

            <div>
                <CTA />
            </div>



            <div>
                <Footer />
            </div>
            
        </div>
    )
}

export default About;