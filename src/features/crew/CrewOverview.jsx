import { calculatePersonalBaseline, regionStatus } from '../../logic/baseline.js'
import { science } from '../../data/science.js'

const badge = {
  normal: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  watch: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  alert: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
  unassessed: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
}

export default function CrewOverview({ crewHistories, onSelectCrew }) {
  const crew = crewHistories.map((history, index) => {
    const latest = history[history.length - 1]
    const baseline = calculatePersonalBaseline(history)
    const regionStatuses = science.map((region) => regionStatus(region.id, latest, baseline))
    const overall = regionStatuses.includes('alert') ? 'alert' : regionStatuses.includes('watch') ? 'watch' : 'normal'
    return { id: index, name: `Crew member ${String(index + 1).padStart(2, '0')}`, latest, overall }
  })
  return (
    <section className="panel rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">Crew health overview</h2><p className="mt-1 text-xs text-slate-400">Four independent synthetic profiles for interface demonstration.</p></div><span className="rounded-md border border-cyan-400/30 px-2 py-1 text-[9px] tracking-widest text-cyan-200">SIMULATED CREW</span></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {crew.map((member) => <button key={member.id} onClick={() => onSelectCrew(member.id)} className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-4 text-left transition hover:border-cyan-400/50 hover:bg-cyan-400/5">
          <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{member.name}</span><span className={`rounded-full border px-2 py-1 text-[9px] uppercase ${badge[member.overall]}`}>{member.overall}</span></div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div><div className="text-[10px] text-slate-500">Heart rate</div><div className="mt-1 text-base font-semibold">{member.latest.heartRate} <span className="text-[10px] font-normal text-slate-500">bpm</span></div></div>
            <div><div className="text-[10px] text-slate-500">Sleep</div><div className="mt-1 text-base font-semibold">{member.latest.sleepHours} <span className="text-[10px] font-normal text-slate-500">h</span></div></div>
            <div><div className="text-[10px] text-slate-500">Mood</div><div className="mt-1 text-base font-semibold">{member.latest.mood}<span className="text-[10px] font-normal text-slate-500"> / 5</span></div></div>
            <div><div className="text-[10px] text-slate-500">Exercise</div><div className="mt-1 text-base font-semibold">{member.latest.exerciseMinutes}<span className="text-[10px] font-normal text-slate-500"> min</span></div></div>
          </div><div className="mt-3 text-[9px] uppercase tracking-wider text-cyan-300">Select crew member</div>
        </button>)}
      </div>
      <p className="mt-4 text-[10px] leading-5 text-slate-500">Commander view is an optional demonstration extension. It contains no real crew records and does not replace astronaut self-assessment or flight-surgeon review.</p>
    </section>
  )
}
