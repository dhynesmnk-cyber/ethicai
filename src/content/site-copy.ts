// Fixed page copy for Home and About, kept in one place (current site copy, BUILD-SPEC
// Appendix A). Articles, videos, team, testimonials and contact details are edited in the admin.
// DECISION: page copy stays in code for now; it changes rarely and the data model (§4) has no
// page-copy global. If the client wants to edit it themselves, move it into a global.

export const HERO = {
  headline: 'A.I. grounded in human dignity',
  subhead:
    'We help organisations adopt AI ethically, building the systems, culture and clarity to move with change.',
}

export const INTRO =
  'In a world where AI is reshaping work and certainty is in short supply, the most powerful thing an organisation can be is adaptable. At EthicAI, we help organisations build the systems, culture, and clarity to move with change. We blend sharp operational insight with deep people strategy to create workplaces that are data led, ethical, and energised for what’s next.'

// Three columns drawn from the intro above (spec §5.2). Needs client sign-off.
export const VALUE_PROPS = [
  {
    title: 'Systems & clarity',
    body: 'Sharp operational insight to design the systems, processes and decision-making that let your organisation move with change.',
  },
  {
    title: 'People & culture',
    body: 'Deep people strategy so your teams feel supported, informed and energised as the way they work evolves.',
  },
  {
    title: 'Ethical AI',
    body: 'Data-led, ethical AI adoption that serves your goals and your people, with values built in from the start.',
  },
]
