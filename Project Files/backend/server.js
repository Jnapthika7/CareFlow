import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import customerRoutes from './routes/customers.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: true }))
app.options('*', cors())
app.use(express.json())

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload' })
  }
  next(err)
})

app.use('/api/auth', authRoutes)
app.use('/api/customers', customerRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Customer registry backend running' })
})

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`)
})
