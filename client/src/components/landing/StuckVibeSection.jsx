import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { HiOutlineSparkles } from "react-icons/hi2";
import { FaArrowRight } from "react-icons/fa";

export default function StuckVibeSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="bg-[#00564C] w-full h-auto p-8 lg:px-14 lg:py-14 mx-2 md:mx-8 m-4 flex flex-col md:flex-row justify-between items-center rounded-2xl md:rounded-3xl gap-8 md:gap-6 overflow-hidden relative shadow-xl"
    >
      <div className="gap-5 md:gap-6 flex flex-col w-full max-w-lg">
        <span className="inline-flex items-center gap-1.5 w-fit bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full">
          <HiOutlineSparkles className="text-[#FB9E01]" />
          For businesses
        </span>

        <h2 className="text-2xl lg:text-3xl font-bold text-white leading-snug">
          Stuck at vibe coding?
        </h2>
        <p className="text-sm md:text-base text-white/75 max-w-md">
          Get matched with the right expert to turn your prototype into a
          real, working product.
        </p>
        <Link to="/explore-projects" className="w-fit">
          <button className="text-[#00564C] duration-300 ease-in-out hover:scale-105 bg-white flex flex-row items-center gap-2 py-3 px-6 rounded-full shadow-lg text-sm font-semibold cursor-pointer hover:bg-white/90 transition-all">
            Find an Expert
            <FaArrowRight className="text-xs" />
          </button>
        </Link>
      </div>

      <div className="w-full md:w-[360px] shrink-0 relative">
        <div className="absolute -inset-4 bg-white/5 rounded-3xl -z-10" />
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center gap-1.5 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
          </div>

          <div className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 mb-4">
            <img
              src="/img/tb.png"
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Matched with Tobi A.</p>
              <p className="text-xs text-gray-500">Full-stack Developer · 5.0 ★</p>
            </div>
            <span className="text-[10px] bg-[#00564C]/10 text-[#00564C] font-medium px-2 py-1 rounded-full shrink-0">
              Online
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { label: "Prototype reviewed", done: true },
              { label: "Architecture planned", done: true },
              { label: "Build in progress", done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    step.done ? "bg-[#00564C]" : "border-2 border-gray-200"
                  }`}
                >
                  {step.done && (
                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                <span className={`text-xs md:text-sm ${step.done ? "text-gray-700" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}