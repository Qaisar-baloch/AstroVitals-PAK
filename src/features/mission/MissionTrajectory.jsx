import { useState } from 'react'

const phases = [
  { id: 'departure', day: 'DAY 01', title: 'Earth departure', detail: 'Crew health baseline established before the illustrative transit begins.', focus: 'Pre-flight baseline', context: 'Record initial self-assessments and review each crew member’s personal reference range.' },
  { id: 'cruise', day: 'DAY 30+', title: 'Deep-space cruise', detail: 'The current demonstration phase: routine check-ins, trend review and alert triage.', focus: 'Routine monitoring', context: 'Review crew-reported check-ins, compare trends with personal demo baselines and acknowledge items requiring follow-up.' },
  { id: 'approach', day: 'ARRIVAL', title: 'Mars approach', detail: 'A planning phase illustrating the transition toward arrival operations.', focus: 'Readiness review', context: 'Consolidate health summaries and unresolved follow-up items for a hypothetical mission handover.' },
]

export default function MissionTrajectory() {
  const [active, setActive] = useState('cruise')
  const phase = phases.find((item) => item.id === active) || phases[1]
  return <div className="space-y-5">
    <header className="panel rounded-2xl p-5 sm:p-6">
      <div className="text-xs font-semibold tracking-[.2em] text-cyan-300">MISSION DESIGN / FLIGHT PROFILE</div>
      <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Earth-to-Mars mission timeline</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Explore the health-monitoring priorities across an illustrative Mars transit. Select a phase to see the crew-health focus and suggested workflow.</p>
    </header>
    <section className="panel overflow-hidden rounded-2xl p-4 sm:p-6">
      <div className="mission-route-visual" role="img" aria-label="Illustrative Earth to Mars route diagram, not a navigational trajectory">
        <div className="route-body earth"><span className="route-planet-label">EARTH</span><span className="route-planet earth-globe"/></div>
        <div className="route-path"><span className="route-path-line"/><span className="route-spacecraft">✦</span><span className="route-path-caption">ILLUSTRATIVE TRANSIT PATH</span></div>
        <div className="route-body mars"><span className="route-planet-label">MARS</span><span className="route-planet mars-globe"/></div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {phases.map((item) => <button key={item.id} onClick={() => setActive(item.id)} aria-pressed={active === item.id} className={`rounded-xl border p-3 text-left transition ${active === item.id ? 'border-cyan-300/60 bg-cyan-300/10' : 'border-slate-700 bg-slate-950/30 hover:border-cyan-300/30'}`}>
          <span className="text-xs font-semibold tracking-wider text-cyan-300">{item.day}</span>
          <span className="mt-1 block text-sm font-semibold text-slate-100">{item.title}</span>
          <span className="mt-1 block text-xs leading-5 text-slate-400">{item.detail}</span>
        </button>)}
      </div>
    </section>
    <section className="grid gap-3 lg:grid-cols-[.8fr_1.2fr]">
      <article className="panel rounded-2xl p-5">
        <div className="text-xs font-semibold tracking-[.18em] text-cyan-300">SELECTED PHASE</div>
        <div className="mt-2 text-2xl font-semibold text-white">{phase.title}</div>
        <div className="mt-1 text-sm font-semibold text-cyan-200">{phase.day}</div>
        <div className="mt-5 text-xs uppercase tracking-wider text-slate-400">Health-monitoring priority</div>
        <div className="mt-2 text-lg font-semibold text-slate-100">{phase.focus}</div>
      </article>
      <article className="panel rounded-2xl p-5">
        <div className="text-xs font-semibold tracking-[.18em] text-cyan-300">CREW HEALTH WORKFLOW</div>
        <p className="mt-3 text-sm leading-7 text-slate-200">{phase.context}</p>
        <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/[.05] p-3 text-sm leading-6 text-slate-300"><strong className="text-amber-200">Scenario boundary:</strong> This is a conceptual timeline for demonstration. It does not calculate orbital mechanics, predict travel duration, display spacecraft position or use live NASA mission data.</div>
      </article>
    </section>
  </div>
}
