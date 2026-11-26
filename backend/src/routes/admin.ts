import { Router } from 'express'
import { env } from '../config/env'
import { supabaseAdmin } from '../config/supabase'
import { upload } from '../middleware/upload'
import { ApiError, asyncHandler } from '../utils/http'
import { bootstrapSchema } from '../validators/auth'
import { createProductSchema, updateProductSchema } from '../validators/products'
import { updateOrderStatusSchema } from '../validators/orders'
import {
  createAdminUser,
  createProfile,
  listUsersWithEmail,
  splitFullName,
  updateAdminUser,
} from '../services/users'
import {
  createAdminUserSchema,
  updateAdminUserSchema,
} from '../validators/users'
import {
  createProduct,
  deactivateProduct,
  getProduct,
  listProducts,
  updateProduct,
} from '../services/products'
import {
  getOrder,
  getStats,
  listOrders,
  listOrdersByStates,
  updateOrderStatus,
} from '../services/orders'
import {
  catalogKeys,
  createCatalogItem,
  deleteCatalogItem,
  listCatalog,
  updateCatalogItem,
} from '../services/catalogs'
import { uploadProductImage } from '../services/storage'

/** Public routes: only the first-admin bootstrap. */
export const adminPublicRouter = Router()

/** Protected routes: mounted behind requireAuth + requireRole('admin'). */
export const adminRouter = Router()

adminPublicRouter.post(
  '/bootstrap',
  asyncHandler(async (req, res) => {
    if (!env.adminBootstrapSecret) {
      throw new ApiError(500, 'ADMIN_BOOTSTRAP_SECRET is not configured')
    }

    const secret = req.header('x-bootstrap-secret') ?? (req.body?.secret as string | undefined)
    if (secret !== env.adminBootstrapSecret) {
      throw new ApiError(403, 'Invalid bootstrap secret')
    }

    const { data: list, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    if (listError) {
      throw new ApiError(500, listError.message)
    }

    const adminExists = list.users.some((user) => user.app_metadata?.role === 'admin')
    if (adminExists) {
      throw new ApiError(409, 'An admin already exists. Bootstrap is disabled.')
    }

    const input = bootstrapSchema.parse(req.body)
    const fallback = splitFullName(input.fullName)
    const nombre = input.nombre ?? fallback.nombre
    const primerApellido = input.primerApellido ?? fallback.primerApellido

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      app_metadata: { role: 'admin' },
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
        'admin',
      )
    } catch (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id)
      throw profileError
    }

    res.status(201).json({
      message: 'Admin created',
      user: { id: data.user.id, email: data.user.email, role: 'admin' },
    })
  }),
)

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

adminRouter.get(
  '/products',
  asyncHandler(async (_req, res) => {
    const products = await listProducts({ includeInactive: true })
    res.json(products)
  }),
)

adminRouter.get(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const product = await getProduct(Number(req.params.id))
    res.json(product)
  }),
)

adminRouter.post(
  '/products',
  upload.single('imagen'),
  asyncHandler(async (req, res) => {
    if (typeof req.body.variantes === 'string') {
      try {
        req.body.variantes = JSON.parse(req.body.variantes)
      } catch {
        throw new ApiError(400, 'Invalid variantes JSON')
      }
    }

    const input = createProductSchema.parse(req.body)

    if (req.file) {
      input.imagen_url = await uploadProductImage(req.file)
    }

    const product = await createProduct(input)
    res.status(201).json(product)
  }),
)

adminRouter.put(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const input = updateProductSchema.parse(req.body)
    const product = await updateProduct(Number(req.params.id), input)
    res.json(product)
  }),
)

adminRouter.post(
  '/products/:id/image',
  upload.single('imagen'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, 'Image file is required')
    }

    const imagen_url = await uploadProductImage(req.file)
    const product = await updateProduct(Number(req.params.id), { imagen_url })
    res.json(product)
  }),
)

adminRouter.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const product = await deactivateProduct(Number(req.params.id))
    res.json(product)
  }),
)

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

adminRouter.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const orders = await listOrders(req.user!, true)
    res.json(orders)
  }),
)

adminRouter.get(
  '/orders/:id',
  asyncHandler(async (req, res) => {
    const order = await getOrder(Number(req.params.id))
    res.json(order)
  }),
)

adminRouter.patch(
  '/orders/:id/status',
  asyncHandler(async (req, res) => {
    const { estado } = updateOrderStatusSchema.parse(req.body)
    const order = await updateOrderStatus(Number(req.params.id), estado)
    res.json(order)
  }),
)

adminRouter.get(
  '/returns',
  asyncHandler(async (_req, res) => {
    const orders = await listOrdersByStates(['Cancelada', 'Devuelta'])
    res.json(orders)
  }),
)

/* ------------------------------------------------------------------ */
/* Users and stats                                                     */
/* ------------------------------------------------------------------ */

adminRouter.get(
  '/users',
  asyncHandler(async (_req, res) => {
    res.json(await listUsersWithEmail())
  }),
)

adminRouter.post(
  '/users',
  asyncHandler(async (req, res) => {
    const input = createAdminUserSchema.parse(req.body)
    const user = await createAdminUser(input)
    res.status(201).json(user)
  }),
)

adminRouter.put(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const input = updateAdminUserSchema.parse(req.body)
    const user = await updateAdminUser(Number(req.params.id), input)
    res.json(user)
  }),
)

adminRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    res.json(await getStats())
  }),
)

/* ------------------------------------------------------------------ */
/* Catalogs (tipos de producto, colores, tallas, proveedores)          */
/* ------------------------------------------------------------------ */

adminRouter.get(
  '/catalogs',
  asyncHandler(async (_req, res) => {
    res.json(catalogKeys())
  }),
)

adminRouter.get(
  '/catalogs/:catalog',
  asyncHandler(async (req, res) => {
    res.json(await listCatalog(req.params.catalog))
  }),
)

adminRouter.post(
  '/catalogs/:catalog',
  asyncHandler(async (req, res) => {
    const item = await createCatalogItem(req.params.catalog, req.body)
    res.status(201).json(item)
  }),
)

adminRouter.put(
  '/catalogs/:catalog/:id',
  asyncHandler(async (req, res) => {
    const item = await updateCatalogItem(
      req.params.catalog,
      Number(req.params.id),
      req.body,
    )
    res.json(item)
  }),
)

adminRouter.delete(
  '/catalogs/:catalog/:id',
  asyncHandler(async (req, res) => {
    res.json(await deleteCatalogItem(req.params.catalog, Number(req.params.id)))
  }),
)
