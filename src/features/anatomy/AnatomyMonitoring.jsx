import { useMemo, useState } from 'react'
import { AnatomyViewer } from 'open-anatomy-3d-react'
import 'open-anatomy-3d-react/styles.css'
import RegionDetail from '../../components/RegionDetail.jsx'
import { science } from '../../data/science.js'

const STATUS = { normal: '#00bfa5', watch: '#ffb547', alert: '#ff5470', unassessed: '#718096' }
const REGION_META = {
  brain: { label: 'Brain & mind', structures: ['brain'], note: 'Brain and behavioral-health monitoring region' },
  heart: { label: 'Heart & vessels', structures: ['heart'], note: 'Cardiovascular monitoring region' },
  bones: { label: 'Bones & muscles', structures: ['femur_l', 'femur_r', 'spine_lumbar'], note: 'Musculoskeletal monitoring region' },
  immune: { label: 'Immune system', structures: ['lung_l', 'lung_r', 'liver', 'kidney_l'], note: 'Immune-health monitoring region' },
  eyes: { label: 'Eyes', structures: ['eye_l', 'eye_r'], note: 'Vision and neuro-ocular monitoring region' },
}
const STRUCTURE_REGION = {
  brain: 'brain', heart: 'heart', eye_l: 'eyes', eye_r: 'eyes', femur_l: 'bones', femur_r: 'bones',
  spine_lumbar: 'bones', lung_l: 'immune', lung_r: 'immune', liver: 'immune', kidney_l: 'immune',
}

