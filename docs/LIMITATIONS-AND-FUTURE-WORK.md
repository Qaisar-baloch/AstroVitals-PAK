# AstroVitals PAK — Limitations and Future Work

## Current limitations

### Data and privacy
- All crew profiles and automatic telemetry are synthetic.
- Manual check-ins are demonstration inputs stored in browser localStorage.
- localStorage is not encrypted medical storage and does not synchronize across devices.
- There is no backend, secure identity system, or role-based access enforcement.

### Medical and scientific validity
- The application is not a medical device and is not clinically validated.
- Demonstration baselines, z-scores, status colors, and alert levels are not clinical reference ranges or urgency classifications.
- The app does not diagnose, prescribe treatment, predict medical outcomes, or replace a flight surgeon.
- NASA references are educational context and do not validate the prototype's algorithms or suggested actions.

### Hardware and connectivity
- No wearable, medical sensor, spacecraft telemetry bus, or external health API is connected.
- Simulated telemetry is for demonstration only.
- Offline support is limited to assets already cached by the browser; external links and uncached model assets may require internet access.

### 3D anatomy
- The anatomy viewer is an educational reference, not a diagnostic visualization.
- Asset availability, loading performance, mobile GPU support, and licence conditions should be checked before redistribution or operational use.

## Future development

1. Conduct user research with aerospace medical professionals and human-factors specialists.
2. Define validated requirements and safety cases before any clinical or operational use.
3. Design a secure backend, identity, access controls, audit logging, encryption, and data-retention policy.
4. Evaluate standards and regulatory obligations applicable to health software and medical devices.
5. Integrate real sensors only through documented, validated interfaces and explicit data provenance.
6. Review all health thresholds and decision logic with qualified medical experts using authoritative evidence.
7. Improve model loading, asset caching, accessibility, and low-bandwidth performance.
8. Add automated tests, continuous integration, dependency scanning, and release monitoring.

## Safe interpretation

All current values and outputs should be interpreted as illustrative software demonstrations. No user should rely on them for medical decisions.
