import { z } from 'zod'

const fechaNacimiento = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
  .or(z.literal(''))
  .nullish()
  .transform((value) => (value ? value : null))

const baseUserFields = {
  nombre: z.string().trim().min(2, 'El nombre es demasiado corto'),
  primerApellido: z.string().trim().min(2, 'El apellido es demasiado corto'),
  segundoApellido: z
    .string()
    .trim()
    .nullish()
    .transform((value) => (value ? value : null)),
  fechaNacimiento,
  idTipoUsuario: z.coerce.number().int().positive('Selecciona un tipo de usuario'),
  idEstadoUsuario: z.coerce.number().int().positive('Selecciona un estado de usuario'),
}

export const createAdminUserSchema = z.object({
  ...baseUserFields,
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const updateAdminUserSchema = z.object({
  ...baseUserFields,
  email: z.string().email('Correo electrónico inválido').optional(),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .or(z.literal(''))
    .optional(),
})

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>
