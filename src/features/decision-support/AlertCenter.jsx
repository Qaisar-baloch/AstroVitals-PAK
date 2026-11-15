import { useMemo, useState } from 'react'
import { calculatePersonalBaseline } from '../../logic/baseline.js'
import { evaluateDecisionSupport } from '../../logic/decisionSupport.js'

const ACK_KEY = 'astrovitals-pak-alert-ack-v1'
const MANUAL_KEY = 'astovitals-pak-manual-checkins-v1'
const styles = {
  Information: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
  Warning: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  Critical: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
}
function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback } catch { return fallback } }
function getManual(id) { const all = readJSON(MANUAL_KEY, {}); return Array.isArray(all[String(id)]) ? all[String(id)] : [] }

export default function AlertCenter({ crewHistories, onOpenCrew }) {
  const [acked, setAcked] = useState(() => readJSON(ACK_KEY, {}))
  const [filter, setFilter] = useState('All')
  const alerts = useMemo(() => {
    const list = []
    crewHistories.forEach((history, crewId) => {
      if (!history?.length) return
      const reading = history[history.length - 1]
      const baseline = calculatePersonalBaseline(history)
      const result = evaluateDecisionSupport({ reading, baseline, manualRecords: getManual(crewId) })
      result.alertDeviations.forEach((item) => list.push({ id: `c${crewId}-${item.key}-alert`, crewId, severity: 'Critical', source: 'SIMULATED TELEMETRY', title: `${item.label} statistical deviation`, detail: `Absolute z-score ${item.zScore?.toFixed(2) ?? 'N/A'} against this profile's demo baseline. This is not a medical threshold.`, action: 'Review the trend and follow the mission medical protocol.' }))
      result.watchDeviations.forEach((item) => list.push({ id: `c${crewId}-${item.key}-watch`, crewId, severity: 'Warning', source: 'SIMULATED TELEMETRY', title: `${item.label} trend requires review`, detail: `Absolute z-score ${item.zScore?.toFixed(2) ?? 'N/A'} against this profile's demo baseline.`, action: 'Review recent readings and compare with the crew member’s check-in.' }))
      result.manualConcerns.forEach((item) => list.push({ id: `c${crewId}-manual-${item.id}-${getManual(crewId)[0]?.id || 'latest'}`, crewId, severity: 'Warning', source: 'CREW-ENTERED', title: item.title, detail: item.detail, action: 'Review the reported observation with the crew member and follow mission protocol.' }))
    })
    return list.sort((a, b) => ({ Critical: 0, Warning: 1, Information: 2 }[a.severity] - { Critical: 0, Warning: 1, Information: 2 }[b.severity]))
  }, [crewHistories])
  const visible = alerts.filter((a) => filter === 'All' || a.severity === filter)
  const acknowledgedCount = alerts.filter((a) => acked[a.id]).length
  function acknowledge(id) { const next = { ...acked, [id]: new Date().toISOString() }; setAcked(next); try { localStorage.setItem(ACK_KEY, JSON.stringify(next)) } catch {} }
  function clearHistory() { const active = new Set(alerts.map((a) => a.id)); const next = Object.fromEntries(Object.entries(acked).filter(([id]) => active.has(id))); setAcked(next); try { localStorage.setItem(ACK_KEY, JSON.stringify(next)) } catch {} }
  return <div className="space-y-5">
    <section className="panel rounded-2xl p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-[10px] uppercase tracking-[.2em] text-cyan-300">COMMANDER WORKSPACE</div><h2 className="mt-1 text-xl font-semibold">Alert intelligence center</h2><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">A consolidated view of prototype alerts across all four synthetic crew profiles. Alerts support review and acknowledgement; they do not diagnose or determine medical urgency.</p></div><span className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[10px] text-cyan-200">LOCAL DEMO · NO REMOTE NOTIFICATIONS</span></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-4"><div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3"><div className="text-[10px] text-slate-500">Active alerts</div><div className="mt-1 text-2xl font-semibold">{alerts.length}</div></div><div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-3"><div className="text-[10px] text-rose-200/70">Critical</div><div className="mt-1 text-2xl font-semibold text-rose-200">{alerts.filter(a=>a.severity==='Critical').length}</div></div><div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3"><div className="text-[10px] text-amber-200/70">Warnings</div><div className="mt-1 text-2xl font-semibold text-amber-200">{alerts.filter(a=>a.severity==='Warning').length}</div></div><div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3"><div className="text-[10px] text-emerald-200/70">Acknowledged</div><div className="mt-1 text-2xl font-semibold text-emerald-200">{acknowledgedCount}</div></div></div>
    </section>
    <section className="panel rounded-2xl p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-base font-semibold">Crew alert feed</h3><p className="mt-1 text-xs text-slate-400">Sorted by severity. Acknowledgements are stored locally in this browser.</p></div><div className="flex flex-wrap gap-2">{['All','Critical','Warning'].map(v=><button key={v} onClick={()=>setFilter(v)} className={`rounded-lg border px-3 py-2 text-[10px] ${filter===v?'border-cyan-300 bg-cyan-300/10 text-cyan-200':'border-slate-700 text-slate-400'}`}>{v}</button>)}</div></div>
      {visible.length===0 ? <div className="mt-4 rounded-xl border border-dashed border-slate-700 p-8 text-center"><div className="text-sm font-semibold text-slate-200">No alerts in this view</div><p className="mt-1 text-xs text-slate-500">No current demo deviations or crew-entered observations match this filter.</p></div> : <div className="mt-4 space-y-3">{visible.map(a=><article key={a.id} className="rounded-xl border border-slate-700/70 bg-slate-950/35 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase ${styles[a.severity]}`}>{a.severity}</span><span className="text-[10px] text-slate-500">Crew {a.crewId+1} · {a.source}</span></div><span className={`text-[9px] uppercase tracking-wider ${acked[a.id]?'text-emerald-300':'text-amber-200'}`}>{acked[a.id]?'Acknowledged':'Awaiting review'}</span></div><h4 className="mt-3 text-sm font-semibold text-slate-100">{a.title}</h4><p className="mt-1 text-xs leading-5 text-slate-400">{a.detail}</p><div className="mt-3 rounded-lg border border-cyan-400/15 bg-cyan-400/5 p-3"><div className="text-[9px] uppercase tracking-widest text-cyan-300">Suggested workflow</div><p className="mt-1 text-xs text-slate-300">{a.action}</p></div><div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>onOpenCrew?.(a.crewId)} className="rounded-lg border border-slate-700 px-3 py-2 text-[10px] text-slate-300 hover:border-cyan-400">Open crew profile</button><button disabled={!!acked[a.id]} onClick={()=>acknowledge(a.id)} className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[10px] text-cyan-200 disabled:cursor-default disabled:opacity-40">{acked[a.id]?'Acknowledged':'Acknowledge alert'}</button></div></article>)}</div>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-700/60 pt-3"><p className="text-[10px] text-slate-500">Acknowledgement records are local demo state, not a secure audit log.</p><button onClick={clearHistory} className="text-[10px] text-slate-400 underline underline-offset-4">Prune acknowledgements for cleared alerts</button></div>
    </section>
    <section className="rounded-2xl border border-amber-400/25 bg-amber-400/5 p-4"><h3 className="text-sm font-semibold text-amber-100">Safety and interpretation</h3><p className="mt-2 text-xs leading-5 text-slate-300">Critical and warning labels are generated from prototype statistical deviations and user-entered observations. They are not clinical severity classifications. For real operations, use the mission's approved medical procedures and qualified medical personnel. This offline prototype cannot transmit alerts or contact a flight surgeon.</p></section>
  </div>
}
