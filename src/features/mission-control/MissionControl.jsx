import { useMemo } from 'react'
import { calculatePersonalBaseline, regionStatus } from '../../logic/baseline.js'
import { science } from '../../data/science.js'

const tones = {
  normal: { label: 'NOMINAL', dot: 'bg-emerald-400', text: 'text-emerald-300', border: 'border-emerald-400/25', wash: 'bg-emerald-400/10' },
  watch: { label: 'MONITOR', dot: 'bg-amber-400', text: 'text-amber-300', border: 'border-amber-400/25', wash: 'bg-amber-400/10' },
  alert: { label: 'REVIEW', dot: 'bg-rose-400', text: 'text-rose-300', border: 'border-rose-400/25', wash: 'bg-rose-400/10' },
}

function getCrewSummary(history, index) {
  const latest = history[history.length - 1]
  const baseline = calculatePersonalBaseline(history)
  const statuses = science.map((region) => regionStatus(region.id, latest, baseline))
  const status = statuses.includes('alert') ? 'alert' : statuses.includes('watch') ? 'watch' : 'normal'
  return { id: index, latest, status, watchCount: statuses.filter((v) => v === 'watch').length, alertCount: statuses.filter((v) => v === 'alert').length }
}

function StatCard({ label, value, detail, icon, accent = 'cyan' }) {
  const accents = { cyan: 'text-cyan-300 bg-cyan-300/10 border-cyan-300/20', amber: 'text-amber-300 bg-amber-300/10 border-amber-300/20', rose: 'text-rose-300 bg-rose-300/10 border-rose-300/20', green: 'text-emerald-300 bg-emerald-300/10 border-emerald-300/20' }
  return <article className="mc-stat panel rounded-2xl p-4"><div className="flex items-start justify-between gap-3"><span className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">{label}</span><span className={`grid h-9 w-9 place-items-center rounded-xl border text-base ${accents[accent]}`}>{icon}</span></div><div className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</div><div className="mt-1 text-[11px] text-slate-500">{detail}</div></article>
}

function CrewCard({ member, onSelect }) {
  const tone = tones[member.status]
  const r = member.latest
  return <button onClick={() => onSelect(member.id)} className="mc-crew-card group rounded-2xl border border-slate-700/70 bg-slate-950/45 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-cyan-300/[.045] focus:outline-none focus:ring-2 focus:ring-cyan-300/60">
    <div className="flex items-start justify-between gap-2"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-sm font-semibold text-cyan-100">0{member.id + 1}</div><div><div className="text-sm font-semibold text-white">Crew member {String(member.id + 1).padStart(2, '0')}</div><div className="mt-1 text-[10px] text-slate-500">Mission specialist · Demo profile</div></div></div><span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-semibold tracking-wider ${tone.border} ${tone.wash} ${tone.text}`}><span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`}/>{tone.label}</span></div>
    <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">{[['Heart rate',r.heartRate,'bpm'],['Blood pressure',`${r.systolicBP}/${r.diastolicBP}`,'mmHg'],['Sleep',r.sleepHours,'hrs'],['Mood',r.mood,'/ 5']].map(([label,value,unit]) => <div key={label}><div className="text-[9px] uppercase tracking-wider text-slate-500">{label}</div><div className="mt-1 text-lg font-semibold text-slate-100">{value}<span className="ml-1 text-[10px] font-normal text-slate-500">{unit}</span></div></div>)}</div>
    <div className="mt-4 flex items-center justify-between border-t border-slate-700/60 pt-3"><span className="text-[10px] text-slate-500">{member.alertCount ? `${member.alertCount} flagged region(s)` : member.watchCount ? `${member.watchCount} region(s) to monitor` : 'No flagged regions'}</span><span className="text-[10px] font-semibold text-cyan-300 group-hover:text-cyan-100">OPEN PROFILE ↗</span></div>
  </button>
}

