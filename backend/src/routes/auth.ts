import { Router } from 'express'
import { supabaseAdmin, supabaseAnon } from '../config/supabase'
import { requireAuth } from '../middleware/auth'
import { ApiError, asyncHandler } from '../utils/http'
import {
  createProfile,
  getProfileByAuthId,
  profileResponse,
  splitFullName,
} from '../services/users'
import { loginSchema, registerSchema } from '../validators/auth'

export const authRouter = Router()

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body)
    const fallback = splitFullName(input.fullName)
    const nombre = input.nombre ?? fallback.nombre
    const primerApellido = input.primerApellido ?? fallback.primerApellido

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      app_metadata: { role: 'customer' },
      user_metadata: {
        full_name: input.fullName ?? `${nombre} ${primerApellido}`.trim(),
      },
    })

    if (error) {
      throw new ApiError(400, error.message)
    }

    try {
      await createProfile(
        data.user.id,
        {
          nombre,
          primerApellido,
          segundoApellido: input.segundoApellido ?? null,
          fechaNacimiento: input.fechaNacimiento ?? null,
        },
        'customer',
      )
    } catch (profileError) {
      // Avoid orphan auth users if the profile could not be created.
      await supabaseAdmin.auth.admin.deleteUser(data.user.id)
      throw profileError
    }

    const { data: login, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    })

    if (loginError) {
      throw new ApiError(400, loginError.message)
    }

    const profile = await getProfileByAuthId(data.user.id)

    res.status(201).json({
      user: profileResponse(login.user, profile),
      session: login.session,
    })
  }),
)

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body)

    const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password })
    if (error) {
      throw new ApiError(401, error.message)
    }

    const profile = await getProfileByAuthId(data.user.id)

    res.json({
      user: profileResponse(data.user, profile),
      session: data.session,
    })
  }),
)

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const profile = await getProfileByAuthId(req.user!.id)
    res.json({ user: profileResponse(req.user!, profile) })
  }),
)
