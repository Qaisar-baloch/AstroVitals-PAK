import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'astovitals-pak-manual-checkins-v1'
const SYMPTOMS = ['Rash or skin change', 'Headache', 'Nausea', 'Unusual fatigue', 'Breathing difficulty', 'Pain or discomfort', 'Other / not listed']

function readAll() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const fieldClass = 'mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400'
const labelClass = 'text-xs font-medium text-slate-300'

function Field({ label, name, value, onChange, type = 'number', min, max, step = 'any', required = false, placeholder }) {
  return (
    <label className="block">
      <span className={labelClass}>{label} {required && <span className="text-rose-300">*</span>}</span>
      <input className={fieldClass} name={name} type={type} value={value} onChange={onChange} min={min} max={max} step={step} required={required} placeholder={placeholder} />
    </label>
  )
}

export default function DailyCheckIn({ crewId }) {
  const [allRecords, setAllRecords] = useState(readAll)
  const [form, setForm] = useState({
    heartRate: '', systolicBP: '', diastolicBP: '', sleepHours: '',
    mood: '3', exerciseMinutes: '', bodyTemperature: '', bloodGlucose: '',
    visionChange: 'no-change', symptoms: [], notes: '',
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(allRecords)) } catch { setMessage('Browser storage is unavailable. Your new entry may not persist after refresh.') }
  }, [allRecords])

  const records = useMemo(() => allRecords[String(crewId)] || [], [allRecords, crewId])
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const toggleSymptom = (symptom) => setForm((current) => ({
    ...current,
    symptoms: current.symptoms.includes(symptom)
      ? current.symptoms.filter((item) => item !== symptom)
      : [...current.symptoms, symptom],
  }))

  const submit = (event) => {
    event.preventDefault()
    const requiredNumbers = ['heartRate', 'systolicBP', 'diastolicBP', 'sleepHours', 'mood', 'exerciseMinutes', 'bodyTemperature']
    const invalid = requiredNumbers.some((key) => form[key] === '' || !Number.isFinite(Number(form[key])))
    if (invalid) {
      setMessage('Please complete all required numeric fields with valid numbers.')
      return
    }
    if (form.bloodGlucose !== '' && !Number.isFinite(Number(form.bloodGlucose))) {
      setMessage('Blood glucose must be a number or left blank.')
      return
    }

    const entry = {
      id: `manual-${Date.now()}`,
      createdAt: new Date().toISOString(),
      source: 'USER-ENTERED',
      values: {
        heartRate: Number(form.heartRate),
        systolicBP: Number(form.systolicBP),
        diastolicBP: Number(form.diastolicBP),
        sleepHours: Number(form.sleepHours),
        mood: Number(form.mood),
        exerciseMinutes: Number(form.exerciseMinutes),
        bodyTemperature: Number(form.bodyTemperature),
        bloodGlucose: form.bloodGlucose === '' ? null : Number(form.bloodGlucose),
      },
      visionChange: form.visionChange,
      symptoms: form.symptoms,
      notes: form.notes.trim(),
    }

    setAllRecords((current) => ({
      ...current,
      [String(crewId)]: [entry, ...(current[String(crewId)] || [])].slice(0, 100),
    }))
    setForm({
      heartRate: '', systolicBP: '', diastolicBP: '', sleepHours: '',
      mood: '3', exerciseMinutes: '', bodyTemperature: '', bloodGlucose: '',
      visionChange: 'no-change', symptoms: [], notes: '',
    })
    window.dispatchEvent(new Event('astrovitals:checkin-saved'))
    setMessage('Check-in saved locally for this crew profile.')
  }

  return (
    <div className="space-y-5">
      <section className="panel rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[.2em] text-cyan-300">Crew member {String(crewId + 1).padStart(2, '0')}</div>
            <h2 className="mt-1 text-xl font-semibold">Daily health check-in</h2>
            <p className="mt-1 text-xs text-slate-400">Enter measurements collected by the crew member. These entries are separate from simulated telemetry.</p>
          </div>
          <span className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[10px] font-semibold text-amber-200">USER-ENTERED DATA</span>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-5">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Cardiovascular indicators</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Heart rate (bpm)" name="heartRate" value={form.heartRate} onChange={update} min="1" max="300" required placeholder="e.g. 72"/>
              <Field label="Systolic blood pressure (mmHg)" name="systolicBP" value={form.systolicBP} onChange={update} min="1" max="300" required placeholder="e.g. 118"/>
              <Field label="Diastolic blood pressure (mmHg)" name="diastolicBP" value={form.diastolicBP} onChange={update} min="1" max="200" required placeholder="e.g. 76"/>
            </div>
          </div>

          <div className="border-t border-slate-700/60 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Sleep and mental wellbeing</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Sleep duration (hours)" name="sleepHours" value={form.sleepHours} onChange={update} min="0" max="24" step="0.1" required placeholder="e.g. 7.5"/>
              <label className="block"><span className={labelClass}>Mood (1 = lowest, 5 = highest) *</span><select className={fieldClass} name="mood" value={form.mood} onChange={update}>{[1,2,3,4,5].map((v) => <option key={v} value={v}>{v}</option>)}</select></label>
              <Field label="Exercise duration (minutes)" name="exerciseMinutes" value={form.exerciseMinutes} onChange={update} min="0" max="1440" step="1" required placeholder="e.g. 35"/>
            </div>
          </div>

          <div className="border-t border-slate-700/60 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Immune and additional indicators</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Body temperature (°C)" name="bodyTemperature" value={form.bodyTemperature} onChange={update} min="25" max="45" step="0.1" required placeholder="e.g. 36.7"/>
              <Field label="Blood glucose (mg/dL) · optional" name="bloodGlucose" value={form.bloodGlucose} onChange={update} min="1" max="1000" placeholder="Leave blank if not measured"/>
            </div>
            <p className="mt-2 text-[10px] leading-5 text-slate-500">Blood glucose is optional. Record it only when an appropriate measurement has actually been taken. No glucose thresholds or interpretation are applied in this prototype.</p>
          </div>

          <div className="border-t border-slate-700/60 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Vision self-check</h3>
            <div className="flex flex-wrap gap-2">
              {[['no-change','No change reported'],['change','Vision change noticed'],['not-checked','Not checked']].map(([value,label]) => <label key={value} className={`cursor-pointer rounded-lg border px-3 py-2 text-xs ${form.visionChange === value ? 'border-cyan-300 bg-cyan-300/10 text-cyan-100' : 'border-slate-700 text-slate-400'}`}><input className="sr-only" type="radio" name="visionChange" value={value} checked={form.visionChange === value} onChange={update}/>{label}</label>)}
            </div>
          </div>

          <div className="border-t border-slate-700/60 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Symptom checklist</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {SYMPTOMS.map((symptom) => <label key={symptom} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-950/35 p-3 text-xs text-slate-300"><input type="checkbox" checked={form.symptoms.includes(symptom)} onChange={() => toggleSymptom(symptom)} className="accent-cyan-400"/>{symptom}</label>)}
            </div>
          </div>

          <div className="border-t border-slate-700/60 pt-4">
            <label className="block"><span className={labelClass}>Crew notes · optional</span><textarea className={`${fieldClass} min-h-24`} name="notes" value={form.notes} onChange={update} maxLength={1000} placeholder="Describe observations in your own words. Avoid entering identifying or confidential information."/></label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="rounded-lg border border-cyan-300/50 bg-cyan-300/10 px-5 py-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/20">Save daily check-in</button>
            <span className="text-[10px] text-slate-500">Required fields are marked with *</span>
          </div>
          {message && <p role="status" className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3 text-xs text-cyan-100">{message}</p>}
        </form>
      </section>

      <section className="panel rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><h2 className="text-lg font-semibold">Check-in history</h2><p className="mt-1 text-xs text-slate-400">Locally stored entries for this crew profile.</p></div>
          <span className="rounded-md border border-slate-700 px-2 py-1 text-[10px] text-cyan-200">{records.length} SAVED</span>
        </div>
        {records.length === 0 ? <p className="mt-4 rounded-lg border border-dashed border-slate-700 p-5 text-center text-xs text-slate-500">No manual check-ins yet. Submit the form to create the first entry.</p> : (
          <div className="mt-4 space-y-3">
            {records.map((record) => <article key={record.id} className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-semibold text-white">{new Date(record.createdAt).toLocaleString()}</span><span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[9px] text-amber-200">{record.source}</span></div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div><span className="text-slate-500">Heart rate</span><div className="mt-1 text-slate-200">{record.values.heartRate} bpm</div></div>
                <div><span className="text-slate-500">Blood pressure</span><div className="mt-1 text-slate-200">{record.values.systolicBP}/{record.values.diastolicBP} mmHg</div></div>
                <div><span className="text-slate-500">Sleep</span><div className="mt-1 text-slate-200">{record.values.sleepHours} h</div></div>
                <div><span className="text-slate-500">Mood</span><div className="mt-1 text-slate-200">{record.values.mood}/5</div></div>
                <div><span className="text-slate-500">Exercise</span><div className="mt-1 text-slate-200">{record.values.exerciseMinutes} min</div></div>
                <div><span className="text-slate-500">Temperature</span><div className="mt-1 text-slate-200">{record.values.bodyTemperature} °C</div></div>
                <div><span className="text-slate-500">Glucose</span><div className="mt-1 text-slate-200">{record.values.bloodGlucose ?? 'Not recorded'}</div></div>
                <div><span className="text-slate-500">Vision</span><div className="mt-1 text-slate-200">{record.visionChange}</div></div>
              </div>
              <p className="mt-2 text-[10px] text-slate-400">Symptoms: {record.symptoms.length ? record.symptoms.join(', ') : 'None selected'}</p>
              {record.notes && <p className="mt-2 whitespace-pre-wrap text-xs text-slate-300">Notes: {record.notes}</p>}
            </article>)}
          </div>
        )}
        <p className="mt-4 text-[10px] leading-5 text-slate-500">This prototype stores entries in this browser only. Data is not transmitted to a flight surgeon or another crew device. It is a software demonstration, not a diagnostic system.</p>
      </section>
    </div>
  )
}
