import { Card, Row, Col } from 'react-bootstrap'
import TaskQueue from '../components/TaskQueue'

export default function HomePage() {
  return (
    <div className="w-100 h-100 p-4">
      <Row className="g-4">
        <Col md={8} lg={8}>
          <Card className="p-3">
            <Card.Body>
              <h1 className="mb-3">LifeOS</h1>

              <p className="text-muted">
                It&apos;s time to execute.
              </p>

              <p>
                LifeOS is a tool for people who do not want to waste time
                deciding what to do next. It is not trying to psychoanalyze
                you, optimize your emotions, or dress up procrastination in
                research language. You enter your tasks, give rough estimates,
                and let the scheduler tell you what to work on.
              </p>

              <p>
                The idea is simple: computers do not sit around wondering
                which process feels the most inspiring. They schedule work,
                execute it, context switch when needed, and keep going.
                LifeOS applies that same spirit to human tasks.
              </p>

              <p>
                The stack of blocks on the right is your ready queue: the work
                waiting to run. Add tasks in Scheduling, then move to Execution
                when it&apos;s time to work.
              </p>

              <p className="mb-0">
                LifeOS is loosely inspired by <em>Algorithms to Live By</em>,
                but its goal is to make those ideas concrete: fewer vague
                productivity theories, more direct execution.
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