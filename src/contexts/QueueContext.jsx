import { createContext, useContext, useState } from 'react'

const QueueContext = createContext()

export function QueueProvider({ children }) {
  const [queue, setQueue] = useState([])
  const [quantum, setQuantum] = useState(10)

  function enqueue(task) {
    setQueue(q => [...q, task])
  }

  function dequeue() {
    setQueue(q => {
      if (q.length === 0) return q
      return q.slice(1)
    })
  }

  function removeTask(id) {
    setQueue(q => q.filter(task => task.id !== id))
  }

  return (
    <QueueContext.Provider
      value={{
        queue,
        enqueue,
        dequeue,
        removeTask,
        quantum,
        setQuantum
      }}
    >
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