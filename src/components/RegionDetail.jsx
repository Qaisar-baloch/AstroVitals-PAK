import { SIMULATION_LABEL } from '../sim/simulator.js'

export default function RegionDetail({ region, status }) {
  if (!region) return null
  return (
    <section className="rounded-xl border border-cyan-400/25 bg-cyan-400/5 p-4" aria-live="polite">
      <div className="text-[10px] uppercase tracking-[.2em] text-cyan-300">Selected body region · {SIMULATION_LABEL}</div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-white">{region.name}</h3>
        <span className="rounded-full border border-slate-600 px-3 py-1 text-[10px] uppercase text-slate-200">{status}</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-950/50 p-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">Spaceflight hazard</div><p className="mt-1 text-sm text-slate-200">{region.hazard}</p></div>
        <div className="rounded-lg bg-slate-950/50 p-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">Health indicators</div><ul className="mt-1 list-inside list-disc text-sm text-slate-200">{region.indicators.map((x) => <li key={x}>{x}</li>)}</ul></div>
      </div>
      <div className="mt-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">NASA risk names from supplied table</div><p className="mt-1 text-sm leading-6 text-slate-200">{region.nasaRiskName.join('; ')}</p></div>
      <div className="mt-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">Plain-language explanation</div><p className="mt-1 text-sm leading-6 text-slate-300">{region.explanation}</p></div>
      <div className="mt-3 rounded-lg border border-cyan-400/20 bg-slate-950/40 p-3"><div className="text-[10px] uppercase tracking-wider text-cyan-300">Application action from supplied table</div><p className="mt-1 text-sm leading-6 text-slate-200">{region.action}</p></div>
      {region.nasaContext && <div className="mt-3 rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-3"><div className="text-[10px] uppercase tracking-wider text-emerald-300">NASA source context · source-linked summary</div><p className="mt-1 text-sm leading-6 text-slate-300">{region.nasaContext}</p></div>}
      <div className="mt-3 break-words text-[10px] text-emerald-200/90">NASA reference: <a href={region.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-emerald-400/50 underline-offset-2 hover:text-white">{region.sourceTitle || region.sourceUrl}</a></div>
      <p className="mt-3 text-[10px] leading-5 text-slate-500">The original risk names and app actions are retained from the supplied project table; the NASA context is a separate source-linked summary. This panel does not diagnose a condition or establish medical thresholds. Measurement instructions and clinical actions require separately verified sources.</p>
    </section>
  )
}
