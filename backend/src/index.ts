import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env, isSupabaseConfigured } from './config/env'
import { requireAuth } from './middleware/auth'
import { requireRole } from './middleware/requireRole'
import { errorHandler, notFound } from './middleware/errorHandler'
import { adminPublicRouter, adminRouter } from './routes/admin'
import { authRouter } from './routes/auth'
import { ordersRouter } from './routes/orders'
import { productsRouter } from './routes/products'

const app = express()

app.use(helmet())
app.use(cors({ origin: env.corsOrigin, credentials: true }))
app.use(express.json())
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    supabaseConfigured: isSupabaseConfigured(),
    timestamp: new Date().toISOString(),
  })
})

app.use('/auth', authRouter)
app.use('/products', productsRouter)
app.use('/orders', requireAuth, ordersRouter)
app.use('/admin', adminPublicRouter)
app.use('/admin', requireAuth, requireRole('admin'), adminRouter)

app.use(notFound)
app.use(errorHandler)

app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`)
})
