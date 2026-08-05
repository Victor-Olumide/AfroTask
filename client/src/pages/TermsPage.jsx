import React, { useState, useEffect } from 'react';
import WhiteNavbar from '../components/navbar/WhiteNavbar';
import Footer from '../components/Footer';
import { FaArrowRightLong } from "react-icons/fa6";
import { 
  FileText, ShieldCheck, Briefcase, CreditCard, 
  Users, UserCheck, Scale, Lock, AlertCircle, 
  Ban, Gavel, Mail
} from "lucide-react";

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState("acceptance");

  // Optional: Highlight sidebar link based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      const scrollY = window.scrollY;
      
      sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 150;
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          setActiveSection(section.getAttribute("id"));
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "acceptance", label: "Acceptance" },
    { id: "accounts", label: "Accounts" },
    { id: "services", label: "Services" },
    { id: "payments", label: "Payments & Fees" },
    { id: "freelancer-obligations", label: "Freelancer Duties" },
    { id: "client-obligations", label: "Client Duties" },
    { id: "projects", label: "Projects & Disputes" },
    { id: "ip-rights", label: "IP Rights" },
    { id: "termination", label: "Termination" },
    { id: "liability", label: "Liability" },
    { id: "governing", label: "Governing Law" },
    { id: "contact", label: "Contact" }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans scroll-smooth">
      <WhiteNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#00564C] to-[#023E37] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/img/tm.png')] bg-cover bg-center bg-no-repeat mix-blend-overlay"></div>
        
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#FB9E01]/10 blur-3xl"></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-8">
            <ShieldCheck className="w-4 h-4 text-[#FB9E01]" />
            Legal Agreement
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-emerald-50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed opacity-90 mb-8">
            Please read these terms carefully before using the AfroTask platform. They govern your rights and responsibilities.
          </p>
          <div className="text-sm font-medium text-emerald-100/80">
            Last Updated: March 1, 2026
          </div>
        </div>
      </section>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Navigation */} 
          <aside className="lg:w-72 flex-shrink-0 sticky top-4">
            <div className="lg:sticky lg:top-32 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">
                Contents
              </h2>
              {/* Horizontal scroll on mobile, vertical on desktop */}
              <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
                {navLinks.map((link) => (
                  <a 
                    key={link.id}
                    href={`#${link.id}`} 
                    className={`whitespace-nowrap lg:whitespace-normal py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeSection === link.id 
                        ? "bg-[#00564C]/10 text-[#00564C] shadow-sm" 
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
            <div className="prose prose-slate max-w-none">
              
              <section id="acceptance" className="scroll-mt-32 mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-50 rounded-xl text-[#00564C]">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 m-0">1. Acceptance of Terms</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  These Terms of Service ("Terms") govern your access to and use of AfroTask ("Platform," "we," "us"). 
                  By registering for an account, accessing, or using the Platform, you agree to be bound by these Terms and our <a href="/policy" className="text-[#00564C] font-semibold hover:underline">Privacy Policy</a>. If you do not agree, you must not use our services.
                </p>
              </section>

              <section id="accounts" className="scroll-mt-32 mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-50 rounded-xl text-[#00564C]">
                    <Users className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 m-0">2. Accounts & Eligibility</h2>
                </div>
                <ul className="space-y-4 text-gray-600 text-lg list-none pl-0">
                  <li className="flex gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FB9E01] flex-shrink-0"></span>
                    <span>You must be at least 18 years old and legally capable of forming binding contracts.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FB9E01] flex-shrink-0"></span>
                    <span>You agree to provide accurate, current, and complete information during registration and keep your account secure.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FB9E01] flex-shrink-0"></span>
                    <span>Users must choose a primary role (Freelancer or Client). Creating multiple accounts to manipulate the system is strictly prohibited.</span>
                  </li>
                </ul>
              </section>

              <section id="services" className="scroll-mt-32 mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-50 rounded-xl text-[#00564C]">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 m-0">3. Services</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">For Freelancers</h3>
                    <p className="text-gray-600 leading-relaxed">Access a global marketplace to browse jobs, submit competitive proposals, showcase your digital portfolio, and manage active projects securely.</p>
                  </div>
                  <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">For Clients</h3>
                    <p className="text-gray-600 leading-relaxed">Post detailed job listings, review vetted proposals, hire top-tier talent, and manage milestone payments with confidence.</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-6 italic">Note: AfroTask provides the matching infrastructure but does not guarantee employment or project outcomes.</p>
              </section>

              <section id="payments" className="scroll-mt-32 mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-50 rounded-xl text-[#00564C]">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 m-0">4. Payments & Fees</h2>
                </div>
                
                <div className="bg-gradient-to-br from-[#fffdfa] to-[#fff8ee] p-8 rounded-2xl border border-[#FB9E01]/20 relative overflow-hidden mb-8">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FB9E01]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="bg-[#FB9E01] text-white text-sm py-1 px-3 rounded-full">10%</span> Platform Fee
                  </h3>
                  <p className="text-gray-700 mb-6">AfroTask charges a standard 10% platform fee on the total value of successfully completed projects to cover escrow and operational costs.</p>
                  
                  <ul className="space-y-3 text-gray-700 font-medium list-none pl-0">
                    <li className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-emerald-600" /> Milestone payments are held securely in escrow.</li>
                    <li className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-emerald-600" /> Funds are released only upon client review and approval.</li>
                    <li className="flex items-center gap-3"><AlertCircle className="w-5 h-5 text-amber-500" /> In the event of a dispute, a mediation fee may apply.</li>
                  </ul>
                </div>
              </section>

              <section id="freelancer-obligations" className="scroll-mt-32 mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-50 rounded-xl text-[#00564C]">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 m-0">5. Freelancer Obligations</h2>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <ul className="space-y-4 text-gray-600 text-lg list-none pl-0">
                    <li className="flex gap-3"><span className="text-[#00564C] font-bold">✓</span> Deliver work on time and exactly to the agreed-upon specifications.</li>
                    <li className="flex gap-3"><span className="text-[#00564C] font-bold">✓</span> Maintain professional, timely communication throughout the project.</li>
                    <li className="flex gap-3"><span className="text-[#00564C] font-bold">✓</span> Protect and respect all client confidential information.</li>
                    <li className="flex gap-3"><span className="text-red-500 font-bold">✕</span> Strictly no plagiarism, AI-generated content (unless requested), or low-quality work.</li>
                  </ul>
                </div>
              </section>

              <section id="client-obligations" className="scroll-mt-32 mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-50 rounded-xl text-[#00564C]">
                    <Users className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 m-0">6. Client Obligations</h2>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <ul className="space-y-4 text-gray-600 text-lg list-none pl-0">
                    <li className="flex gap-3"><span className="text-[#00564C] font-bold">✓</span> Provide clear project requirements, scope, and achievable timelines.</li>
                    <li className="flex gap-3"><span className="text-[#00564C] font-bold">✓</span> Review submissions and approve satisfactory work promptly.</li>
                    <li className="flex gap-3"><span className="text-[#00564C] font-bold">✓</span> Ensure milestones are funded on time to prevent workflow blockages.</li>
                    <li className="flex gap-3"><span className="text-[#00564C] font-bold">✓</span> Provide constructive, professional feedback during revisions.</li>
                  </ul>
                </div>
              </section>

              <div className="grid md:grid-cols-2 gap-12 mb-16">
                <section id="projects" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <Gavel className="w-5 h-5 text-[#FB9E01]" />
                    <h2 className="text-xl font-bold text-gray-900 m-0">7. Disputes</h2>
                  </div>
                  <p className="text-gray-600">Projects are managed via the AfroTask workspace. In case of a dispute, we require a mandatory 7-day mediation period. If unresolved, escrow funds will be refunded proportionally based on work completion and evidence provided.</p>
                </section>

                <section id="ip-rights" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="w-5 h-5 text-[#FB9E01]" />
                    <h2 className="text-xl font-bold text-gray-900 m-0">8. IP Rights</h2>
                  </div>
                  <p className="text-gray-600">Clients gain full ownership of deliverables immediately upon milestone payment. Freelancers retain the right to display anonymized work in their portfolios unless an NDA is signed. AfroTask retains a non-exclusive license to platform-generated content.</p>
                </section>
              </div>

              <div className="grid md:grid-cols-2 gap-12 mb-16">
                <section id="termination" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <Ban className="w-5 h-5 text-red-500" />
                    <h2 className="text-xl font-bold text-gray-900 m-0">9. Termination</h2>
                  </div>
                  <p className="text-gray-600">We reserve the right to suspend or terminate accounts for severe TOS violations immediately. For voluntary termination, a 30-day notice is standard, and all open projects must be completed or settled via escrow refunds.</p>
                </section>

                <section id="liability" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <Scale className="w-5 h-5 text-gray-900" />
                    <h2 className="text-xl font-bold text-gray-900 m-0">10. Liability & Law</h2>
                  </div>
                  <p className="text-gray-600">The platform is provided "as is." Our maximum liability is limited to 3 months of fees paid. These terms are governed by the laws of Nigeria. Any legal disputes will be handled exclusively in the courts of Lagos.</p>
                </section>
              </div>

              <hr className="my-12 border-gray-100" />

              <section id="contact" className="scroll-mt-32 text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-[#00564C] mb-6">
                  <Mail className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Need clarification?</h2>
                <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                  Our legal and support teams are available to help you understand your rights on AfroTask. We respond to all inquiries within 24 hours.
                </p>
                
                <a 
                  href="/contact" 
                  className="inline-flex items-center justify-center gap-3 text-white bg-[#00564C] hover:bg-[#023E37] py-4 px-10 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-lg shadow-emerald-900/20"
                >
                  Contact Support <FaArrowRightLong />
                </a>
                
                <p className="mt-8 text-sm text-gray-500">
                  For data protection inquiries, please see our <a href="/policy" className="text-[#00564C] font-semibold hover:underline">Privacy Policy</a>.
                </p>
              </section>

            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}