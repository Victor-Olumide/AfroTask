import { useState, useRef } from 'react';
import { Image as ImageIcon, Code2, Link2, Send } from 'lucide-react';


const PostComposer = ({ user, onSubmit = () => {}, submitting = false }) => {
  const [text, setText] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [jobLink, setJobLink] = useState('');
  const [showJobInput, setShowJobInput] = useState(false);
  const fileInputRef = useRef(null);

  const initials = (user?.fullName || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const canSubmit = text.trim().length > 0 || code.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit || submitting) return;
    onSubmit({ text: text.trim(), code: code.trim() || null, imageFile, jobLink: jobLink.trim() || null });
    setText('');
    setCode('');
    setShowCode(false);
    setImageFile(null);
    setJobLink('');
    setShowJobInput(false);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center text-sm font-semibold shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share an update, ask a question, or post a job..."
            rows={2}
            className="w-full resize-none text-sm text-gray-900 placeholder-gray-400 outline-none"
          />

          {showCode && (
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code snippet..."
              rows={4}
              spellCheck={false}
              className="w-full mt-2 resize-none text-xs font-mono text-gray-100 bg-gray-900 rounded-lg p-3 outline-none"
            />
          )}

          {imageFile && (
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" /> {imageFile.name}
              <button onClick={() => setImageFile(null)} className="text-red-500 hover:underline">
                remove
              </button>
            </div>
          )}

          {showJobInput && (
            <input
              type="url"
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              placeholder="Paste job link or job ID"
              className="w-full mt-2 text-sm px-3 py-1.5 bg-gray-50 rounded-lg outline-none border border-transparent focus:border-gray-200"
            />
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                aria-label="Add image"
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
              >
                <ImageIcon className="w-[18px] h-[18px]" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />

              <button
                onClick={() => setShowCode((v) => !v)}
                aria-label="Toggle code snippet"
                className={`p-2 rounded-lg transition ${
                  showCode ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <Code2 className="w-[18px] h-[18px]" />
              </button>

              <button
                onClick={() => setShowJobInput((v) => !v)}
                aria-label="Attach job link"
                className={`p-2 rounded-lg transition ${
                  showJobInput ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <Link2 className="w-[18px] h-[18px]" />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostComposer;