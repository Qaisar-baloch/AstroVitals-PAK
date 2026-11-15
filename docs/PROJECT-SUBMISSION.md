# AstroVitals PAK — Project Submission

## Project summary

AstroVitals PAK is an astronaut health monitoring and mission intelligence prototype created for the NASA Space Apps Challenge 2026 challenge, “Create Health Monitoring Software for Astronauts on Space Missions.”

The project demonstrates a front-end workflow for a long-duration mission scenario: a commander can review a four-person synthetic crew overview, while crew members can record self-assessments and explore descriptive health trends. A 3D educational anatomy viewer connects selected body structures to contextual information. Alert and decision-support screens organize demonstration events and suggested workflow prompts.

**Live demo:** https://astrovitalspak.netlify.app  
**Repository:** https://github.com/Qaisar-baloch/AstroVitals-PAK

## Problem framing

Long-duration human spaceflight introduces interacting hazards, including radiation, isolation and confinement, distance from Earth, altered gravity, and the hostile closed environment of a spacecraft. These conditions motivate careful crew-health monitoring, self-assessment, and clear communication of health-related information.

## Proposed approach

AstroVitals PAK explores how a single interface could bring together:
1. Crew-level mission overview.
2. Individual astronaut self-assessment.
3. Simulated telemetry and manually entered check-ins with clear source separation.
4. Descriptive trends and demonstration baselines.
5. Alert acknowledgement and event history.
6. Educational anatomy exploration.
7. NASA-linked science context and hazard-to-monitoring mapping.

## What the prototype demonstrates

- Four synthetic astronaut profiles.
- Manual check-ins stored locally in the browser.
- Simulated telemetry for demonstration.
- Separate analytics for simulated and user-entered records.
- Interactive 3D educational anatomy viewer.
- Workflow-oriented alert levels and acknowledgement.
- Mission routines and reminders.
- NASA science reference library.

## What it does not demonstrate

It is not flight software, a medical device, a clinical decision-support system, a validated physiological model, a real sensor integration, a secure medical-record platform, or a communication system to Earth. All crew and telemetry values are synthetic. Local check-ins are demonstration data only.

## Technical implementation

React, Vite, JavaScript, Tailwind CSS, Three.js, Recharts, browser localStorage, and Netlify hosting. The app is a front-end-only prototype and does not require a backend or API credentials.

## Evidence and scientific integrity

NASA materials are presented as educational context and linked to source pages. They do not validate the app's simulated readings, statistical thresholds, alert colors, or suggested actions. Missing evidence is identified rather than invented. Third-party anatomy assets are attributed in the repository's anatomy attribution file.

## Demo and access

- Live application: https://astrovitalspak.netlify.app
- Source repository: https://github.com/Qaisar-baloch/AstroVitals-PAK
- Local setup: see the root README.

## Team and acknowledgement

Project author: Qaisar Khan (repository account: Qaisar-baloch). Update this section if the official challenge team profile uses a different display name or includes additional teammates.
