import '../App.css'
import { useEffect, useMemo, useState } from 'react'
import { Card, Row, Col, Form, Button } from 'react-bootstrap'

const ORDER_COLORS = [
  '#1f4fd1',
  '#8a6500',
  '#237044',
  '#6f4db8',
  '#1f7f78',
  '#4f63bf',
  '#9b1c1c',
  '#a65f20'
]

function fisherYatesShuffle(items) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function formatTime(totalSeconds) {
  const isNegative = totalSeconds < 0
  const safe = Math.abs(totalSeconds)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`
  return isNegative ? `-${formatted}` : formatted
}

function getSecondsUntilEnd(endTime) {
  if (!endTime) return 0

  const now = new Date()
  const [hours, minutes] = endTime.split(':').map(Number)

  const end = new Date()
  end.setHours(hours, minutes, 0, 0)

  return Math.floor((end.getTime() - now.getTime()) / 1000)
}

export default function StandupPage() {
  const [mode, setMode] = useState('planning') // planning | running | recap
  const [name, setName] = useState('')
  const [participants, setParticipants] = useState([])
  const [order, setOrder] = useState([])
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0)
  const [meetingEndTime, setMeetingEndTime] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [notesBySpeakerId, setNotesBySpeakerId] = useState({})

  const currentSpeaker = order[currentSpeakerIndex] ?? null
  const onDeckSpeaker = order[currentSpeakerIndex + 1] ?? null

  const speakersLeft = useMemo(() => {
    return Math.max(order.length - currentSpeakerIndex, 0)
  }, [order.length, currentSpeakerIndex])

  function computePerSpeakerTime(nextIndex = currentSpeakerIndex) {
    const secondsUntilEnd = getSecondsUntilEnd(meetingEndTime)
    const remainingSpeakers = Math.max(order.length - nextIndex, 0)
    if (remainingSpeakers <= 0) return 0
    return Math.floor(secondsUntilEnd / remainingSpeakers)
  }

  useEffect(() => {
    if (mode !== 'running') return

    const intervalId = setInterval(() => {
      setTimeRemaining(prev => prev - 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [mode, currentSpeakerIndex])

  function handleAddParticipant(e) {
    e.preventDefault()
    if (!name.trim()) return

    setParticipants(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: name.trim()
      }
    ])
    setName('')
  }

  function handleRemoveParticipant(id) {
    setParticipants(prev => prev.filter(p => p.id !== id))
    setOrder(prev => prev.filter(p => p.id !== id))
    setNotesBySpeakerId(prev => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
    setCurrentSpeakerIndex(0)
    setTimeRemaining(0)
  }

  function handleStartMeeting() {
    const shuffled = fisherYatesShuffle(participants)
    setOrder(shuffled)
    setCurrentSpeakerIndex(0)
    setMode('running')

    const secondsUntilEnd = getSecondsUntilEnd(meetingEndTime)
    const initialTime =
      shuffled.length > 0 ? Math.floor(secondsUntilEnd / shuffled.length) : 0
    setTimeRemaining(initialTime)
  }

  function handleNextSpeaker() {
    if (!currentSpeaker) return

    const nextIndex = currentSpeakerIndex + 1
    const hasNext = nextIndex < order.length

    if (!hasNext) {
      setTimeRemaining(0)
      setMode('recap')
      return
    }

    setCurrentSpeakerIndex(nextIndex)
    setTimeRemaining(computePerSpeakerTime(nextIndex))
  }

  function handleNotesChange(e) {
    if (!currentSpeaker) return

    setNotesBySpeakerId(prev => ({
      ...prev,
      [currentSpeaker.id]: e.target.value
    }))
  }

  function handleStartNewMeeting() {
    setMode('planning')
    setOrder([])
    setCurrentSpeakerIndex(0)
    setTimeRemaining(0)
  }

  const currentNotes = currentSpeaker ? notesBySpeakerId[currentSpeaker.id] ?? '' : ''
  const warning = timeRemaining > 0 && timeRemaining <= 15
  const overtime = timeRemaining < 0

  return (
    <div className="w-100 h-100 p-4">
      <Row className="g-4">
        <Col md={8} lg={8}>
          <Card className="p-3">
            <Card.Body>
              <h1 className="mb-3">Standup</h1>
              <p className="text-muted">
                Fairly randomize meeting order, keep time, and track a note sheet for each speaker.
              </p>

              {mode === 'planning' && (
                <>
                  <Form onSubmit={handleAddParticipant}>
                    <Form.Group className="mb-3" controlId="participantName">
                      <Form.Label>Participant Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Add a participant"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="meetingEndTime">
                      <Form.Label>Meeting End Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={meetingEndTime}
                        onChange={e => setMeetingEndTime(e.target.value)}
                      />
                    </Form.Group>

                    <div className="d-flex gap-2 mb-4">
                      <Button type="submit">Add Participant</Button>
                      <Button
                        type="button"
                        variant="warning"
                        onClick={handleStartMeeting}
                        disabled={participants.length === 0 || !meetingEndTime}
                      >
                        Start Meeting
                      </Button>
                    </div>
                  </Form>

                  <Card className="p-3 mt-4">
                    <Card.Body>
                      <h2 className="mb-3">Participants</h2>

                      {participants.length === 0 ? (
                        <p className="text-muted mb-0">No participants added yet.</p>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          {participants.map(participant => (
                            <div
                              key={participant.id}
                              className="d-flex justify-content-between align-items-center p-2 border rounded"
                            >
                              <span>{participant.name}</span>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleRemoveParticipant(participant.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </>
              )}

              {mode === 'running' && (
                <Card className={`p-3 ${overtime ? 'bg-danger text-white border-danger' : ''}`}>
                  <Card.Body>
                    <h2 className="mb-3">Meeting Control</h2>

                    {currentSpeaker ? (
                      <>
                        <p><strong>Current Speaker:</strong> {currentSpeaker.name}</p>
                        <p><strong>On Deck:</strong> {onDeckSpeaker ? onDeckSpeaker.name : 'Nobody'}</p>
                        <p>
                          <strong>Time Remaining:</strong>{' '}
                          <span className={overtime ? 'fw-bold' : warning ? 'text-warning fw-bold' : ''}>
                            {formatTime(timeRemaining)}
                          </span>
                        </p>

                        <Form.Group className="mb-3" controlId="speakerNotes">
                          <Form.Label><strong>Notes</strong></Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={6}
                            value={currentNotes}
                            onChange={handleNotesChange}
                            placeholder="Leader notes for this speaker's update"
                            className={overtime ? 'border-light' : ''}
                          />
                        </Form.Group>

                        <div className="d-flex gap-2">
                          <Button variant="success" onClick={handleNextSpeaker}>
                            Next Speaker
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted mb-0">
                        No speaking order yet. Return to planning and start the meeting.
                      </p>
                    )}
                  </Card.Body>
                </Card>
              )}

              {mode === 'recap' && (
                <Card className="p-3">
                  <Card.Body>
                    <h3 className="mb-3">Recap</h3>
                    <p className="text-muted">
                      The meeting is complete. Here are the speakers and their notes.
                    </p>

                    {order.length === 0 ? (
                      <p className="text-muted mb-0">No recap available.</p>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {order.map((participant, index) => (
                          <Card key={participant.id} className="p-2">
                            <Card.Body>
                              <p className="mb-2">
                                <strong>{index + 1}. {participant.name}</strong>
                              </p>
                              <p className="mb-0 text-muted">
                                {notesBySpeakerId[participant.id]?.trim()
                                  ? notesBySpeakerId[participant.id]
                                  : 'No notes recorded.'}
                              </p>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    )}

                    <div className="mt-4">
                      <Button onClick={handleStartNewMeeting}>
                        Start New Meeting
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} lg={4}>
          <Card className="task-queue-card">
            <Card.Body className="task-queue-body">
              <div className="task-queue-header">
                <div>
                  <h2>
                    {mode === 'recap' ? 'Final Order' : 'Speaking Order'}
                  </h2>
                  <small>
                    {mode === 'running'
                      ? `${Math.max(order.length - currentSpeakerIndex, 0)} speaker${Math.max(order.length - currentSpeakerIndex, 0) === 1 ? '' : 's'} left`
                      : `${order.length} participant${order.length === 1 ? '' : 's'}`}
                  </small>
                </div>
              </div>

              <div className="task-queue-container">
                {order.length === 0 ? (
                  <div className="task-queue-empty">
                    No speaking order yet. Add participants and start the meeting.
                  </div>
                ) : (
                  <div className="task-queue-list">
                    {(mode === 'running' ? order.slice(currentSpeakerIndex) : order).map((participant, index) => {
                      const originalIndex = order.findIndex(p => p.id === participant.id)
                      const color = ORDER_COLORS[originalIndex % ORDER_COLORS.length]

                      return (
                        <div
                          key={participant.id}
                          className={`task-block ${index === 0 && mode !== 'recap' ? 'task-block-next' : ''}`}
                          style={{
                            '--task-height': '64px',
                            '--task-color': color
                          }}
                        >
                          <span className="task-label">
                            {mode === 'recap'
                              ? `${index + 1}. ${participant.name}`
                              : index === 0
                                ? `Now: ${participant.name}`
                                : index === 1
                                  ? `On Deck: ${participant.name}`
                                  : participant.name}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}