export default function MissionControl({ crewHistories, onSelectCrew, onNavigate, tickNumber }) {
  const crew = useMemo(() => crewHistories.map(getCrewSummary), [crewHistories])
  const totals = useMemo(() => ({ alerts: crew.reduce((sum, m) => sum + m.alertCount, 0), watch: crew.reduce((sum, m) => sum + m.watchCount, 0), nominal: crew.filter((m) => m.status === 'normal').length }), [crew])
  const latestUpdate = crew.reduce((max, m) => Math.max(max, new Date(m.latest.timestamp).getTime()), 0)
  const updateLabel = latestUpdate ? new Date(latestUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Awaiting data'
  const actions = [['checkin','＋','Record daily health check-in','Enter crew-reported observations'],['analytics','⌁','Explore health analytics','Review history and personal baselines'],['decision','⚑','Open decision support','Review flagged indicators and context'],['routines','◷','Mission routines','View scheduled wellbeing activities']]
  return <div className="space-y-5">
    <section className="mc-hero relative overflow-hidden rounded-2xl border border-cyan-300/20 p-5 sm:p-7"><div className="mc-hero-grid" aria-hidden="true"/><div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div className="max-w-2xl"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-[9px] font-semibold tracking-[.18em] text-cyan-200">MISSION CONTROL</span><span className="text-[9px] tracking-[.16em] text-slate-500">FLIGHT OPERATIONS / HEALTH SYSTEMS</span></div><h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Crew health overview<span className="text-cyan-300">.</span></h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">A mission-level view of crew wellbeing, health indicators and monitoring activity. Select a crew profile to explore individual readings.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => onNavigate('commander')} className="rounded-xl border border-slate-600/80 bg-slate-950/40 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/50">CREW HEALTH</button><button onClick={() => onNavigate('analytics')} className="rounded-xl bg-cyan-300 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-200">VIEW ANALYTICS ↗</button></div></div>
      <div className="relative z-10 mt-7 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3"><div><div className="text-[9px] uppercase tracking-[.17em] text-slate-500">Mission scenario</div><div className="mt-1 text-xs font-semibold text-slate-200">Mars transit simulation</div></div><div><div className="text-[9px] uppercase tracking-[.17em] text-slate-500">Mission elapsed</div><div className="mt-1 text-xs font-semibold text-slate-200">DAY 30+ <span className="font-normal text-slate-500">· illustrative</span></div></div><div><div className="text-[9px] uppercase tracking-[.17em] text-slate-500">Telemetry refreshed</div><div className="mono mt-1 text-xs font-semibold text-cyan-200">{updateLabel}</div></div></div>
    </section>
    <section className="mission-orbit-strip panel relative overflow-hidden rounded-2xl p-4 sm:p-5" aria-label="Illustrative Mars transit mission status">
      <div className="relative z-10 grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[.2em] text-cyan-300">DEEP SPACE FLIGHT DECK</div>
          <div className="mt-1 text-sm font-semibold text-slate-100">Mars transit · mission environment</div>
          <p className="mt-1 max-w-xl text-[10px] leading-5 text-slate-400">Illustrative mission context for this prototype. Orbital artwork and mission labels are decorative scenario elements, not live spacecraft navigation.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="mission-chip"><i/> SIMULATION ACTIVE</span>
            <span className="mission-chip">EARTH LINK · DELAYED SCENARIO</span>
            <span className="mission-chip">CREW · 04 PROFILES</span>
          </div>
        </div>
        <div className="mission-orbit-art" aria-hidden="true">
          <span className="orbit-ring orbit-ring-one"/><span className="orbit-ring orbit-ring-two"/>
          <span className="orbit-planet"/><span className="orbit-moon"/>
          <span className="orbit-cross orbit-cross-one"/><span className="orbit-cross orbit-cross-two"/>
        </div>
      </div>
    </section>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Crew monitored" value="04 / 04" detail="Synthetic demonstration profiles" icon="◉" accent="cyan"/><StatCard label="Nominal profiles" value={String(totals.nominal).padStart(2,'0')} detail="No flagged demo regions" icon="✓" accent="green"/><StatCard label="Watch indicators" value={String(totals.watch).padStart(2,'0')} detail="Statistical deviations to review" icon="△" accent="amber"/><StatCard label="Alert indicators" value={String(totals.alerts).padStart(2,'0')} detail="Demo thresholds only" icon="!" accent="rose"/></section>
    <section><div className="mb-3 flex flex-wrap items-end justify-between gap-2"><div><div className="text-[10px] font-semibold uppercase tracking-[.18em] text-cyan-300">Crew monitoring</div><h3 className="mt-1 text-lg font-semibold text-white">Individual crew status</h3><p className="mt-1 text-xs text-slate-500">Four synthetic profiles · automatically updating demonstration telemetry</p></div><span className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-[9px] font-semibold tracking-wider text-emerald-300"><span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"/>SIMULATION ACTIVE · T+{tickNumber}</span></div><div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">{crew.map((member) => <CrewCard key={member.id} member={member} onSelect={onSelectCrew}/>)}</div></section>
    <section className="grid gap-3 lg:grid-cols-[1.15fr_.85fr]"><article className="panel rounded-2xl p-5"><div className="flex items-center justify-between gap-3"><div><div className="text-[9px] font-semibold uppercase tracking-[.18em] text-cyan-300">Mission systems</div><h3 className="mt-1 text-base font-semibold text-white">Operational context</h3></div><span className="text-[9px] text-slate-500">SCENARIO DATA</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{[['Earth communication','DELAYED · SCENARIO','Illustrative one-way delay: approximately 4–24 minutes.'],['Data storage','LOCAL DEMO CACHE','Readings persist in this browser using localStorage.'],['Monitoring cadence','2-SECOND TICK','Synthetic values update for interface demonstration.'],['System mode','OFFLINE CAPABLE','No external health-data service is connected.']].map(([label,value,detail]) => <div key={label} className="rounded-xl border border-slate-700/60 bg-slate-950/35 p-3"><div className="text-[9px] uppercase tracking-wider text-slate-500">{label}</div><div className="mt-2 text-sm font-semibold text-slate-100">{value}</div><div className="mt-1 text-[10px] leading-4 text-slate-500">{detail}</div></div>)}</div></article>
      <article className="panel rounded-2xl p-5"><div className="text-[9px] font-semibold uppercase tracking-[.18em] text-cyan-300">Quick actions</div><h3 className="mt-1 text-base font-semibold text-white">Mission workspace</h3><div className="mt-4 space-y-2">{actions.map(([target,icon,title,description]) => <button key={target} onClick={() => onNavigate(target)} className="flex w-full items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-950/30 p-3 text-left transition hover:border-cyan-300/35 hover:bg-cyan-300/[.04]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-sm text-cyan-200">{icon}</span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-100">{title}</span><span className="mt-1 block text-[10px] text-slate-500">{description}</span></span><span className="text-xs text-slate-500">↗</span></button>)}</div></article></section>
    <p className="rounded-xl border border-amber-300/15 bg-amber-300/[.045] px-4 py-3 text-[10px] leading-5 text-slate-400"><span className="font-semibold text-amber-200">DEMO SAFETY NOTE:</span> All crew profiles and live telemetry on this screen are synthetic. Status counts use this prototype's statistical demonstration logic. They are not clinical thresholds, medical diagnoses, or flight-surgeon decisions.</p>
  </div>
}
