import '../App.css'
import { Card, Row, Col, Button, Badge, Form } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { useQueue } from '../contexts/QueueContext'
import TaskQueue from '../components/TaskQueue'

export default function ExecutionPage() {
  const {
    queue,
    quantum,
    updateTaskRegister,
    completeQuantumAndRotate,
    markTaskComplete
  } = useQueue()

  const currentTask = queue.length > 0 ? queue[0] : null

  const [isRunning, setIsRunning] = useState(false)
  const [quantumRemaining, setQuantumRemaining] = useState(quantum)
  const [awaitingContextSwitch, setAwaitingContextSwitch] = useState(false)
  const [statusMessage, setStatusMessage] = useState('Paused')

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    setQuantumRemaining(quantum)
  }, [quantum, currentTask])

  useEffect(() => {
    if (!isRunning || !currentTask || awaitingContextSwitch) return

    const intervalId = setInterval(() => {
      setQuantumRemaining(prev => {
        if (prev > 1) {
          return prev - 1
        }

        if (queue.length === 1) {
          completeQuantumAndRotate()
          setStatusMessage('Running')
          return quantum
        }

        setIsRunning(false)
        setAwaitingContextSwitch(true)
        setStatusMessage('Awaiting Context Switch')
        return 0
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [
    isRunning,
    currentTask,
    awaitingContextSwitch,
    queue.length,
    quantum,
    completeQuantumAndRotate
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
    setIsRunning(false)
    if (!awaitingContextSwitch) {
      setStatusMessage('Paused')
    }
  }

  function handleContextSwitch() {
    completeQuantumAndRotate()
    setQuantumRemaining(quantum)
    setAwaitingContextSwitch(false)
    setIsRunning(true)
    setStatusMessage('Running')
  }

  function handleMarkComplete() {
    if (!currentTask) return

    markTaskComplete(currentTask.id)
    setQuantumRemaining(quantum)
    setAwaitingContextSwitch(false)
    setIsRunning(true)
    setStatusMessage('Running')
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
              <h1 className="mb-3">Execution</h1>
              <p className="text-muted">
                Run the current task, track the active quantum, and commit context switches explicitly.
              </p>

              <Card className="p-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="mb-0">Current Task</h3>
                    <Badge bg={isRunning ? 'success' : awaitingContextSwitch ? 'warning' : 'secondary'}>
                      {statusMessage}
                    </Badge>
                  </div>

                  {currentTask ? (
                    <>
                      <p><strong>Name:</strong> {currentTask.name}</p>
                      <p><strong>Estimated Time:</strong> {formatTime(currentTask.estimatedTime)}</p>
                      <p>
                        <strong>Time Spent:</strong>{' '}
                        <span className={isOverEstimate ? 'text-danger fw-bold' : ''}>
                          {formatTime(currentTask.timeSpent)}
                        </span>
                      </p>
                      <p><strong>Quantum Remaining:</strong> {formatTime(quantumRemaining)}</p>

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

                      {awaitingContextSwitch && (
                        <p className="text-muted">
                          The quantum has expired. Update the register if needed, then commit the context switch.
                        </p>
                      )}

                      <div className="d-flex gap-2">
                        <Button onClick={handlePlay} disabled={isRunning || awaitingContextSwitch}>
                          Play
                        </Button>

                        <Button
                          variant="secondary"
                          onClick={handlePause}
                          disabled={!isRunning}
                        >
                          Pause
                        </Button>

                        <Button
                          variant="success"
                          onClick={handleMarkComplete}
                        >
                          Mark Complete
                        </Button>

                        {awaitingContextSwitch && (
                          <Button variant="warning" onClick={handleContextSwitch}>
                            Context Switch
                          </Button>
                        )}
                      </div>
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