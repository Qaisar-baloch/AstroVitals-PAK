# AstroVitals PAK — Phase 7 Deployment & QA

## Hosting target
- Build tool: Vite
- Host: Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback: configured in `netlify.toml` and `public/_redirects`
- Custom domain: pending final registration. Preferred candidate: `astrovitalspak.health`; alternatives to check: `astrovitalspak.space`, `astrovitalspak.org`, `astrovitals-pak.health`.

Do not assume a domain is available until the registrar confirms it at checkout. Check both first-year and renewal prices, premium pricing, taxes, and any eligibility or policy terms. `.health` is an industry-specific extension; check its current registry/registrar terms before purchasing. The application is a demo and must not collect real patient/crew medical records.

## Local release gate
Run from the project root:

```bash
npm install
npm run build
npm run preview
```

Open the preview URL and complete the manual checks below. A successful Vite build is necessary but does not prove every interactive workflow works.

## QA checklist
- [ ] Mission Control loads as the default page.
- [ ] Four demo crew profiles are visible and selectable.
- [ ] Manual check-ins save and remain labelled crew-entered.
- [ ] Simulated telemetry is clearly labelled simulated.
- [ ] Analytics distinguish manual records from simulated telemetry.
- [ ] Alert filtering and acknowledgement work.
- [ ] Science hazard mappings and citations open correctly.
- [ ] Anatomy viewer loads; if the remote model cannot load, fallback/error state is clear.
- [ ] Anatomy attribution is visible in `ANATOMY-ATTRIBUTION.md` and in the app where required.
- [ ] Sidebar navigation works after refreshing a nested route.
- [ ] CSV export works.
- [ ] Layout is usable at desktop and mobile widths.
- [ ] Keyboard focus is visible; reduced-motion preference is respected.
- [ ] No browser console errors or broken image/model requests.
- [ ] No real personal health data or credentials are included in the repository.

## Netlify deployment
1. Push the project to a GitHub repository.
2. In Netlify, choose **Add new site → Import an existing project** and connect the repository.
3. Set build command `npm run build` and publish directory `dist` (also defined in `netlify.toml`).
4. Deploy and test the generated `*.netlify.app` URL first.
5. Add the domain only after registering it. In Netlify, open **Domain management → Add a domain**.
6. Copy the exact DNS records Netlify displays into the domain registrar's DNS panel. Do not guess A, CNAME, or nameserver values.
7. Wait for DNS verification, enable/verify HTTPS, and test both apex and `www` if configured.

## Security and medical scope
This is an educational prototype. LocalStorage is not secure storage; role selection is not authentication; no real wearable connection exists. Do not enter real medical data. Thresholds and alert categories are demo logic, not clinical guidance, diagnosis, or emergency triage.
