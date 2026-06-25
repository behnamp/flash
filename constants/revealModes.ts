export const REVEAL_MODES = [
  { id: 'instant',   icon: 'lightning',  name: 'Instant',       desc: 'Photos appear live as guests shoot.' },
  { id: 'end',       icon: 'reveal',     name: 'End of Event',  desc: 'All photos unlock together when you tap Reveal.' },
  { id: 'rolling',   icon: 'rolling',    name: 'Rolling Reveal', desc: 'New photos unlock every 30 minutes.' },
  { id: 'morning',   icon: 'morning',    name: 'Morning After', desc: 'Everything unlocks at 9am the next day.' },
  { id: 'milestone', icon: 'milestone',  name: 'Milestone',     desc: 'Gallery unlocks when every guest uses all their shots.' },
] as const
