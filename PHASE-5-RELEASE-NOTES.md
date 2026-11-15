# AstroVitals PAK — Phase 5: Decision Support & Alert Intelligence

## Included
- New commander-facing Alert Intelligence screen consolidating demo deviations and crew-entered observations across all four synthetic crew profiles.
- Critical and Warning classifications based on the existing prototype decision-support rules. These are not clinical severity classifications.
- Source labels distinguish SIMULATED TELEMETRY from CREW-ENTERED observations.
- Alert filters, crew-profile navigation, local acknowledgement state, and acknowledgement pruning when alerts clear.
- Existing individual Decision Support screen retained as a separate navigation destination.

## Run
```bash
npm install
npm run dev
npm run build
```

## Limitations
- No backend, secure authentication, remote notifications, or secure audit log.
- Acknowledgements are stored in browser localStorage and are demonstration state only.
- Statistical thresholds and alert labels are prototype workflow aids, not medical limits, diagnosis, or triage.
- All simulated telemetry remains synthetic; crew-entered data is user-provided demo data.
