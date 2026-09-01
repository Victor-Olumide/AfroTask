import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";
import { TbTrendingUp } from "react-icons/tb";
import { IoCheckmarkCircle } from "react-icons/io5";

const avatarStack = [
  "/img/fa1.png",
  "/img/mr_tope.png",
  "/img/pj.png",
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [tasksProcessed] = useState(227);
  const [availableWorkers] = useState(1331);

  return (
    <div className="bg-[#F7F6F1] px-4 md:px-10 py-10 md:py-16">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

        <div className="relative">
          <HiOutlineSparkles className="hidden md:block absolute -left-6 top-0 text-[#FB9E01] text-2xl" />

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Empowering ideas.
            <br />
            <span className="text-[#00564C]">Connecting real talent.</span>
          </h1>

          <div className="w-16 h-1 bg-[#00564C]/20 rounded-full mt-4 mb-6" />

          <p className="text-gray-600 text-base md:text-lg max-w-md">
            Connect with a growing network of skilled freelancers ready to bring
            your projects to life. Post a task, review submissions, and get
            quality work done fast.
          </p>

          <button
            onClick={() => navigate("/post-project")}
            className="mt-8 bg-[#00564C] hover:bg-[#027568] text-white px-6 py-3.5 rounded-full font-medium flex items-center gap-2 transition-colors duration-300"
          >
            Post a Task
            <FaArrowRight className="text-sm" />
          </button>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-3">
              {avatarStack.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-10 h-10 rounded-full border-2 border-[#F7F6F1] object-cover"
                />
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-[#F7F6F1] bg-[#00564C] text-white text-xs font-medium flex items-center justify-center">
                +800
              </div>
            </div>
            <p className="text-sm text-gray-700 font-medium leading-tight">
              Over 800+ freelancers
              <br />
              ready for your project.
            </p>
          </div>
        </div>

        <div className="relative h-[420px] md:h-[480px] hidden md:block">
          <HiOutlineSparkles className="absolute right-2 top-6 text-[#FB9E01] text-3xl" />

          <div className="absolute right-6 top-8 w-[300px] h-[380px] rounded-3xl overflow-hidden shadow-xl rotate-3">
            <img
              src="/img/Ld1.png"
              alt="Freelancer at work"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute left-0 top-4 bg-white rounded-2xl shadow-lg p-4 w-[190px] -rotate-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#FB9E01]/15 flex items-center justify-center">
                <TbTrendingUp className="text-[#FB9E01]" />
              </div>
              <span className="text-xs text-gray-500 font-medium">Tasks Completed</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{tasksProcessed}</p>
          </div>

          <div className="absolute left-4 bottom-24 bg-white rounded-2xl shadow-lg p-4 w-[220px] rotate-2 z-10">
            <div className="flex items-center gap-2 mb-2">
              <img
                src="/img/pj.png"
                alt=""
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  Chuka Obi
                  <IoCheckmarkCircle className="text-[#00564C] text-sm" />
                </p>
                <div className="flex text-[#FB9E01] text-xs">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              "Delivered great work on time, every time."
            </p>
          </div>

          <div className="absolute right-0 bottom-0 bg-white rounded-2xl shadow-lg p-4 w-[210px]">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-full bg-[#00564C]/10 flex items-center justify-center">
                <IoCheckmarkCircle className="text-[#00564C]" />
              </div>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Just now</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">Active Freelancers</p>
            <p className="text-xs text-gray-500 mb-2">Ready to work on-demand</p>
            <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500">Available now</span>
              <span className="text-sm font-bold text-[#00564C]">
                {availableWorkers.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}