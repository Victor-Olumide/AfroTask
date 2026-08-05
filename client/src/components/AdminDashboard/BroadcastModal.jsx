import { useState } from 'react';
import { X, Send, Megaphone } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function BroadcastModal({ onClose, prefillUserId = null, prefillUserName = null }) {
  const [form, setForm] = useState({ subject: '', message: '', targetRole: 'all' });
  const [sending, setSending] = useState(false);
  const isDirect = !!prefillUserId;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) { toast.error('Message is required'); return; }
    setSending(true);
    try {
      if (isDirect) {
        await api.post(`/admin/message/${prefillUserId}`, { subject: form.subject, message: form.message });
        toast.success(`Message sent to ${prefillUserName || 'user'}!`);
      } else {
        const res = await api.post('/admin/broadcast', form);
        toast.success(`Broadcast sent to ${res.data.sent} users!`);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              {isDirect ? <Send className="w-4 h-4 text-yellow-400" /> : <Megaphone className="w-4 h-4 text-yellow-400" />}
            </div>
            <h2 className="text-white font-bold text-lg">
              {isDirect ? `Message ${prefillUserName || 'User'}` : 'Broadcast to Users'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSend} className="p-5 space-y-4">
          {!isDirect && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Target Audience</label>
              <select
                value={form.targetRole}
                onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-[#00564C] text-sm"
              >
                <option value="all">All Users</option>
                <option value="freelancer">Freelancers Only</option>
                <option value="client">Clients Only</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject (optional)</label>
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Message from AfroTask Admin"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#00564C] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              placeholder="Write your message here..."
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#00564C] resize-none text-sm"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 text-sm transition">
              Cancel
            </button>
            <button type="submit" disabled={sending} className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-xl text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
              {sending && <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
              {sending ? 'Sending...' : isDirect ? 'Send Message' : 'Broadcast'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