export default function AnatomyMonitoring({ selectedCrew, selectedRegion, setSelectedRegion, statuses, onNavigate }) {
  const [sex, setSex] = useState('male')
  const selectedRegionData = science.find((item) => item.id === selectedRegion)
  const selectedMeta = REGION_META[selectedRegion] || REGION_META.heart
  const selectedStatus = statuses[selectedRegion] || 'unassessed'
  const pins = useMemo(() => Object.entries(REGION_META).flatMap(([region, meta]) => {
    const status = statuses[region] || 'unassessed'
    if (status === 'unassessed') return []
    return meta.structures.slice(0, 1).map((key) => ({
      key,
      title: `${meta.label} · ${status.toUpperCase()}`,
      items: [status === 'normal' ? 'Within configured demo range' : status === 'watch' ? 'Review trend and crew check-in' : 'Priority review indicated in this simulation'],
      color: STATUS[status],
    }))
  }), [statuses])

  const handleStructureClick = (key, structure) => {
    const region = STRUCTURE_REGION[key] || (structure?.system === 'skeleton' || structure?.system === 'muscles' ? 'bones' : null)
    if (region) setSelectedRegion(region)
  }
  const handleStructureHover = (key) => {
    // Hover is handled by the atlas viewer's native labels. Selection remains click/tap only.
  }

  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="text-[10px] uppercase tracking-[.25em] text-cyan-300">ANATOMICAL MONITORING · CREW {String(selectedCrew + 1).padStart(2, '0')}</div>
        <h2 className="mt-2 text-2xl font-semibold">Interactive 3D human anatomy</h2>
        <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">Explore a detailed, multi-structure anatomical atlas. Rotate, zoom, switch body systems, and select individual structures to inspect linked mission-health indicators.</p>
      </div>
      <span className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[10px] text-amber-200">EDUCATIONAL VISUALIZATION · NOT FOR DIAGNOSIS</span>
    </div>

    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(290px,.75fr)]">
      <section className="panel overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/70 px-4 py-3">
          <div><div className="text-xs font-semibold text-white">Anatomical atlas viewport</div><div className="mt-1 text-[10px] text-slate-500">Drag to orbit · pinch or controls to zoom · select a structure for details</div></div>
          <div className="flex items-center gap-2"><span className="text-[9px] uppercase tracking-widest text-slate-500">Reference body</span><div className="flex gap-1"><button onClick={() => setSex('male')} className={`rounded-md border px-2.5 py-1.5 text-[9px] ${sex === 'male' ? 'border-cyan-300/50 bg-cyan-300/10 text-cyan-100' : 'border-slate-700 text-slate-400'}`}>Male</button><button onClick={() => setSex('female')} className={`rounded-md border px-2.5 py-1.5 text-[9px] ${sex === 'female' ? 'border-cyan-300/50 bg-cyan-300/10 text-cyan-100' : 'border-slate-700 text-slate-400'}`}>Female</button></div></div>
        </div>
        <div className="real-anatomy-viewport" aria-label="Interactive detailed 3D human anatomy model">
          <AnatomyViewer
            key={sex}
            defaultSex={sex}
            pins={pins}
            onStructureClick={handleStructureClick}
            onStructureHover={handleStructureHover}
            hoverHint="Select to inspect mission-health links"
            showSexToggle={false}
            showLayerToggles={true}
            showZoomControls={true}
            showRotateControl={true}
            hoverColor="#00c6d7"
            highlightColor="#ffb547"
            className="astrovitals-anatomy-viewer"
          />
        </div>
        <div className="anatomy-scan-console">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><div className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-200">MISSION ANATOMY SCAN CONSOLE</div><div className="mt-1 text-sm font-semibold text-white">{selectedMeta.label} <span className="font-normal text-slate-300">· Crew {String(selectedCrew + 1).padStart(2, '0')}</span></div></div>
            <span className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider" style={{color:STATUS[selectedStatus],borderColor:`${STATUS[selectedStatus]}88`,background:`${STATUS[selectedStatus]}18`}}>{selectedStatus} · DEMO</span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
            <div><div className="text-[10px] uppercase tracking-wider text-slate-300">Linked indicators</div><div className="mt-2 flex flex-wrap gap-1.5">{(selectedRegionData?.indicators || []).slice(0,4).map((item) => <span key={item} className="rounded-md border border-cyan-200/20 bg-cyan-300/[.07] px-2 py-1 text-[11px] text-cyan-50">{item}</span>)}</div></div>
            <div className="flex flex-wrap gap-2"><button onClick={() => onNavigate?.('checkin')} className="rounded-lg border border-cyan-200/30 bg-cyan-300/10 px-3 py-2 text-[11px] font-semibold text-cyan-50 hover:bg-cyan-300/20">NEW CHECK-IN ↗</button><button onClick={() => onNavigate?.('analytics')} className="rounded-lg bg-cyan-300 px-3 py-2 text-[11px] font-bold text-slate-950 hover:bg-cyan-200">VIEW TRENDS ↗</button></div>
          </div>
          <div className="mt-2 text-[10px] leading-5 text-slate-300">Reference atlas selection linked to synthetic crew-health status. This is an educational display, not a diagnostic scan.</div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-700/70 px-4 py-3"><div className="flex flex-wrap gap-3 text-[9px] text-slate-400">{Object.entries({normal:'Normal',watch:'Watch',alert:'Alert'}).map(([key,label]) => <span key={key} className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{background:STATUS[key]}}/>{label}</span>)}</div><span className="text-[9px] text-slate-500">Heatmap pins represent synthetic demo status only</span></div>
      </section>

      <aside className="space-y-4">
        <section className="panel rounded-2xl p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Crew health heatmap</h3><span className="text-[9px] uppercase tracking-widest text-cyan-300">CREW {String(selectedCrew + 1).padStart(2, '0')}</span></div><div className="mt-3 space-y-2">{Object.entries(REGION_META).map(([region, meta]) => { const status = statuses[region] || 'unassessed'; return <button key={region} onClick={() => setSelectedRegion(region)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left ${selectedRegion === region ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-slate-700 bg-slate-950/30'}`}><span className="text-[11px] text-slate-200">{meta.label}</span><span className="flex items-center gap-2 text-[9px] uppercase" style={{color:STATUS[status]}}><i className="h-2 w-2 rounded-full" style={{background:STATUS[status]}}/>{status}</span></button> })}</div><p className="mt-3 text-[10px] leading-5 text-slate-500">No data is shown as unassessed, never as healthy. These status labels are generated by the demonstration logic.</p></section>
        <section className="panel rounded-2xl p-4"><div className="flex items-start justify-between gap-2"><div><div className="text-[9px] uppercase tracking-[.2em] text-slate-500">Selected health domain</div><h3 className="mt-1 text-lg font-semibold">{selectedMeta.label}</h3></div><span className="rounded-full border px-2.5 py-1 text-[9px] uppercase" style={{color:STATUS[selectedStatus],borderColor:`${STATUS[selectedStatus]}66`,background:`${STATUS[selectedStatus]}16`}}>{selectedStatus}</span></div><p className="mt-2 text-xs text-slate-400">{selectedMeta.note}</p><div className="mt-3"><RegionDetail region={selectedRegionData} status={selectedStatus}/></div></section>
      </aside>
    </div>

    <section className="panel rounded-2xl p-5">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="text-[10px] uppercase tracking-[.22em] text-cyan-300">REGIONAL HEALTH INTELLIGENCE</div><h3 className="mt-1 text-lg font-semibold">Selected region · {selectedMeta.label}</h3><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">This workspace uses the previously empty area to connect anatomy exploration with crew monitoring context.</p></div><span className="rounded-full border px-3 py-1 text-[9px] uppercase" style={{color:STATUS[selectedStatus],borderColor:`${STATUS[selectedStatus]}66`}}>{selectedStatus} · DEMO STATUS</span></div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-slate-700/80 bg-slate-950/40 p-4"><div className="text-[9px] uppercase tracking-widest text-slate-500">Spaceflight hazard</div><p className="mt-2 text-sm font-medium text-slate-100">{selectedRegionData?.hazard || 'No linked hazard'}</p><p className="mt-2 text-[10px] leading-5 text-slate-400">Hazard context retained from the project's supplied NASA science table.</p></article>
        <article className="rounded-xl border border-slate-700/80 bg-slate-950/40 p-4"><div className="text-[9px] uppercase tracking-widest text-slate-500">Monitoring indicators</div><div className="mt-2 flex flex-wrap gap-2">{(selectedRegionData?.indicators || []).map((item) => <span key={item} className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-2.5 py-2 text-[10px] text-cyan-100">{item}</span>)}</div><p className="mt-2 text-[10px] leading-5 text-slate-500">Indicators are not live clinical measurements unless entered by the crew.</p></article>
        <article className="rounded-xl border border-slate-700/80 bg-slate-950/40 p-4"><div className="text-[9px] uppercase tracking-widest text-slate-500">Suggested application action</div><p className="mt-2 text-sm leading-6 text-slate-200">{selectedRegionData?.action || 'Select a region to view its linked action.'}</p><p className="mt-2 text-[10px] leading-5 text-slate-500">Prototype decision support, not medical advice.</p></article>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-700/70 pt-3 text-[10px] text-slate-500"><span>Atlas model attribution and licence are documented in the project README and in-app credits.</span>{selectedRegionData?.sourceUrl && <a href={selectedRegionData.sourceUrl} target="_blank" rel="noreferrer" className="text-emerald-200 underline underline-offset-2">Open linked NASA reference ↗</a>}</div>
    </section>

    <div className="rounded-xl border border-amber-400/20 bg-amber-400/[.04] p-4 text-[10px] leading-5 text-slate-400"><strong className="text-amber-200">Scientific boundary:</strong> The anatomy atlas is an educational reference model adapted from open anatomical datasets. It represents a reference body, not an individual astronaut and not a diagnostic or surgical tool. Heatmap pins show this project's synthetic demonstration status only.</div>
  </div>
}
