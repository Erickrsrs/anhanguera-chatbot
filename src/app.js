import express from 'express'
import cors from 'cors'
import healthCheckRouter from './routes/health-check-routes.js'
import chatRouter from './routes/chat-route.js'

export const app = express()

app.use(
  cors({
    origin: '*',
  })
)
app.use(express.json())
app.use('/', healthCheckRouter)
app.use('/chat', chatRouter)
