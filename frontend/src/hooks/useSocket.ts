import { useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import { getSocket } from '../lib/socket'

export function useSocket() {
  const socketRef = useRef<Socket>(getSocket())
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = socketRef.current

    function onConnect() { setConnected(true) }
    function onDisconnect() { setConnected(false) }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    if (!socket.connected) {
      socket.connect()
    } else {
      setConnected(true)
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  return { socket: socketRef.current, connected }
}
