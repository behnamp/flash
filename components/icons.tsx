type IconProps = { size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties }

const I = ({ size = 24, color = 'white', strokeWidth = 1.5, children, style }: IconProps & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

export const IconFlash = ({ size = 24, color = '#e8ff47', style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <path d="M13 2L4 13.5H11L9 22L20 9.5H13V2Z" fill={color}/>
  </svg>
)

export const IconShutter = (p: IconProps) => <I {...p}><path d="M14.5 4H9.5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3L14.5 4z"/><circle cx="12" cy="13" r="3.5"/></I>
export const IconGallery = (p: IconProps) => <I {...p}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="11" width="7" height="10" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></I>
export const IconQR = (p: IconProps) => <I {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="5.5" y="5.5" width="2" height="2" fill={p.color||'white'} stroke="none"/><rect x="16.5" y="5.5" width="2" height="2" fill={p.color||'white'} stroke="none"/><rect x="5.5" y="16.5" width="2" height="2" fill={p.color||'white'} stroke="none"/><path d="M14 14h2v2h-2zM18 14h3v2M18 18v3h3v-3M14 18h2v3"/></I>
export const IconBack = (p: IconProps) => <I {...p}><path d="M19 12H5M5 12L11 6M5 12L11 18"/></I>
export const IconFlip = (p: IconProps) => <I {...p}><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></I>
export const IconPlus = (p: IconProps) => <I {...p}><path d="M12 5v14M5 12h14"/></I>
export const IconCheck = (p: IconProps) => <I {...p}><path d="M20 6L9 17l-5-5"/></I>
export const IconClose = (p: IconProps) => <I {...p}><path d="M18 6L6 18M6 6l12 12"/></I>
export const IconCopy = (p: IconProps) => <I {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></I>
export const IconShare = (p: IconProps) => <I {...p}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M16 6L12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></I>
export const IconFilm = (p: IconProps) => <I {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M17 4v16M2 9h4M2 15h4M18 9h4M18 15h4"/></I>
export const IconSave = (p: IconProps) => <I {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><line x1="12" y1="15" x2="12" y2="3"/></I>
export const IconGuests = (p: IconProps) => <I {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></I>
export const IconStats = (p: IconProps) => <I {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></I>
export const IconTimer = (p: IconProps) => <I {...p}><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9.5 3h5M12 3v2"/></I>
export const IconMic = (p: IconProps) => <I {...p}><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="17" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></I>
export const IconVideo = (p: IconProps) => <I {...p}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></I>
export const IconLogout = (p: IconProps) => <I {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><line x1="21" y1="12" x2="9" y2="12"/></I>
export const IconPrint = (p: IconProps) => <I {...p}><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></I>
export const IconReel = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></I>
export const IconHeart = ({ filled, ...p }: IconProps & { filled?: boolean }) => <I {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={filled ? (p.color||'white') : 'none'}/></I>
export const IconCalendar = (p: IconProps) => <I {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></I>
export const IconLocation = (p: IconProps) => <I {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></I>
export const IconLive = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="2" fill={p.color||'white'} stroke="none"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14"/></I>
export const IconReveal = (p: IconProps) => <I {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1.5" fill={p.color||'white'} stroke="none"/></I>
export const IconTarget = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></I>

// Event type icons — bold, distinctive, 28px display size
export const IconWedding = (p: IconProps) => <I {...p}><path d="M12 2C9.8 2 8 3.8 8 6s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z"/><path d="M5 22v-3a7 7 0 0 1 14 0v3"/><path d="M8 22h8"/></I>
export const IconBirthday = (p: IconProps) => <I {...p}><rect x="2" y="10" width="20" height="12" rx="2"/><path d="M6 10V8M12 10V8M18 10V8"/><path d="M6 8c0-2 3-4 0-6M12 8c0-2 3-4 0-6M18 8c0-2 3-4 0-6"/><line x1="2" y1="15" x2="22" y2="15"/></I>
export const IconParty = (p: IconProps) => <I {...p}><path d="M21.5 2l-8 8"/><path d="M14.5 2H21.5V9"/><path d="M10.5 6l-9 9 6 6 9-9"/><path d="M7.5 18l-4 4"/></I>
export const IconTrip = (p: IconProps) => <I {...p}><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></I>
export const IconCorporate = (p: IconProps) => <I {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M12 12v4M10 14h4"/></I>
export const IconFestival = (p: IconProps) => <I {...p}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></I>
export const IconSports = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/><path d="M4.93 19.07l14.14-14.14"/></I>
export const IconNightlife = (p: IconProps) => <I {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/><path d="M15 17l2 2M9 7l-2-2"/></I>
export const IconOther = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" strokeWidth={2.5}/></I>

// Reveal mode icons
export const IconInstant = (p: IconProps) => <I {...p}><path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z"/></I>
export const IconEndEvent = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill={p.color||'white'} stroke="none"/></I>
export const IconRolling = (p: IconProps) => <I {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></I>
export const IconMorning = (p: IconProps) => <I {...p}><path d="M17 18a5 5 0 0 0-10 0"/><path d="M12 9V2M4.22 10.22l1.42 1.42M1 18h2M21 18h2M18.36 11.64l1.42-1.42"/></I>
export const IconMilestone = (p: IconProps) => <I {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></I>
export const IconSun = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></I>
