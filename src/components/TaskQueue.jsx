import { Card, Form, Row, Col } from 'react-bootstrap'
import './TaskQueue.css'
import { useQueue } from '../contexts/QueueContext'

const COLORS = [
  '#2f6ae6',
  '#237044',
  '#755200',
  '#b94a2f',
  '#6f4db8',
  '#1f7f78',
  '#a65f20',
  '#5a6fd1'
]

export default function TaskQueue() {
  const { queue, quantum, setQuantum, removeTask } = useQueue()

  const quantumMinutes = Math.floor(quantum / 60)
  const quantumSeconds = quantum % 60

  function getRemainingTime(task) {
    return Math.max(task.estimatedTime - task.timeSpent, 0)
  }

  function getRemainingQuanta(task) {
    return Math.max(1, Math.ceil(getRemainingTime(task) / quantum))
  }

  function handleQuantumMinutesChange(value) {
    const mins = Number(value) || 0
    setQuantum(mins * 60 + quantumSeconds)
  }

  function handleQuantumSecondsChange(value) {
    let secs = Number(value) || 0
    secs = Math.max(0, Math.min(59, secs))
    setQuantum(quantumMinutes * 60 + secs)
  }

  const allQuanta = queue.map(task => getRemainingQuanta(task))
  const maxQuanta = Math.max(...allQuanta, 1)

  return (
    <Card className="task-queue-card">
      <Card.Body className="task-queue-body">
        <div className="task-queue-header">
          <div>
            <h2>Ready Queue</h2>
            <small>
              {queue.length} task{queue.length === 1 ? '' : 's'} waiting
            </small>
          </div>

          <div className="task-queue-quantum">
            <div className="form-label">Quantum</div>

            <Row className="g-1">
              <Col xs={6}>
                <Form.Group controlId="quantumMinutes">
                  <Form.Label className="visually-hidden">
                    Quantum minutes
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={quantumMinutes}
                    onChange={e => handleQuantumMinutesChange(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col xs={6}>
                <Form.Group controlId="quantumSeconds">
                  <Form.Label className="visually-hidden">
                    Quantum seconds
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="59"
                    value={quantumSeconds}
                    onChange={e => handleQuantumSecondsChange(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="task-queue-quantum-labels" aria-hidden="true">
              <small>min</small>
              <small>sec</small>
            </div>
          </div>
        </div>

        <div className="task-queue-container">
          {queue.length === 0 ? (
            <div className="task-queue-empty">Queue is empty.</div>
          ) : (
            <div className="task-queue-list">
              {queue.map((task, index) => {
                const remainingQuanta = getRemainingQuanta(task)
                const normalized = Math.sqrt(remainingQuanta / maxQuanta)
                const minHeight = 40
                const maxHeight = 140
                const height = minHeight + normalized * (maxHeight - minHeight)

                const isOverEstimate = task.timeSpent >= task.estimatedTime
                const color = isOverEstimate ? '#c92a2a' : COLORS[index % COLORS.length]

                return (
                  <div
                    key={task.id}
                    className={`task-block ${index === 0 ? 'task-block-next' : ''}`}
                    style={{
                      '--task-height': `${height}px`,
                      '--task-color': color
                    }}
                  >
                    <button
                      type="button"
                      className="task-remove-btn"
                      aria-label={`Remove ${task.name}`}
                      onClick={e => {
                        e.stopPropagation()
                        removeTask(task.id)
                      }}
                    >
                      ×
                    </button>

                    <span className="task-label">
                      {index === 0 ? `${task.name}` : task.name}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}