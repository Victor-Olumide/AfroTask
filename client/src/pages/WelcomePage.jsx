import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Users, ShieldCheck } from 'lucide-react';
import * as THREE from 'three';
import WhiteNavbar from '../components/navbar/WhiteNavbar';

const BRAND = '#00564C';
const PARTICLE_COLOR = 0xbfe0d6;

const ParticleField = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 60;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const count = 260;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 140;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 90;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
      speeds[i] = 0.02 + Math.random() * 0.05;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: PARTICLE_COLOR,
      size: 1.15,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let frameId;
    const animate = () => {
      const pos = geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += speeds[i];
        if (pos[i * 3 + 1] > 45) pos[i * 3 + 1] = -45;
      }
      geometry.attributes.position.needsUpdate = true;
      points.rotation.y += 0.0006;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
};

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <WhiteNavbar />

      <div
        className="relative overflow-hidden pt-16 lg:pt-24"
        style={{ backgroundColor: BRAND }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <ParticleField />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pb-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <span className="inline-block text-xs font-semibold tracking-wide uppercase mb-5 px-3 py-1 rounded-full bg-white/10 text-white/90">
                AfroTask
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
                Connecting African talent to global opportunities
              </h1>

              <p className="text-lg text-white/70 mb-10 max-w-md mx-auto lg:mx-0">
                Find skilled freelancers or land your next project, all in one place built for the way you work.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
                <button
                  onClick={() => navigate('/signup/freelancer')}
                  className="flex-1 flex items-center justify-center gap-2 font-medium py-3.5 px-6 rounded-lg transition hover:opacity-90"
                  style={{ backgroundColor: '#FFFFFF', color: BRAND }}
                >
                  Sign up as freelancer
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/signup/client')}
                  className="flex-1 flex items-center justify-center gap-2 font-medium py-3.5 px-6 rounded-lg border border-white/30 text-white transition hover:bg-white/10"
                >
                  Hire a talent
                </button>
              </div>

              <p className="mt-8 text-sm text-white/50">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-semibold text-white hover:underline"
                >
                  Log in
                </button>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6 max-w-sm mx-auto">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: BRAND }}
                  >
                    A
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Amara O.</p>
                    <p className="text-xs text-gray-400">Product Designer &middot; Lagos</p>
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-1">UI/UX for fintech mobile app</p>
                  <p className="text-xs text-gray-500">$800 &ndash; $1,200 &middot; Contract</p>
                </div>
                <button
                  className="w-full text-sm font-medium text-white py-2.5 rounded-lg"
                  style={{ backgroundColor: BRAND }}
                >
                  View project
                </button>
              </div>

              <div className="hidden sm:block absolute -bottom-6 -left-6 bg-white rounded-xl border border-gray-100 shadow-lg px-4 py-3">
                <p className="text-xs text-gray-400 mb-0.5">Freelancers onboard</p>
                <p className="text-lg font-bold" style={{ color: BRAND }}>12,400+</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-10">
          {[
            { icon: Users, title: 'Vetted talent', copy: 'Every freelancer profile is reviewed before they can apply to jobs.' },
            { icon: Briefcase, title: 'Real work, fast', copy: 'Post a project or browse open jobs and get moving the same day.' },
            { icon: ShieldCheck, title: 'Built for trust', copy: 'Clear pricing, direct messaging, and no hidden fees on either side.' },
          ].map(({ icon: Icon, title, copy }) => (
            <div key={title}>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${BRAND}0D` }}
              >
                <Icon className="w-5 h-5" style={{ color: BRAND }} />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;