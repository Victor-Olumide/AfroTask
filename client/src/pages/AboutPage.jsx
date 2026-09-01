import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Video, MessageCircle, ShieldCheck, Layers, Zap,
  UserCheck, Briefcase, ArrowRight, Star, ChevronDown
} from 'lucide-react';
import WhiteNavbar from '../components/navbar/WhiteNavbar';
import Footer from '../components/Footer';

// Reusable fade-in-on-scroll wrapper
function FadeIn({ children, delay = 0, direction = 'up', className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0 },
  };
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children, light = false }) {
  return (
    <div className="mb-3 inline-flex items-center gap-2">
      <span className="h-px w-6 bg-[#FB9E01]" />
      <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${light ? 'text-[#FFC978]' : 'text-[#FB9E01]'}`}>
        {children}
      </p>
      <span className="h-px w-6 bg-[#FB9E01]" />
    </div>
  );
}

const features = [
  { icon: Video, title: 'Video-Based Identity', desc: 'Freelancers introduce themselves through video, giving clients a real sense of who they are before hiring.' },
  { icon: MessageCircle, title: 'Real-Time Communication', desc: 'Built-in messaging keeps clients and freelancers connected throughout every project.' },
  { icon: ShieldCheck, title: 'Transparent Hiring', desc: 'Every step of the hiring process is visible — no hidden fees, no surprises.' },
  { icon: Layers, title: 'Project-Based Discovery', desc: 'Browse real projects and find talent matched to your exact needs.' },
  { icon: Zap, title: 'Smart Matching System', desc: 'Our ranking engine surfaces the best freelancers based on skills, ratings, and performance.' },
];

const steps = [
  { num: '01', icon: UserCheck, title: 'Sign Up', desc: 'Create your account as a freelancer or client in minutes.' },
  { num: '02', icon: Briefcase, title: 'Build Your Profile', desc: 'Showcase your skills, portfolio, and intro video to stand out.' },
  { num: '03', icon: Layers, title: 'Discover or Post Jobs', desc: 'Clients post projects; freelancers browse and apply instantly.' },
  { num: '04', icon: MessageCircle, title: 'Connect & Work', desc: 'Chat, agree on terms, and deliver great work together.' },
];

const pillFeatures = [
  {
    icon: Zap,
    title: 'Built for Speed',
    desc: 'From posting a project to hiring, every step is optimized. Proposals land fast, and you can be working with talent within minutes — not weeks.',
  },
  {
    icon: Layers,
    title: 'A Growing Network',
    desc: 'Tap into a purpose-driven community of African freelancers ready to deliver — across web development, design, writing, and dozens of other categories.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent & Fair',
    desc: 'See exactly who you\'re hiring before you commit. A two-way review system keeps quality high and holds both clients and freelancers to the same standard.',
  },
];

const faqs = [
  {
    q: 'How do I get started on AfroTask?',
    a: 'Sign up as a freelancer or client in minutes, build your profile with your skills or project needs, and you can start browsing or posting immediately.',
  },
  {
    q: 'Is AfroTask free to join?',
    a: 'Yes, creating an account is completely free for both freelancers and clients. You only pay when you hire or complete paid work.',
  },
  {
    q: 'How are freelancers verified?',
    a: 'Freelancers introduce themselves through video and build out a full profile with portfolio work, so clients can see real proof of skill before hiring.',
  },
  {
    q: 'How do payments work?',
    a: 'Clients and freelancers agree on terms directly through the platform. We\'re continuously improving payment protection as AfroTask grows.',
  },
  {
    q: 'Can I work with clients outside Nigeria?',
    a: 'Yes. AfroTask is built for Africa but welcomes clients and freelancers working across borders and beyond the continent.',
  },
];

function FAQItem({ faq, isOpen, onClick }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm font-semibold text-[#0B1F1C] md:text-base">{faq.q}</span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            isOpen ? 'rotate-180 bg-[#00564C]' : 'bg-gray-100'
          }`}
        >
          <ChevronDown className={`h-4 w-4 transition-colors duration-300 ${isOpen ? 'text-white' : 'text-[#00564C]'}`} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-10 text-sm leading-relaxed text-gray-500">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AboutPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-gray-900">
      <WhiteNavbar />

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(135deg, #00453D 0%, #00564C 45%, #027568 100%)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, #FB9E01 0%, transparent 45%), radial-gradient(circle at 85% 80%, #ffffff 0%, transparent 45%)' }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-14 px-6 py-24 lg:flex-row lg:py-32">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#FB9E01]" />
              About AfroTask
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
            >
              Connecting talent<br />
              <span className="text-[#FB9E01]">with opportunity</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mb-8 max-w-xl text-lg text-white/75 md:text-xl lg:mx-0"
            >
              AfroTask is Africa's freelance marketplace built to bridge the gap between skilled professionals and the clients who need them most.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 lg:justify-start"
            >
              <button onClick={() => navigate('/welcome')}
                className="group flex items-center gap-2 rounded-xl bg-[#FB9E01] px-8 py-3.5 font-semibold text-[#3D2600] shadow-[0_16px_32px_-12px_rgba(251,158,1,0.5)] transition-all duration-300 hover:scale-105 hover:bg-[#FFB020]">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button onClick={() => navigate('/explore-projects')}
                className="rounded-xl border border-white/25 bg-white/5 px-8 py-3.5 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/15">
                Explore Projects
              </button>
            </motion.div>
          </div>

          {/* Hero images — 2×2 grid */}
          <div className="grid flex-1 grid-cols-2 items-center justify-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="overflow-hidden rounded-2xl shadow-[0_24px_48px_-16px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
            >
              <img src="/img/Ld1.png" alt="AfroTask freelancer" className="h-40 w-full object-cover md:h-52" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-6 overflow-hidden rounded-2xl shadow-[0_24px_48px_-16px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
            >
              <img src="/img/whisk.png" alt="AfroTask work" className="h-40 w-full object-cover md:h-52" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="-mt-6 overflow-hidden rounded-2xl shadow-[0_24px_48px_-16px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
            >
              <img src="/img/fa1.png" alt="AfroTask talent" className="h-40 w-full object-cover md:h-52" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="overflow-hidden rounded-2xl shadow-[0_24px_48px_-16px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
            >
              <img src="/img/cn.png" alt="AfroTask board" className="h-40 w-full object-cover md:h-52" />
            </motion.div>
          </div>
        </div>

        {/* bottom fade into page background */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#FBFAF7]" />
      </section>

      {/* ── Who We Are ── */}
      <section className="relative bg-[#FBFAF7] px-6 py-20 lg:py-28">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-20">
          <FadeIn direction="right" className="flex-1">
            <div className="relative">
              <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-[#00564C]/10 to-[#FB9E01]/10" />
              <img src="/img/mr_tope.png" alt="Who we are" className="max-h-[480px] w-full rounded-3xl object-cover shadow-xl" />
            </div>
          </FadeIn>
          <FadeIn direction="left" delay={0.15} className="flex-1">
            <Eyebrow>Who we are</Eyebrow>
            <h2 className="mb-6 text-3xl font-bold leading-tight text-[#0B1F1C] md:text-4xl">
              Built for Africa,<br />by Africans
            </h2>
            <p className="mb-5 text-lg leading-relaxed text-gray-600">
              AfroTask was born from a simple observation: Africa is full of world-class talent, but the tools to connect that talent with real opportunities were built for someone else.
            </p>
            <p className="mb-5 text-lg leading-relaxed text-gray-600">
              We built AfroTask to change that. A platform where freelancers can showcase their real skills, clients can find the right person fast, and both sides can work together with full transparency.
            </p>
            <p className="text-lg leading-relaxed text-gray-600">
              Whether you're a developer in Lagos, a designer in Nairobi, or a startup founder in Accra — AfroTask is your home.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Why AfroTask (3-card) ── */}
      <section className="bg-[#FBFAF7] px-6 pb-20 lg:pb-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-3">
          {pillFeatures.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.1} className="h-full">
              <div className="group relative h-full rounded-2xl border border-black/[0.06] bg-white p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#00564C]/15 hover:shadow-[0_16px_32px_-16px_rgba(0,86,76,0.18)]">
                <span className="absolute inset-x-8 top-0 h-[3px] scale-x-0 rounded-full bg-gradient-to-r from-[#FB9E01] to-[#00564C] transition-transform duration-300 ease-out group-hover:scale-x-100" />
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#00564C]">
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-[#0B1F1C]">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── What Makes Us Different ── */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-28">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-60"
          style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(0,86,76,0.06) 0%, rgba(251,158,1,0.04) 45%, transparent 80%)' }}
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <FadeIn className="mb-14 text-center">
            <Eyebrow>Our edge</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-[#0B1F1C] md:text-4xl">What makes us different</h2>
          </FadeIn>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.08} className="h-full">
                <div className="group relative h-full rounded-2xl border border-black/[0.06] bg-white p-7 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#00564C]/15 hover:shadow-[0_16px_32px_-16px_rgba(0,86,76,0.18)]">
                  <span className="absolute inset-x-7 top-0 h-[3px] scale-x-0 rounded-full bg-gradient-to-r from-[#FB9E01] to-[#00564C] transition-transform duration-300 ease-out group-hover:scale-x-100" />
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#00564C]/10 transition-colors duration-300 group-hover:bg-[#00564C]">
                    <f.icon className="h-6 w-6 text-[#00564C] transition-colors duration-300 group-hover:text-white" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-[#0B1F1C]">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="bg-[#FBFAF7] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn className="mb-14 text-center">
            <Eyebrow>Purpose</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-[#0B1F1C] md:text-4xl">Mission &amp; vision</h2>
          </FadeIn>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <FadeIn direction="right">
              <div className="relative h-full overflow-hidden rounded-3xl p-10"
                style={{ background: 'linear-gradient(135deg, #00453D 0%, #00564C 45%, #027568 100%)' }}>
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                  }}
                />
                <div className="absolute right-0 top-0 h-40 w-40 -translate-y-10 translate-x-10 rounded-full bg-white/5" />
                <div className="relative">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                    <Star className="h-7 w-7 text-[#FB9E01]" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-white">Our Mission</h3>
                  <p className="text-lg leading-relaxed text-white/80">
                    To help people find opportunities and grow through real work — by building a platform where talent is recognized, rewarded, and connected to those who need it most.
                  </p>
                </div>
              </div>
            </FadeIn>
            <FadeIn direction="left" delay={0.15}>
              <div className="relative h-full overflow-hidden rounded-3xl p-10"
                style={{ background: 'linear-gradient(135deg, #CC8102 0%, #FB9E01 100%)' }}>
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                  }}
                />
                <div className="absolute right-0 top-0 h-40 w-40 -translate-y-10 translate-x-10 rounded-full bg-white/10" />
                <div className="relative">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                    <Zap className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-white">Our Vision</h3>
                  <p className="text-lg leading-relaxed text-white/90">
                    To build the most transparent freelance marketplace in the world — starting from Africa, and growing into a global standard for how work gets done.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-28">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-60"
          style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(0,86,76,0.06) 0%, rgba(251,158,1,0.04) 45%, transparent 80%)' }}
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <FadeIn className="mb-14 text-center">
            <Eyebrow>Simple process</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-[#0B1F1C] md:text-4xl">How it works</h2>
          </FadeIn>
          <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Connector line (desktop only) */}
            <div className="absolute left-[12.5%] right-[12.5%] top-10 z-0 hidden h-0.5 bg-gradient-to-r from-[#00564C] to-[#FB9E01] lg:block" />
            {steps.map((s, i) => (
              <FadeIn key={s.num} delay={i * 0.1} className="relative z-10 h-full">
                <div className="group h-full rounded-2xl border border-black/[0.06] bg-white p-7 text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#00564C]/15 hover:shadow-[0_16px_32px_-16px_rgba(0,86,76,0.18)]">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#00564C] shadow-[0_12px_24px_-8px_rgba(0,86,76,0.5)] transition-transform duration-300 group-hover:scale-110">
                    <s.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-black tracking-widest text-[#FB9E01]">{s.num}</span>
                  <h3 className="mb-2 mt-1 text-lg font-bold text-[#0B1F1C]">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="bg-[#FBFAF7] py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <FadeIn>
            <Eyebrow>The team</Eyebrow>
            <h2 className="mb-14 text-3xl font-bold tracking-tight text-[#0B1F1C] md:text-4xl">The people behind AfroTask</h2>
          </FadeIn>

          {/* Founder — centered, larger */}
          <FadeIn delay={0.1} className="mb-10 flex justify-center">
            <div className="group flex w-full max-w-sm flex-col items-center rounded-3xl border border-black/[0.06] bg-white p-10 shadow-[0_1px_2px_rgba(16,24,22,0.04),0_16px_40px_-16px_rgba(16,24,22,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(0,86,76,0.2)]">
              <div className="mb-6 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#00564C] to-[#027568] p-1 shadow-lg">
                <img src="/img/mr_tope.png" alt="Founder" className="h-full w-full rounded-full object-cover" />
              </div>
              <h3 className="mb-1 text-xl font-bold text-[#0B1F1C]">Tope Adeosun</h3>
              <p className="mb-4 text-sm font-semibold text-[#FB9E01]">Founder of AfroTask</p>
              <p className="text-center text-sm leading-relaxed text-gray-500">
                Visionary behind AfroTask — driven by a mission to unlock Africa's talent potential and create a transparent, opportunity-rich freelance ecosystem across the continent.
              </p>
            </div>
          </FadeIn>

          {/* Dev team — side by side */}
          <div className="mx-auto grid max-w-2xl grid-cols-1 justify-between gap-6 sm:grid-cols-2">
            <FadeIn delay={0.15}>
              <div className="flex h-full flex-col items-center rounded-2xl border border-black/[0.06] bg-white p-8 shadow-[0_1px_2px_rgba(16,24,22,0.04),0_12px_32px_-16px_rgba(16,24,22,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(0,86,76,0.18)]">
                <div className="mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#00564C] to-[#027568] p-0.5 shadow-md">
                  <img src="/img/mba.png" alt="dev" className="h-full w-full rounded-full object-cover" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-[#0B1F1C]">Mbata Blessing</h3>
                <p className="mb-3 text-sm font-medium text-[#00564C]">Lead Developer</p>
                <p className="text-center text-sm leading-relaxed text-gray-500">
                  Responsible for building the full AfroTask application — from architecture to deployment.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="flex h-full flex-col items-center rounded-2xl border border-black/[0.06] bg-white p-8 shadow-[0_1px_2px_rgba(16,24,22,0.04),0_12px_32px_-16px_rgba(16,24,22,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(251,158,1,0.2)]">
                <div className="mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#FB9E01] to-[#CC8102] p-0.5 shadow-md">
                  <img src="/img/vo.png" alt="dev" className="h-full w-full rounded-full object-cover" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-[#0B1F1C]">Victor Olumide</h3>
                <p className="mb-3 text-sm font-medium text-[#FB9E01]">Frontend Developer</p>
                <p className="text-center text-sm leading-relaxed text-gray-500">
                  Crafting the user-facing experience — ensuring AfroTask looks and feels world-class on every device.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <FadeIn className="mb-12 text-center">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-[#0B1F1C] md:text-4xl">Got questions?</h2>
            <p className="mt-3 text-gray-500">Everything you need to know before you get started.</p>
          </FadeIn>

          <FadeIn delay={0.1} className="rounded-2xl border border-black/[0.06] bg-white px-6 shadow-[0_1px_2px_rgba(16,24,22,0.04),0_12px_32px_-16px_rgba(16,24,22,0.10)] md:px-8">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                faq={faq}
                isOpen={openFaq === i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </FadeIn>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#FBFAF7] px-4 py-16 md:px-8 lg:py-24">
        <FadeIn>
          <div
            className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl px-6 py-16 text-center md:py-20"
            style={{ background: 'linear-gradient(135deg, #00453D 0%, #00564C 45%, #027568 100%)' }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 12% 15%, #FB9E01 0%, transparent 40%), radial-gradient(circle at 88% 85%, #ffffff 0%, transparent 45%)' }}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                backgroundSize: '56px 56px',
              }}
            />
            <div className="relative mx-auto max-w-2xl">
              <Eyebrow light>Get started today</Eyebrow>
              <h2 className="mb-6 text-3xl font-bold leading-tight text-white md:text-5xl">
                Start your journey with<br />
                <span className="text-[#FB9E01]">AfroTask today</span>
              </h2>
              <p className="mb-10 text-lg text-white/70">
                Join thousands of freelancers and clients already building the future of work in Africa.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button onClick={() => navigate('/welcome')}
                  className="group flex items-center gap-2 rounded-xl bg-[#FB9E01] px-10 py-4 text-lg font-semibold text-[#3D2600] shadow-[0_16px_32px_-12px_rgba(251,158,1,0.5)] transition-all duration-300 hover:scale-105 hover:bg-[#FFB020]">
                  Sign Up Free
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <button onClick={() => navigate('/explore-projects')}
                  className="rounded-xl border border-white/25 bg-white/5 px-10 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/15">
                  Explore Projects
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
}