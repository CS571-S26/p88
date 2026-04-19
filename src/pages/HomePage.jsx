import { Card, Row, Col } from 'react-bootstrap'
import TaskQueue from '../components/TaskQueue'

export default function HomePage() {
  return (
    <div className="w-100 h-100 p-4">
      <Row className="g-4">
        <Col md={8} lg={8}>
          <Card className="p-3">
            <Card.Body>
              <h1 className="mb-2">LifeOS</h1>

              <p className="text-muted mb-3">
                It&apos;s time to execute.
              </p>

              <p>
                A lightweight system for scheduling work, executing it, and
                seeing what actually happened. No overthinking, no productivity
                theater.
              </p>

              <p>
                Add tasks with rough estimates, then let the scheduler decide
                what runs next. The queue on the right is your ready queue —
                work waiting to execute.
              </p>

              <p>
                In Execution, tasks run in time slices. You leave notes before
                switching away so future you can resume without friction.
              </p>

              <p>
                Standup fixes the usual meeting pain: no awkward “who goes next,” no
                depth-first rabbit holes where one person eats the whole meeting,
                and no updates that disappear. Everyone speaks, notes are captured,
                and you get a recap.
              </p>

              <p>
                For quantitative nerds, we have Metrics: throughput, estimate accuracy, focus
                time, context switching, and a slightly judgmental productivity score.
              </p>

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