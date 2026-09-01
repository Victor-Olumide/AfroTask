import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      className="relative overflow-hidden py-20 md:py-28"
      style={{ background: "linear-gradient(135deg, #00453D 0%, #00564C 45%, #027568 100%)" }}
    >
      {/* Decorative glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 15%, #FB9E01 0%, transparent 40%), radial-gradient(circle at 88% 85%, #ffffff 0%, transparent 45%)",
        }}
      />

      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative mx-auto max-w-3xl px-6 text-center"
      >
        <div className="mb-5 inline-flex items-center gap-2">
          <span className="h-px w-6 bg-[#FB9E01]" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FB9E01]">
            Get started today
          </p>
          <span className="h-px w-6 bg-[#FB9E01]" />
        </div>

        <h2 className="mb-6 text-2xl font-bold leading-tight text-white md:text-4xl">
          Ready to build your future?
        </h2>

        <p className="mx-auto mb-10 max-w-xl text-sm text-white/70 md:text-base">
          Join thousands of verified professionals and trusted clients on AfroTask
        </p>

        <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-5">
          <Link to="/signup/client">
            <button className="group flex items-center gap-2 rounded-xl bg-[#FB9E01] px-10 py-4 text-base font-semibold text-[#3D2600] shadow-[0_16px_32px_-12px_rgba(251,158,1,0.5)] transition-all duration-300 hover:scale-105 hover:bg-[#FFB020] md:text-lg">
              Join as a client
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Link>
          <Link to="/signup/freelancer">
            <button className="rounded-xl border border-white/25 bg-white/5 px-10 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/15 md:text-lg">
              Become a freelancer
            </button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}