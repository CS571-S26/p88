import { Card, Form } from 'react-bootstrap'
import './TaskQueue.css'
import { useQueue } from '../contexts/QueueContext'

const COLORS = [
  '#4f86f7',
  '#58b368',
  '#f2c14e',
  '#d95d39',
  '#8e6cce',
  '#2a9d8f',
  '#f4a261',
  '#7b8cde'
]

export default function TaskQueue() {
  const { queue, quantum, setQuantum, removeTask } = useQueue()

  function getRemainingQuanta(task) {
    const remainingTime = Math.max(task.estimatedTime - task.timeSpent, 0)
    return Math.max(1, Math.ceil(remainingTime / quantum))
  }

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

          <Form.Group className="task-queue-quantum" controlId="quantum">
            <Form.Label>Quantum</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={quantum}
              onChange={e => setQuantum(Number(e.target.value))}
            />
          </Form.Group>
        </div>

        <div className="task-queue-container">
          {queue.length === 0 ? (
            <div className="task-queue-empty">Queue is empty.</div>
          ) : (
            <div className="task-queue-list">
              {queue.map((task, index) => {
                const remainingQuanta = getRemainingQuanta(task)
                const height = 40 + remainingQuanta * 20
                const color = COLORS[index % COLORS.length]

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
                      className="task-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeTask(task.id)
                      }}
                    >
                      ×
                    </button>

                    <span className="task-label">
                      {index === 0 ? `Next: ${task.name}` : task.name}
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