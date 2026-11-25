import { Router } from 'express'
import { asyncHandler } from '../utils/http'
import { getProduct, listProducts } from '../services/products'

export const productsRouter = Router()

productsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q : undefined
    const tipo = typeof req.query.tipo === 'string' ? req.query.tipo : undefined
    const idTipo = req.query.id_tipo ? Number(req.query.id_tipo) : undefined
    const includeInactive = req.query.include_inactive === 'true'

    const products = await listProducts({ q, tipo, idTipo, includeInactive })
    res.json(products)
  }),
)

productsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid product id' })
      return
    }

    const product = await getProduct(id)
    res.json(product)
  }),
)
