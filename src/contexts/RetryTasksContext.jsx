import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const RetryTasksContext = createContext()

const STORAGE_KEY = 'lifeos-retry-tasks'
const DAY_MS = 24 * 60 * 60 * 1000

function normalizeRetryTask(task) {
  return {
    id: task.id ?? crypto.randomUUID(),
    name: task.name ?? '',
    description: task.description ?? '',
    register: task.register ?? '',
    baseDelayDays:
      typeof task.baseDelayDays === 'number'
        ? task.baseDelayDays
        : Number(task.baseDelayDays) || 2,
    attemptCount:
      typeof task.attemptCount === 'number'
        ? task.attemptCount
        : Number(task.attemptCount) || 0,
    createdAt:
      typeof task.createdAt === 'number'
        ? task.createdAt
        : Date.now(),
    lastRetriedAt:
      typeof task.lastRetriedAt === 'number'
        ? task.lastRetriedAt
        : Date.now(),
    nextDueAt:
      typeof task.nextDueAt === 'number'
        ? task.nextDueAt
        : Date.now() + ((Number(task.baseDelayDays) || 2) * DAY_MS),
    completedAt:
      typeof task.completedAt === 'number'
        ? task.completedAt
        : null
  }
}

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        retryTasks: [],
        selectedRetryTaskId: null
      }
    }

    const parsed = JSON.parse(raw)

    return {
      retryTasks: Array.isArray(parsed.retryTasks)
        ? parsed.retryTasks.map(normalizeRetryTask)
        : [],
      selectedRetryTaskId:
        typeof parsed.selectedRetryTaskId === 'string'
          ? parsed.selectedRetryTaskId
          : null
    }
  } catch {
    return {
      retryTasks: [],
      selectedRetryTaskId: null
    }
  }
}

export function RetryTasksProvider({ children }) {
  const initial = useMemo(loadInitialState, [])

  const [retryTasks, setRetryTasks] = useState(initial.retryTasks)
  const [selectedRetryTaskId, setSelectedRetryTaskId] = useState(initial.selectedRetryTaskId)

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        retryTasks,
        selectedRetryTaskId
      })
    )
  }, [retryTasks, selectedRetryTaskId])

  function enqueueRetryTask(task) {
    const normalized = normalizeRetryTask(task)
    setRetryTasks(prev => [...prev, normalized])
    setSelectedRetryTaskId(normalized.id)
  }

  function updateRetryTask(id, updates) {
    setRetryTasks(prev =>
      prev.map(task =>
        task.id === id
          ? normalizeRetryTask({
              ...task,
              ...updates,
              id: task.id,
              createdAt: task.createdAt,
              attemptCount: task.attemptCount,
              lastRetriedAt: task.lastRetriedAt,
              nextDueAt: task.nextDueAt,
              completedAt: task.completedAt
            })
          : task
      )
    )
  }

  function retryRetryTask(id) {
    setRetryTasks(prev =>
      prev.map(task => {
        if (task.id !== id) return task

        const nextAttemptCount = task.attemptCount + 1
        const nextDelayDays = task.baseDelayDays * (2 ** nextAttemptCount)
        const now = Date.now()

        return {
          ...task,
          attemptCount: nextAttemptCount,
          lastRetriedAt: now,
          nextDueAt: now + nextDelayDays * DAY_MS
        }
      })
    )
  }

  function markRetryTaskComplete(id) {
    setRetryTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              completedAt: Date.now()
            }
          : task
      )
    )
  }

  function deleteRetryTask(id) {
    setRetryTasks(prev => prev.filter(task => task.id !== id))
    setSelectedRetryTaskId(prev => (prev === id ? null : prev))
  }

  function clearCompletedRetryTasks() {
    setRetryTasks(prev => prev.filter(task => !task.completedAt))
    setSelectedRetryTaskId(prev => {
      const selected = retryTasks.find(task => task.id === prev)
      return selected?.completedAt ? null : prev
    })
  }

  function resetRetryTasks() {
    setRetryTasks([])
    setSelectedRetryTaskId(null)
  }

  const value = {
    retryTasks,
    selectedRetryTaskId,
    setSelectedRetryTaskId,
    enqueueRetryTask,
    updateRetryTask,
    retryRetryTask,
    markRetryTaskComplete,
    deleteRetryTask,
    clearCompletedRetryTasks,
    resetRetryTasks
  }

  return (
    <RetryTasksContext.Provider value={value}>
      {children}
    </RetryTasksContext.Provider>
  )
}

export function useRetryTasks() {
  const context = useContext(RetryTasksContext)
  if (!context) {
    throw new Error('useRetryTasks must be used within a RetryTasksProvider')
  }
  return context
}