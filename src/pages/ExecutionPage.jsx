import '../App.css'
import { Card, Row, Col } from 'react-bootstrap'
import { useQueue } from '../contexts/QueueContext'
import TaskQueue from '../components/TaskQueue'

export default function ExecutionPage() {
  const { queue, quantum } = useQueue()
  const currentTask = queue.length > 0 ? queue[0] : null

  function getRemainingQuanta(task) {
    const remainingTime = Math.max(task.estimatedTime - task.timeSpent, 0)
    return Math.max(1, Math.ceil(remainingTime / quantum))
  }

  return (
    <div className="w-100 h-100 p-4">
      <Row className="g-4">
        <Col md={8} lg={8}>
          <Card className="p-3">
            <Card.Body>
              <h1 className="mb-3">Execution</h1>
              <p className="text-muted">
                This page will show the current task, its register, and runtime controls.
              </p>

              <Card className="p-3">
                <Card.Body>
                  {currentTask ? (
                    <>
                      <h3 className="mb-3">Current Task</h3>
                      <p><strong>Name:</strong> {currentTask.name}</p>
                      <p><strong>Estimated Time:</strong> {currentTask.estimatedTime} min</p>
                      <p><strong>Time Spent:</strong> {currentTask.timeSpent} min</p>
                      <p><strong>Quanta Until Context Switch:</strong> {getRemainingQuanta(currentTask)}</p>
                      <div>
                        <strong>Register:</strong>
                        <Card className="mt-2 p-2 bg-light">
                          <Card.Body className="p-2">
                            {currentTask.register?.trim() ? currentTask.register : 'No register contents yet.'}
                          </Card.Body>
                        </Card>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="mb-3">Current Task</h3>
                      <p className="text-muted mb-0">No task running yet.</p>
                    </>
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