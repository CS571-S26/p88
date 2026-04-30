import '../App.css'
import { useMemo, useState } from 'react'
import { Card, Row, Col, ButtonGroup, Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { useQueue } from '../contexts/QueueContext'
import TaskQueue from '../components/TaskQueue'

function startOfDay(ts) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d
}

function dayKey(ts) {
  return startOfDay(ts).toISOString().slice(0, 10)
}

function formatDayLabel(ts) {
  return new Date(ts).toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  })
}

function formatSeconds(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60

  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

function formatCompactDuration(totalSeconds) {
  const safe = Math.max(0, totalSeconds)
  if (safe < 60) return `${Math.round(safe)}s`
  return `${(safe / 60).toFixed(1)}m`
}

function formatSignedMinutes(seconds) {
  const mins = seconds / 60

  if (Math.abs(mins) < 1) {
    const s = Math.round(seconds)
    if (s > 0) return `+${s}s`
    if (s < 0) return `${s}s`
    return '0'
  }

  const roundedToTenth = Math.round(mins * 10) / 10
  const isWhole = Number.isInteger(roundedToTenth)

  const value = isWhole
    ? `${Math.trunc(roundedToTenth)}`
    : `${roundedToTenth.toFixed(1)}`

  if (roundedToTenth > 0) return `+${value}m`
  if (roundedToTenth < 0) return `${value}m`
  return '0'
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function average(values) {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function InfoLabel({ title, info }) {
  return (
    <div
      className="d-flex align-items-start gap-2 mb-2"
      style={{ minHeight: 40 }}
    >
      <h2
        className="mb-0"
        style={{
          lineHeight: 1.2,
          fontSize: '1rem'
        }}
      >
        {title}
      </h2>

      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>{info}</Tooltip>}
      >
        <span
          role="img"
          aria-label={`Info: ${title}`}
          style={{
            display: 'inline-flex',
            width: 18,
            height: 18,
            minWidth: 18,
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            backgroundColor: 'var(--border)',
            cursor: 'help',
            marginTop: 2
          }}
        >
          i
        </span>
      </OverlayTrigger>
    </div>
  )
}

function ChartColumn({ topLabel, bottomLabel, children }) {
  return (
    <div className="d-flex flex-column align-items-center flex-fill">
      <small
        className="text-muted mb-2 text-center"
        style={{ minHeight: 18, lineHeight: 1.1, fontSize: 12 }}
      >
        {topLabel}
      </small>

      <div
        style={{
          width: '100%',
          height: 96,
          position: 'relative'
        }}
      >
        {children}
      </div>

      <small
        className="mt-2 text-muted text-center"
        style={{ minHeight: 18, lineHeight: 1.1, fontSize: 12 }}
      >
        {bottomLabel}
      </small>
    </div>
  )
}

function MiniBarChart({ data, valueFormatter, color = '#2f6ae6' }) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="d-flex gap-2 align-items-start">
      {data.map(d => {
        const barHeight =
          d.value === 0 ? 6 : Math.max(6, (d.value / maxValue) * 96)

        return (
          <ChartColumn
            key={d.label}
            topLabel={valueFormatter(d.value)}
            bottomLabel={d.label}
          >
            <div
              className="d-flex align-items-end"
              style={{ width: '100%', height: '100%' }}
            >
              <div
                style={{
                  width: '100%',
                  height: `${barHeight}px`,
                  borderRadius: 8,
                  backgroundColor: color
                }}
              />
            </div>
          </ChartColumn>
        )
      })}
    </div>
  )
}

function VarianceBarChart({ data }) {
  const maxAbs = Math.max(...data.map(d => Math.abs(d.value)), 1)
  const chartHeight = 96
  const halfHeight = chartHeight / 2

  return (
    <div className="d-flex gap-2 align-items-start">
      {data.map(d => {
        const value = d.value
        const scaledHeight =
          value === 0 ? 0 : Math.max(6, (Math.abs(value) / maxAbs) * (halfHeight - 6))

        return (
          <ChartColumn
            key={d.label}
            topLabel={formatSignedMinutes(value)}
            bottomLabel={d.label}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '18%',
                right: '18%',
                height: 1,
                backgroundColor: 'var(--border)'
              }}
            />

            {value > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: '30%',
                  width: '40%',
                  bottom: '50%',
                  height: scaledHeight,
                  borderRadius: 6,
                  backgroundColor: '#ff5c5c'
                }}
              />
            )}

            {value < 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: '30%',
                  width: '40%',
                  top: '50%',
                  height: scaledHeight,
                  borderRadius: 6,
                  backgroundColor: '#237044'
                }}
              />
            )}

            {value === 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: '30%',
                  width: '40%',
                  top: 'calc(50% - 3px)',
                  height: 6,
                  borderRadius: 6,
                  backgroundColor: 'var(--muted)',
                  opacity: 0.5
                }}
              />
            )}
          </ChartColumn>
        )
      })}
    </div>
  )
}

