import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const profile = user?.profile

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold">Mi perfil</h1>
      <dl className="mt-6 space-y-3 rounded-lg bg-white p-6 shadow">
        <div>
          <dt className="text-sm text-gray-500">Nombre</dt>
          <dd className="font-medium">
            {profile
              ? `${profile.nombre} ${profile.primer_apellido} ${
                  profile.segundo_apellido ?? ''
                }`.trim()
              : user?.fullName || '—'}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Correo</dt>
          <dd className="font-medium">{user?.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Rol</dt>
          <dd className="font-medium capitalize">{user?.role}</dd>
        </div>
        {profile && (
          <>
            <div>
              <dt className="text-sm text-gray-500">Tipo de usuario</dt>
              <dd className="font-medium">
                {profile.tipo_usuario_rel?.nombre_tipo_usuario ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Estado</dt>
              <dd className="font-medium">
                {profile.estado_usuario?.nombre_estado_usuario ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Fecha de nacimiento</dt>
              <dd className="font-medium">{profile.fecha_nacimiento ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Edad</dt>
              <dd className="font-medium">{profile.edad ?? '—'}</dd>
            </div>
          </>
        )}
      </dl>
    </section>
  )
}
