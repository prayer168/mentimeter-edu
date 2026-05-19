import express from 'express'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import activitiesRouter from './routes/activities'
import questionsRouter from './routes/questions'
import { setupSocket } from './socket'
import { supabase } from './lib/supabase'

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

app.get('/health', (_req, res) => res.json({ ok: true }))

const io = new Server(server, {
  cors: { origin: FRONTEND_URLS, methods: ['GET', 'POST'] },
})

setupSocket(io)

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})

// 每 5 天 ping 一次 Supabase，防止免費方案因閒置被自動暫停（閒置上限為 7 天）
const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000
setInterval(async () => {
  try {
    await supabase.from('activities').select('id').limit(1)
    console.log('[keep-alive] Supabase ping OK', new Date().toISOString())
  } catch (err) {
    console.error('[keep-alive] Supabase ping failed', err)
  }
}, FIVE_DAYS_MS)
