import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { science } from './data/science.js'
import { nasaHazards, nasaScienceSources } from './data/nasaReferences.js'
import { calculatePersonalBaseline, regionStatus, DEMO_THRESHOLDS } from './logic/baseline.js'
import { createInitialHistory, createLiveTick, SIMULATION_LABEL, TICK_MS } from './sim/simulator.js'
import RegionDetail from './components/RegionDetail.jsx'
import CrewOverview from './features/crew/CrewOverview.jsx'
import DailyCheckIn from './features/health-checkin/DailyCheckIn.jsx'
const HealthAnalytics = lazy(() => import('./features/analytics/HealthAnalytics.jsx'))
const DataManagement = lazy(() => import('./features/data-management/DataManagement.jsx'))
const MissionActivity = lazy(() => import('./features/activity/MissionActivity.jsx'))
import DecisionSupport from './features/decision-support/DecisionSupport.jsx'
import AlertCenter from './features/decision-support/AlertCenter.jsx'
import MissionRoutines from './features/routines/MissionRoutines.jsx'
import MissionControl from './features/mission-control/MissionControl.jsx'
const AnatomyMonitoring = lazy(() => import('./features/anatomy/AnatomyMonitoring.jsx'))

const STORAGE_KEY = 'astovitals-pak-crew-demo-v2'
const statusClasses = {
  normal: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  watch: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  alert: 'bg-rose-400/15 text-rose-300 border-rose-400/30',
  unassessed: 'bg-slate-400/10 text-slate-300 border-slate-400/20',
}
const regionFill = { normal: '#167b70', watch: '#a36b19', alert: '#a33b52', unassessed: '#46536a' }

function createCrewHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : null
    if (Array.isArray(parsed) && parsed.length === 4 && parsed.every((h) => Array.isArray(h) && h.length >= 14)) return parsed
  } catch { /* Replace invalid demo cache. */ }
  return Array.from({ length: 4 }, () => createInitialHistory())
}

