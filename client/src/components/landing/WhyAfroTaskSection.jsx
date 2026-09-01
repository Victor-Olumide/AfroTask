import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  FaLaptopCode,
  FaBullhorn,
  FaPalette,
  FaRobot,
  FaPenNib,
  FaVideo,
} from "react-icons/fa";

const features = [
  {
    icon: FaLaptopCode,
    title: "Web & App Projects",
    description:
      "Get sites, apps, and software built by skilled Nigerian developers ready to ship fast.",
  },
  {
    icon: FaBullhorn,
    title: "Digital Marketing",
    description:
      "Drive reach and leads with SEO, social media management, and paid campaign experts.",
  },
  {
    icon: FaPalette,
    title: "Design & Branding",
    description:
      "Logos, brand identity, and visual design from freelancers who understand local markets.",
  },
  {
    icon: FaRobot,
    title: "AI & Automation",
    description:
      "Tap into freelancers building AI-powered tools, chatbots, and workflow automation.",
  },
  {
    icon: FaPenNib,
    title: "Writing & Translation",
    description:
      "Content, copywriting, and translation work delivered by native-fluent professionals.",
  },
  {
    icon: FaVideo,
    title: "Video & Animation",
    description:
      "Editing, motion graphics, and animation from creators who know what converts.",
  },
];

export default function WhyAfroTaskSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full py-14 px-4 md:px-8"
    >
      <h2 className="text-xl md:text-3xl font-bold text-gray-900 text-center mb-3">
        Scale your work with real people.
      </h2>
      <p className="text-sm md:text-base text-gray-500 text-center max-w-md mx-auto mb-12">
        Tap into a growing network of Nigerian freelancers ready to deliver
        across every category.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
        {features.map(({ icon: Icon, title, description }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative bg-white border-l-[5px] border-[#00564C] rounded-r-2xl rounded-l-md p-6 shadow-sm hover:shadow-xl transition-shadow duration-300"
          >
            <span className="absolute top-4 right-5 text-3xl font-bold text-[#00564C]/[0.06] select-none">
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00564C] to-[#027568] flex items-center justify-center mb-5 shadow-md shadow-[#00564C]/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Icon className="text-white text-xl" />
            </div>
            <h3 className="font-semibold text-gray-900 text-base md:text-lg mb-2">
              {title}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
              {description}
            </p>

            <div className="mt-4 h-[2px] w-8 bg-[#FB9E01] rounded-full transition-all duration-300 group-hover:w-14" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}