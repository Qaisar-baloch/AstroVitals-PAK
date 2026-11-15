import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { status as baselineStatus, DEMO_THRESHOLDS } from '../../logic/baseline.js'

const CHECKIN_KEY = 'astovitals-pak-manual-checkins-v1'
const METRICS = {
  heartRate: { label: 'Heart rate', unit: 'bpm', color: '#45d6e8' },
  systolicBP: { label: 'Systolic blood pressure', unit: 'mmHg', color: '#f6b85c' },
  diastolicBP: { label: 'Diastolic blood pressure', unit: 'mmHg', color: '#b49bff' },
  sleepHours: { label: 'Sleep duration', unit: 'hours', color: '#69d5a7' },
  mood: { label: 'Mood', unit: '/ 5', color: '#e88cc8' },
  exerciseMinutes: { label: 'Exercise', unit: 'minutes', color: '#91a9ff' },
  bodyTemperature: { label: 'Body temperature', unit: '°C', color: '#ff987c' },
  bloodGlucose: { label: 'Blood glucose', unit: 'mg/dL*', color: '#e5a7ff' },
}
const panel = 'panel rounded-2xl p-5'
const selectClass = 'rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400'
const dateLabel = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function readAllManualRecords(crewId) {
  try {
    const all = JSON.parse(localStorage.getItem(CHECKIN_KEY) || '{}')
    return Array.isArray(all[String(crewId)]) ? all[String(crewId)] : []
  } catch { return [] }
}
function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
function Stat({ label, value, note, accent = 'text-cyan-200' }) {
  return <div className="rounded-xl border border-slate-700/60 bg-slate-950/45 p-3"><div className="text-[10px] text-slate-500">{label}</div><div className={`mt-1 text-2xl font-semibold ${accent}`}>{value}</div>{note && <div className="mt-1 text-[10px] text-slate-500">{note}</div>}</div>
}
function TrendChart({ data, metricKey, baseline, sourceLabel }) {
  const metric = METRICS[metricKey]
  const chartData = data.filter((row) => Number.isFinite(Number(row[metricKey])))
  return <section className={panel}>
    <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-sm font-semibold">{metric.label} trend</h3><p className="mt-1 text-xs text-slate-400">{sourceLabel} · {chartData.length} recorded points</p></div><span className="rounded-md border border-slate-700 px-2 py-1 text-[9px] tracking-wider text-cyan-200">{metric.unit}</span></div>
    {chartData.length < 2 ? <div className="mt-5 rounded-lg border border-dashed border-slate-700 p-8 text-center text-xs text-slate-500">At least two recorded points are needed to display a trend.</div> : <div className="mt-4 h-72 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 10, right: 18, left: 0, bottom: 4 }}><CartesianGrid stroke="#263449" strokeDasharray="3 3"/><XAxis dataKey="label" tick={{ fill: '#8da0b9', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#40516a' }} minTickGap={24}/><YAxis tick={{ fill: '#8da0b9', fontSize: 10 }} tickLine={false} axisLine={false} width={44}/><Tooltip contentStyle={{ background: '#081221', border: '1px solid #34445c', borderRadius: 10, color: '#e2e8f0', fontSize: 12 }} formatter={(value) => [`${value} ${metric.unit}`, metric.label]}/><Legend wrapperStyle={{ color: '#aab8ca', fontSize: 10 }}/>{Number.isFinite(baseline?.mean) && <ReferenceLine y={baseline.mean} stroke="#a78bfa" strokeDasharray="5 5" label={{ value: 'Personal mean', fill: '#c4b5fd', fontSize: 10, position: 'insideTopRight' }}/>}<Line type="monotone" dataKey={metricKey} name={metric.label} stroke={metric.color} strokeWidth={2.5} dot={{ r: 2.5, fill: metric.color }} activeDot={{ r: 5 }} connectNulls={false}/></LineChart></ResponsiveContainer></div>}
    <p className="mt-2 text-[10px] text-slate-500">The personal mean is a statistical reference calculated from the available simulated history. It is not a clinical target or safe range.</p>
  </section>
}
function statusTone(level) {
  return level === 'alert' ? 'border-rose-400/30 bg-rose-400/10 text-rose-200' : level === 'watch' ? 'border-amber-400/30 bg-amber-400/10 text-amber-200' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
}

export default function HealthAnalytics({ history, baseline, crewId }) {
  const [source, setSource] = useState('simulated')
  const [metric, setMetric] = useState('heartRate')
  const [manualRecords, setManualRecords] = useState(() => readAllManualRecords(crewId))
  useEffect(() => setManualRecords(readAllManualRecords(crewId)), [crewId])
  useEffect(() => {
    const refresh = () => setManualRecords(readAllManualRecords(crewId))
    window.addEventListener('storage', refresh)
    window.addEventListener('astrovitals:checkin-saved', refresh)
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('astrovitals:checkin-saved', refresh) }
  }, [crewId])

  const simulatedData = useMemo(() => history.slice(-60).map((entry, index) => ({ ...entry, label: entry.timestamp ? dateLabel(entry.timestamp) : `Sample ${index + 1}` })), [history])
  const manualData = useMemo(() => [...manualRecords].reverse().map((record) => ({ ...record.values, timestamp: record.createdAt, label: dateLabel(record.createdAt), symptoms: record.symptoms || [], notes: record.notes || '' })), [manualRecords])
  const activeData = source === 'simulated' ? simulatedData : manualData
  const manualMetrics = Object.keys(METRICS).filter((key) => manualData.some((entry) => entry[key] !== null && entry[key] !== undefined && Number.isFinite(Number(entry[key]))))
  const availableMetrics = source === 'simulated' ? Object.keys(METRICS).filter((key) => simulatedData.some((entry) => Number.isFinite(Number(entry[key])))) : manualMetrics
  useEffect(() => { if (availableMetrics.length && !availableMetrics.includes(metric)) setMetric(availableMetrics[0]) }, [availableMetrics, metric])

  const anomalies = useMemo(() => {
    if (source !== 'simulated') return []
    return [...simulatedData].reverse().map((entry) => {
      const flagged = Object.keys(METRICS).filter((key) => Number.isFinite(Number(entry[key])) && baseline[key] && baselineStatus(Number(entry[key]), baseline[key]) !== 'normal')
      return flagged.length ? { ...entry, flagged } : null
    }).filter(Boolean).slice(0, 12)
  }, [simulatedData, baseline, source])

  const manualSymptomEntries = manualRecords.filter((record) => (record.symptoms || []).length > 0 || record.visionChange && record.visionChange !== 'no-change')
  const latest = activeData[activeData.length - 1]
  const latestStatus = source === 'simulated' && latest && baseline[metric] ? baselineStatus(Number(latest[metric]), baseline[metric]) : 'unassessed'
  const reportRows = useMemo(() => {
    const rows = [['timestamp', 'source', ...Object.keys(METRICS), 'symptoms', 'notes']]
    const records = source === 'simulated' ? simulatedData : manualRecords.map((record) => ({ ...record.values, timestamp: record.createdAt, symptoms: record.symptoms || [], notes: record.notes || '' }))
    records.forEach((record) => rows.push([record.timestamp || '', source === 'simulated' ? 'SIMULATED' : 'USER-ENTERED', ...Object.keys(METRICS).map((key) => record[key] ?? ''), (record.symptoms || []).join('; '), record.notes || '']))
    return rows
  }, [source, simulatedData, manualRecords])

  return <div className="space-y-5">
    <section className={panel}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-[10px] uppercase tracking-[.2em] text-cyan-300">Crew member {String(crewId + 1).padStart(2, '0')}</div><h2 className="mt-1 text-xl font-semibold">Health data & analytics</h2><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">Review crew-entered check-ins separately from synthetic telemetry. Personal baselines describe this demo profile's own simulated history, not clinical limits.</p></div><button onClick={() => downloadCsv(`astrovitals-crew-${crewId + 1}-${source}-report.csv`, reportRows)} className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-400/20">↓ Export {source === 'simulated' ? 'telemetry' : 'check-ins'} CSV</button></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Simulated samples" value={simulatedData.length} note="Current in-memory mission history"/><Stat label="Manual check-ins" value={manualRecords.length} note="Saved in this browser" accent="text-amber-200"/><Stat label="Check-ins with symptoms" value={manualSymptomEntries.length} note="Crew-entered flags only" accent="text-rose-200"/><Stat label="Baseline window" value="First 14" note="Synthetic demo records" accent="text-violet-200"/></div>
    </section>

    <section className={panel}>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-base font-semibold">Data explorer</h3><p className="mt-1 text-xs text-slate-400">Choose one data stream and one indicator. Sources are never blended.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setSource('simulated')} className={`rounded-lg border px-3 py-2 text-xs ${source === 'simulated' ? 'border-cyan-300 bg-cyan-300/10 text-cyan-100' : 'border-slate-700 text-slate-400'}`}>Simulated telemetry</button><button onClick={() => setSource('manual')} className={`rounded-lg border px-3 py-2 text-xs ${source === 'manual' ? 'border-amber-300 bg-amber-300/10 text-amber-100' : 'border-slate-700 text-slate-400'}`}>Manual check-ins</button></div></div>
      <div className="mt-4 flex flex-wrap items-center gap-3"><label htmlFor="analytics-metric" className="text-xs text-slate-400">Health indicator</label><select id="analytics-metric" className={selectClass} value={availableMetrics.includes(metric) ? metric : availableMetrics[0] || ''} onChange={(event) => setMetric(event.target.value)}>{availableMetrics.map((key) => <option key={key} value={key}>{METRICS[key].label}</option>)}</select>{source === 'simulated' && <span className={`rounded-full border px-2 py-1 text-[9px] uppercase ${statusTone(latestStatus)}`}>Latest demo deviation: {latestStatus}</span>}<span className="text-[10px] text-slate-500">{source === 'simulated' ? 'SIMULATED' : 'USER-ENTERED'}</span></div>
      {availableMetrics.length ? <div className="mt-4"><TrendChart data={activeData} metricKey={metric} baseline={source === 'simulated' ? baseline[metric] : null} sourceLabel={source === 'simulated' ? 'SIMULATED TELEMETRY' : 'USER-ENTERED CHECK-INS'}/></div> : <div className="mt-4 rounded-xl border border-dashed border-slate-700 p-8 text-center"><p className="text-sm font-medium">No {source === 'manual' ? 'manual check-in' : 'telemetry'} data available</p><p className="mt-2 text-xs text-slate-400">{source === 'manual' ? 'Submit a daily health check-in for this crew member. At least two entries are needed for a trend.' : 'Synthetic samples will appear when the mission simulator is running.'}</p></div>}
    </section>

    <section className="grid gap-5 xl:grid-cols-2">
      <div className={panel}><div className="flex items-center justify-between gap-2"><div><h3 className="text-sm font-semibold">Personal baseline comparison</h3><p className="mt-1 text-xs text-slate-400">Latest synthetic sample versus this profile's first-14-record mean.</p></div><span className="text-[9px] text-violet-200">STATISTICAL CONTEXT</span></div><div className="mt-4 space-y-3">{Object.entries(METRICS).filter(([key]) => baseline[key] && Number.isFinite(Number(history.at(-1)?.[key]))).slice(0,7).map(([key, item]) => { const value = Number(history.at(-1)[key]); const base = baseline[key]; const delta = value - base.mean; const level = baselineStatus(value, base); return <div key={key} className="rounded-lg border border-slate-700/60 bg-slate-950/35 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-medium">{item.label}</span><span className={`rounded-full border px-2 py-0.5 text-[9px] uppercase ${statusTone(level)}`}>{level}</span></div><div className="mt-2 grid grid-cols-3 gap-2 text-xs"><div><div className="text-[9px] text-slate-500">Latest</div><div className="mono mt-1">{value} {item.unit}</div></div><div><div className="text-[9px] text-slate-500">Personal mean</div><div className="mono mt-1">{base.mean.toFixed(1)}</div></div><div><div className="text-[9px] text-slate-500">Difference</div><div className="mono mt-1">{delta > 0 ? '+' : ''}{delta.toFixed(1)}</div></div></div></div> })}</div><p className="mt-3 text-[10px] leading-5 text-slate-500">Deviation labels use the application's illustrative z-score settings (watch ≥ {DEMO_THRESHOLDS.watchZ}, alert ≥ {DEMO_THRESHOLDS.alertZ}). They are not medical thresholds, diagnosis, or a clinical risk score.</p></div>
      <div className={panel}><div><h3 className="text-sm font-semibold">Anomaly & event timeline</h3><p className="mt-1 text-xs text-slate-400">Synthetic deviations and separately recorded crew check-in flags.</p></div><div className="mt-4 space-y-3">{source === 'simulated' ? anomalies.length ? anomalies.map((entry, index) => <div key={`${entry.id}-${index}`} className="flex gap-3 border-l border-slate-700 pl-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-300"/><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-2"><span className="text-xs font-medium">Demo deviation · {entry.flagged.length} indicator(s)</span><span className="text-[9px] text-slate-500">{dateLabel(entry.timestamp)}</span></div><p className="mt-1 text-[10px] text-slate-400">{entry.flagged.map((key) => METRICS[key].label).join(', ')}</p></div></div>) : <p className="text-xs text-slate-500">No statistical deviations in the currently displayed synthetic history.</p> : manualSymptomEntries.length ? manualSymptomEntries.map((entry) => <div key={entry.id} className="flex gap-3 border-l border-amber-400/50 pl-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-300"/><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-2"><span className="text-xs font-medium">Crew check-in flag</span><span className="text-[9px] text-slate-500">{dateLabel(entry.createdAt)}</span></div><p className="mt-1 text-[10px] text-slate-400">{[...(entry.symptoms || []), entry.visionChange && entry.visionChange !== 'no-change' ? `Vision: ${entry.visionChange}` : ''].filter(Boolean).join(' · ')}</p></div></div>) : <p className="text-xs text-slate-500">No symptoms or vision changes have been recorded in this crew member's manual check-ins.</p>}</div><div className="mt-4 rounded-lg border border-slate-700/60 bg-slate-950/35 p-3 text-[10px] leading-5 text-slate-500">Events are review prompts based on recorded demo data. They do not determine medical urgency or replace clinical assessment.</div></div>
    </section>

    <section className={`${panel} border border-cyan-400/20`}><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold">Mission health report</h3><p className="mt-1 text-xs text-slate-400">A downloadable snapshot for the selected crew profile and selected data source.</p></div><button onClick={() => downloadCsv(`astrovitals-crew-${crewId + 1}-${source}-report.csv`, reportRows)} className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300">Export report CSV</button></div><div className="mt-3 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-slate-950/40 p-3"><div className="text-[9px] text-slate-500">Report subject</div><div className="mt-1 text-sm font-semibold">Crew member {String(crewId + 1).padStart(2, '0')}</div></div><div className="rounded-lg bg-slate-950/40 p-3"><div className="text-[9px] text-slate-500">Data source</div><div className="mt-1 text-sm font-semibold">{source === 'simulated' ? 'Synthetic telemetry' : 'Crew-entered'}</div></div><div className="rounded-lg bg-slate-950/40 p-3"><div className="text-[9px] text-slate-500">Records included</div><div className="mt-1 text-sm font-semibold">{source === 'simulated' ? simulatedData.length : manualRecords.length}</div></div></div><p className="mt-3 text-[10px] leading-5 text-slate-500">Export contains the selected source only. CSV may include personal notes entered into the prototype. Review before sharing. This is a demonstration report, not a medical record.</p></section>
    <p className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-[11px] leading-5 text-amber-100/80">Medical boundary: this prototype stores data locally in the browser. Statistical deviations are software demonstration flags, not diagnoses, clinical thresholds, or emergency triage. A qualified medical professional must interpret real health information.</p>
  </div>
}
