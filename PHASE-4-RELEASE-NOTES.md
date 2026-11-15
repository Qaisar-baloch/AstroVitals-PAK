# AstroVitals PAK — Phase 4: Health Data & Analytics

## What's new
- Expanded the analytics workspace with an explicit source selector: simulated telemetry or crew-entered check-ins. The streams are never blended.
- Added metric selection and trend charts for available fields.
- Added a per-crew personal baseline comparison against the first 14 synthetic records. Labels are statistical demo context only, not clinical limits.
- Added a timeline for simulated deviations and separately recorded symptoms / vision changes from manual check-ins.
- Added CSV export for the selected source. Export is intentionally source-specific and includes manual notes when exporting user-entered check-ins.
- Added a same-tab custom event so newly saved check-ins refresh the analytics view immediately.

## Existing data preserved
- Uses the existing localStorage key `astovitals-pak-manual-checkins-v1` and existing per-crew record shape.
- Keeps existing simulated history and baseline logic.
- No backend, external API, or new dependency required.

## Install
1. Back up the current Phase 3 project folder.
2. Extract this ZIP into a new folder.
3. Open that folder in VS Code.
4. Run `npm install`, then `npm run dev`.
5. Open Health Analytics. Switch between Simulated telemetry and Manual check-ins.
6. Save a check-in, return to analytics, and verify it appears under Manual check-ins.
7. Run `npm run build`.

## Important limitations
- All telemetry in the simulator is synthetic.
- Z-score deviations are illustrative software flags, not clinical thresholds or diagnoses.
- Browser localStorage is not secure medical-record storage.
- CSV exports may contain user-entered notes. Review before sharing.
- The report is a demo data export, not a certified medical report.
