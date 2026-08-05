import { IoLogoWhatsapp } from 'react-icons/io'
import { FaFacebook } from 'react-icons/fa'
import { FaSquareThreads, FaSquareXTwitter } from 'react-icons/fa6'

export default function BlogShareBar({ blog, onCopyLink }) {
  const shareUrl = window.location.href

  return (
    <div className="mt-12 mb-16 flex flex-col justify-center items-center font-mono text-sm border-t border-b border-gray-200 py-6">
      <p className="p-2 text-gray-600">Kindly Share this story with others</p>
      <div className="flex flex-row gap-4">

        <button
          onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400')}
          className="p-2 hover:scale-110 transition-transform cursor-pointer"
          title="Share on Facebook"
        >
          <FaFacebook className="text-3xl text-gray-600 hover:text-blue-600" />
        </button>

        <button
          onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(blog.title)}`, '_blank', 'width=600,height=400')}
          className="p-2 hover:scale-110 transition-transform cursor-pointer"
          title="Share on X/Twitter"
        >
          <FaSquareXTwitter className="text-3xl text-gray-600 hover:text-black" />
        </button>

        <button
          onClick={() => window.open(`https://threads.net/intent/post?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
          className="p-2 hover:scale-110 transition-transform cursor-pointer"
          title="Share on Threads"
        >
          <FaSquareThreads className="text-3xl text-gray-600 hover:text-black" />
        </button>

        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Check out this blog: ${blog.title} ${shareUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on WhatsApp"
          className="p-2 hover:scale-110 transition-transform"
        >
          <IoLogoWhatsapp className="text-3xl text-gray-600 hover:text-green-500" />
        </a>

        <button
          onClick={onCopyLink}
          className="p-2 hover:scale-110 transition-transform cursor-pointer"
          title="Copy AfroTask Blog Link"
        >
          <img src="/img/afro-task.png" alt="AfroTask" className="w-8 h-8 filter brightness-70" />
        </button>

      </div>
    </div>
  )
}
