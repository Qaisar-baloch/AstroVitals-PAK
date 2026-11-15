import { useMemo, useState } from 'react'
import { evaluateDecisionSupport } from '../../logic/decisionSupport.js'

const STORAGE_KEY = 'astovitals-pak-manual-checkins-v1'

function readManualRecords(crewId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return Array.isArray(all[String(crewId)]) ? all[String(crewId)] : []
  } catch {
    return []
  }
}

const tone = {
  alert: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  watch: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  normal: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  reported: 'border-amber-400/30 bg-amber-400/10 text-amber-100',
  pattern: 'border-rose-400/30 bg-rose-400/10 text-rose-100',
}

function StatusPill({ value }) {
  return <span className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider ${tone[value] || tone.normal}`}>{value}</span>
}

export default function DecisionSupport({ reading, baseline, crewId }) {
  const [refresh, setRefresh] = useState(0)
  const manualRecords = useMemo(() => readManualRecords(crewId), [crewId, refresh])
  const result = useMemo(() => evaluateDecisionSupport({ reading, baseline, manualRecords }), [reading, baseline, manualRecords])

  const refreshManual = () => setRefresh((value) => value + 1)

  return (
    <div className="space-y-5">
      <section className="panel rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[.2em] text-cyan-300">Crew member {String(crewId + 1).padStart(2, '0')}</div>
            <h2 className="mt-1 text-xl font-semibold">Mission decision support</h2>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">A structured review of statistical demo deviations and crew-entered observations. This screen does not diagnose or determine medical urgency.</p>
          </div>
          <span className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[10px] font-semibold text-cyan-200">DECISION SUPPORT · NOT A DIAGNOSIS</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3"><div className="text-[10px] text-slate-500">Demo alert deviations</div><div className="mt-1 text-2xl font-semibold">{result.alertDeviations.length}</div></div>
          <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3"><div className="text-[10px] text-slate-500">Demo watch deviations</div><div className="mt-1 text-2xl font-semibold">{result.watchDeviations.length}</div></div>
          <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3"><div className="text-[10px] text-slate-500">Saved manual check-ins</div><div className="mt-1 text-2xl font-semibold">{result.manualRecordCount}</div></div>
        </div>
      </section>

      <section className="panel rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><h3 className="text-base font-semibold">Synthetic telemetry review</h3><p className="mt-1 text-xs text-slate-400">Compared with this profile's first-14-day personal demo baseline.</p></div>
          <span className="rounded-md border border-cyan-400/30 px-2 py-1 text-[9px] text-cyan-200">SIMULATED</span>
        </div>
        {result.deviations.length ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {result.deviations.map((item) => <div key={item.key} className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/60 bg-slate-950/35 p-3">
              <div><div className="text-xs font-medium text-slate-200">{item.label}</div><div className="mt-1 text-[10px] text-slate-500">Absolute z-score: {item.zScore?.toFixed(2) ?? 'N/A'}</div></div>
              <StatusPill value={item.state}/>
            </div>)}
          </div>
        ) : <p className="mt-4 text-xs text-slate-500">No assessable telemetry metrics.</p>}
        <div className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-[11px] leading-5 text-amber-100/80">
          Demo thresholds only: watch at |z| ≥ 1.5 and alert at |z| ≥ 2.5. These are software demonstration thresholds, not medical limits. A statistical alert is not evidence of a medical emergency.
        </div>
      </section>

      <section className="panel rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><h3 className="text-base font-semibold">Crew-entered observations</h3><p className="mt-1 text-xs text-slate-400">Symptoms and vision changes from this crew member's saved check-ins.</p></div>
          <div className="flex items-center gap-2"><span className="rounded-md border border-amber-400/30 px-2 py-1 text-[9px] text-amber-200">USER-ENTERED</span><button onClick={refreshManual} className="rounded-md border border-slate-700 px-2 py-1 text-[10px] text-slate-300 hover:border-cyan-400">Refresh</button></div>
        </div>
        {result.manualConcerns.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-slate-700 p-5 text-center">
            <p className="text-sm font-medium text-slate-200">No symptoms or vision changes recorded in the latest check-in.</p>
            <p className="mt-1 text-xs text-slate-500">This means no concerns were selected in the latest saved entry. It does not establish that the crew member is medically well.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {result.manualConcerns.map((concern) => <article key={concern.id} className={`rounded-xl border p-4 ${tone[concern.level]}`}>
              <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-semibold">{concern.title}</h4><StatusPill value={concern.level}/></div>
              <p className="mt-2 text-xs leading-5">{concern.detail}</p>
              {concern.repeated?.length > 0 && <p className="mt-2 text-[10px]">Repeated selections: {concern.repeated.join(', ')}</p>}
            </article>)}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-400/10 p-2 text-amber-200">!</div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-amber-100">Recommended workflow prompt</h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">If a crew member reports symptoms, a vision change, or a concerning pattern, review the observations and follow the mission's medical protocol. Contact the flight surgeon when required by that protocol.</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">For an urgent or rapidly worsening situation, use the mission's established emergency procedure. This prototype cannot contact Earth, send an alert, or determine urgency.</p>
          </div>
        </div>
      </section>

      <section className="panel rounded-2xl p-5">
        <h3 className="text-sm font-semibold">How this prototype makes decisions</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-5 text-slate-400">
          <li>Synthetic measurements are compared with the profile's personal demo baseline using z-scores.</li>
          <li>Manual symptoms and vision changes are displayed as crew-reported observations, not diagnoses.</li>
          <li>A repeated selection across the latest two saved check-ins is labelled as a repeated pattern, not a clinical escalation threshold.</li>
          <li>No treatment, medication, or medical reference range is prescribed.</li>
        </ul>
      </section>
    </div>
  )
}
