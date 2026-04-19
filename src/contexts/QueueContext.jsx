import { createContext, useContext, useEffect, useState } from 'react'

const QueueContext = createContext()

const STORAGE_KEY = 'lifeos-state'
const DEFAULT_QUANTUM = 10 * 60

function normalizeTask(task) {
  return {
    ...task,
    timeSpent: typeof task.timeSpent === 'number' ? task.timeSpent : 0,
    register: task.register ?? '',
    createdAt: task.createdAt ?? Date.now(),
    completedAt: task.completedAt ?? null
  }
}

function normalizeEvent(event) {
  return {
    id: event.id ?? crypto.randomUUID(),
    type: event.type ?? 'unknown',
    taskId: event.taskId ?? null,
    at: typeof event.at === 'number' ? event.at : Date.now(),
    ...event
  }
}

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        queue: [],
        completedTasks: [],
        quantum: DEFAULT_QUANTUM,
        eventLog: []
      }
    }

    const parsed = JSON.parse(raw)

    return {
      queue: Array.isArray(parsed.queue) ? parsed.queue.map(normalizeTask) : [],
      completedTasks: Array.isArray(parsed.completedTasks)
        ? parsed.completedTasks.map(normalizeTask)
        : [],
      quantum: typeof parsed.quantum === 'number' ? parsed.quantum : DEFAULT_QUANTUM,
      eventLog: Array.isArray(parsed.eventLog)
        ? parsed.eventLog.map(normalizeEvent)
        : []
    }
  } catch {
    return {
      queue: [],
      completedTasks: [],
      quantum: DEFAULT_QUANTUM,
      eventLog: []
    }
  }
}

export function QueueProvider({ children }) {
  const initial = loadInitialState()

  const [queue, setQueue] = useState(initial.queue)
  const [completedTasks, setCompletedTasks] = useState(initial.completedTasks)
  const [quantum, setQuantum] = useState(initial.quantum)
  const [eventLog, setEventLog] = useState(initial.eventLog)

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        queue,
        completedTasks,
        quantum,
        eventLog
      })
    )
  }, [queue, completedTasks, quantum, eventLog])

  function logEvent(type, taskId, extra = {}) {
    setEventLog(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        taskId,
        at: Date.now(),
        ...extra
      }
    ])
  }

  function enqueue(task) {
    setQueue(q => [...q, normalizeTask(task)])
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

  function markTaskComplete(id) {
    setQueue(q => {
      const task = q.find(t => t.id === id)
      if (!task) return q

      setCompletedTasks(prev => [
        ...prev,
        {
          ...task,
          completedAt: Date.now()
        }
      ])

      return q.filter(t => t.id !== id)
    })
  }

  function updateTaskRegister(id, register) {
    setQueue(q =>
      q.map(task =>
        task.id === id ? { ...task, register } : task
      )
    )
  }

  function completeQuantumAndRotate() {
    setQueue(q => {
      if (q.length === 0) return q

      const [current, ...rest] = q
      const updatedTask = {
        ...current,
        timeSpent: (current.timeSpent ?? 0) + quantum
      }

      return [...rest, updatedTask]
    })
  }

  function addTimeToTask(id, seconds) {
    setQueue(q =>
      q.map(task =>
        task.id === id
          ? { ...task, timeSpent: (task.timeSpent ?? 0) + seconds }
          : task
      )
    )
  }

  function clearCompletedTasks() {
    setCompletedTasks([])
  }

  function clearEventLog() {
    setEventLog([])
  }

  function resetAllTasks() {
    setQueue([])
    setCompletedTasks([])
    setEventLog([])
  }

  return (
    <QueueContext.Provider
      value={{
        queue,
        completedTasks,
        quantum,
        eventLog,
        setQuantum,
        enqueue,
        dequeue,
        removeTask,
        markTaskComplete,
        updateTaskRegister,
        completeQuantumAndRotate,
        addTimeToTask,
        logEvent,
        clearCompletedTasks,
        clearEventLog,
        resetAllTasks
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