import { useMemo, useState } from 'react'

const STORAGE_KEY = 'astovitals-pak-mission-routines-v1'

const DEFAULT_TASKS = [
  { id: 'daily-checkin', title: 'Complete daily health check-in', time: '08:00', category: 'Self-assessment', detail: 'Record the indicators available to you and any observations.' },
  { id: 'exercise', title: 'Review planned exercise session', time: '10:00', category: 'Movement', detail: 'Use the exercise plan approved for this mission. This reminder does not prescribe an exercise routine.' },
  { id: 'sleep-mood', title: 'Record sleep and mood reflection', time: '19:00', category: 'Wellbeing', detail: 'Record sleep duration and mood in the daily check-in.' },
  { id: 'vision', title: 'Vision self-check', time: '20:00', category: 'Self-assessment', detail: 'Use the vision self-check field and record a change if noticed.' },
]

const panel = 'panel rounded-2xl p-5'
const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400'

function todayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function loadState(crewId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const crew = all[String(crewId)] || {}
    const day = todayKey()
    return {
      date: day,
      tasks: Array.isArray(crew.tasks) && crew.tasks.length ? crew.tasks : DEFAULT_TASKS,
      completed: crew.date === day && Array.isArray(crew.completed) ? crew.completed : [],
    }
  } catch {
    return { date: todayKey(), tasks: DEFAULT_TASKS, completed: [] }
  }
}

function saveState(crewId, state) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    all[String(crewId)] = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    return true
  } catch {
    return false
  }
}

export default function MissionRoutines({ crewId }) {
  const [state, setState] = useState(() => loadState(crewId))
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('12:00')
  const [showAdd, setShowAdd] = useState(false)
  const [storageWarning, setStorageWarning] = useState(false)

  const progress = useMemo(() => ({
    done: state.completed.length,
    total: state.tasks.length,
  }), [state.completed, state.tasks])

  function commit(next) {
    setState(next)
    setStorageWarning(!saveState(crewId, next))
  }

  function toggleTask(id) {
    const completed = state.completed.includes(id)
      ? state.completed.filter((item) => item !== id)
      : [...state.completed, id]
    commit({ ...state, completed })
  }

  function addTask(event) {
    event.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    const task = {
      id: `custom-${Date.now()}`,
      title,
      time: newTime,
      category: 'Crew reminder',
      detail: 'Custom reminder created by the crew member.',
    }
    commit({ ...state, tasks: [...state.tasks, task] })
    setNewTitle('')
    setNewTime('12:00')
    setShowAdd(false)
  }

  function removeTask(id) {
    const tasks = state.tasks.filter((task) => task.id !== id)
    const completed = state.completed.filter((item) => item !== id)
    commit({ ...state, tasks, completed })
  }

  const sortedTasks = [...state.tasks].sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="space-y-5">
      <section className={panel}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[.2em] text-cyan-300">Crew member {String(crewId + 1).padStart(2, '0')} · {state.date}</div>
            <h2 className="mt-1 text-xl font-semibold">Mission routines & reminders</h2>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">An offline daily task list for self-assessment and mission routines. Times are editable demonstration reminders, not NASA-prescribed schedules.</p>
          </div>
          <span className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[10px] font-semibold text-cyan-200">LOCAL · OFFLINE</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3"><div className="text-[10px] text-slate-500">Today's reminders</div><div className="mt-1 text-2xl font-semibold">{progress.total}</div></div>
          <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3"><div className="text-[10px] text-slate-500">Completed</div><div className="mt-1 text-2xl font-semibold">{progress.done}</div></div>
          <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3"><div className="text-[10px] text-slate-500">Remaining</div><div className="mt-1 text-2xl font-semibold">{Math.max(0, progress.total - progress.done)}</div></div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}/>
        </div>
        <p className="mt-2 text-[10px] text-slate-500">{progress.total ? Math.round(progress.done / progress.total * 100) : 0}% of today's reminder checklist completed.</p>
      </section>

      <section className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><h3 className="text-base font-semibold">Daily mission checklist</h3><p className="mt-1 text-xs text-slate-400">Completion is saved separately for each crew profile and calendar day.</p></div>
          <button onClick={() => setShowAdd((value) => !value)} className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200">{showAdd ? 'Close' : '+ Add reminder'}</button>
        </div>

        {showAdd && <form onSubmit={addTask} className="mt-4 grid gap-3 rounded-xl border border-cyan-400/20 bg-slate-950/40 p-4 sm:grid-cols-[1fr_130px_auto] sm:items-end">
          <label className="block text-xs text-slate-300">Reminder title<input className={`${inputClass} mt-1`} value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="e.g. Review mission notes" maxLength={70} required/></label>
          <label className="block text-xs text-slate-300">Reminder time<input className={`${inputClass} mt-1`} type="time" value={newTime} onChange={(event) => setNewTime(event.target.value)} required/></label>
          <button type="submit" className="rounded-lg bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300">Save reminder</button>
        </form>}

        <div className="mt-4 space-y-3">
          {sortedTasks.length === 0 ? <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-xs text-slate-500">No reminders scheduled. Add one to begin.</div> : sortedTasks.map((task) => {
            const done = state.completed.includes(task.id)
            return <article key={task.id} className={`flex gap-3 rounded-xl border p-4 transition ${done ? 'border-emerald-400/20 bg-emerald-400/5' : 'border-slate-700/70 bg-slate-950/35'}`}>
              <button onClick={() => toggleTask(task.id)} aria-label={done ? `Mark ${task.title} incomplete` : `Complete ${task.title}`} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${done ? 'border-emerald-400 bg-emerald-400 text-slate-950' : 'border-slate-500 text-transparent hover:border-cyan-300'}`}>{done ? '✓' : '✓'}</button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-slate-100">{task.title}</span><span className="rounded-md border border-slate-700 px-2 py-0.5 text-[9px] text-slate-400">{task.category}</span>{done && <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-300">Completed</span>}</div>
                <p className="mt-1 text-xs leading-5 text-slate-400">{task.detail}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="font-mono text-sm text-cyan-200">{task.time}</span>
                {task.id.startsWith('custom-') && <button onClick={() => removeTask(task.id)} className="text-[9px] text-slate-500 hover:text-rose-300">Remove</button>}
              </div>
            </article>
          })}
        </div>
        {storageWarning && <p className="mt-3 text-xs text-amber-300">Browser storage is unavailable. Changes may not persist after closing this tab.</p>}
      </section>

      <section className="rounded-2xl border border-amber-400/25 bg-amber-400/5 p-5">
        <h3 className="text-sm font-semibold text-amber-100">Reminder behavior in this offline prototype</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-5 text-slate-300">
          <li>Tasks appear in the app and can be checked off manually.</li>
          <li>Completion resets for a new calendar day; the reminder list remains saved.</li>
          <li>Each crew profile has its own reminder list and completion state.</li>
          <li>This version does not send push notifications, contact Earth, or run while the app is closed.</li>
          <li>Follow mission-approved medical and exercise protocols; these reminders are not medical instructions.</li>
        </ul>
      </section>
    </div>
  )
}
