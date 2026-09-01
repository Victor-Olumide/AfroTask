import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LuShield } from "react-icons/lu";
import { GoPeople } from "react-icons/go";
import { CiStar } from "react-icons/ci";

const features = [
  {
    icon: LuShield,
    title: "Trust-First Verification",
    desc: "Every freelancer and client goes through our rigorous verification process",
  },
  {
    icon: GoPeople,
    title: "Quality Professionals",
    desc: "Work with verified experts who have proven their skills and credibility",
  },
  {
    icon: CiStar,
    title: "Guaranteed Quality",
    desc: "Our verification system ensures high-quality work and reliable partnerships",
  },
];

function FadeIn({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function WhyAfroTaskFeatures() {
  return (
    <div className="relative overflow-hidden bg-[#FBFAF7] px-4 py-16 md:py-24">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-60"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(0,86,76,0.06) 0%, rgba(251,158,1,0.04) 45%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-14 md:gap-20">
        <FadeIn className="text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="h-px w-6 bg-[#FB9E01]" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FB9E01]">
              Our advantage
            </p>
            <span className="h-px w-6 bg-[#FB9E01]" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#0B1F1C] md:text-4xl">
            Why choose AfroTask
          </h2>
        </FadeIn>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.12} className="h-full">
              <div className="group relative flex h-full flex-col items-center rounded-2xl border border-black/[0.06] bg-white px-8 py-10 text-center shadow-[0_1px_2px_rgba(16,24,22,0.04),0_12px_32px_-16px_rgba(16,24,22,0.10)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#00564C]/15 hover:shadow-[0_1px_2px_rgba(16,24,22,0.05),0_24px_48px_-16px_rgba(0,86,76,0.18)]">
                <span className="absolute inset-x-8 top-0 h-[3px] scale-x-0 rounded-full bg-gradient-to-r from-[#FB9E01] to-[#00564C] transition-transform duration-300 ease-out group-hover:scale-x-100" />

                <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#00564C]">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  <f.icon className="relative text-3xl text-white" strokeWidth={1.75} />
                </div>

                <h3 className="mb-3 text-xl font-bold text-[#0B1F1C]">
                  {f.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-[#5B6864]">
                  {f.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}