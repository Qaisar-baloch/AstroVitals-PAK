# AstroVitals PAK

Offline-first, front-end-only prototype for a Mars-transit astronaut self-assessment scenario.

## Requirements
- Node.js 20.19+ or 22.12+
- npm

## Install and run
```bash
npm install
npm run dev
```
Open the local URL printed by Vite, usually http://localhost:5173.

## Production build
```bash
npm run build
npm run preview
```

## Deployment
Deploy the repository to Vercel or Netlify with:
- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: Vite

No environment variables or backend are required.

## Important limitations
- All health readings and history are SIMULATED.
- `src/data/science.js` only uses the science table supplied for this prototype. Source URLs are intentionally marked `TODO(source)`.
- The baseline and `demo thresholds` are software demonstrations, not medical reference ranges.
- This is not a medical device and does not diagnose or recommend treatment.
- Browser localStorage is used for local persistence. Clearing browser data clears this demo history.

## Step 2 additions
- Interactive region detail panel driven by `src/data/science.js`.
- Astronaut self-assessment remains the primary experience.
- Commander overview displays four independent synthetic crew profiles.
- All crew profiles and telemetry are simulated; no real crew or medical records are used.
- Statistical statuses are demonstrations, not medical warnings or diagnoses.


## Step 3: Daily health check-ins
- Manual entries are labelled `USER-ENTERED` and kept separate from synthetic telemetry.
- Each of the four synthetic crew profiles has its own local check-in history.
- Required fields: heart rate, systolic/diastolic blood pressure, sleep, mood, exercise, body temperature.
- Optional fields: blood glucose, vision self-check, symptoms, notes.
- Check-ins are saved in browser localStorage and are not transmitted anywhere.
- No clinical thresholds, diagnosis, or treatment recommendations are applied.


## Step 4: Health analytics
- Recharts-based trend views for synthetic telemetry and user-entered check-ins.
- The synthetic chart uses recent simulator samples and shows the first-14-day baseline mean as a reference line.
- The manual chart reads only the selected crew member's saved check-ins from localStorage.
- Manual and simulated records are never merged.
- Charts are descriptive only; they do not diagnose or establish medical thresholds.


## Step 5: Mission decision support
- Adds a dedicated Decision Support view for the selected crew profile.
- Compares synthetic telemetry to that profile's first-14-day demo baseline using the existing demo z-score thresholds.
- Displays manually reported symptoms and vision changes separately from synthetic readings.
- Labels repeated symptom/vision selections across the latest two saved check-ins as a repeated pattern. This is a workflow cue, not a clinical threshold.
- Provides a plain-language prompt to follow mission medical protocol and contact the flight surgeon when required.
- Does not diagnose, prescribe treatment, determine urgency, or send messages to Earth.
- Analytics is lazy-loaded and Vite manual chunks split chart and React dependencies to reduce the initial bundle.


## Step 6: Mission routines and reminders
- Adds an offline daily checklist for each crew profile.
- Includes example prompts for daily health check-in, reviewing the mission-approved exercise plan, sleep/mood reflection, and vision self-check.
- Crew members can add and remove custom reminders with a time.
- Completion state is saved to localStorage per crew member and calendar day; tasks remain saved across days.
- No push notifications, background scheduling, external API, or medical instructions are included.


## Step 7: NASA science library and evidence links
- Preserves the original project-provided science table entries and app actions.
- Adds separately labelled NASA source-context summaries for cardiovascular, behavioral/sleep, bone, immune, and SANS risks.
- Adds NASA's five human-spaceflight hazards as a separate reference section.
- Adds a curated list of official NASA and NASA Human Research Roadmap source links.
- Does not treat NASA background pages as validation of synthetic values, z-score thresholds, diagnosis, or treatment guidance.
- Source pages should be reviewed by the team before any operational use.


## Step 8: Final QA, offline shell, and deployment

### Local verification
```bash
npm install
npm run build
npm run preview
```
Open the local preview URL printed by Vite. Check each navigation tab, crew switching, check-in save/history, analytics, decision support, reminders, and NASA reference links.

### Offline behavior
- The application stores check-ins and reminder data in browser localStorage.
- Production builds register `public/sw.js`, which caches the app shell and same-origin static assets after they are first requested.
- For a meaningful offline test: deploy or preview over localhost, open the app while online, reload once so the service worker controls the page, then use browser DevTools > Network > Offline and reload.
- Offline availability is limited to the app shell and assets already cached by that browser. NASA source links require internet. Data remains local to that browser and is not synchronized to other devices.
- Do not enter real astronaut health records into this demonstration.

