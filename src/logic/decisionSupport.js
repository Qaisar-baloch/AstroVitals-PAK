import { status, DEMO_THRESHOLDS } from './baseline.js'

export const DECISION_RULES = {
  label: 'prototype decision-support rules',
  repeatedCheckInsRequired: 2,
  note: 'These are workflow rules for this prototype, not clinical thresholds.',
}

const METRICS = [
  ['heartRate', 'Heart rate'],
  ['systolicBP', 'Systolic blood pressure'],
  ['diastolicBP', 'Diastolic blood pressure'],
  ['sleepHours', 'Sleep duration'],
  ['mood', 'Mood'],
  ['exerciseMinutes', 'Exercise minutes'],
  ['bodyTemperature', 'Body temperature'],
]

export function evaluateDecisionSupport({ reading, baseline, manualRecords = [] }) {
  const deviations = METRICS.map(([key, label]) => {
    const value = Number(reading?.[key])
    const personal = baseline?.[key]
    const state = status(value, personal, DEMO_THRESHOLDS)
    const sd = Math.max(Number(personal?.sd) || 0, DEMO_THRESHOLDS.minimumSd)
    const zScore = Number.isFinite(value) && Number.isFinite(personal?.mean)
      ? Math.abs((value - personal.mean) / sd)
      : null
    return { key, label, value, state, zScore }
  }).filter((item) => item.state !== 'unassessed')

  const latest = manualRecords[0] || null
  const previous = manualRecords[1] || null
  const latestSymptoms = latest?.symptoms || []
  const previousSymptoms = previous?.symptoms || []
  const repeatedSymptoms = latestSymptoms.filter((symptom) => previousSymptoms.includes(symptom))
  const visionReported = latest?.visionChange === 'change'
  const repeatedVisionChange = visionReported && previous?.visionChange === 'change'

  const manualConcerns = []
  if (latestSymptoms.length) {
    manualConcerns.push({
      id: 'symptoms',
      title: 'Symptoms reported in the latest check-in',
      detail: latestSymptoms.join(', '),
      level: repeatedSymptoms.length ? 'pattern' : 'reported',
      repeated: repeatedSymptoms,
    })
  }
  if (visionReported) {
    manualConcerns.push({
      id: 'vision',
      title: 'Vision change reported',
      detail: repeatedVisionChange
        ? 'Vision change was also selected in the previous saved check-in.'
        : 'A vision change was selected in the latest saved check-in.',
      level: repeatedVisionChange ? 'pattern' : 'reported',
    })
  }

  const alertDeviations = deviations.filter((item) => item.state === 'alert')
  const watchDeviations = deviations.filter((item) => item.state === 'watch')

  return {
    deviations,
    alertDeviations,
    watchDeviations,
    manualConcerns,
    repeatedSymptoms,
    repeatedVisionChange,
    hasManualConcerns: manualConcerns.length > 0,
    hasDemoDeviation: alertDeviations.length > 0 || watchDeviations.length > 0,
    manualRecordCount: manualRecords.length,
    rules: DECISION_RULES,
  }
}
