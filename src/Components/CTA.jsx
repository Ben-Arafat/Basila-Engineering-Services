import { Link } from "react-router-dom";

const CTA = () => {
    return (
        <div>
            <section className="bg-slate-900 py-20">

        <div className="max-w-4xl mx-auto text-center px-6">

          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Build Your Next Project?
          </h2>

          <p className="mt-6 text-yellow-100 text-lg leading-8">
            Whether you need solar installations, electrical engineering,
            industrial automation, or technical consultancy, our team is ready
            to bring your vision to life.
          </p>

          <Link to="/contact">
            <button className="mt-10 bg-white text-yellow-600 font-semibold px-8 py-4 rounded-full hover:bg-slate-100 transition">
              Book a Consultation
            </button>
          </Link>

        </div>

      </section>
        </div>

    )

}

export default CTA;