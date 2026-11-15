// Entirely synthetic demonstration data. Not a medical model or medical advice.
export const SIMULATION_LABEL = 'SIMULATED'
export const HISTORY_DAYS = 30
export const TICK_MS = 2000

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const round = (value, digits = 1) => Number(value.toFixed(digits))
const gaussianNoise = (scale) => {
  // Box-Muller transform: small random variation for demo telemetry.
  const u = Math.max(Math.random(), 1e-9)
  const v = Math.max(Math.random(), 1e-9)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * scale
}

function makeReading(day, index) {
  // The slow drift is deliberately subtle and synthetic.
  const drift = day / 30
  const wave = Math.sin(index * 0.7)
  return {
    id: `day-${day}`,
    day,
    timestamp: new Date(Date.now() - (30 - day) * 86400000).toISOString(),
    heartRate: round(clamp(70 + drift * 2 + wave * 1.8 + gaussianNoise(2.2), 52, 105), 0),
    systolicBP: round(clamp(116 + drift * 1.5 + gaussianNoise(3.5), 95, 145), 0),
    diastolicBP: round(clamp(76 + drift + gaussianNoise(2.5), 58, 95), 0),
    sleepHours: round(clamp(7.4 - drift * 0.15 + gaussianNoise(0.35), 3.5, 10), 1),
    mood: round(clamp(3.6 + gaussianNoise(0.35) - drift * 0.05, 1, 5), 0),
    exerciseMinutes: round(clamp(42 - drift * 1.5 + gaussianNoise(7), 0, 100), 0),
    bodyTemperature: round(clamp(36.7 + gaussianNoise(0.12), 35.8, 38.2), 1),
  }
}

export function createInitialHistory() {
  return Array.from({ length: HISTORY_DAYS }, (_, index) =>
    makeReading(index + 1, index),
  )
}

export function createLiveTick(previous, tickNumber = 1) {
  const drift = Math.min(tickNumber / 900, 0.4)
  const next = {
    ...previous,
    id: `live-${Date.now()}`,
    timestamp: new Date().toISOString(),
    day: previous.day,
    heartRate: round(clamp(previous.heartRate + gaussianNoise(1.1) + drift * 0.08, 45, 130), 0),
    systolicBP: round(clamp(previous.systolicBP + gaussianNoise(1.5) + drift * 0.04, 85, 170), 0),
    diastolicBP: round(clamp(previous.diastolicBP + gaussianNoise(1.0) + drift * 0.03, 45, 110), 0),
    sleepHours: round(clamp(previous.sleepHours + gaussianNoise(0.025) - drift * 0.002, 0, 12), 1),
    mood: round(clamp(previous.mood + gaussianNoise(0.06), 1, 5), 0),
    exerciseMinutes: round(clamp(previous.exerciseMinutes + gaussianNoise(0.2), 0, 120), 0),
    bodyTemperature: round(clamp(previous.bodyTemperature + gaussianNoise(0.035), 34, 40), 1),
  }
  return next
}
