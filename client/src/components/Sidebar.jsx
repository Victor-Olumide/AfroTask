import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Calendar,
  Download,
  ChevronDown,
  Clock,
  Wallet,
  X
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/navbar/Navbar';
import Sidebar from '../components/Sidebar';

const BRAND = '#00564C';
const BRAND_DARK = '#00423A';

const WalletPage = () => {
  const { user } = useContext(AuthContext);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');

  const presets = ['5,000', '10,000', '50,000'];

  return (
    <div className="flex min-h-screen bg-gray-50 dashboard-page">
      {/* Sidebar handles its own desktop-persistent + mobile-drawer rendering,
          including the mobile hamburger trigger. */}
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <Navbar />

        <main className="max-w-6xl w-full mx-auto flex-1 flex flex-col">
          {/* Sticky Header */}
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between gap-10">
            <div className="mb-2">
              <p style={{ color: BRAND }} className="text-[13px] font-bold tracking-widest mb-1">
                EARNINGS
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Your wallet</h1>
              <p className="text-xs text-gray-500 mt-2">Cash out your earnings anytime to your bank.</p>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-4 py-2 text-[11px] font-bold tracking-wide text-gray-600">
                AVAILABLE
                <span
                  style={{ borderColor: BRAND, color: BRAND }}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                >
                  K
                </span>
                <span>0</span>
              </div>
              <button
                onClick={() => setShowWithdraw(true)}
                style={{ backgroundColor: BRAND }}
                className="flex items-center gap-1.5 hover:opacity-90 transition text-white font-semibold text-xs rounded-full px-4 py-2 shadow-sm"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Withdraw
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {/* Mobile available + withdraw row */}
            <div className="flex sm:hidden items-center justify-between mb-4">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5 text-[11px] font-bold text-gray-600">
                AVAILABLE
                <span
                  style={{ borderColor: BRAND, color: BRAND }}
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] font-bold"
                >
                  K
                </span>
                0
              </div>
              <button
                onClick={() => setShowWithdraw(true)}
                style={{ backgroundColor: BRAND }}
                className="flex items-center gap-1.5 hover:opacity-90 transition text-white font-semibold text-xs rounded-full px-4 py-2"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Withdraw
              </button>
            </div>

            {/* Earnings card */}
            <div
              style={{ backgroundColor: BRAND }}
              className="relative overflow-hidden rounded-2xl text-white p-6 sm:p-8 mb-8 shadow-sm"
            >
              {/* subtle decorative watermark, brand-tinted */}
              <Wallet className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5" />

              <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                  <p className="text-[11px] font-bold tracking-widest text-white/70 mb-3">
                    AVAILABLE TO WITHDRAW
                  </p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold">
                      K
                    </span>
                    <span className="text-4xl sm:text-5xl font-extrabold">0</span>
                  </div>
                  <p className="text-xs font-semibold text-white/70 mb-6">≈ ₦0</p>
                  <button
                    onClick={() => setShowWithdraw(true)}
                    className="flex items-center gap-1.5 bg-white hover:bg-white/90 transition font-semibold text-xs rounded-full px-4 py-2"
                    style={{ color: BRAND }}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Withdraw
                  </button>
                </div>

                <div className="bg-white/10 rounded-xl p-4 min-w-[200px]">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-white/70 mb-3">
                    <Clock className="w-3.5 h-3.5" />
                    PENDING EARNINGS
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">
                      K
                    </span>
                    <span className="text-2xl font-extrabold">0</span>
                  </div>
                  <p className="text-xs font-semibold text-white/70 mb-1">≈ ₦0</p>
                  <p className="text-[11px] font-medium text-white/60">Awaiting approval</p>
                </div>
              </div>
            </div>

            {/* Recent transactions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <h2 className="text-sm font-bold text-gray-900">Recent transactions</h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition text-xs font-semibold text-gray-700 rounded-full px-3.5 py-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Filter by date
                </button>
                <button className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition text-xs font-semibold text-gray-700 rounded-full px-3.5 py-2">
                  <Download className="w-3.5 h-3.5" />
                  Download Statement
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100">
              <p className="text-center text-gray-400 text-xs py-16">No transactions yet</p>
            </div>
          </div>
        </main>
      </div>

      {/* Withdraw modal */}
      <AnimatePresence>
        {showWithdraw && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWithdraw(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div style={{ backgroundColor: `${BRAND}1A` }} className="w-9 h-9 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" style={{ color: BRAND }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-none mb-1 text-gray-900">Withdraw</p>
                    <p className="text-gray-500 text-xs">Enter amount</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWithdraw(false)}
                  className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="flex gap-1.5 mb-6">
                <div style={{ backgroundColor: BRAND }} className="h-1 flex-1 rounded-full" />
                <div className="h-1 flex-1 rounded-full bg-gray-100" />
                <div className="h-1 flex-1 rounded-full bg-gray-100" />
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
                <p className="text-[11px] font-bold tracking-widest text-gray-500 mb-2">AMOUNT TO WITHDRAW</p>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    style={{ borderColor: BRAND, color: BRAND }}
                    className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0"
                  >
                    K
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="bg-transparent text-2xl font-bold outline-none w-full placeholder-gray-300 text-gray-900"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Available: <span style={{ color: BRAND }} className="font-semibold">K0</span>
                </p>
              </div>

              <div className="flex items-center gap-2 mb-6">
                {presets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setAmount(p.replace(/,/g, ''))}
                    className="flex-1 bg-white border border-gray-200 hover:border-current transition text-xs font-semibold text-gray-700 rounded-full py-2.5 px-2"
                  >
                    K{p}
                  </button>
                ))}
                <button
                  onClick={() => setAmount('0')}
                  style={{ backgroundColor: BRAND }}
                  className="flex-1 text-white text-xs font-bold rounded-full py-2.5 px-2"
                >
                  Max
                </button>
              </div>

              <button
                disabled={!amount || Number(amount) <= 0}
                style={{ backgroundColor: BRAND }}
                onMouseEnter={(e) => { if (amount && Number(amount) > 0) e.currentTarget.style.backgroundColor = BRAND_DARK; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = BRAND; }}
                className="w-full flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition text-white font-semibold text-sm rounded-full py-3"
              >
                Continue
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletPage;