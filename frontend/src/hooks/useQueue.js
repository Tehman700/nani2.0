import { useEffect, useRef, useState, useCallback } from 'react'
import { auth } from '../api/client'

export function useQueue(sectionId) {
  const [queue, setQueue]       = useState([])
  const [connected, setConnected] = useState(false)
  const wsRef      = useRef(null)
  const timerRef   = useRef(null)
  const stopped    = useRef(false)

  const connect = useCallback(() => {
    if (stopped.current || !sectionId) return
    const token = auth.token()
    if (!token) return

    const ws = new WebSocket(
      `ws://localhost:8000/ws/queue:${sectionId}?token=${encodeURIComponent(token)}`
    )
    wsRef.current = ws

    ws.onopen = () => setConnected(true)

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'queue_update') setQueue(data.queue ?? [])
      } catch (_) {}
    }

    ws.onclose = () => {
      setConnected(false)
      if (!stopped.current) timerRef.current = setTimeout(connect, 3000)
    }

    ws.onerror = () => ws.close()
  }, [sectionId])

  useEffect(() => {
    stopped.current = false
    connect()
    return () => {
      stopped.current = true
      clearTimeout(timerRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { queue, connected }
}
