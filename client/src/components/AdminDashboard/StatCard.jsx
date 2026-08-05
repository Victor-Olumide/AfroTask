import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl p-5 border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] transition group"
    >
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition ${gradient}`} />
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${gradient} bg-opacity-20`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-3xl font-bold text-white mb-1">{value ?? <span className="text-gray-600">—</span>}</p>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
    </motion.div>
  );
}
