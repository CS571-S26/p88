import '../App.css'
import { Button, Card, Form, ListGroup, Row, Col } from 'react-bootstrap'
import { useState } from 'react'
import { useQueue } from '../contexts/QueueContext'

export default function HomePage() {
  const { queue, enqueue, dequeue } = useQueue()

  const [taskName, setTaskName] = useState('')
  const [estimatedTime, setEstimatedTime] = useState(25)
  const [register, setRegister] = useState('')

  function handleEnqueue() {
    if (!taskName.trim()) return

    enqueue({
      id: crypto.randomUUID(),
      name: taskName,
      estimatedTime: Number(estimatedTime),
      timeSpent: 0,
      register
    })

    setTaskName('')
    setEstimatedTime(25)
    setRegister('')
  }

  function handleDequeue() {
    dequeue()
  }

  return (
    <div className="w-100 h-100 p-4">
      <Row className="g-4">
        <Col md={6} lg={5}>
          <Card className="p-3">
            <Card.Body>
              <h1 className="mb-3">Queue Test</h1>
              <p className="text-muted">
                Add tasks on the left and inspect the ready queue on the right.
              </p>

              <Form>
                <Form.Group className="mb-3" controlId="taskName">
                  <Form.Label>Task Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={taskName}
                    onChange={e => setTaskName(e.target.value)}
                    placeholder="Write proposal"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="estimatedTime">
                  <Form.Label>Estimated Minutes</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={estimatedTime}
                    onChange={e => setEstimatedTime(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="register">
                  <Form.Label>Initial Register</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={register}
                    onChange={e => setRegister(e.target.value)}
                    placeholder="What should future you know before resuming?"
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button onClick={handleEnqueue}>Enqueue Task</Button>
                  <Button variant="danger" onClick={handleDequeue}>
                    Dequeue Task
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={7}>
          <Card className="p-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h2 className="mb-0">Ready Queue</h2>
                  <small className="text-muted">
                    {queue.length} task{queue.length === 1 ? '' : 's'} waiting
                  </small>
                </div>
              </div>

              <div
                style={{
                  maxHeight: '70vh',
                  overflowY: 'auto',
                  border: '1px solid #dee2e6',
                  borderRadius: '0.5rem'
                }}
              >
                {queue.length === 0 ? (
                  <div className="p-3 text-muted">Queue is empty.</div>
                ) : (
                  <ListGroup variant="flush">
                    {queue.map((task, index) => (
                      <ListGroup.Item key={task.id} className="p-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="fw-bold">
                              {index + 1}. {task.name}
                            </div>
                            <div>Estimated: {task.estimatedTime} min</div>
                            <div>Time Spent: {task.timeSpent} min</div>
                            <div className="text-muted mt-1">
                              Register:{' '}
                              {task.register?.trim()
                                ? task.register
                                : 'No register contents'}
                            </div>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}