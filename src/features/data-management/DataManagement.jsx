import { useMemo, useState } from 'react'

const DATA_KEYS = [
  { key: 'astovitals-pak-crew-demo-v2', label: 'Synthetic crew telemetry', description: 'Four synthetic crew histories and simulated readings.' },
  { key: 'astovitals-pak-manual-checkins-v1', label: 'Manual check-ins', description: 'Crew-entered demonstration check-ins. This key is shared by the check-in and analytics views.' },
  { key: 'astrovitals-pak-alert-ack-v1', label: 'Alert acknowledgements', description: 'Local acknowledgement state for generated prototype alerts.' },
  { key: 'astovitals-pak-mission-routines-v1', label: 'Mission routines', description: 'Locally saved checklist tasks and completion state.' },
]

function readSnapshot() {
  const capturedAt = new Date().toISOString()
  const records = DATA_KEYS.map((item) => {
    try {
      const raw = localStorage.getItem(item.key)
      return { ...item, present: raw !== null, value: raw === null ? null : JSON.parse(raw), bytes: raw ? new Blob([raw]).size : 0 }
    } catch {
      return { ...item, present: false, value: null, bytes: 0, error: 'Could not read this browser storage entry.' }
    }
  })
  return { schema: 'astrovitals-pak-local-backup', version: 1, capturedAt, application: 'AstroVitals PAK', storage: 'browser-localStorage', records }
}

function downloadJson(snapshot) {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `astrovitals-pak-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

const panel = 'panel rounded-2xl p-5'

export default function DataManagement() {
  const [message, setMessage] = useState('')
  const snapshot = useMemo(() => readSnapshot(), [message])
  const totalBytes = snapshot.records.reduce((sum, item) => sum + item.bytes, 0)
  const presentCount = snapshot.records.filter((item) => item.present).length

  function exportBackup() {
    try {
      const fresh = readSnapshot()
      downloadJson(fresh)
      setMessage(`Backup prepared at ${new Date().toLocaleTimeString()}.`)
    } catch {
      setMessage('The browser could not create the backup. Check browser download permissions.')
    }
  }

  return <div className="space-y-5">
    <section className={panel}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[.2em] text-cyan-300">SYSTEM WORKSPACE</div>
          <h2 className="mt-1 text-xl font-semibold">Data & privacy center</h2>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">Review the demonstration data saved by this browser and export a portable JSON snapshot. No data is uploaded by this tool.</p>
        </div>
        <span className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[10px] font-semibold text-cyan-200">LOCAL STORAGE ONLY</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3"><div className="text-[10px] text-slate-500">Data categories found</div><div className="mt-1 text-2xl font-semibold">{presentCount} / {DATA_KEYS.length}</div></div>
        <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3"><div className="text-[10px] text-slate-500">Estimated local data size</div><div className="mt-1 text-2xl font-semibold">{totalBytes < 1024 ? `${totalBytes} B` : `${(totalBytes / 1024).toFixed(1)} KB`}</div></div>
        <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3"><div className="text-[10px] text-slate-500">Backup format</div><div className="mt-1 text-2xl font-semibold">JSON</div></div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button onClick={exportBackup} className="rounded-lg bg-cyan-300 px-5 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-200">↓ Export local data backup</button>
        <span className="text-[10px] text-slate-500">Creates a file on this device. It does not change stored records.</span>
      </div>
      {message && <p role="status" className="mt-3 rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3 text-xs text-cyan-100">{message}</p>}
    </section>

    <section className={panel}>
      <h3 className="text-base font-semibold">Stored data inventory</h3>
      <p className="mt-1 text-xs text-slate-400">The inventory lists the application storage categories included in the backup.</p>
      <div className="mt-4 space-y-3">
        {snapshot.records.map((item) => <article key={item.key} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700/70 bg-slate-950/35 p-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h4 className="text-sm font-semibold text-slate-100">{item.label}</h4><span className={`rounded-full border px-2 py-0.5 text-[9px] ${item.present ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200' : 'border-slate-600 text-slate-400'}`}>{item.present ? 'FOUND' : 'NOT CREATED YET'}</span></div>
            <p className="mt-1 text-xs leading-5 text-slate-400">{item.description}</p>
            <code className="mt-2 block break-all text-[9px] text-slate-500">{item.key}</code>
          </div>
          <span className="text-xs text-slate-400">{item.bytes ? `${item.bytes.toLocaleString()} bytes` : '0 bytes'}</span>
        </article>)}
      </div>
    </section>

    <section className="rounded-2xl border border-amber-400/25 bg-amber-400/5 p-5">
      <h3 className="text-sm font-semibold text-amber-100">Privacy and safety boundaries</h3>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-xs leading-5 text-slate-300">
        <li>All crew profiles and automatic telemetry are synthetic demonstration data.</li>
        <li>Manual check-ins are stored in this browser's localStorage. They are not encrypted medical records and are not synchronized to another device.</li>
        <li>The exported JSON may contain notes entered into the demo. Store and share the backup carefully.</li>
        <li>This workspace does not transmit, upload, or restore data. Clearing browser storage or using another browser may make local records unavailable.</li>
        <li>Do not enter real medical, identifying, or confidential astronaut information.</li>
      </ul>
    </section>
  </div>
}
