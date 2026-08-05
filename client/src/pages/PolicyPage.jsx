import React, { useState, useEffect } from 'react';
import WhiteNavbar from '../components/navbar/WhiteNavbar';
import Footer from '../components/Footer';
import { FaArrowRightLong } from "react-icons/fa6";
import { 
  ShieldAlert, Database, BarChart, Share2, 
  Lock, UserCheck, Cookie, Scale, RefreshCcw, 
  Mail, CheckCircle2, ShieldCheck, AlertCircle 
} from "lucide-react";

export default function PolicyPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  // Highlight sidebar link based on scroll position
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
    { id: "introduction", label: "Introduction" },
    { id: "data-collection", label: "Data We Collect" },
    { id: "data-use", label: "How We Use Data" },
    { id: "sharing", label: "Data Sharing" },
    { id: "security", label: "Security" },
    { id: "freelancer-specific", label: "Freelancer Data" },
    { id: "cookies", label: "Cookies" },
    { id: "rights", label: "Your Rights" },
    { id: "changes", label: "Changes" },
    { id: "contact", label: "Contact Us" }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans scroll-smooth">
      <WhiteNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#00564C] to-[#023E37] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/img/sk.png')] bg-cover bg-center bg-no-repeat mix-blend-overlay"></div>
        
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#FB9E01]/10 blur-3xl"></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-8">
            <Lock className="w-4 h-4 text-[#FB9E01]" />
            Data Protection
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-emerald-50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed opacity-90 mb-8">
            Your trust is our priority. We protect your data with enterprise-grade security while connecting African talent to global opportunities.
          </p>
          <div className="text-sm font-medium text-emerald-100/80">
            Last Updated: March 1, 2026
          </div>
        </div>
      </section>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Layout container with items-start to prevent stretching */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Sidebar Navigation */}
          <aside className="md:w-64 lg:w-72 flex-shrink-0 md:sticky md:top-32 z-10">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">
                Contents
              </h2>
              <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide">
                {navLinks.map((link) => (
                  <a 
                    key={link.id}
                    href={`#${link.id}`} 
                    className={`whitespace-nowrap md:whitespace-normal py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
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
          <main className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 lg:p-12">
            <div className="prose prose-slate max-w-none">
              
              <section id="introduction" className="scroll-mt-32 mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-50 rounded-xl text-[#00564C]">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 m-0">1. Introduction</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Welcome to AfroTask's Privacy Policy. At AfroTask, we connect talented African freelancers with clients worldwide. 
                  Your privacy matters. This policy explains how we collect, use, share, and protect your information.
                </p>
                <p className="text-gray-600 leading-relaxed text-lg mt-4">
                  By using AfroTask, you agree to this policy. We comply with applicable data protection laws including GDPR for EU users.
                </p>
              </section>

              <section id="data-collection" className="scroll-mt-32 mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-50 rounded-xl text-[#00564C]">
                    <Database className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 m-0">2. Data We Collect</h2>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <ul className="space-y-4 text-gray-600 text-lg list-none pl-0">
                    <li className="flex gap-3"><span className="mt-1.5 w-2 h-2 rounded-full bg-[#FB9E01] flex-shrink-0"></span><span><strong>Account Information:</strong> Name, email, phone, password, role (freelancer/client).</span></li>
                    <li className="flex gap-3"><span className="mt-1.5 w-2 h-2 rounded-full bg-[#FB9E01] flex-shrink-0"></span><span><strong>Profile Data:</strong> Bio, skills, portfolio, location, payment details.</span></li>
                    <li className="flex gap-3"><span className="mt-1.5 w-2 h-2 rounded-full bg-[#FB9E01] flex-shrink-0"></span><span><strong>Job/Project Data:</strong> Proposals, contracts, milestones, reviews.</span></li>
                    <li className="flex gap-3"><span className="mt-1.5 w-2 h-2 rounded-full bg-[#FB9E01] flex-shrink-0"></span><span><strong>Communication:</strong> Messages, notifications, support tickets.</span></li>
                    <li className="flex gap-3"><span className="mt-1.5 w-2 h-2 rounded-full bg-[#FB9E01] flex-shrink-0"></span><span><strong>Usage Data:</strong> IP address, browser type, pages visited.</span></li>
                    <li className="flex gap-3"><span className="mt-1.5 w-2 h-2 rounded-full bg-[#FB9E01] flex-shrink-0"></span><span><strong>Files:</strong> Portfolio images, project deliverables (processed securely via Cloudinary).</span></li>
                  </ul>
                </div>
              </section>

              <section id="data-use" className="scroll-mt-32 mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-50 rounded-xl text-[#00564C]">
                    <BarChart className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 m-0">3. How We Use Data</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mt-8 mb-8">
                  <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Matchmaking</h3>
                    <p className="text-gray-600 leading-relaxed">We use your skills and preferences to intelligently recommend relevant jobs and highly qualified freelancers.</p>
                  </div>
                  <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Payments</h3>
                    <p className="text-gray-600 leading-relaxed">Process transactions securely, manage escrow milestones, and actively prevent platform fraud.</p>
                  </div>
                </div>
                <ul className="space-y-3 text-gray-600 text-lg list-none pl-0">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> Provide, maintain, and improve our platform services.</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> Send essential notifications, alerts, and platform updates.</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> Analyze aggregate usage trends to build better features.</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> Ensure legal compliance and facilitate dispute resolution.</li>
                </ul>
              </section>

              <section id="sharing" className="scroll-mt-32 mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-50 rounded-xl text-[#00564C]">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 m-0">4. Data Sharing</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg mb-6">We never sell your data. We share your information only when absolutely necessary:</p>
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <ul className="space-y-4 text-gray-600 text-lg list-none pl-0">
                    <li className="flex gap-3"><span className="text-[#00564C] font-bold">↳</span> <strong>With freelancers/clients:</strong> Profile information is shared during the job matching and proposal process.</li>
                    <li className="flex gap-3"><span className="text-[#00564C] font-bold">↳</span> <strong>Service providers:</strong> Trusted partners like Firebase, Cloudinary, and secure payment processors.</li>
                    <li className="flex gap-3"><span className="text-[#00564C] font-bold">↳</span> <strong>Legal compliance:</strong> To comply with court orders, valid subpoenas, or strict regulatory requests.</li>
                    <li className="flex gap-3"><span className="text-[#00564C] font-bold">↳</span> <strong>Business transfers:</strong> In the event of a merger, acquisition, or asset sale.</li>
                  </ul>
                </div>
              </section>

              <section id="security" className="scroll-mt-32 mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-50 rounded-xl text-[#00564C]">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 m-0">5. Security</h2>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-2xl border border-emerald-200 relative overflow-hidden mb-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00564C]/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <h3 className="text-xl font-bold text-[#00564C] mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6" /> Enterprise-Grade Protection
                  </h3>
                  
                  <ul className="space-y-3 text-gray-800 font-medium list-none pl-0">
                    <li className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-emerald-600" /> Firebase Authentication & highly encrypted Firestore databases.</li>
                    <li className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-emerald-600" /> End-to-end encryption for sensitive workspace communications.</li>
                    <li className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-emerald-600" /> Multi-factor authentication support for user accounts.</li>
                    <li className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-emerald-600" /> Comprehensive GDPR & CCPA privacy compliance frameworks.</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-500 italic">While we use industry-leading security practices, no digital system is 100% immune to breaches. Please report any suspected security issues immediately to security@afrotask.com.</p>
              </section>

              <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
                <section id="freelancer-specific" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <UserCheck className="w-5 h-5 text-[#FB9E01]" />
                    <h2 className="text-xl font-bold text-gray-900 m-0">6. Freelancer Data</h2>
                  </div>
                  <ul className="space-y-3 text-gray-600 list-none pl-0">
                    <li className="flex items-start gap-2"><span className="text-[#00564C] mt-1">•</span> Portfolio files are encrypted and access-controlled.</li>
                    <li className="flex items-start gap-2"><span className="text-[#00564C] mt-1">•</span> Direct payment details are never exposed to clients.</li>
                    <li className="flex items-start gap-2"><span className="text-[#00564C] mt-1">•</span> Dispute records remain strictly confidential.</li>
                  </ul>
                </section>

                <section id="cookies" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <Cookie className="w-5 h-5 text-[#FB9E01]" />
                    <h2 className="text-xl font-bold text-gray-900 m-0">7. Cookies</h2>
                  </div>
                  <p className="text-gray-600 mb-3">We utilize cookies to maintain core platform functionality and improve user experience:</p>
                  <ul className="space-y-3 text-gray-600 list-none pl-0">
                    <li className="flex items-start gap-2"><span className="text-[#00564C] mt-1">•</span> <strong>Session:</strong> Authentication tracking (cleared on logout).</li>
                    <li className="flex items-start gap-2"><span className="text-[#00564C] mt-1">•</span> <strong>Preference:</strong> UI states like dark mode settings.</li>
                    <li className="flex items-start gap-2"><span className="text-[#00564C] mt-1">•</span> <strong>Analytics:</strong> Fully anonymized usage insights.</li>
                  </ul>
                </section>
              </div>

              <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
                <section id="rights" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <Scale className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-xl font-bold text-gray-900 m-0">8. Your Rights</h2>
                  </div>
                  <ul className="space-y-3 text-gray-600 list-none pl-0">
                    <li className="flex items-start gap-2"><span className="font-semibold text-gray-800">Access:</span> Download a copy of your data at any time.</li>
                    <li className="flex items-start gap-2"><span className="font-semibold text-gray-800">Delete:</span> Request account deletion (subject to a 30-day hold for dispute prevention).</li>
                    <li className="flex items-start gap-2"><span className="font-semibold text-gray-800">Correct:</span> Edit and update inaccurate profile data.</li>
                    <li className="flex items-start gap-2"><span className="font-semibold text-gray-800">Opt-out:</span> Manage marketing emails and non-essential cookies.</li>
                  </ul>
                </section>

                <section id="changes" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <RefreshCcw className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-xl font-bold text-gray-900 m-0">9. Changes</h2>
                  </div>
                  <p className="text-gray-600">We may update this policy periodically to reflect new regulations or platform features. Significant changes will be posted 30 days in advance along with a direct email notification. Continued use constitutes acceptance.</p>
                </section>
              </div>

              <hr className="my-12 border-gray-100" />

              <section id="contact" className="scroll-mt-32 text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-[#00564C] mb-6">
                  <Mail className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions? We're here to help</h2>
                <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                  If you have concerns about your data, our Data Protection Officer is available to assist you.
                </p>
                
                <a 
                  href="/contact" 
                  className="inline-flex items-center justify-center gap-3 text-white bg-[#00564C] hover:bg-[#023E37] py-4 px-10 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-lg shadow-emerald-900/20"
                >
                  Contact DPO <FaArrowRightLong />
                </a>
                
                <p className="mt-8 text-sm text-gray-500">
                  See also our <a href="/terms" className="text-[#00564C] font-semibold hover:underline">Terms of Service</a> for platform rules.
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