import { Pencil, Trash2 } from 'lucide-react'
import { IoIosPerson, IoMdTime } from 'react-icons/io'

export default function BlogHeader({ blog, user, onEdit, onDelete, deleting }) {
  return (
    <div className="mb-8 font-serif">
      <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-gray-900">
        {blog.title}
      </h1>
      <p className="text-sm md:text-base text-gray-500 mb-6 flex items-center gap-1">
        Published by <IoIosPerson className="ml-1" /> {blog.author} on <IoMdTime className="ml-1" /> {blog.date}
      </p>

      {blog.link && (
        <img
          src={blog.link}
          alt={blog.title}
          className="w-full max-h-[500px] object-cover rounded-2xl mb-6 shadow-xl"
        />
      )}

      {blog.isFirestore && user && blog.authorId === user.id && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={onEdit}
            className="bg-gray-200 hover:bg-gray-300 p-3 rounded-xl transition flex items-center gap-2 text-gray-800 font-medium"
            title="Edit Post"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="bg-red-500 hover:bg-red-600 p-3 rounded-xl transition flex items-center gap-2 text-white font-medium"
            title="Delete Post"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
