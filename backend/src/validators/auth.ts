import { z } from 'zod'

const fechaNacimiento = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
  .optional()

export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2).optional(),
  nombre: z.string().min(2, 'Name is too short').optional(),
  primerApellido: z.string().min(2, 'Last name is too short').optional(),
  segundoApellido: z.string().optional(),
  fechaNacimiento,
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export const bootstrapSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2).optional(),
  nombre: z.string().min(2).optional(),
  primerApellido: z.string().min(2).optional(),
  segundoApellido: z.string().optional(),
  fechaNacimiento,
})
