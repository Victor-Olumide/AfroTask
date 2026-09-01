import Footer from "../components/Footer";
import CategoryMarquee from "../components/landing/CategoryMarquee";
import FreelancerHireSection from "../components/landing/FreelancerHireSection";
import WhyAfroTaskFeatures from "../components/landing/WhyAfroTaskFeatures";
import CTA from "../components/landing/CTA";
import WhyAfroTaskSection from "../components/landing/WhyAfroTaskSection";
import BuiltForSpeedSection from "../components/landing/BuiltForSpeedSection";
import StuckVibeSection from "../components/landing/StuckVibeSection";
import AppReviews from "../components/landing/AppReviews";
import WhiteNavbar from "../components/navbar/WhiteNavbar";
import HeroSection from "../components/landing/HeroSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#00564C] relative text-white">
      <WhiteNavbar />
      <HeroSection />
      <CategoryMarquee />

      <section className="bg-white flex justify-center items-center p-4 md:p-10 overflow-visible flex-col gap-y-8 md:gap-y-12">
        <WhyAfroTaskSection />
        <FreelancerHireSection />
        <StuckVibeSection />
      </section>

      <BuiltForSpeedSection />

      <AppReviews />

      <WhyAfroTaskFeatures />
      <CTA />
      <Footer />
    </div>
  );
}