### Deploy to Vercel
1. Push the `astovitals-pak` project folder to a GitHub repository.
2. In Vercel, choose **Add New > Project** and import the repository.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Deploy. The included `vercel.json` rewrites app routes to `index.html`.

### Deploy to Netlify
1. Push the project to GitHub or drag the project folder into Netlify's deploy flow.
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. The included `public/_redirects` file is copied to `dist` and provides SPA fallback routing.

### Final safety and evidence checklist
- This is a student prototype, not a certified medical device or clinical decision system.
- Synthetic telemetry must remain labelled SIMULATED.
- User-entered records are local browser demo data, not encrypted medical records.
- Do not present demo z-score thresholds as clinical thresholds.
- NASA reference summaries are educational context; review source pages and challenge rules before the final presentation.


## Phase 1: AstroVitals PAK brand and navigation refresh
- Corrects the product name consistently to `AstroVitals PAK` across the app title, metadata, manifest, README, and offline support.
- Applies the approved Deep Space Medical palette: deep navy, medical cyan, ice white, and alert amber.
- Introduces the clinical-precision typography direction and a space-medical emblem for the app icon and sidebar identity.
- Converts primary navigation into a persistent left sidebar on desktop and a compact bottom navigation strip on smaller screens.
- Adds reduced-motion CSS support.
- Keeps the existing feature modules, local data model, science entries, and simulated telemetry behavior intact.


## Phase 2: Mission Control dashboard

The default landing screen is now a commander-style Mission Control overview. It summarizes the four synthetic crew profiles, counts nominal/watch/alert statistical indicators, displays mission scenario context, and provides shortcuts to existing health workflows. Selecting a crew card opens that crew member's existing individual monitoring view.

All values remain synthetic demonstration data. Status counts use the project's existing statistical baseline logic and are not clinical thresholds or medical decisions.


## Phase 3: Interactive 3D anatomy prototype

Phase 3 adds a procedural Three.js anatomical schematic to the Anatomical Monitoring workspace. It supports orbit rotation, zoom, front/back/left/right camera presets, hover previews, click/tap selection, and toggles for external body, muscles, skeleton, and organs. The selected region opens the existing source-linked project detail panel.

**Important limitation:** the current model is an original geometric schematic, not a photorealistic or clinically validated anatomical atlas. It does not claim medical accuracy. Heatmap colors reflect only the project's synthetic demo status. A separately licensed, anatomically validated 3D asset would be a future enhancement after license and technical review.

Install the new Three.js dependency with `npm install`, then run `npm run dev` and `npm run build`.


## Detailed 3D anatomy atlas

The anatomy workspace now integrates the Open Anatomy 3D React viewer and its male/female glTF reference models. It supports orbit rotation, zoom, body-system visibility, hover labels, structure selection, and synthetic status pins. The regional health-intelligence panel below the viewer uses the space previously left unused.

Install the additional 3D dependencies with `npm install`. See [ANATOMY-ATTRIBUTION.md](./ANATOMY-ATTRIBUTION.md) for model sources, licence, attribution, and limitations. The atlas is educational and is not for diagnosis.


## Phase 5 — Alert Intelligence

See `PHASE-5-RELEASE-NOTES.md` for the commander-facing alert feed, severity filters, source labelling, local acknowledgement workflow, and safety limitations.

## Phase 6 — NASA science & evidence traceability

Phase 6 adds a hazard-to-health monitoring map in the NASA science reference area. It uses the project's existing `src/data/science.js` and `src/data/nasaReferences.js` entries. The original science table is preserved; missing mappings are explicitly labelled rather than filled with invented indicators. NASA pages are background references and do not validate the prototype's simulated readings, thresholds, or suggested actions.

See `PHASE-6-RELEASE-NOTES.md` for details.

## Phase 7 — release and deployment

See `PHASE-7-DEPLOYMENT-CHECKLIST.md` for the release QA checklist and Netlify steps. Netlify settings are also provided in `netlify.toml` (build: `npm run build`, publish: `dist`).

The `.com` domain is no longer assumed. Preferred candidate for checking: `astrovitalspak.health`. Availability and price must be confirmed directly with the registrar before purchase. `.health` may have special registry terms; review them before registering. The project is an educational demo and must not collect real health records.
