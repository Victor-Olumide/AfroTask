import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { HiOutlineSparkles } from "react-icons/hi2";
import { IoCheckmarkCircle, IoCloudUploadOutline } from "react-icons/io5";

function StepBadge({ number }) {
  return (
    <div className="w-14 h-14 rounded-2xl bg-[#00564C] text-white flex items-center justify-center text-xl font-bold shadow-md shadow-[#00564C]/20">
      {number}
    </div>
  );
}

function Checklist({ items }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2 text-gray-700 font-medium text-sm md:text-base">
          <IoCheckmarkCircle className="text-[#00564C] text-lg shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function PostTaskMockup() {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1800);
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-[#00564C]/5 rounded-3xl rotate-3 -z-10" />
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-7 rotate-1 hover:rotate-0 transition-transform duration-300">
        <h4 className="font-bold text-lg text-gray-900 mb-4">Post a Project</h4>

        <div className="bg-[#00564C]/5 border border-[#00564C]/10 rounded-2xl p-4 mb-5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-2">
            <HiOutlineSparkles className="text-[#00564C] text-lg mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Fill this in with AI</p>
              <p className="text-xs text-gray-500">Describe your project — we'll draft the brief.</p>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            className="shrink-0 bg-[#00564C] hover:bg-[#027568] text-white text-xs md:text-sm font-medium px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors duration-200"
          >
            <HiOutlineSparkles className="text-sm" />
            {generating ? "Generating…" : "Generate"}
          </button>
        </div>

        {generating && (
          <div className="mb-4 flex items-center gap-2 text-xs text-[#00564C] font-medium">
            <span className="w-3 h-3 border-2 border-[#00564C] border-t-transparent rounded-full animate-spin" />
            Filling out your brief…
          </div>
        )}

        <label className="block text-xs font-semibold text-gray-500 mb-1">PROJECT TITLE</label>
        <div className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 mb-4">
          e.g. Build a responsive landing page
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">PROJECT TYPE</label>
            <div className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400">Select…</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">DEADLINE</label>
            <div className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400">Select…</div>
          </div>
        </div>

        <label className="block text-xs font-semibold text-gray-500 mb-1">BUDGET RANGE</label>
        <div className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 mb-5">
          e.g. ₦150,000 – ₦400,000
        </div>

        <button className="w-full bg-[#00564C]/40 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 text-sm cursor-default">
          <IoCloudUploadOutline />
          Post Project
        </button>
      </div>
    </div>
  );
}

function ReviewMockup() {
  const applicants = [
    { name: "Amaka O.", role: "Frontend Developer", status: "pending" },
    { name: "Tunde M.", role: "UI/UX Designer", status: "accepted" },
  ];

  const statusStyle = {
    pending: "bg-amber-50 text-amber-700",
    accepted: "bg-[#00564C]/10 text-[#00564C]",
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-[#FB9E01]/5 rounded-3xl -rotate-3 -z-10" />
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-7 -rotate-1 hover:rotate-0 transition-transform duration-300">
        <h4 className="font-bold text-lg text-gray-900 mb-4">Review Proposals</h4>

        <div className="space-y-3">
          {applicants.map((a, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{a.name}</p>
                  <p className="text-xs text-gray-500">{a.role}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[a.status]}`}>
                  {a.status}
                </span>
              </div>
              {a.status === "pending" && (
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 bg-[#00564C] text-white text-xs font-medium py-2 rounded-lg cursor-default">
                    Accept
                  </button>
                  <button className="flex-1 border border-gray-200 text-gray-600 text-xs font-medium py-2 rounded-lg cursor-default">
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BuiltForSpeedSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-[#F7F6F1] py-16 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">Built for speed.</h2>
        <p className="text-gray-500 text-sm md:text-base">
          Our platform makes hiring and getting hired as fast and frictionless as possible.
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center mb-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <PostTaskMockup />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <StepBadge number={1} />
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-5 mb-3">
            Post your project in minutes.
          </h3>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Add a title, pick a project type, set your budget, and describe
            what needs to be done. Your project goes live instantly — or use
            AI to draft the brief for you.
          </p>
          <Checklist
            items={["Fixed price, hourly, or contract", "AI-assisted project briefs", "Remote, onsite, or hybrid work"]}
          />
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="order-2 md:order-1"
        >
          <StepBadge number={2} />
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-5 mb-3">
            Review work. Hire with confidence.
          </h3>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Every proposal lands in your dashboard. Accept the freelancer
            that fits, or decline and keep browsing — you stay in control
            of who works on your project.
          </p>
          <Checklist
            items={["Compare proposals side by side", "Accept or decline instantly", "Message freelancers before hiring"]}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="order-1 md:order-2"
        >
          <ReviewMockup />
        </motion.div>
      </div>
    </section>
  );
}