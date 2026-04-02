import '../App.css'
import { Button, Card, Form, Row, Col } from 'react-bootstrap'
import { useState } from 'react'
import { useQueue } from '../contexts/QueueContext'
import TaskQueue from '../components/TaskQueue'

export default function SchedulingPage() {
  const { enqueue } = useQueue()

  const [taskName, setTaskName] = useState('')
  const [estimatedTime, setEstimatedTime] = useState(25)
  const [register, setRegister] = useState('')

  function handleEnqueue(e) {
    e.preventDefault()
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

  return (
    <div className="w-100 h-100 p-4">
      <Row className="g-4">
        <Col md={8} lg={8}>
          <Card className="p-3">
            <Card.Body>
              <h1 className="mb-3">Scheduling</h1>
              <p className="text-muted">
                Enter tasks and initial register contents, then inspect the ready queue on the right.
              </p>

              <Form onSubmit={handleEnqueue}>
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
                  <Button type="submit">Enqueue Task</Button>
                </div>
              </Form>
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