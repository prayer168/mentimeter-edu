import express from 'express'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import activitiesRouter from './routes/activities'
import questionsRouter from './routes/questions'
import aiRouter from './routes/ai'
import { setupSocket } from './socket'

dotenv.config()

const app = express()
const server = http.createServer(app)

const FRONTEND_URLS = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
  .split(',').map(u => u.trim())
const PORT = parseInt(process.env.PORT ?? '3001', 10)

app.use(cors({ origin: FRONTEND_URLS, credentials: true }))
app.use(express.json())

app.use('/activities', activitiesRouter)
app.use('/questions', questionsRouter)
app.use('/ai', aiRouter)

app.get('/health', (_req, res) => res.json({ ok: true }))

const io = new Server(server, {
  cors: { origin: FRONTEND_URLS, methods: ['GET', 'POST'] },
})

setupSocket(io)

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})
