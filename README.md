# AstroVitals PAK

**Astronaut health monitoring and mission intelligence prototype**  
NASA Space Apps Challenge 2026 · “Create Health Monitoring Software for Astronauts on Space Missions”

- **Live demo:** https://astrovitalspak.netlify.app
- **Source code:** https://github.com/Qaisar-baloch/AstroVitals-PAK

AstroVitals PAK is an offline-first, front-end prototype that demonstrates how a crew health interface could organize astronaut self-assessments, simulated telemetry, health trends, alert workflows, and educational spaceflight-health references during a long-duration mission scenario.

> **Safety notice:** This is an educational software prototype, not a medical device or clinical decision-support system. All crew profiles and telemetry are synthetic. User-entered check-ins are local demonstration data. Do not enter real medical or astronaut health records. The application does not diagnose, prescribe treatment, or establish clinical urgency.

## Key capabilities

- **Mission Control:** commander-style overview of four synthetic crew profiles and mission health indicators.
- **Crew check-ins:** manual self-assessment with local browser persistence.
- **3D anatomy explorer:** interactive educational anatomy viewer with rotation, zoom, body-system visibility, hover labels, and structure selection. See [anatomy attribution](./ANATOMY-ATTRIBUTION.md).
- **Health analytics:** descriptive charts for simulated telemetry and manually entered check-ins, kept separate.
- **Decision support prototype:** baseline comparisons and workflow prompts using demonstration logic, not clinical thresholds.
- **Alert intelligence:** information, warning, and critical workflow labels, filtering, and local acknowledgement history.
- **Mission routines:** per-crew daily checklist and locally stored reminders.
- **Data & privacy center:** inventory of local browser data categories and one-click JSON backup export. The export remains on the user's device and does not upload or restore records.
- **NASA science library:** educational context, source links, and hazard-to-health monitoring map.

## Technology

- React and Vite
- JavaScript
- Tailwind CSS
- Three.js / 3D anatomy viewer
- Recharts
- Browser localStorage
- Netlify deployment

## Run locally

### Requirements
- Node.js 20.19+ or 22.12+
- npm

### Install and start
```bash
npm ci
npm run dev
```

Open the local URL printed by Vite.

### Production build
```bash
npm run build
npm run preview
```

The production output is generated in `dist/`.

## Deploy

The project is configured for Netlify.

- Build command: `npm run build`
- Publish directory: `dist`
- Branch: `main`

The repository includes `netlify.toml` and an SPA fallback redirect. No backend or environment variables are required for the current prototype.

## Data handling and limitations

- All four crew profiles and automatically updating telemetry are synthetic demonstration data.
- Manual check-ins are labelled as user-entered and stored in the current browser's localStorage.
- Manual records and simulated telemetry are not merged.
- LocalStorage is not encrypted medical storage and does not synchronize between devices.
- The Data & privacy center can export a JSON snapshot of the prototype's known localStorage categories. The exported file may include user-entered notes, so it should be handled carefully. The feature does not upload, encrypt, or restore data.
- The anatomy viewer is an educational reference, not a diagnostic or clinically validated tool.
- Demonstration baselines, z-scores, status colors, and alert levels are software examples, not medical reference ranges or clinical urgency classifications.
- NASA references provide educational context; they do not validate the prototype's synthetic values, thresholds, or actions.
- Offline support is limited to assets already cached by the browser. External source links and uncached model assets may require internet access.

See:
- [Anatomy model attribution and licence](./ANATOMY-ATTRIBUTION.md)
- [Project architecture](./docs/ARCHITECTURE.md)
- [Challenge solution and submission overview](./docs/PROJECT-SUBMISSION.md)
- [Demo walkthrough](./docs/DEMO-SCRIPT.md)
- [Limitations and future work](./docs/LIMITATIONS-AND-FUTURE-WORK.md)

## Project structure

```text
AstroVitals-PAK/
├── public/                 # Static assets, icons, offline support
├── src/
│   ├── components/         # Reusable interface components
│   ├── data/               # Demo data and science references
│   ├── pages/              # Application workspaces
│   └── ...                 # App logic, styles, utilities
├── docs/                   # Submission and technical documentation
├── index.html
├── netlify.toml
├── package.json
├── package-lock.json
└── vite.config.js
```

## Challenge alignment

The prototype explores a software interface for organizing crew self-assessment and health-monitoring information in the context of long-duration spaceflight hazards. It is a concept demonstration, not flight-qualified software.

## Verification

The project owner reports that the deployed application passed an 11-item manual live test covering the homepage, four-crew overview, 3D anatomy interactions, manual check-in persistence, analytics, alert acknowledgement, science library, mobile layout, and route refresh. This is a reported manual test, not an independent certification or automated test-suite result.

## Acknowledgements

NASA and NASA Human Research Program resources are linked in the in-app science library for educational context. Third-party anatomy model sources and licence details are documented in [ANATOMY-ATTRIBUTION.md](./ANATOMY-ATTRIBUTION.md).

## Licence

Add the repository's chosen software licence before redistributing the source. Third-party assets remain subject to their own licences and attribution requirements.