function Metric({ label, value, unit, status = 'unassessed' }) {
  return <div className="rounded-xl border border-slate-700/60 bg-slate-950/45 p-3">
    <div className="text-xs text-slate-400">{label} <span className="text-[9px] text-cyan-300">({SIMULATION_LABEL})</span></div>
    <div className="mt-1 flex items-end justify-between gap-2"><div className="text-xl font-semibold tracking-tight">{value}<span className="ml-1 text-xs font-normal text-slate-400">{unit}</span></div><span className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-wider ${statusClasses[status]}`}>{status}</span></div>
  </div>
}

function HumanBody({ selected, statuses, onSelect }) {
  const parts = [
    { id: 'brain', label: 'Brain and mind', d: 'M100 22 C83 22 77 36 82 48 C72 61 82 75 96 76 L104 76 C119 73 126 60 118 48 C123 34 115 22 100 22 Z' },
    { id: 'heart', label: 'Heart and vessels', d: 'M91 91 C80 79 65 89 70 104 C75 118 91 128 100 136 C110 126 126 115 130 102 C134 87 117 80 106 92 L100 99 Z' },
    { id: 'bones', label: 'Bones and muscles', d: 'M82 82 L118 82 L124 151 L114 177 L110 224 L102 224 L100 174 L96 224 L88 224 L86 177 L76 151 Z' },
    { id: 'immune', label: 'Immune system', d: 'M75 91 L58 101 L39 147 L47 151 L69 119 L76 158 L124 158 L131 119 L153 151 L161 147 L142 101 L125 91 Z' },
    { id: 'eyes', label: 'Eyes', d: 'M87 43 Q94 38 99 43 Q94 49 87 43 M102 43 Q108 38 115 43 Q108 49 102 43' },
  ]
  return <svg viewBox="0 0 200 245" role="img" aria-label="Clickable simulated astronaut body regions" className="mx-auto h-[310px] w-full max-w-[260px]">
    <defs><linearGradient id="suit" x1="0" x2="1"><stop offset="0" stopColor="#263d5d"/><stop offset="1" stopColor="#17263e"/></linearGradient></defs>
    <path d="M100 18 C76 18 68 40 76 59 L75 83 L55 96 L32 148 L48 156 L72 123 L76 160 L83 180 L85 231 L103 231 L100 177 L115 231 L133 231 L125 180 L125 160 L128 123 L152 156 L168 148 L145 96 L125 83 L124 59 C132 40 124 18 100 18Z" fill="url(#suit)" stroke="#6c86a9" strokeWidth="2" opacity=".55"/>
    {parts.map((part) => <path key={part.id} d={part.d} fill={regionFill[statuses[part.id]]} fillOpacity={selected === part.id ? 1 : .78} className={`region ${selected === part.id ? 'selected' : ''}`} onClick={() => onSelect(part.id)} role="button" tabIndex="0" aria-label={`Select ${part.label}`} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(part.id)}/>)}
    <path d="M100 80 L100 169 M83 157 L117 157 M100 176 L100 224" stroke="#a9bfdc" strokeWidth="2" opacity=".55" fill="none"/>
    <text x="100" y="242" textAnchor="middle" fill="#91a8c7" fontSize="7" letterSpacing="1.5">CREW AVATAR / SIMULATED</text>
  </svg>
}

export default function App() {
  const [crewHistories, setCrewHistories] = useState(createCrewHistory)
  const [selectedCrew, setSelectedCrew] = useState(0)
  const [selectedRegion, setSelectedRegion] = useState('heart')
  const [mode, setMode] = useState('mission')
  const [tickNumber, setTickNumber] = useState(0)
  const tickRef = useRef(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      tickRef.current += 1
      setCrewHistories((current) => {
        const updated = current.map((history) => [...history, createLiveTick(history[history.length - 1], tickRef.current)].slice(-120))
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch { /* Keep running in memory if storage is unavailable. */ }
        return updated
      })
      setTickNumber(tickRef.current)
    }, TICK_MS)
    return () => window.clearInterval(interval)
  }, [])

  const history = crewHistories[selectedCrew]
  const baseline = useMemo(() => calculatePersonalBaseline(history), [history])
  const latest = history[history.length - 1]
  const statuses = useMemo(() => Object.fromEntries(science.map((r) => [r.id, regionStatus(r.id, latest, baseline)])), [latest, baseline])
  const selected = science.find((item) => item.id === selectedRegion)
  const overall = Object.values(statuses).includes('alert') ? 'alert' : Object.values(statuses).includes('watch') ? 'watch' : 'normal'

  return <main className="starfield min-h-screen px-4 py-5 sm:px-7 lg:px-10"><div className="app-content mx-auto max-w-7xl">
    <header className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-700/60 pb-5 sm:flex-row sm:items-center"><div><div className="mono text-[10px] tracking-[.35em] text-cyan-300">PAKISTAN · MARS TRANSIT SIMULATION</div><h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">AstroVitals <span className="text-cyan-300">PAK</span></h1><p className="mt-1 text-sm text-slate-400">Crew self-assessment and mission health dashboard</p></div><div className="flex flex-wrap items-center gap-2"><span className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-semibold tracking-wider text-cyan-200">● OFFLINE DEMO</span><span className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">MISSION DAY 30+</span></div></header>

    <nav className="app-nav" aria-label="Application navigation">
      <div className="sidebar-brand">
        <div className="brand-emblem"><span className="brand-orbit"/><span className="brand-cross">✚</span></div>
        <div><div className="brand-name">AstroVitals <span>PAK</span></div><div className="brand-caption">CREW HEALTH SYSTEM</div></div>
      </div>
      <div className="sidebar-section-label">MISSION WORKSPACE</div>{[{id:'mission',label:'Mission Control',glyph:'⌂'},{id:'commander',label:'Crew Health',glyph:'◉'},{id:'astronaut',label:'Anatomical Monitoring',glyph:'♧'},{id:'checkin',label:'Daily Health Check-in',glyph:'＋'},{id:'analytics',label:'Health Analytics',glyph:'⌁'},{id:'alerts',label:'Alert Intelligence',glyph:'⚑'},{id:'decision',label:'Decision Support',glyph:'◇'},{id:'routines',label:'Mission Routines',glyph:'◷'},{id:'data',label:'Data & Privacy',glyph:'▤'},{id:'activity',label:'Mission Activity',glyph:'◷'}].map((item) => <button key={item.id} onClick={() => setMode(item.id)} className={`side-link rounded-lg border px-4 py-2 text-xs font-semibold ${mode === item.id ? 'border-cyan-300 bg-cyan-300/10 text-cyan-200' : 'border-slate-700 bg-slate-900 text-slate-400'}`}><span className="side-glyph">{item.glyph}</span>{item.label}</button>)}<div className="sidebar-section-label mt-3">REFERENCE</div><button onClick={() => document.getElementById('mission-science')?.scrollIntoView({behavior:'smooth'})} className="side-link"><span className="side-glyph">⌘</span>NASA Science Library</button></nav>

    {mode === 'mission' ? <MissionControl crewHistories={crewHistories} tickNumber={tickNumber} onSelectCrew={(id) => { setSelectedCrew(id); setMode('astronaut') }} onNavigate={setMode}/> : mode === 'commander' ? <CrewOverview crewHistories={crewHistories} onSelectCrew={(id) => { setSelectedCrew(id); setMode('astronaut') }}/> : mode === 'checkin' ? <DailyCheckIn crewId={selectedCrew}/> : mode === 'analytics' ? <Suspense fallback={<div className="panel rounded-2xl p-6 text-sm text-slate-400">Loading health analytics…</div>}><HealthAnalytics history={history} baseline={baseline} crewId={selectedCrew}/></Suspense> : mode === 'alerts' ? <AlertCenter crewHistories={crewHistories} onOpenCrew={(id) => { setSelectedCrew(id); setMode('astronaut') }}/> : mode === 'decision' ? <DecisionSupport reading={latest} baseline={baseline} crewId={selectedCrew}/> : mode === 'routines' ? <MissionRoutines crewId={selectedCrew}/> : mode === 'data' ? <Suspense fallback={<div className="panel rounded-2xl p-6 text-sm text-slate-400">Loading data workspace…</div>}><DataManagement/></Suspense> : mode === 'activity' ? <Suspense fallback={<div className="panel rounded-2xl p-6 text-sm text-slate-400">Loading mission activity…</div>}><MissionActivity crewHistories={crewHistories} onNavigate={setMode}/></Suspense> : mode === 'astronaut' ? <Suspense fallback={<div className="panel rounded-2xl p-6 text-sm text-slate-400">Loading 3D anatomy viewport…</div>}><AnatomyMonitoring selectedCrew={selectedCrew} selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} statuses={statuses}/></Suspense> : <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700/70 bg-slate-950/40 px-4 py-3"><div><div className="text-[10px] uppercase tracking-widest text-slate-500">Selected synthetic crew profile</div><div className="mt-1 text-sm font-semibold">Crew member {String(selectedCrew + 1).padStart(2, '0')}</div></div><div className="flex flex-wrap gap-2">{crewHistories.map((_, id) => <button key={id} onClick={() => setSelectedCrew(id)} className={`rounded-md border px-3 py-2 text-[10px] ${selectedCrew === id ? 'border-cyan-300 bg-cyan-300/10 text-cyan-200' : 'border-slate-700 text-slate-400'}`}>Crew {id + 1}</button>)}</div></div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3"><div className="panel rounded-2xl p-4"><div className="text-[10px] uppercase tracking-[.2em] text-slate-500">Telemetry status</div><div className="mt-2 flex items-center gap-2 text-sm font-semibold"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"/>LIVE SIMULATION</div><div className="mt-1 text-xs text-slate-500">Synthetic tick every 2 seconds</div></div><div className="panel rounded-2xl p-4"><div className="text-[10px] uppercase tracking-[.2em] text-slate-500">Overall demo status</div><div className="mt-2"><span className={`rounded-full border px-3 py-1 text-xs uppercase ${statusClasses[overall]}`}>{overall}</span></div><div className="mt-2 text-xs text-slate-500">Statistical deviation, not a medical warning</div></div><div className="panel rounded-2xl p-4"><div className="text-[10px] uppercase tracking-[.2em] text-slate-500">Earth communication</div><div className="mt-2 text-sm font-semibold text-amber-200">DELAYED · SCENARIO</div><div className="mt-1 text-xs text-slate-500">One-way delay scenario: approximately 4 to 24 minutes</div></div></div>
      <div className="grid gap-5 lg:grid-cols-[1.05fr_1.3fr]"><section className="panel rounded-2xl p-5"><div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold">Crew body map</h2><p className="mt-1 text-xs text-slate-400">Select a region to open its assessment information.</p></div><span className="rounded-md border border-slate-700 px-2 py-1 text-[9px] tracking-widest text-cyan-200">SIMULATED</span></div><HumanBody selected={selectedRegion} statuses={statuses} onSelect={setSelectedRegion}/><div className="mt-2 flex flex-wrap justify-center gap-3 text-[10px] text-slate-400">{Object.entries({normal:'Normal',watch:'Watch',alert:'Alert',unassessed:'Not assessed'}).map(([key,label]) => <span key={key} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{background:regionFill[key]}}/>{label}</span>)}</div><div className="mt-5"><RegionDetail region={selected} status={statuses[selected.id]}/></div></section>
      <section className="panel rounded-2xl p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Live crew indicators</h2><p className="mt-1 text-xs text-slate-400">Every value below is synthetic demonstration data.</p></div><span className="mono text-[10px] text-cyan-300">T+{tickNumber} TICKS</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><Metric label="Heart rate" value={latest.heartRate} unit="bpm" status={regionStatus('heart',latest,baseline)}/><Metric label="Blood pressure" value={`${latest.systolicBP}/${latest.diastolicBP}`} unit="mmHg" status={regionStatus('heart',latest,baseline)}/><Metric label="Sleep" value={latest.sleepHours} unit="hours" status={regionStatus('brain',latest,baseline)}/><Metric label="Mood" value={latest.mood} unit="/ 5" status={regionStatus('brain',latest,baseline)}/><Metric label="Exercise" value={latest.exerciseMinutes} unit="min" status={regionStatus('bones',latest,baseline)}/><Metric label="Body temperature" value={latest.bodyTemperature} unit="°C" status={regionStatus('immune',latest,baseline)}/></div><div className="mt-5 rounded-xl border border-slate-700/60 bg-slate-950/35 p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Personal baseline</h3><span className="text-[9px] uppercase tracking-widest text-cyan-300">SIMULATED · FIRST 14 DAYS</span></div><p className="mt-1 text-xs leading-5 text-slate-400">Mean and standard deviation calculated from the first 14 simulated daily records. These demo thresholds are not medical reference ranges.</p><div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">{Object.entries(baseline).slice(0,6).map(([key,value]) => <div key={key} className="rounded-lg bg-slate-900/70 p-2"><div className="truncate text-[10px] text-slate-500">{key}</div><div className="mono mt-1 text-slate-200">{value.mean.toFixed(1)} <span className="text-slate-500">± {value.sd.toFixed(2)}</span></div></div>)}</div><div className="mt-3 border-t border-slate-700/60 pt-3 text-[10px] text-slate-500">{DEMO_THRESHOLDS.label}: watch at |z| ≥ {DEMO_THRESHOLDS.watchZ}; alert at |z| ≥ {DEMO_THRESHOLDS.alertZ}. Statistical demo only.</div></div></section></div>
    </>}

    <section id="mission-science" className="panel mt-5 rounded-2xl p-5"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"><div><h2 className="text-lg font-semibold">Mission science reference</h2><p className="mt-1 text-xs text-slate-400">Original project-table entries are preserved and paired with separately labelled NASA source context.</p></div><span className="text-[9px] tracking-widest text-emerald-300">NASA REFERENCES LINKED</span></div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{science.map((item) => <button key={item.id} onClick={() => {setSelectedRegion(item.id);setMode('astronaut')}} className="rounded-xl border border-slate-700/60 bg-slate-950/35 p-4 text-left transition hover:border-cyan-400/50"><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">{item.name}</h3><span className={`rounded-full border px-2 py-0.5 text-[9px] uppercase ${statusClasses[regionStatus(item.id,latest,baseline)]}`}>{regionStatus(item.id,latest,baseline)}</span></div><p className="mt-2 text-xs leading-5 text-slate-400"><span className="text-slate-300">Hazard:</span> {item.hazard}</p><p className="mt-2 text-xs leading-5 text-slate-400"><span className="text-slate-300">NASA risk:</span> {item.nasaRiskName.join('; ')}</p><p className="mt-2 text-xs leading-5 text-slate-400"><span className="text-slate-300">Indicators:</span> {item.indicators.join(', ')}</p><p className="mt-2 text-xs leading-5 text-cyan-200/80">{item.action}</p><p className="mt-3 text-[9px] text-emerald-200/80">{item.evidenceStatus} · <a href={item.sourceUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="underline underline-offset-2">{item.sourceTitle}</a></p></button>)}</div></section>
    <section className="panel mt-5 rounded-2xl p-5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"><div><h2 className="text-lg font-semibold">NASA Human Spaceflight Hazards</h2><p className="mt-1 text-xs text-slate-400">The five-hazard framework described by NASA's Human Research Program.</p></div><a href="https://www.nasa.gov/hrp/hazards/" target="_blank" rel="noreferrer" className="text-[10px] font-semibold text-cyan-300 underline underline-offset-4">OPEN NASA HAZARDS PAGE ↗</a></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{nasaHazards.map((hazard) => <article key={hazard.id} className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-3"><h3 className="text-xs font-semibold text-white">{hazard.name}</h3><p className="mt-2 text-[11px] leading-5 text-slate-400">{hazard.summary}</p><p className="mt-3 text-[9px] text-cyan-300">{hazard.source}</p></article>)}</div>
      <div className="mt-5 border-t border-slate-700/70 pt-4"><h3 className="text-sm font-semibold">NASA research library</h3><p className="mt-1 text-xs text-slate-400">Official NASA pages used for the source-linked summaries above.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{nasaScienceSources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-700/60 bg-slate-950/35 p-3 transition hover:border-cyan-400/50"><span className="block text-xs font-medium text-cyan-200 underline underline-offset-2">{source.title} ↗</span><span className="mt-1 block text-[10px] text-slate-500">{source.topic}</span></a>)}</div></div>
      <p className="mt-4 text-[10px] leading-5 text-slate-500">Evidence boundary: NASA pages provide background on hazards and research risks. They do not validate this prototype's simulated readings, demo z-score thresholds, symptom logic, or medical recommendations. Source pages should be reviewed by the project team before any operational use.</p>
    </section>
    <section id="science-traceability" className="panel mt-5 rounded-2xl p-5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div><div className="mono text-[9px] tracking-[.25em] text-cyan-300">PHASE 6 · EVIDENCE TRACEABILITY</div><h2 className="mt-1 text-lg font-semibold">Hazard-to-health monitoring map</h2><p className="mt-1 text-xs text-slate-400">A navigation and traceability view built only from the project's existing NASA hazard and science reference entries.</p></div>
        <span className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-[9px] font-semibold tracking-widest text-emerald-200">SOURCE-LINKED CONCEPT</span>
      </div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left text-xs"><thead><tr className="border-b border-slate-700 text-[9px] uppercase tracking-widest text-slate-500"><th className="p-3">NASA hazard</th><th className="p-3">Project science area</th><th className="p-3">Indicators in supplied table</th><th className="p-3">Reference</th></tr></thead><tbody>{nasaHazards.map((hazard) => { const linked = science.filter((item) => item.hazard.toLowerCase().includes(hazard.name.toLowerCase().split(' ')[0]) || (hazard.id === 'gravity' && item.hazard.toLowerCase().includes('gravity')) || (hazard.id === 'isolation' && item.hazard.toLowerCase().includes('isolation')) || (hazard.id === 'distance' && item.hazard.toLowerCase().includes('distance')) || (hazard.id === 'environment' && item.hazard.toLowerCase().includes('closed'))); return <tr key={hazard.id} className="border-b border-slate-800/80 align-top"><td className="p-3 font-medium text-slate-200">{hazard.name}</td><td className="p-3 text-slate-300">{linked.length ? linked.map((item) => item.name).join('; ') : <span className="text-amber-200">No direct monitoring row in supplied table</span>}</td><td className="p-3 text-slate-400">{linked.length ? linked.map((item) => item.indicators.join(', ')).join(' · ') : 'Not specified in supplied table'}</td><td className="p-3"><a href={hazard.url} target="_blank" rel="noreferrer" className="text-cyan-200 underline underline-offset-2">NASA hazard reference ↗</a></td></tr> })}</tbody></table></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-4"><h3 className="text-xs font-semibold text-white">How to interpret this map</h3><p className="mt-2 text-[11px] leading-5 text-slate-400">The project science rows preserve the original hazard names, NASA risk names, indicators, explanations and action text. This matrix is a navigation aid, not a claim that every NASA hazard has a validated sensor, indicator or countermeasure in this prototype.</p></article>
        <article className="rounded-xl border border-amber-400/25 bg-amber-400/5 p-4"><h3 className="text-xs font-semibold text-amber-100">Evidence and safety boundary</h3><p className="mt-2 text-[11px] leading-5 text-slate-300">NASA references provide background context only. This prototype does not reproduce NASA operational procedures, establish clinical thresholds, diagnose conditions, or validate treatment recommendations. The live readings remain synthetic; manual entries are user-entered demo data.</p></article>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">{nasaScienceSources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-[10px] text-cyan-200 hover:border-cyan-400/50">{source.title} ↗</a>)}</div>
    </section>
    <footer className="mt-5 flex flex-col justify-between gap-2 border-t border-slate-800 py-4 text-[10px] text-slate-500 sm:flex-row"><span>ASTOVITALS PAK · NASA SPACE APPS 2026 CONCEPT</span><span>DECISION SUPPORT, NOT A DIAGNOSIS · ALL TELEMETRY SIMULATED</span></footer>
  </div></main>
}
