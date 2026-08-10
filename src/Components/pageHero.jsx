import { ArrowRight } from "lucide-react";

const PageHero = ({
  title,
  subtitle,
  breadcrumb = "Home",
}) => {
  return (
    <section className=" bg-slate-900 h-auto w-full overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 h-40 w-40 rounded-full bg-yellow-500/10 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full bg-green-500/10 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl p-5 pt-5 text-3xl md:pl-10">
        <div className="max-w-3xl">

          <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
            <span>{breadcrumb}</span>
            <ArrowRight size={16} />
            <span>{title}</span>
          </div>

          <h1 className="mt-6 text-4xl md:text-6xl font-bold text-white">
            {title}
          </h1>

          <p className="mt-6 text-sm md:text-lg text-slate-300">
            {subtitle}
          </p>

        </div>
      </div>
    </section>
  );
};

export default PageHero;