function pairRunSessions(events, rangeStartMs, rangeEndMs) {
  const sorted = [...events].sort((a, b) => a.at - b.at)
  const openRuns = new Map()
  const perDaySeconds = {}

  for (const event of sorted) {
    if (!event.taskId) continue

    if (event.type === 'run_started') {
      openRuns.set(event.taskId, event.at)
      continue
    }

    if (
      event.type === 'run_paused' ||
      event.type === 'task_completed' ||
      event.type === 'context_switch_requested'
    ) {
      const startedAt = openRuns.get(event.taskId)
      if (startedAt == null) continue

      const start = Math.max(startedAt, rangeStartMs)
      const end = Math.min(event.at, rangeEndMs)

      if (end > start) {
        const key = dayKey(start)
        perDaySeconds[key] = (perDaySeconds[key] ?? 0) + Math.floor((end - start) / 1000)
      }

      openRuns.delete(event.taskId)
    }
  }

  return perDaySeconds
}

export default function MetricsPage() {
  const { completedTasks, eventLog } = useQueue()
  const [rangeDays, setRangeDays] = useState(5)

  const { dayBuckets, summary, score } = useMemo(() => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const rangeEndMs = today.getTime()

    const rangeStartDate = new Date()
    rangeStartDate.setHours(0, 0, 0, 0)
    rangeStartDate.setDate(rangeStartDate.getDate() - (rangeDays - 1))
    const rangeStartMs = rangeStartDate.getTime()

    const days = []
    for (let i = 0; i < rangeDays; i++) {
      const d = new Date(rangeStartDate)
      d.setDate(rangeStartDate.getDate() + i)
      days.push({
        key: dayKey(d.getTime()),
        label: formatDayLabel(d.getTime()),
        throughput: 0,
        varianceValues: [],
        latencyValues: []
      })
    }

    const bucketMap = Object.fromEntries(days.map(d => [d.key, d]))

    const completedInRange = completedTasks.filter(task =>
      task.completedAt && task.completedAt >= rangeStartMs && task.completedAt <= rangeEndMs
    )

    for (const task of completedInRange) {
      const key = dayKey(task.completedAt)
      const bucket = bucketMap[key]
      if (!bucket) continue

      bucket.throughput += 1
      bucket.varianceValues.push((task.timeSpent ?? 0) - (task.estimatedTime ?? 0))
    }

    const latencyByTask = new Map()

    for (const event of eventLog) {
      if (event.at < rangeStartMs || event.at > rangeEndMs) continue
      if (!event.taskId) continue

      if (event.type === 'context_switch_requested') {
        latencyByTask.set(event.taskId, event.at)
      }

      if (event.type === 'context_switch_completed') {
        const requestedAt = latencyByTask.get(event.taskId)
        if (requestedAt != null && event.at >= requestedAt) {
          const key = dayKey(event.at)
          const bucket = bucketMap[key]
          if (bucket) {
            bucket.latencyValues.push((event.at - requestedAt) / 1000)
          }
        }
        latencyByTask.delete(event.taskId)
      }
    }

    const focusedTimeByDay = pairRunSessions(eventLog, rangeStartMs, rangeEndMs)

    const enrichedDays = days.map(day => ({
      ...day,
      focusedSeconds: focusedTimeByDay[day.key] ?? 0,
      averageVariance: average(day.varianceValues),
      averageLatency: average(day.latencyValues)
    }))

    const totalCompleted = completedInRange.length
    const totalFocusedSeconds = enrichedDays.reduce((sum, d) => sum + d.focusedSeconds, 0)
    const avgVariance = average(
      completedInRange.map(task => (task.timeSpent ?? 0) - (task.estimatedTime ?? 0))
    )
    const avgLatency = average(enrichedDays.flatMap(d => d.latencyValues))

    const withinEstimateRate =
      totalCompleted === 0
        ? 0
        : completedInRange.filter(task => (task.timeSpent ?? 0) <= (task.estimatedTime ?? 0)).length / totalCompleted

    const focusedScore = clamp((totalFocusedSeconds / (rangeDays * 2 * 3600)) * 40, 0, 40)
    const throughputScore = clamp((totalCompleted / (rangeDays * 3)) * 25, 0, 25)
    const accuracyScore = clamp(withinEstimateRate * 20, 0, 20)
    const latencyScore = clamp(15 - (avgLatency / 60) * 15, 0, 15)
    const productivityScore = Math.round(focusedScore + throughputScore + accuracyScore + latencyScore)

    return {
      dayBuckets: enrichedDays,
      summary: {
        totalCompleted,
        avgVariance,
        avgLatency
      },
      score: productivityScore
    }
  }, [completedTasks, eventLog, rangeDays])

  const throughputChart = dayBuckets.map(day => ({
    label: day.label,
    value: day.throughput
  }))

  const varianceChart = dayBuckets.map(day => ({
    label: day.label,
    value: day.averageVariance
  }))

  const latencyChart = dayBuckets.map(day => ({
    label: day.label,
    value: day.averageLatency
  }))

  return (
    <div className="w-100 h-100 p-4">
      <Row className="g-4">
        <Col md={8} lg={8}>
          <Row className="g-4">
            <Col xs={12}>
              <Card className="p-3">
                <Card.Body>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto 1fr',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <h1 className="mb-2">Metrics</h1>
                      <p className="text-muted mb-0">
                        How things are going.
                      </p>
                    </div>

                    <div className="d-flex justify-content-center">
                      <div className="d-flex flex-column align-items-center">
                        <div
                          className="d-flex align-items-center gap-2 mb-1"
                          style={{ fontSize: '1rem', fontWeight: 600 }}
                        >
                          <span>Productivity Score</span>

                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip>
                                A heuristic score based on focused time, throughput,
                                estimate accuracy, and context switch latency.
                              </Tooltip>
                            }
                          >
                            <span
                              role="img"
                              aria-label="Info: Productivity Score"
                              style={{
                                display: 'inline-flex',
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 11,
                                fontWeight: 700,
                                backgroundColor: 'var(--border)',
                                cursor: 'help'
                              }}
                            >
                              i
                            </span>
                          </OverlayTrigger>
                        </div>

                        <div
                          style={{
                            fontSize: 40,
                            fontWeight: 700,
                            color:
                              score >= 80
                                ? '#198754'
                                : score >= 60
                                  ? '#2f6ae6'
                                  : score >= 40
                                    ? '#c99700'
                                    : '#ff5c5c',
                            lineHeight: 1
                          }}
                        >
                          {score}
                        </div>

                        <div className="fw-semibold mt-1" style={{ fontSize: 14 }}>
                          {score >= 80
                            ? 'Locked In'
                            : score >= 60
                              ? 'Solid'
                              : score >= 40
                                ? 'Shaky'
                                : 'Pathetic'}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end">
                      <ButtonGroup aria-label="Metrics date range">
                        {[3, 5, 7].map(days => {
                          const active = rangeDays === days

                          return (
                            <Button
                              key={days}
                              type="button"
                              variant={active ? 'primary' : 'outline-primary'}
                              active={active}
                              aria-label={`Show last ${days} days`}
                              aria-pressed={active}
                              onClick={() => setRangeDays(days)}
                              style={
                                active
                                  ? {
                                      backgroundColor: '#2f6ae6',
                                      borderColor: '#2f6ae6',
                                      color: '#ffffff'
                                    }
                                  : {
                                      color: '#9fc2ff',
                                      borderColor: '#6ea3ff'
                                    }
                              }
                            >
                              Last {days}d
                            </Button>
                          )
                        })}
                      </ButtonGroup>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} xl={4}>
              <Card className="p-3 h-100">
                <Card.Body>
                  <InfoLabel
                    title="Tasks Throughput"
                    info="How many tasks you completed each day."
                  />
                  <div
                    className="mb-2 fw-semibold d-flex align-items-center"
                    style={{ minHeight: 24 }}
                  >
                    {summary.totalCompleted} completed
                  </div>
                  <MiniBarChart
                    data={throughputChart}
                    valueFormatter={value => `${value}`}
                    color="#2f6ae6"
                  />
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} xl={4}>
              <Card className="p-3 h-100">
                <Card.Body>
                  <InfoLabel
                    title="Average Over / Under Estimate"
                    info="Average actual minus estimated time for tasks completed that day. Red means you ran over. Green means you finished early."
                  />
                  <div
                    className="mb-2 fw-semibold d-flex align-items-center"
                    style={{ minHeight: 24 }}
                  >
                    {formatSignedMinutes(summary.avgVariance)}
                  </div>
                  <VarianceBarChart data={varianceChart} />
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} xl={4}>
              <Card className="p-3 h-100">
                <Card.Body>
                  <InfoLabel
                    title="Context Switch Latency"
                    info="How long it took to commit a context switch after the quantum expired."
                  />
                  <div
                    className="mb-2 fw-semibold d-flex align-items-center"
                    style={{ minHeight: 24 }}
                  >
                    {formatSeconds(summary.avgLatency)}
                  </div>
                  <MiniBarChart
                    data={latencyChart}
                    valueFormatter={value => formatCompactDuration(value)}
                    color="#a87800"
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>

        <Col md={4} lg={4}>
          <TaskQueue />
        </Col>
      </Row>
    </div>
  )
}