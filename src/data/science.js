// Source basis: only the science table supplied by the project owner.
// Do not add medical claims here without verifying and documenting a source.
export const science = [
  {
    id: 'heart',
    name: 'Heart and vessels',
    hazard: 'Gravity fields',
    nasaRiskName: [
      'Cardiovascular Adaptations',
      'Reduced Cardiorespiratory and Musculoskeletal Fitness',
    ],
    indicators: ['Heart rate', 'Blood pressure'],
    explanation:
      'The supplied table links gravity-field exposure with cardiovascular adaptations and reduced cardiorespiratory and musculoskeletal fitness.',
    action: 'Trend readings against the personal baseline and show an exercise prompt.',
    sourceUrl: 'https://www.nasa.gov/reference/risk-of-cardiovascular-adaptations/',
    sourceTitle: 'NASA: Risk of Cardiovascular Adaptations',
    evidenceStatus: 'NASA SOURCE LINKED',
    nasaContext: 'NASA describes how low-gravity conditions and other spaceflight stressors can alter the heart and blood vessels. The NASA page discusses cardiovascular fitness and mission-related cardiovascular risks.',
  },
  {
    id: 'brain',
    name: 'Brain and mind',
    hazard: 'Isolation and confinement; distance from Earth',
    nasaRiskName: [
      'Behavioral Changes and Psychiatric Disorders',
      'Inadequate Sleep and Irregular Schedules',
    ],
    indicators: ['Sleep hours', 'Mood (1-5)'],
    explanation:
      'The supplied table connects isolation, confinement and distance from Earth with behavioral changes, psychiatric disorders, inadequate sleep and irregular schedules.',
    action: 'Daily check-in; escalate if a concerning pattern is sustained.',
    sourceUrl: 'https://www.nasa.gov/directorates/esdmd/hhp/behavioral-health-risk/',
    sourceTitle: 'NASA: Behavioral Health Risk',
    evidenceStatus: 'NASA SOURCE LINKED',
    nasaContext: 'NASA describes how isolation and confinement can affect cognitive and behavioral functioning. The sleep-risk reference separately discusses sleep loss, circadian disruption and work overload.',
  },
  {
    id: 'bones',
    name: 'Bones and muscles',
    hazard: 'Gravity fields',
    nasaRiskName: ['Spaceflight-Induced Bone Changes', 'Reduced Fitness'],
    indicators: ['Exercise minutes', 'Periodic scan log'],
    explanation:
      'The supplied table links gravity fields with spaceflight-induced bone changes and reduced fitness.',
    action: 'Show exercise reminders. The table notes that NASA names exercise, diet and medication.',
    sourceUrl: 'https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/',
    sourceTitle: 'NASA: Risk of Spaceflight-Induced Bone Changes',
    evidenceStatus: 'NASA SOURCE LINKED',
    nasaContext: 'NASA describes bone-density changes in microgravity and discusses exercise, routine bone scans and other countermeasure research.',
  },
  {
    id: 'immune',
    name: 'Immune system',
    hazard: 'Hostile/closed environments',
    nasaRiskName: [
      'Altered Immune System Responses',
      'Host-Microorganism Interactions',
    ],
    indicators: ['Body temperature', 'Symptom checklist (e.g. rash)'],
    explanation:
      'The supplied table links hostile or closed environments with altered immune-system responses and host-microorganism interactions.',
    action: 'Symptom check and temperature trend.',
    sourceUrl: 'https://humanresearchroadmap.nasa.gov/Risks/risk.aspx?i=85',
    sourceTitle: 'NASA Human Research Roadmap: Altered Immune Response',
    evidenceStatus: 'NASA SOURCE LINKED',
    nasaContext: "NASA's Human Research Roadmap describes altered immune responses and reports that spaceflight-associated immune changes may include skin rashes and infectious processes.",
  },
  {
    id: 'eyes',
    name: 'Eyes',
    hazard: 'Gravity fields',
    nasaRiskName: ['Spaceflight Associated Neuro-ocular Syndrome'],
    indicators: ['Vision-change self-check'],
    explanation:
      'The supplied table links gravity fields with Spaceflight Associated Neuro-ocular Syndrome.',
    action: 'Optional sixth hotspot for a vision-change self-check.',
    sourceUrl: 'https://www.nasa.gov/directorates/esdmd/hhp/risk-of-spaceflight-associated-neuro-ocular-syndrome/',
    sourceTitle: 'NASA: Spaceflight Associated Neuro-ocular Syndrome (SANS)',
    evidenceStatus: 'NASA SOURCE LINKED',
    nasaContext: 'NASA describes ocular and brain structural changes associated with altered gravity and identifies vision alterations among potential effects.',
  },
]
