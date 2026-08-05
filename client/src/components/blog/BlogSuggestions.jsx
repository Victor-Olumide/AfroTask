import BlogCard from '../BlogCard'

export default function BlogSuggestions({ suggestions, onNavigate }) {
  if (!suggestions.length) return null

  return (
    <div className="pt-8 border-t border-gray-600">
      <h2 className="text-2xl md:text-3xl font-bold mb-8">You might also like</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((blog) => (
          <BlogCard
            key={blog.id}
            title={blog.title}
            description={blog.description}
            author={blog.author}
            date={blog.date}
            link={blog.link}
            onReadMore={() => onNavigate(`/blogs/${blog.id}`)}
          />
        ))}
      </div>
    </div>
  )
}
