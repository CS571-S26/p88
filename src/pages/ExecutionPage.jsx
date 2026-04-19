import '../App.css'
import { Card, Row, Col, Button, Badge, Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { useEffect, useRef, useState } from 'react'
import { useQueue } from '../contexts/QueueContext'
import { FiRefreshCw } from 'react-icons/fi'   // best match
import TaskQueue from '../components/TaskQueue'

export default function ExecutionPage() {
  const {
    queue,
    quantum,
    updateTaskRegister,
    completeQuantumAndRotate,
    markTaskComplete,
    addTimeToTask,
    logEvent
  } = useQueue()

  const currentTask = queue.length > 0 ? queue[0] : null

  const [isRunning, setIsRunning] = useState(false)
  const [quantumRemaining, setQuantumRemaining] = useState(quantum)
  const [awaitingContextSwitch, setAwaitingContextSwitch] = useState(false)
  const [statusMessage, setStatusMessage] = useState('Paused')

  const lastRunSignatureRef = useRef(null)

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    setQuantumRemaining(quantum)
  }, [quantum, currentTask])

  useEffect(() => {
    if (!isRunning || !currentTask) {
      lastRunSignatureRef.current = null
      return
    }

    const signature = `${currentTask.id}-${awaitingContextSwitch}-${quantumRemaining}`

    if (!awaitingContextSwitch && lastRunSignatureRef.current !== signature) {
      logEvent('run_started', currentTask.id, {
        quantumRemaining
      })
      lastRunSignatureRef.current = signature
    }
  }, [isRunning, currentTask, awaitingContextSwitch, quantumRemaining, logEvent])

useEffect(() => {
  if (!isRunning || !currentTask || awaitingContextSwitch) return

  const intervalId = setInterval(() => {
    if (quantumRemaining > 1) {
      setQuantumRemaining(prev => prev - 1)
      return
    }

    if (queue.length === 1) {
      setQuantumRemaining(quantum)
      completeQuantumAndRotate()
      logEvent('quantum_completed', currentTask.id, {
        workedSeconds: quantum
      })
      setStatusMessage('Running')
      return
    }

    setQuantumRemaining(0)
    setIsRunning(false)
    setAwaitingContextSwitch(true)
    logEvent('context_switch_requested', currentTask.id)
    setStatusMessage('Awaiting Context Switch')
  }, 1000)

  return () => clearInterval(intervalId)
}, [
  isRunning,
  currentTask,
  awaitingContextSwitch,
  quantumRemaining,
  queue.length,
  quantum,
  completeQuantumAndRotate,
  logEvent
])
 

  function handlePlay() {
    if (!currentTask || awaitingContextSwitch) return

    if (quantumRemaining === 0) {
      setQuantumRemaining(quantum)
    }

    setIsRunning(true)
    setStatusMessage('Running')
  }

  function handlePause() {
    if (!currentTask) return

    logEvent('run_paused', currentTask.id, {
      quantumRemaining
    })

    setIsRunning(false)
    if (!awaitingContextSwitch) {
      setStatusMessage('Paused')
    }
  }

  function handleContextSwitch() {
    if (!currentTask) return

    logEvent('context_switch_completed', currentTask.id)

    completeQuantumAndRotate()
    setQuantumRemaining(quantum)
    setAwaitingContextSwitch(false)
    setIsRunning(true)
    setStatusMessage('Running')
  }

  function handleMarkComplete() {
    if (!currentTask) return

    const workedThisSlice = quantum - quantumRemaining

    if (workedThisSlice > 0) {
      addTimeToTask(currentTask.id, workedThisSlice)
    }

    logEvent('task_completed', currentTask.id, {
      estimatedTime: currentTask.estimatedTime,
      totalTimeSpent: (currentTask.timeSpent ?? 0) + workedThisSlice,
      workedThisSlice
    })

    markTaskComplete(currentTask.id)
    setQuantumRemaining(quantum)
    setAwaitingContextSwitch(false)
    setIsRunning(queue.length > 1)
    setStatusMessage(queue.length > 1 ? 'Running' : 'Paused')
  }

  function handleRegisterChange(e) {
    if (!currentTask) return
    updateTaskRegister(currentTask.id, e.target.value)
  }

  const isOverEstimate =
    currentTask && currentTask.timeSpent >= currentTask.estimatedTime

  return (
    <div className="w-100 h-100 p-4">
      <Row className="g-4">
        <Col md={8} lg={8}>
          <Card className="p-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h1 className="mb-0">Execution</h1>
                <Badge bg={isRunning ? 'success' : awaitingContextSwitch ? 'warning' : 'secondary'}>
                  {statusMessage}
                </Badge>
              </div>

              <p className="text-muted mb-3">
                Run the current task, track the active quantum, and commit context switches explicitly.
              </p>

              <Card className="p-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="mb-0">Current Task</h3>
                  </div>
                  {currentTask ? (
                    <>
                      <div className="mb-3">
                        <div className="fw-semibold mb-2">{currentTask.name}</div>

                        <div
                          className="d-flex flex-wrap gap-4 align-items-center"
                          style={{
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                            fontSize: '0.95rem'
                          }}
                        >
                          <div>
                            <span className="text-muted">Estimated:</span>{' '}
                            <strong>{formatTime(currentTask.estimatedTime)}</strong>
                          </div>

                          <div>
                            <span className="text-muted">Spent:</span>{' '}
                            <strong className={isOverEstimate ? 'text-danger' : ''}>
                              {formatTime(currentTask.timeSpent)}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <Form.Group className="mb-3" controlId="currentRegister">
                        <Form.Label><strong>Register</strong></Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={6}
                          value={currentTask.register}
                          onChange={handleRegisterChange}
                          placeholder="Leave notes for future you before the next context switch."
                        />
                      </Form.Group>

                      <div
                        className="d-flex flex-wrap align-items-center gap-3 execution-controls"
                        style={{
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                          fontSize: '0.95rem'
                        }}
                      >
                        <div className="me-2">
                          <span className="text-muted">Quantum Remaining:</span>{' '}
                          <strong>{formatTime(quantumRemaining)}</strong>
                        </div>

                        <Button
                          variant={isRunning ? 'secondary' : 'primary'}
                          onClick={isRunning ? handlePause : handlePlay}
                          disabled={!currentTask || awaitingContextSwitch}
                        >
                          {isRunning ? '⏸' : '▶'}
                        </Button>

                        <Button variant="success" onClick={handleMarkComplete}>
                          ✓
                        </Button>

                        {awaitingContextSwitch && (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Commit Context Switch</Tooltip>}
                          >
                            <Button variant="warning" onClick={handleContextSwitch}>
                              <FiRefreshCw />
                            </Button>
                            
                          </OverlayTrigger>
                        )}
                      </div>

                      {awaitingContextSwitch && (
                        <p className="text-muted mt-3 mb-0">
                          The quantum has expired. Update the register if needed, then commit the context switch.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-muted mb-0">No task is ready to run.</p>
                  )}
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} lg={4}>
          <TaskQueue />
        </Col>
      </Row>
    </div>
  )
}