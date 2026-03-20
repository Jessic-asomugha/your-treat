import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRouter from './api/auth/index.js'
import ordersRouter from './api/orders/index.js'
import messagesRouter from './api/messages/index.js'

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/messages', messagesRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    console.log('DATABASE_URL set:', !!process.env.DATABASE_URL)
  })
}

export default app