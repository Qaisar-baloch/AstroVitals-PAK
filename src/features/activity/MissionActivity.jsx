import { useEffect, useMemo, useState } from 'react'

const KEYS = {
  telemetry: 'astovitals-pak-crew-demo-v2',
  checkins: 'astovitals-pak-manual-checkins-v1',
  routines: 'astovitals-pak-mission-routines-v1',
  acknowledgements: 'astrovitals-pak-alert-ack-v1',
}
const panel = 'panel rounded-2xl p-5'
const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback } catch { return fallback }
}
function collectEvents() {
  const events = []
  const telemetry = read(KEYS.telemetry, [])
  telemetry.forEach((history, crewId) => {
    if (!Array.isArray(history)) return
    history.slice(-3).forEach((record, index) => {
      if (!record?.timestamp) return
      events.push({
        id: `telemetry-${crewId}-${record.timestamp}-${index}`,
        time: new Date(record.timestamp).getTime(),
        crewId, kind: 'telemetry', source: 'SIMULATED TELEMETRY',
        title: 'Synthetic telemetry sample recorded',
        detail: 'A generated demonstration sample was added to this crew profile.',
        summary: record.heartRate != null ? `Heart rate ${record.heartRate} bpm · Sleep ${record.sleepHours ?? '—'} h` : 'Synthetic sample available',
      })
    })
  })
  const checkins = read(KEYS.checkins, {})
  Object.entries(checkins).forEach(([crewKey, records]) => {
    if (!Array.isArray(records)) return
    records.forEach((record) => {
      const time = new Date(record.createdAt).getTime()
      if (!Number.isFinite(time)) return
      const symptomCount = Array.isArray(record.symptoms) ? record.symptoms.length : 0
      events.push({
        id: record.id || `checkin-${crewKey}-${time}`, time, crewId: Number(crewKey),
        kind: 'checkin', source: 'CREW-ENTERED',
        title: 'Manual health check-in saved',
        detail: `Self-reported entry recorded${symptomCount ? ` with ${symptomCount} symptom item(s)` : ''}.`,
        summary: record.values ? `HR ${record.values.heartRate ?? '—'} bpm · BP ${record.values.systolicBP ?? '—'}/${record.values.diastolicBP ?? '—'}` : 'Check-in details saved',
      })
    })
  })
  const routines = read(KEYS.routines, {})
  Object.entries(routines).forEach(([crewKey, state]) => {
    if (!state || state.date !== today() || !Array.isArray(state.completed)) return
    state.completed.forEach((taskId) => {
      const task = (state.tasks || []).find((item) => item.id === taskId)
      events.push({
        id: `routine-${crewKey}-${state.date}-${taskId}`,
        time: new Date(`${state.date}T12:00:00`).getTime(), crewId: Number(crewKey),
        kind: 'routine', source: 'LOCAL CHECKLIST',
        title: 'Mission reminder marked complete',
        detail: task?.title || 'A checklist item was completed.',
        summary: 'Completion date is recorded; exact completion time is not available.',
      })
    })
  })
  const acknowledgements = read(KEYS.acknowledgements, {})
  Object.entries(acknowledgements).forEach(([id, value]) => {
    const time = new Date(value).getTime()
    if (!Number.isFinite(time)) return
    const match = id.match(/^c(\d+)-/)
    events.push({
      id: `ack-${id}`, time, crewId: match ? Number(match[1]) : null,
      kind: 'ack', source: 'LOCAL ACKNOWLEDGEMENT',
      title: 'Prototype alert acknowledged',
      detail: 'An alert acknowledgement was saved in this browser.',
      summary: 'Acknowledgement is a local demo record, not a secure audit event.',
    })
  })
  return events.filter((item) => Number.isFinite(item.time)).sort((a,b) => b.time-a.time)
}
function dayString(timestamp) {
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
const filters = [
  ['all','All activity'],['checkin','Check-ins'],['telemetry','Telemetry'],['routine','Routines'],['ack','Acknowledgements'],
]
const kindStyle = {
  checkin: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  telemetry: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
  routine: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  ack: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
}

export default function MissionActivity({ crewHistories, onNavigate }) {
  const [filter, setFilter] = useState('all')
  const [crewFilter, setCrewFilter] = useState('all')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const refresh = () => setRevision((value) => value + 1)
    window.addEventListener('storage', refresh)
    window.addEventListener('astrovitals:checkin-saved', refresh)
    window.addEventListener('astrovitals:alert-acknowledged', refresh)
    window.addEventListener('astrovitals:routine-updated', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('astrovitals:checkin-saved', refresh)
      window.removeEventListener('astrovitals:alert-acknowledged', refresh)
      window.removeEventListener('astrovitals:routine-updated', refresh)
    }
  }, [])
  const events = useMemo(() => collectEvents(), [revision, crewHistories])
  const visible = events.filter((event) =>
    (filter === 'all' || event.kind === filter) &&
    (crewFilter === 'all' || String(event.crewId) === crewFilter)
  )
  const checkins = read(KEYS.checkins, {})
  const routines = read(KEYS.routines, {})
  const ack = read(KEYS.acknowledgements, {})
  const crewCount = Array.isArray(crewHistories) ? crewHistories.length : 4
  const todayKey = today()
  const readiness = Array.from({ length: crewCount }, (_, crewId) => {
    const dailyCheckins = Array.isArray(checkins[String(crewId)]) ? checkins[String(crewId)] : []
    const hasCheckin = dailyCheckins.some((entry) => dayString(new Date(entry.createdAt).getTime()) === todayKey)
    const routine = routines[String(crewId)]
    const total = Array.isArray(routine?.tasks) && routine.date === todayKey ? routine.tasks.length : 4
    const done = routine?.date === todayKey && Array.isArray(routine.completed) ? routine.completed.length : 0
    return { crewId, hasCheckin, total, done }
  })
  const completeCount = readiness.filter((item) => item.hasCheckin && item.total === item.done).length
  const acknowledged = Object.keys(ack).length

  return <div className="space-y-5">
    <section className={panel}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><div className="text-[10px] uppercase tracking-[.2em] text-cyan-300">FLIGHT OPERATIONS / ACTIVITY LOG</div><h2 className="mt-1 text-xl font-semibold">Mission activity & readiness</h2><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">A consolidated view of locally available crew activity, check-ins, synthetic samples, routine completions and alert acknowledgements.</p></div>
        <span className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[10px] font-semibold text-cyan-200">LOCAL DEMO LOG</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3"><div className="text-[10px] text-slate-500">Crew profiles</div><div className="mt-1 text-2xl font-semibold">{crewCount}</div><div className="text-[10px] text-slate-500">Synthetic demo profiles</div></div>
        <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3"><div className="text-[10px] text-slate-500">Crew with today's check-in</div><div className="mt-1 text-2xl font-semibold">{readiness.filter((item) => item.hasCheckin).length} / {crewCount}</div><div className="text-[10px] text-slate-500">Based on local manual entries</div></div>
        <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3"><div className="text-[10px] text-slate-500">Saved acknowledgements</div><div className="mt-1 text-2xl font-semibold">{acknowledged}</div><div className="text-[10px] text-slate-500">Local browser records</div></div>
      </div>
      <p className="mt-4 text-[10px] leading-5 text-slate-500">Readiness here is a checklist-completion summary, not a medical fitness assessment or operational flight-readiness determination.</p>
    </section>

    <section className={panel}>
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-base font-semibold">Crew readiness checklist</h3><p className="mt-1 text-xs text-slate-400">Today's manual check-in and mission-routine completion state.</p></div><span className="text-[10px] text-cyan-200">{completeCount} / {crewCount} complete</span></div>
      <div className="mt-4 space-y-3">
        {readiness.map((item) => <article key={item.crewId} className="rounded-xl border border-slate-700/70 bg-slate-950/35 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><div className="text-sm font-semibold">Crew member {String(item.crewId+1).padStart(2,'0')}</div><span className={`rounded-full border px-2 py-1 text-[9px] ${item.hasCheckin && item.done === item.total ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-amber-400/30 bg-amber-400/10 text-amber-200'}`}>{item.hasCheckin && item.done === item.total ? 'CHECKLIST COMPLETE' : 'IN PROGRESS'}</span></div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div><div className="flex justify-between text-[10px]"><span className="text-slate-400">Daily check-in</span><span className={item.hasCheckin ? 'text-emerald-200' : 'text-amber-200'}>{item.hasCheckin ? 'Recorded' : 'Not recorded'}</span></div><div className="mt-1 h-1.5 rounded-full bg-slate-800"><div className={`h-full rounded-full ${item.hasCheckin ? 'w-full bg-emerald-400' : 'w-0'}`}/></div></div>
            <div><div className="flex justify-between text-[10px]"><span className="text-slate-400">Mission routines</span><span className="text-slate-300">{item.done} / {item.total}</span></div><div className="mt-1 h-1.5 rounded-full bg-slate-800"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${item.total ? item.done/item.total*100 : 0}%` }}/></div></div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2"><button onClick={() => onNavigate('checkin')} className="rounded-lg border border-slate-700 px-3 py-2 text-[10px] text-slate-300 hover:border-cyan-400">Open check-in</button><button onClick={() => onNavigate('routines')} className="rounded-lg border border-slate-700 px-3 py-2 text-[10px] text-slate-300 hover:border-cyan-400">Open routines</button></div>
        </article>)}
      </div>
    </section>

    <section className={panel}>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-base font-semibold">Activity timeline</h3><p className="mt-1 text-xs text-slate-400">Most recent local events first. Only a small recent telemetry sample is shown per crew profile.</p></div><span className="text-[10px] text-slate-500">{visible.length} events</span></div>
      <div className="mt-4 flex flex-wrap gap-2">{filters.map(([value,label]) => <button key={value} onClick={() => setFilter(value)} className={`rounded-lg border px-3 py-2 text-[10px] ${filter===value ? 'border-cyan-300 bg-cyan-300/10 text-cyan-200' : 'border-slate-700 text-slate-400'}`}>{label}</button>)}</div>
      <div className="mt-3"><label className="text-[10px] text-slate-400">Crew filter<select value={crewFilter} onChange={(event) => setCrewFilter(event.target.value)} className="ml-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200"><option value="all">All crew</option>{Array.from({length:crewCount},(_,id)=><option key={id} value={String(id)}>Crew {id+1}</option>)}</select></label></div>
      {visible.length === 0 ? <div className="mt-4 rounded-xl border border-dashed border-slate-700 p-8 text-center"><p className="text-sm font-semibold text-slate-200">No activity matches these filters</p><p className="mt-1 text-xs text-slate-500">Events appear when local check-ins, acknowledgements, routines or synthetic samples are available.</p></div> : <div className="mt-4 space-y-3">{visible.slice(0,80).map((event) => <article key={event.id} className="flex gap-3 rounded-xl border border-slate-700/70 bg-slate-950/35 p-4"><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-300"/><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2 py-0.5 text-[9px] ${kindStyle[event.kind]}`}>{event.source}</span><span className="text-[9px] text-slate-500">{event.crewId == null ? 'Mission-wide' : `Crew ${event.crewId+1}`}</span><time className="text-[9px] text-slate-500">{new Date(event.time).toLocaleString()}</time></div><h4 className="mt-2 text-xs font-semibold text-slate-100">{event.title}</h4><p className="mt-1 text-xs leading-5 text-slate-400">{event.detail}</p><p className="mt-1 text-[10px] text-slate-500">{event.summary}</p></div></article>)}</div>}
    </section>
    <section className="rounded-2xl border border-amber-400/25 bg-amber-400/5 p-4"><h3 className="text-sm font-semibold text-amber-100">Interpretation boundary</h3><p className="mt-2 text-xs leading-5 text-slate-300">This timeline combines synthetic telemetry with locally entered demo records. Routine completions retain a date but not an exact completion time. Alert acknowledgements are browser-local and are not a secure audit trail. This feature is not a clinical or operational readiness system.</p></section>
  </div>
}
