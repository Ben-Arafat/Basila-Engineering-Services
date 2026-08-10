import { useState } from "react";
import '../App.css';
import Navbar from '../Components/navbar';
import PageHero from "../Components/pageHero";
import Footer from "../Components/footer";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa";
import CTA from "../Components/CTA";
import { getDbInstance } from "../Firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: "",
    });

    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (
        !formData.name ||
        !formData.email ||
        !formData.phone ||
        !formData.service ||
        !formData.message
        ) {
        setStatusMessage("error");
        setLoading(false);
        return;
        }

     setLoading(true);
     setStatusMessage("");

    try {
        const db = await getDbInstance();
        

        await addDoc(collection(db, "contactMessages"), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        message: formData.message,
        createdAt: serverTimestamp(),
        });

        setStatusMessage("success");

        setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: "",
        });

    } catch (error) {
    console.error(error);
    setStatusMessage("error");

    } finally {
        setLoading(false);
    }

    
    };

    return (
        <div className="h-auto w-auto">

            <div className="w-full">
                <PageHero             
                    title="Contact Us"
                    subtitle="Get in touch with our team to discuss your project, request a consultation, or receive expert technical support"
                />
            </div>

            <div>
                 {/* CONTACT SECTION */}

                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12">

                    {/* LEFT */}

                    <div>

                        <span className="text-yellow-500 uppercase font-semibold tracking-widest">
                        Contact Information
                        </span>

                        <h2 className="text-4xl font-bold mt-4">
                        Let's Talk About Your Project
                        </h2>

                        <p className="text-gray-600 mt-6 leading-8">
                        Whether you're planning a residential solar installation,
                        commercial electrical project, or industrial engineering
                        solution, we'd love to hear from you.
                        </p>

                        <div className="mt-10 space-y-6">

                        <div className="flex gap-5">
                            <FaPhoneAlt className="text-yellow-500 text-2xl mt-1"/>
                            <div>
                            <h3 className="font-bold">Phone</h3>
                            <p className="text-gray-600">+234 904 862 3223 || +234 703 210 8771 </p>
                            </div>
                        </div>

                        <div className="flex gap-5">
                            <FaEnvelope className="text-yellow-500 text-2xl mt-1"/>
                            <div>
                            <h3 className="font-bold">Email</h3>
                            <p className="text-gray-600">
                                sunergy0@gmail.com
                            </p>
                            </div>
                        </div>

                        <div className="flex gap-5">
                            <FaMapMarkerAlt className="text-yellow-500 text-2xl mt-1"/>
                            <div>
                            <h3 className="font-bold">Office Address</h3>
                            <p className="text-gray-600">
                                Kaduna Office: No. 3A Rimi Drive, Ungwan Rimi,Kaduna State, Nigeria
                            </p>
                            </div>
                        </div>

                        <div className="flex gap-5">
                            <FaClock className="text-yellow-500 text-2xl mt-1"/>
                            <div>
                            <h3 className="font-bold">Business Hours</h3>
                            <p className="text-gray-600">
                                Monday - Friday
                            </p>

                            <p className="text-gray-600">
                                8:00 AM - 5:00 PM
                            </p>
                            </div>
                        </div>

                        </div>

                        {/* SOCIALS */}

                        <div className="flex gap-4 mt-10">

                        {[FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp].map(
                            (Icon, index) => (
                            <div
                                key={index}
                                className="w-12 h-12 rounded-full bg-yellow-500 text-white flex items-center justify-center hover:bg-yellow-600 cursor-pointer transition"
                            >
                                <Icon />
                            </div>
                            )
                        )}

                        </div>

                    </div>

                    {/* FORM */}

                    <div className="bg-slate-50 rounded-3xl p-8 shadow-lg relative">

                        <h2 className="text-3xl font-bold mb-8">
                        Request a Quote
                        </h2>

                        <form className="space-y-5" onSubmit={handleSubmit}>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            className="w-full border rounded-xl p-4 outline-none focus:ring-2 focus:ring-yellow-500"
                        />

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email Address"
                            className="w-full border rounded-xl p-4 outline-none focus:ring-2 focus:ring-yellow-500"
                        />

                        <input
                            type="tel"
                            name="phone"
                            inputMode="tel"
                            autoComplete="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Phone Number"
                            className="w-full border rounded-xl p-4 outline-none focus:ring-2 focus:ring-yellow-500"
                        />

                        <select
                            name="service"
                            value={formData.service}
                            onChange={handleChange}
                            className="w-full border rounded-xl p-4 outline-none focus:ring-2 focus:ring-yellow-500"
                        >

                            <option value="">Select Service</option>

                            <option value="Solar Installation">Solar Installation</option>

                            <option value="Electrical Engineering">Electrical Engineering</option>

                            <option value="Industrial Automation">Industrial Automation</option>

                            <option value="Maintenance">Maintenance</option>

                            <option value="Consultation">Consultation</option>

                        </select>

                        <textarea
                            name="message"
                            rows="6"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Tell us about your project..."
                            className="w-full border rounded-xl p-4 outline-none focus:ring-2 focus:ring-yellow-500"
                        ></textarea>

                        {statusMessage === "success" && (
                            <p className="bg-green-100 text-green-700 p-3 rounded-xl">
                                ✅ Your message has been sent successfully. We will contact you soon.
                            </p>
                        )}

                        {statusMessage === "error" && (
                            <p className="bg-red-100 text-red-700 p-3 rounded-xl">
                                ❌ Please fill all fields before submitting.
                            </p>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-xl font-semibold transition">
                            {loading ? "Sending..." : "Send Message"}
                        </button>

                        </form>

                    </div>

                    </div>

                </section>

                {/* MAP */}

                <section className="bg-slate-100 py-20">

                    <div className="max-w-7xl mx-auto px-6">

                    <h2 className="text-4xl font-bold text-center mb-10">
                        Find Us
                    </h2>

                    <div className="rounded-3xl overflow-hidden shadow-lg">

                        <iframe
                        title="Google Map"
                        src="https://www.google.com/maps?q=Kaduna,Nigeria&output=embed"
                        width="100%"
                        height="450"
                        loading="lazy"
                        ></iframe>

                    </div>

                    </div>

                </section>
            </div>

            <CTA />

            <div>
                <Footer />
            </div>
        </div>
    )
}

export default Contact;