

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

const SocialMedia = () => {
    const socials = [
         {
    name: "Facebook",
    icon: <FaFacebookF size={24} />,
    link: "#",
    color: "hover:bg-blue-600",
  },
  {
    name: "Instagram",
    icon: <FaInstagram size={24} />,
    link: "#",
    color: "hover:bg-pink-600",
  },
  {
    name: "LinkedIn",
    icon: <FaLinkedinIn size={24} />,
    link: "#",
    color: "hover:bg-blue-700",
  },
  {
    name: "X (Twitter)",
    icon: <FaXTwitter size={24} />,
    link: "#",
    color: "hover:bg-black",
  },
  {
    name: "YouTube",
    icon: <FaYoutube size={24} />,
    link: "#",
    color: "hover:bg-red-600",
  },
    ]


    return (
    <section className="py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <span className="inline-block bg-yellow-200 text-slate-700 px-4 py-2 rounded-full text-sm font-semibold">
          Stay Connected
        </span>

        <h2 className="mt-5 text-4xl md:text-5xl font-extrabold text-white">
          Connect With Us
        </h2>

        <p className="mt-5 max-w-2xl mx-auto text-white text-lg">
          Follow us on social media for the latest solar innovations, project
          updates, maintenance tips, and exclusive offers. We'd love to hear
          from you.
        </p>

        <div className="mt-12 grid md:grid-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {socials.map((social) => (
            <a
              key={social.name}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`group bg-white rounded-2xl p-1 shadow-sm border border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${social.color}`}
            >
              <div className="flex justify-center text-slate-800 group-hover:text-white transition-colors">
                {social.icon}
              </div>

              <h3 className="ont-semibold text-slate-900 group-hover:text-white transition-colors">
                {social.name}
              </h3>
            </a>
          ))}
        </div>
      </div>
    </section>
    )
};

export default SocialMedia;