import { Card, Container, Row, Col } from 'react-bootstrap'

export default function AboutPage() {
  return (
    <div className="w-100 h-100 p-4">
      <Container fluid>
        <Row className="g-4 justify-content-center">
          <Col md={10} lg={8}>
            <Card className="p-3">
              <Card.Body>
                <h1 className="mb-3">About LifeOS</h1>

                <p className="text-muted">
                  LifeOS: It&apos;s time to execute.
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
                  Instead of spending part of your hour figuring out how to use
                  your hour, you just start. The scheduler helps you get moving,
                  the register helps you resume work after interruptions, and
                  the queue keeps the remaining work visible.
                </p>

                <p className="mb-0">
                  LifeOS is loosely inspired by <em>Algorithms to Live By</em>,
                  but its goal is to make those ideas concrete: fewer vague
                  productivity theories, more direct execution.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}