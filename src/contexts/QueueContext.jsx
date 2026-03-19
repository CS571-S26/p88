import { createContext, useContext, useState } from 'react'

const QueueContext = createContext()

export function QueueProvider({ children }) {
  const [queue, setQueue] = useState([])

  function enqueue(task) {
    setQueue(q => [...q, task])
  }

  function dequeue() {
    let removedTask = null
    setQueue(q => {
      if (q.length === 0) return q
      removedTask = q[0]
      return q.slice(1)
    })
    return removedTask
  }

  return (
    <QueueContext.Provider value={{ queue, enqueue, dequeue }}>
      {children}
    </QueueContext.Provider>
  )
}

export function useQueue() {
  const context = useContext(QueueContext)
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider')
  }
  return context
}