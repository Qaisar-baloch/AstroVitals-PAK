# AstroVitals PAK — Phase 6: NASA Science & Evidence Traceability

## Included
- Added a hazard-to-health monitoring traceability matrix to the NASA science area.
- Matrix rows are generated from the existing `nasaHazards` and `science` data modules.
- Existing project science-table entries in `src/data/science.js` are preserved unchanged.
- Shows where the supplied project table has a direct monitoring row and explicitly marks gaps rather than inventing an indicator.
- Added clear evidence-boundary language distinguishing NASA background references from prototype behavior.
- Kept the existing source links and research library.

## Evidence integrity
This phase does not add new medical claims, clinical thresholds, or operational NASA procedures. Existing source summaries and project-table content are retained as supplied in the Phase 5 codebase. The matrix is a navigation/traceability aid, not a validation of the prototype's measurements or recommendations.

## Install
1. Back up the current project.
2. Extract this ZIP into a new folder.
3. Run `npm install` and `npm run dev`.
4. Open the NASA Science Library / Mission science reference area and scroll to **Hazard-to-health monitoring map**.
5. Run `npm run build`.

All readings remain synthetic or crew-entered demo data. This is not a medical device or diagnostic system.
