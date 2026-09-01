import { useState, useEffect, useCallback } from "react";
import FreelancerCard from "../FreelancerCard";
import api from "../../services/api";

export default function FreelancerHireSection() {
  const [allFreelancers, setAllFreelancers] = useState([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const CATEGORIES = [
    'All',
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Video Editing',
  'Digital Marketing',
  'Writing',
  'Data Science',
  'AI / Machine Learning',
  'Cybersecurity',
  'DevOps',
  'Game Development',
  'Others',
  ];

  const fetchFreelancers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/ranking/top-freelancers?limit=12");
      setAllFreelancers(response.data.freelancers || []);
      setFilteredFreelancers(response.data.freelancers || []);
    } catch (error) {
      console.error("Error fetching top freelancers:", error);
      setAllFreelancers([]);
      setFilteredFreelancers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFreelancers();
  }, [fetchFreelancers]);

  const handleCategoryFilter = (category) => {
    setActiveCategory(category);
    if (category === "All") {
      setFilteredFreelancers(allFreelancers);
    } else if (category === "Others") {
      const specificCategories = CATEGORIES.filter(cat => cat !== "All" && cat !== "Others");
      const filtered = allFreelancers.filter((freelancer) => {
        const skillCategory = freelancer.skillCategory?.toLowerCase() || '';
        const professionalTitle = freelancer.professionalTitle?.toLowerCase() || '';
        const skills = freelancer.skills || [];

        const hasCategoryData = skillCategory || professionalTitle || skills.length > 0;

        if (!hasCategoryData) {
          return true;
        }

        const matchesAnySpecificCategory = specificCategories.some(specificCat => {
          const matchesCategory = skillCategory === specificCat.toLowerCase();
          const matchesTitle = professionalTitle.includes(specificCat.toLowerCase());
          const matchesSkills = skills.some(skill =>
            skill.toLowerCase().includes(specificCat.toLowerCase())
          );
          return matchesCategory || matchesTitle || matchesSkills;
        });

        return !matchesAnySpecificCategory;
      });
      setFilteredFreelancers(filtered);
    } else {
      const filtered = allFreelancers.filter((freelancer) => {
        const skillCategory = freelancer.skillCategory?.toLowerCase() || '';
        const professionalTitle = freelancer.professionalTitle?.toLowerCase() || '';
        const skills = freelancer.skills || [];

        const matchesCategory = skillCategory === category.toLowerCase();
        const matchesTitle = professionalTitle.includes(category.toLowerCase());
        const matchesSkills = skills.some(skill =>
          skill.toLowerCase().includes(category.toLowerCase())
        );

        return matchesCategory || matchesTitle || matchesSkills;
      });
      setFilteredFreelancers(filtered);
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#FBFAF7] px-4 py-16 md:px-8 md:py-24">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 opacity-60"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(0,86,76,0.06) 0%, rgba(251,158,1,0.04) 45%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto mb-10 max-w-xl text-center">
        <div className="mb-3 inline-flex items-center gap-2">
          <span className="h-px w-6 bg-[#FB9E01]" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FB9E01]">
            Top talent
          </p>
          <span className="h-px w-6 bg-[#FB9E01]" />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-[#0B1F1C] md:text-3xl">
          Hire a freelancer
        </h2>
        <p className="text-sm text-gray-500 md:text-base">
          Find the right talent. Start your project. Watch your vision come alive.
        </p>
      </div>

      <div
        className="relative mx-auto mb-10 flex max-w-5xl gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryFilter(category)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 md:text-sm ${
              activeCategory === category
                ? "border-[#00564C] bg-[#00564C] text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-600 hover:border-[#00564C]/40 hover:text-[#00564C]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-6">
        {loading ? (
          Array(12)
            .fill()
            .map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="aspect-[3/4.2] animate-pulse rounded-2xl bg-gray-100"
              />
            ))
        ) : filteredFreelancers.length === 0 ? (
          <div className="col-span-full flex h-72 items-center justify-center text-center text-gray-500">
            <div>
              <p className="mb-1 text-base font-medium">No freelancers found for this category</p>
              <p className="text-sm text-gray-400">Try a different category or check back later</p>
            </div>
          </div>
        ) : (
          filteredFreelancers.map((freelancer) => (
            <FreelancerCard
              key={freelancer.uid || freelancer.id}
              userId={freelancer.uid || freelancer.id}
              name={freelancer.fullName || "Unknown"}
              title={
                freelancer.professionalTitle ||
                freelancer.skillCategory ||
                "Skilled Professional"
              }
              rating={freelancer.averageRating || 0}
              reviews={freelancer.totalReviews || 0}
              hourlyRate={freelancer.hourlyRate || "Negotiable"}
              image={
                freelancer.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancer.fullName || "User")}`
              }
            />
          ))
        )}
      </div>
    </div>
  );
}