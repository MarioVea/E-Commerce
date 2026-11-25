import { Router } from 'express'
import { asyncHandler } from '../utils/http'
import {
  cancelOrder,
  createOrder,
  getOrderForUser,
  listOrders,
  returnOrder,
} from '../services/orders'
import { createOrderSchema } from '../validators/orders'

export const ordersRouter = Router()

ordersRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { items } = createOrderSchema.parse(req.body)
    const order = await createOrder(req.user!, items)
    res.status(201).json(order)
  }),
)

ordersRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const orders = await listOrders(req.user!, false)
    res.json(orders)
  }),
)

ordersRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const order = await getOrderForUser(req.user!, Number(req.params.id), false)
    res.json(order)
  }),
)

ordersRouter.post(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    const order = await cancelOrder(req.user!, Number(req.params.id), false)
    res.json(order)
  }),
)

ordersRouter.post(
  '/:id/return',
  asyncHandler(async (req, res) => {
    const order = await returnOrder(req.user!, Number(req.params.id), false)
    res.json(order)
  }),
)
