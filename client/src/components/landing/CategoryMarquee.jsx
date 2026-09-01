import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import servicesData from "../../data/services.json";

const categories = [
  ...servicesData.map((s) => s.title),
  "SEO",
  "Video Editing",
  "Data Entry",
  "App Testing",
  "Virtual Assistant",
  "Customer Support",
];

const pillColors = [
  { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", dot: "bg-teal-500" },
  { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500" },
  { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500" },
  { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", dot: "bg-sky-500" },
  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
  { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-500" },
];

export default function CategoryMarquee() {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf;
    const speed = 40;
    let last = 0;

    const tick = (time) => {
      if (!last) last = time;
      const delta = Math.min(time - last, 32);
      last = time;

      track.scrollLeft += (speed * delta) / 1000;
      if (track.scrollLeft >= track.scrollWidth / 2) {
        track.scrollLeft = 0;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const navigate = useNavigate();
  const loop = [...categories, ...categories];

  return (
    <section className="bg-white py-10 md:py-14 overflow-hidden">
      <p className="text-center text-xs md:text-sm tracking-widest text-gray-400 font-medium uppercase mb-6">
        {categories.length}+ task categories and counting
      </p>

      <div
        ref={trackRef}
        className="flex gap-3 overflow-x-hidden whitespace-nowrap px-4"
      >
        {loop.map((title, i) => {
          const color = pillColors[i % pillColors.length];
          return (
            <button
              key={`${title}-${i}`}
              onClick={() => navigate(`/explore-projects?category=${encodeURIComponent(title)}`)}
              className={`shrink-0 border ${color.bg} ${color.text} ${color.border} hover:shadow-sm transition-shadow duration-200 px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
              {title}
            </button>
          );
        })}
      </div>
    </section>
  );
}