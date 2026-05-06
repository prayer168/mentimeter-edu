import { Server } from 'socket.io'
import { registerRoomHandlers } from './roomHandlers'
import { registerQuestionHandlers } from './questionHandlers'

export function setupSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id}`)

    registerRoomHandlers(io, socket)
    registerQuestionHandlers(io, socket)

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`)
    })
  })
}
