import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '',
    primerApellido: '',
    segundoApellido: '',
    fechaNacimiento: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        email: form.email,
        password: form.password,
        nombre: form.nombre,
        primerApellido: form.primerApellido,
        segundoApellido: form.segundoApellido || undefined,
        fechaNacimiento: form.fechaNacimiento || undefined,
      })
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'No se pudo crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => update('nombre', e.target.value)}
          className="w-full rounded border p-3"
          required
        />
        <input
          type="text"
          placeholder="Primer apellido"
          value={form.primerApellido}
          onChange={(e) => update('primerApellido', e.target.value)}
          className="w-full rounded border p-3"
          required
        />
        <input
          type="text"
          placeholder="Segundo apellido (opcional)"
          value={form.segundoApellido}
          onChange={(e) => update('segundoApellido', e.target.value)}
          className="w-full rounded border p-3"
        />
        <label className="block text-sm text-gray-600 dark:text-gray-300">
          Fecha de nacimiento (opcional)
          <input
            type="date"
            value={form.fechaNacimiento}
            onChange={(e) => update('fechaNacimiento', e.target.value)}
            className="mt-1 w-full rounded border p-3 text-gray-900 dark:text-gray-100"
          />
        </label>
        <input
          type="email"
          placeholder="Correo"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="w-full rounded border p-3"
          required
        />
        <input
          type="password"
          placeholder="Contraseña (mín. 6 caracteres)"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          className="w-full rounded border p-3"
          required
          minLength={6}
        />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-indigo-600 p-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Registrarme'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-indigo-600 dark:text-indigo-400">
          Inicia sesión
        </Link>
      </p>
    </section>
  )
}
