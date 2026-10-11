import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="bg-white py-24">
      <div className="container text-center">
        <h1 className="editorial-title mb-4">Page not found</h1>
        <Link to="/" className="text-orange underline">
          Return home
        </Link>
      </div>
    </section>
  )
}
