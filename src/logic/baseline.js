// Demo thresholds are illustrative software settings, NOT medical thresholds.
export const DEMO_THRESHOLDS = {
  label: 'demo thresholds',
  watchZ: 1.5,
  alertZ: 2.5,
  minimumSd: 0.15,
}

export function mean(values) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function standardDeviation(values) {
  if (values.length < 2) return 0
  const average = mean(values)
  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

export function calculatePersonalBaseline(history) {
  const first14Days = history.slice(0, 14)
  const metrics = [
    'heartRate',
    'systolicBP',
    'diastolicBP',
    'sleepHours',
    'mood',
    'exerciseMinutes',
    'bodyTemperature',
  ]

  return Object.fromEntries(metrics.map((metric) => {
    const values = first14Days.map((entry) => Number(entry[metric])).filter(Number.isFinite)
    return [metric, { mean: mean(values), sd: standardDeviation(values), sampleCount: values.length }]
  }))
}

export function status(value, baseline, thresholds = DEMO_THRESHOLDS) {
  if (!baseline || !Number.isFinite(value) || !Number.isFinite(baseline.mean)) return 'unassessed'
  const sd = Math.max(baseline.sd || 0, thresholds.minimumSd)
  const zScore = Math.abs((value - baseline.mean) / sd)

  if (zScore >= thresholds.alertZ) return 'alert'
  if (zScore >= thresholds.watchZ) return 'watch'
  return 'normal'
}

export function regionStatus(regionId, reading, baseline) {
  const metricMap = {
    heart: ['heartRate', 'systolicBP', 'diastolicBP'],
    brain: ['sleepHours', 'mood'],
    bones: ['exerciseMinutes'],
    immune: ['bodyTemperature'],
    eyes: [],
  }
  const metrics = metricMap[regionId] || []
  if (!metrics.length) return 'unassessed'

  const statuses = metrics.map((metric) => status(reading[metric], baseline[metric]))
  if (statuses.includes('alert')) return 'alert'
  if (statuses.includes('watch')) return 'watch'
  return 'normal'
}
