import { useState } from "react";
import PortfolioModal from "../Components/portfolioModal";
import { MapPin } from "lucide-react";
import Navbar from '../Components/navbar';
import PageHero from "../Components/pageHero";
import projects from "../Data/projects";
import Footer from "../Components/footer";
import CTA from "../Components/CTA";

const categories = [
  "All",
  "Residential",
  "Commercial",
  "Industrial",
];


const Portfolio = () => {
    const [activeCategory, setActiveCategory] = useState ("All");
    const [selectedProject, setSelectedProject] = useState(null);

    const filteredProjects = 
        activeCategory === "All"
        ? projects
        : projects.filter (
            (project) => project.category === activeCategory
        );

    

    return (
        <div className="h-auto w-auto">

            <div className="w-full">
                <PageHero             
                    title="Portfolio"
                    subtitle="Explore our completed residential, commercial, and industrial projects that showcase our commitment to quality, innovation, and sustainable energy."
                />
            </div>

            <section className="bg-white py-16">

                <div className="max-w-7xl mx-auto px-6">

                {/* Filter Buttons */}

                <div className="flex flex-wrap justify-center gap-4 mb-14">

                    {categories.map((category) => (

                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-6 py-3 rounded-full font-semibold transition

                        ${
                        activeCategory === category
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-100 hover:bg-yellow-100"
                        }
                        `}
                    >
                        {category}
                    </button>

                    ))}

                </div>

                {/* Projects */}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {filteredProjects.map((project) => (

                    <div
                        key={project.id}
                        className="group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition"
                    >

                        <div className="overflow-hidden">

                        <img
                            src={project.image}
                            alt={project.title}
                            className="h-72 w-full object-cover group-hover:scale-110 transition duration-500"
                        />

                        </div>

                        <div className="p-6">

                        <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                            {project.category}
                        </span>

                        <h3 className="text-2xl font-bold mt-4">
                            {project.title}
                        </h3>

                        <div className="flex items-center gap-2 text-gray-500 mt-3">
                            <MapPin size={18} />
                            {project.location}
                        </div>

                        <button 
                        onClick = {() => setSelectedProject(project)}
                        className="mt-6 text-yellow-600 font-semibold hover:underline">
                            View Project →
                        </button>

                        </div>

                    </div>

                    ))}

                </div>

                </div>



            </section>

            {selectedProject && (
                <PortfolioModal
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />
            )}

            <CTA />

            <Footer />
        </div>
    )
}

export default Portfolio;