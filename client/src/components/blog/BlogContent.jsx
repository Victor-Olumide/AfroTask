import DOMPurify from 'dompurify'

export default function BlogContent({ content }) {
  return (
    <div
      className="blog-content mb-12 text-justify"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(content || '')
      }}
    />
  )
}
