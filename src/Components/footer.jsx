import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

import {
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineMapPin,
} from "react-icons/hi2";

const Footer = () => {
  return (
    <footer className="bg-yellow-500 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Company */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl w-auto font-bold text-slate-800">
              <img src="basila logo.png" className="h-15 w-15" /> BASILA ENGINEERING SERVICES
            </h2>

            <p className="mt-5 leading-7 text-slate-800  max-w-md">
              Delivering reliable solar energy solutions through expert
              engineering, quality installations, and exceptional customer
              support. We help homes and businesses transition to clean,
              sustainable energy.
            </p>

            <div className="flex gap-4 mt-8">

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-yellow-500 hover:text-white transition"
              >
                <FaFacebookF />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-yellow-500 hover:text-white transition"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-yellow-500 hover:text-white transition"
              >
                <FaLinkedinIn />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-yellow-500 hover:text-white transition"
              >
                <FaXTwitter />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-yellow-500 hover:text-white transition"
              >
                <FaYoutube />
              </a>

            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-slate-800 text-lg font-semibold mb-6">
              Quick Links
            </h3>

            <ul className="space-y-4">
              <li><a href="/" className="text-black hover:text-yellow-500 transition">Home</a></li>
              <li><a href="/about" className="text-slate-800 hover:text-yellow-100 transition">About</a></li>
              <li><a href="/services" className="text-slate-800 hover:text-yellow-100 transition">Services</a></li>
              <li><a href="/projects" className="text-slate-800 hover:text-yellow-100 transition">Projects</a></li>
              <li><a href="/contact" className="text-slate-800 hover:text-yellow-100 transition">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-slate-800 text-lg font-semibold mb-6">
              Services
            </h3>

            <ul className="space-y-4">
              <li className="text-slate-800">Electrical & Building System</li>
              <li className="text-slate-800">Energy Solution (Solar & Power Systems)</li>
              <li className="text-slate-800">Smart Building & Automation</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-slate-800 text-lg font-semibold mb-6">
              Contact
            </h3>

            <div className="space-y-5">

              <div className="flex gap-3">
                <HiOutlineMapPin className="text-slate-800 text-xl mt-1" />
                <p className="text-slate-800">
                  Kaduna Office: No. 3A Rimi Drive, Ungwan Rimi,
                  <br />
                  Kaduna State, Nigeria
                </p>

                <p className="text-slate-800">
                  Abuja Liason Office: Suit 413 Ammah Ahmadu Bello Way Kado,
                  <br />
                  Abuja, Nigeria
                </p>
              </div>

              <div className="flex gap-3">
                <HiOutlinePhone className="text-slate-800 text-xl" />
                <p className="text-slate-800">+234 904 862 3223 | +234 703 210 8771</p>
              </div>

              <div className="flex gap-3">
                <HiOutlineEnvelope className="text-slate-800 text-xl" />
                <p className="text-slate-800">sunergy0@gmail.com</p>
              </div>

            </div>
          </div>

        </div>

        {/* Divider */}

        <div className="border-t border-slate-800 mt-14 pt-8">

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            <p className="text-gray-500 text-center md:text-left">
              © {new Date().getFullYear()} Basila Engineering Services. All rights reserved.
            </p>

            <div className="flex gap-6 text-sm">

              <a
                href="#"
                className="text-gray-500 hover:text-slate-800 transition"
              >
                Privacy Policy
              </a>

              <a
                href="#"
                className="text-gray-500 hover:text-slate-800 transition"
              >
                Terms of Service
              </a>

              <a
                href="#"
                className="text-gray-500 hover:text-slate-800 transition"
              >
                Cookie Policy
              </a>

            </div>

          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;