import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="text-4xl font-bold">Gorras para todos los estilos</h1>
      <p className="mx-auto mt-4 max-w-2xl text-gray-600">
        Explora nuestro catálogo, busca tus gorras favoritas y compra en línea.
      </p>
      <Link
        to="/catalog"
        className="mt-8 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
      >
        Ver catálogo
      </Link>
    </section>
  )
}
