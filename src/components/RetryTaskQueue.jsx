import { Card } from 'react-bootstrap'
import './TaskQueue.css'

function formatDueTime(ts) {
  if (!ts) return 'No due date'

  const now = Date.now()
  const diff = ts - now
  const abs = Math.abs(diff)

  const day = 24 * 60 * 60 * 1000
  const hour = 60 * 60 * 1000

  if (diff <= 0) {
    if (abs < hour) return 'Overdue'
    if (abs < day) return `Overdue by ${Math.round(abs / hour)}h`
    return `Overdue by ${Math.round(abs / day)}d`
  }

  if (diff < hour) return 'Due < 1h'
  if (diff < day) return `Due in ${Math.round(diff / hour)}h`
  return `Due in ${Math.round(diff / day)}d`
}

function getRetryTaskState(task) {
  if (!task || task.completedAt) return 'completed'

  const now = Date.now()
  const dueSoonWindow = 24 * 60 * 60 * 1000

  if (task.nextDueAt <= now) return 'overdue'
  if (task.nextDueAt - now <= dueSoonWindow) return 'dueSoon'
  return 'waiting'
}

function getRetryTaskColor(state, index) {
  if (state === 'overdue') return '#9b1c1c'
  if (state === 'dueSoon') return '#8a6500'

  const COLORS = [
    '#1f4fd1',
    '#237044',
    '#6f4db8',
    '#1f7f78',
    '#4f63bf'
  ]

  return COLORS[index % COLORS.length]
}

export default function RetryTaskQueue({
  tasks,
  selectedTaskId,
  onSelectTask
}) {
  const activeTasks = [...tasks]
    .filter(task => !task.completedAt)
    .sort((a, b) => (a.nextDueAt ?? Infinity) - (b.nextDueAt ?? Infinity))

  return (
    <Card className="task-queue-card">
      <Card.Body className="task-queue-body">
        <div className="task-queue-header">
          <div>
            <h2>Retry Queue</h2>
            <small>
              {activeTasks.length} task{activeTasks.length === 1 ? '' : 's'} waiting
            </small>
          </div>
        </div>

        <div className="task-queue-container">
          {activeTasks.length === 0 ? (
            <div className="task-queue-empty">No retry tasks queued.</div>
          ) : (
            <div className="task-queue-list">
              {activeTasks.map((task, index) => {
                const state = getRetryTaskState(task)
                const color = getRetryTaskColor(state, index)
                const isSelected = task.id === selectedTaskId

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onSelectTask(task.id)}
                    className={`task-block ${isSelected ? 'task-block-next' : ''}`}
                    style={{
                      '--task-height': '74px',
                      '--task-color': color,
                      width: '100%',
                      border: 'none'
                    }}
                    aria-label={`Select retry task ${task.name}`}
                  >
                    <div className="d-flex flex-column align-items-center justify-content-center w-100">
                      <span className="task-label">{task.name}</span>
                      <small
                        style={{
                          color: '#ffffff',
                          marginTop: 4,
                          fontSize: 12
                        }}
                      >
                        {formatDueTime(task.nextDueAt)}
                      </small>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}