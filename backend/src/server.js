import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import buyerRoutes from './routes/buyer.js'
import sellerRoutes from './routes/seller.js'
import productsRoutes from './routes/products.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const app = express()
const PORT = Number(process.env.PORT) || 5000

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  })
)
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'bazario-api' })
})

app.use('/api/auth', authRoutes)
app.use('/api/buyer', buyerRoutes)
app.use('/api/seller', sellerRoutes)
app.use('/api/products', productsRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Bazario API listening on http://localhost:${PORT}`)
})
