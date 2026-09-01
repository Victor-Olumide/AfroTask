import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Card({
  name,
  title,
  rating,
  reviews,
  hourlyRate,
  image,
  userId,
}) {
  const navigate = useNavigate();
  return (
    <div
      className="group w-full cursor-pointer overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#00564C]/20 hover:shadow-[0_16px_32px_-16px_rgba(0,86,76,0.22)]"
      onClick={() => navigate(`/profile/${userId}`)}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <img
          src={image || "/img/blog1.png"}
          alt={name || "AfroTask freelancer"}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[11px] font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
          <FaStar className="text-[#FB9E01] text-[10px]" />
          {rating || "New"}
          {reviews ? <span className="font-normal text-gray-500">({reviews})</span> : null}
        </div>
      </div>

      <div className="p-3.5">
        <p className="mb-0.5 truncate text-sm font-semibold text-[#0B1F1C]">
          {name || "Skilled Professional"}
        </p>
        <p className="mb-2.5 truncate text-[11px] text-gray-500">
          {title || "Skilled Professional"}
        </p>

        <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
          <span className="text-[10px] uppercase tracking-wide text-gray-400">Rate</span>
          <span className="text-xs font-semibold text-[#00564C]">
            {hourlyRate === "Negotiable" ? "Negotiable" : `₦${hourlyRate}/hr`}
          </span>
        </div>
      </div>
    </div>
  );
}