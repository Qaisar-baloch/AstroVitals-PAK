import { useMemo, useState } from 'react'

const templates = [
  'Crew health summary ready for review.',
  'Daily check-in completed by crew member.',
  'Follow-up requested for a flagged demo indicator.',
]
const initial = [
  { id: 1, from: 'MISSION CONTROL', to: 'CREW HABITAT', body: 'Routine status request: submit the next crew health check-in.', state: 'Delivered', time: 'T−00:18' },
  { id: 2, from: 'CREW HABITAT', to: 'MISSION CONTROL', body: 'Acknowledged. Health summary is being prepared.', state: 'Delivered', time: 'T−00:11' },
]

export default function MissionComms() {
  const [delay, setDelay] = useState(12)
  const [draft, setDraft] = useState(templates[0])
  const [messages, setMessages] = useState(initial)
  const [nextId, setNextId] = useState(3)
  const queued = useMemo(() => messages.filter((item) => item.state === 'Queued').length, [messages])
  const send = () => {
    const body = draft.trim()
    if (!body) return
    setMessages((items) => [{ id: nextId, from: 'MISSION CONTROL', to: 'CREW HABITAT', body, state: 'Queued', time: 'JUST NOW' }, ...items])
    setNextId((value) => value + 1)
    setDraft('')
  }
  const simulateDelivery = (id) => setMessages((items) => items.map((item) => item.id === id ? { ...item, state: 'Delivered', time: `SIMULATED +${delay} MIN` } : item))
  const simulateAll = () => setMessages((items) => items.map((item) => item.state === 'Queued' ? { ...item, state: 'Delivered', time: `SIMULATED +${delay} MIN` } : item))
  return <div className="space-y-5">
    <header className="panel rounded-2xl p-5 sm:p-6">
      <div className="text-xs font-semibold tracking-[.2em] text-cyan-300">DEEP SPACE NETWORK / COMMUNICATIONS</div>
      <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Mission communications simulator</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Explore how message queues and communication delay could affect crew coordination during a deep-space mission.</p>
    </header>
    <section className="grid gap-3 sm:grid-cols-3">
      <article className="panel rounded-2xl p-4"><div className="text-xs uppercase tracking-wider text-slate-300">Link scenario</div><div className="mt-2 text-xl font-semibold text-amber-200">DELAYED</div><div className="mt-1 text-xs text-slate-300">Conceptual deep-space link</div></article>
      <article className="panel rounded-2xl p-4"><div className="text-xs uppercase tracking-wider text-slate-300">One-way delay</div><div className="mt-2 text-xl font-semibold text-white">{delay} minutes</div><div className="mt-1 text-xs text-slate-300">Adjustable scenario value</div></article>
      <article className="panel rounded-2xl p-4"><div className="text-xs uppercase tracking-wider text-slate-300">Queued messages</div><div className="mt-2 text-xl font-semibold text-cyan-200">{queued}</div><div className="mt-1 text-xs text-slate-300">Awaiting simulated delivery</div></article>
    </section>
    <section className="panel rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-semibold text-white">Communication link configuration</h3><p className="mt-1 text-sm text-slate-300">Set the illustrative one-way delay for this scenario.</p></div><span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100">SIMULATION ONLY</span></div>
      <div className="mt-5"><div className="flex items-center justify-between text-sm text-slate-200"><label htmlFor="delay-range">One-way communication delay</label><strong className="text-cyan-200">{delay} min</strong></div><input id="delay-range" type="range" min="4" max="24" step="1" value={delay} onChange={(event) => setDelay(Number(event.target.value))} className="mt-3 w-full accent-cyan-300"/><div className="mt-1 flex justify-between text-xs text-slate-300"><span>4 min</span><span>24 min</span></div></div>
    </section>
    <section className="grid gap-3 lg:grid-cols-[.9fr_1.1fr]">
      <article className="panel rounded-2xl p-5">
        <h3 className="text-lg font-semibold text-white">Compose mission message</h3>
        <p className="mt-1 text-sm text-slate-300">Create a sample message from Mission Control to the crew habitat.</p>
        <label className="mt-4 block text-xs font-semibold text-slate-200" htmlFor="message-template">Quick message</label>
        <select id="message-template" value={templates.includes(draft) ? draft : 'custom'} onChange={(event) => setDraft(event.target.value === 'custom' ? '' : event.target.value)} className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-sm text-slate-100"><option value="custom">Write a custom message</option>{templates.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={4} maxLength={240} placeholder="Type a short mission message…" className="mt-3 w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-sm leading-6 text-slate-100 placeholder:text-slate-400"/>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-slate-300">{draft.length}/240 characters</span><button onClick={send} disabled={!draft.trim()} className="rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">QUEUE MESSAGE ↗</button></div>
      </article>
      <article className="panel rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-lg font-semibold text-white">Message queue</h3><p className="mt-1 text-sm text-slate-300">Track sample messages and simulate delivery.</p></div><button onClick={simulateAll} disabled={!queued} className="rounded-lg border border-cyan-200/30 px-3 py-2 text-xs font-semibold text-cyan-100 disabled:opacity-40">DELIVER ALL QUEUED</button></div>
        <div className="mt-4 space-y-3">{messages.map((item) => <div key={item.id} className="rounded-xl border border-slate-700 bg-slate-950/40 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-xs font-bold tracking-wider text-cyan-200">{item.from} → {item.to}</div><span className={`rounded-full border px-2 py-1 text-xs font-semibold ${item.state === 'Queued' ? 'border-amber-300/30 bg-amber-300/10 text-amber-100' : 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'}`}>{item.state}</span></div><p className="mt-2 text-sm leading-6 text-slate-100">{item.body}</p><div className="mt-2 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-slate-300">{item.time}</span>{item.state === 'Queued' && <button onClick={() => simulateDelivery(item.id)} className="text-xs font-semibold text-cyan-200 underline underline-offset-4">Simulate delivery</button>}</div></div>)}</div>
      </article>
    </section>
    <div className="rounded-xl border border-amber-300/25 bg-amber-300/[.06] p-4 text-sm leading-6 text-slate-200"><strong className="text-amber-100">Important simulation boundary:</strong> This workspace models a simple user-controlled queue. It does not connect to NASA, a spacecraft, a radio network, or the internet; delivery is manually simulated and does not wait for real elapsed minutes. The adjustable delay is an illustrative scenario setting, not a live prediction.</div>
  </div>
}
