import '../App.css'
import { useEffect, useMemo, useState } from 'react'
import { Card, Row, Col, Form, Button, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FiPlus, FiCheck, FiRefreshCw } from 'react-icons/fi'
import { useRetryTasks } from '../contexts/RetryTasksContext'
import RetryTaskQueue from '../components/RetryTaskQueue'

const DAY_MS = 24 * 60 * 60 * 1000

function formatDateTime(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function formatCompactDelay(days) {
  const rounded = Math.round(days * 10) / 10
  return Number.isInteger(rounded) ? `${rounded}d` : `${rounded.toFixed(1)}d`
}

function getRetryStatus(task) {
  if (!task || task.completedAt) return 'Completed'

  const now = Date.now()
  const dueSoonWindow = DAY_MS

  if (task.nextDueAt <= now) return 'Due'
  if (task.nextDueAt - now <= dueSoonWindow) return 'Due Soon'
  return 'Waiting'
}

function getStatusVariant(status) {
  switch (status) {
    case 'Due':
      return 'danger'
    case 'Due Soon':
      return 'warning'
    case 'Completed':
      return 'success'
    default:
      return 'secondary'
  }
}

function buildPreviewRows(baseDelayDays, multiplier, previewCount = 5) {
  const base = Number(baseDelayDays)
  const mult = Number(multiplier)

  if (!base || base <= 0 || !mult || mult <= 0) return []

  return Array.from({ length: previewCount }, (_, i) => {
    const delayDays = base * mult ** i
    return delayDays
  })
}

export default function RetryTasksPage() {
  const {
    retryTasks,
    selectedRetryTaskId,
    setSelectedRetryTaskId,
    enqueueRetryTask,
    updateRetryTask,
    markRetryTaskComplete,
    retryRetryTask
  } = useRetryTasks()

  const selectedRetryTask = useMemo(() => {
    return retryTasks.find(task => task.id === selectedRetryTaskId) ?? null
  }, [retryTasks, selectedRetryTaskId])

  const [taskName, setTaskName] = useState('')
  const [baseDelayDays, setBaseDelayDays] = useState(2)
  const [multiplier, setMultiplier] = useState(2)
  const [register, setRegister] = useState('')

  useEffect(() => {
    if (!selectedRetryTaskId) {
      setTaskName('')
      setBaseDelayDays(2)
      setMultiplier(2)
      setRegister('')
      return
    }

    const task = retryTasks.find(t => t.id === selectedRetryTaskId)
    if (!task) return

    setTaskName(task.name ?? '')
    setBaseDelayDays(task.baseDelayDays ?? 2)
    setMultiplier(task.multiplier ?? 2)
    setRegister(task.register ?? '')
  }, [selectedRetryTaskId, retryTasks])

  const compactSchedule = useMemo(() => {
    return buildPreviewRows(baseDelayDays, multiplier, 5)
      .map(formatCompactDelay)
      .join(', ')
  }, [baseDelayDays, multiplier])

  function handleStartNewTask() {
    setSelectedRetryTaskId(null)
  }

  function handleCreateRetryTask(e) {
    e.preventDefault()

    if (!taskName.trim()) return
    if (Number(baseDelayDays) <= 0) return
    if (Number(multiplier) <= 0) return

    const now = Date.now()

    enqueueRetryTask({
      id: crypto.randomUUID(),
      name: taskName.trim(),
      register: register.trim(),
      baseDelayDays: Number(baseDelayDays),
      multiplier: Number(multiplier),
      attemptCount: 0,
      createdAt: now,
      lastRetriedAt: now,
      nextDueAt: now + Number(baseDelayDays) * DAY_MS,
      completedAt: null
    })

    setTaskName('')
    setBaseDelayDays(2)
    setMultiplier(2)
    setRegister('')
  }

  function handleRetryTask() {
    if (!selectedRetryTask) return
    retryRetryTask(selectedRetryTask.id)
  }

  function handleCompleteTask() {
    if (!selectedRetryTask) return
    markRetryTaskComplete(selectedRetryTask.id)
    setSelectedRetryTaskId(null)
  }

  function handleNameChange(value) {
    setTaskName(value)
    if (selectedRetryTask) {
      updateRetryTask(selectedRetryTask.id, { name: value })
    }
  }

  function handleBaseDelayChange(value) {
    setBaseDelayDays(value)
    if (selectedRetryTask && Number(value) > 0) {
      updateRetryTask(selectedRetryTask.id, { baseDelayDays: Number(value) })
    }
  }

  function handleMultiplierChange(value) {
    setMultiplier(value)
    if (selectedRetryTask && Number(value) > 0) {
      updateRetryTask(selectedRetryTask.id, { multiplier: Number(value) })
    }
  }

  function handleRegisterChange(value) {
    setRegister(value)
    if (selectedRetryTask) {
      updateRetryTask(selectedRetryTask.id, { register: value })
    }
  }

  const selectedStatus = getRetryStatus(selectedRetryTask)

  return (
    <div className="w-100 h-100 p-4">
      <Row className="g-4">
        <Col md={8} lg={8}>
          <Card className="p-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h1 className="mb-0">Retry Tasks</h1>

                {selectedRetryTask && (
                  <Badge bg={getStatusVariant(selectedStatus)}>
                    {selectedStatus}
                  </Badge>
                )}
              </div>

              <p className="text-muted mb-3">
                Schedule follow-ups with exponential backoff and keep the context in a register.
              </p>

              <Card className="p-3">
                <Card.Body>
                  <Form onSubmit={handleCreateRetryTask}>
                    <Form.Group className="mb-3" controlId="retryTaskName">
                      <Form.Label>Retry Task Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={taskName}
                        onChange={e => handleNameChange(e.target.value)}
                        placeholder="Follow up with recruiter"
                      />
                    </Form.Group>

                    <div className="form-label">Backoff Parameters</div>
                    <Row className="mb-3">
                      <Col xs={6}>
                        <Form.Group controlId="baseDelayDays">
                          <Form.Label className="text-muted small">Base Delay (days)</Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            value={baseDelayDays}
                            onChange={e => handleBaseDelayChange(e.target.value)}
                          />
                        </Form.Group>
                      </Col>

                      <Col xs={6}>
                        <Form.Group controlId="multiplier">
                          <Form.Label className="text-muted small">Multiplier</Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            step="0.5"
                            value={multiplier}
                            onChange={e => handleMultiplierChange(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div
                      className="mb-3 d-flex flex-wrap align-items-center gap-4"
                      style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div>
                        <span className="text-muted">Formula:</span>{' '}
                        delay(n) = base × multiplier<sup>(n−1)</sup>
                      </div>

                      <div>
                        <span className="text-muted">Schedule:</span>{' '}
                        {compactSchedule || '—'}
                      </div>
                    </div>

                    <Form.Group className="mb-3" controlId="register">
                      <Form.Label>Register</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        value={register}
                        onChange={e => handleRegisterChange(e.target.value)}
                        placeholder="Context for future you. What was this about? What should you say next time?"
                      />
                    </Form.Group>

                    {selectedRetryTask && (
                      <div
                        className="d-flex flex-wrap gap-4 align-items-center mb-3"
                        style={{
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                          fontSize: '0.95rem'
                        }}
                      >
                        <div>
                          <span className="text-muted">Attempts:</span>{' '}
                          <strong>{selectedRetryTask.attemptCount ?? 0}</strong>
                        </div>

                        <div>
                          <span className="text-muted">Last Retried:</span>{' '}
                          <strong>{formatDateTime(selectedRetryTask.lastRetriedAt)}</strong>
                        </div>

                        <div>
                          <span className="text-muted">Next Due:</span>{' '}
                          <strong>{formatDateTime(selectedRetryTask.nextDueAt)}</strong>
                        </div>
                      </div>
                    )}

                    <div className="d-flex gap-2 flex-wrap retry-task-controls">
                      {!selectedRetryTask ? (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Enqueue Retry Task</Tooltip>}
                        >
                          <Button type="submit" variant="success" aria-label="Enqueue Retry Task">
                            <FiPlus />
                          </Button>
                        </OverlayTrigger>
                      ) : (
                        <>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Backoff and retry</Tooltip>}
                          >
                            <Button
                              variant="warning"
                              type="button"
                              onClick={handleRetryTask}
                              aria-label="Backoff and retry"
                            >
                              <FiRefreshCw />
                            </Button>
                          </OverlayTrigger>

                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Complete Retry Task</Tooltip>}
                          >
                            <Button
                              variant="success"
                              type="button"
                              onClick={handleCompleteTask}
                              aria-label="Complete Retry Task"
                            >
                              <FiCheck />
                            </Button>
                          </OverlayTrigger>
                        </>
                      )}
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} lg={4}>
          <RetryTaskQueue
            tasks={retryTasks}
            selectedTaskId={selectedRetryTaskId}
            onSelectTask={setSelectedRetryTaskId}
            onNewTask={handleStartNewTask}
          />
        </Col>
      </Row>
    </div>
  )
}