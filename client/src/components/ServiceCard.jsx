import { IoIosArrowForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";

export default function ServiceCard({ icon: Icon, title, description, link, index = 0, user = null }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/explore-projects?category=${encodeURIComponent(title)}`);
  };

  return (
    <div className="bg-white rounded-xl text-black lg:p-6 p-4 lg:w-[260px] w-[200px] lg:h-[240px] h-[200px] flex flex-col justify-between flex-shrink-0 m-4 transition-transform duration-300 ease-in-out hover:scale-105 group">
      <div className="flex flex-row justify-start items-center gap-4 w-full">
        <div className="bg-[#00564C] p-4 lg:text-3xl text-xl text-white rounded-2xl flex items-center justify-center group-hover:-rotate-3 group-hover:shadow-md group:hover:scale-105 transition-transform duration-300">
          {Icon ? <Icon /> : null}
        </div>
        <p className="lg:text-lg text-sm font-semibold">{title}</p>
      </div>
      <p className="lg:text-sm text-xs line-clamp-2 text-gray-600">{description}</p>

      <button
        onClick={handleClick}
        className="bg-[#00564C] hover:bg-[#027568] px-4 py-2 font-medium text-white rounded-2xl flex flex-row gap-2 items-center lg:w-1/2 w-2/3 group transition-transform duration-300 ease-in-out hover:scale-105 lg:text-sm text-xs"
      >
        Explore
        <IoIosArrowForward className="font-bold transition-transform duration-300 group-hover:translate-x-1 group-hover:text-xl" />
      </button>
    </div>
  );
}