type IconProps = { size?: number; color?: string; strokeWidth?: number }

const I = ({ size = 24, color = 'white', strokeWidth = 1.75, children }: IconProps & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

export const IconShutter = (p: IconProps) => <I {...p}><rect x="2" y="6" width="20" height="14" rx="2.5"/><circle cx="12" cy="13" r="3.5"/><path d="M7 6L9.5 3h5L17 6"/><circle cx="18.5" cy="9.5" r="1" fill="white" stroke="none"/></I>
export const IconGallery = (p: IconProps) => <I {...p}><rect x="2" y="2" width="9" height="13" rx="1.5"/><rect x="13" y="2" width="9" height="6" rx="1.5"/><rect x="13" y="10" width="9" height="12" rx="1.5"/><rect x="2" y="17" width="9" height="5" rx="1.5"/></I>
export const IconQR = (p: IconProps) => <I {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="5" y="5" width="3" height="3" fill="white" stroke="none"/><rect x="16" y="5" width="3" height="3" fill="white" stroke="none"/><rect x="5" y="16" width="3" height="3" fill="white" stroke="none"/><path d="M14 14h2v2h-2zM18 14h3v2h-3zM14 18h3v3h-3zM19 19h2v2h-2z" fill="white" stroke="none"/></I>
export const IconFlash = (p: IconProps) => <I {...p} strokeWidth={0}><path d="M13 2L4 13.5H11L9 22L20 9.5H13V2Z" fill="white"/></I>
export const IconBack = (p: IconProps) => <I {...p}><path d="M19 12H5"/><path d="M5 12L11 6"/><path d="M5 12L11 18"/></I>
export const IconFlip = (p: IconProps) => <I {...p}><path d="M20 7H9a4 4 0 0 0-4 4v1"/><path d="M4 7l3-3-3-3"/><path d="M4 17h11a4 4 0 0 0 4-4v-1"/><path d="M20 17l-3 3 3 3"/></I>
export const IconReveal = (p: IconProps) => <I {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/><circle cx="12" cy="16" r="1.5" fill="white" stroke="none"/></I>
export const IconPlus = (p: IconProps) => <I {...p}><path d="M12 5v14M5 12h14"/></I>
export const IconCheck = (p: IconProps) => <I {...p}><path d="M20 6L9 17l-5-5"/></I>
export const IconClose = (p: IconProps) => <I {...p}><path d="M18 6L6 18M6 6l12 12"/></I>
export const IconCopy = (p: IconProps) => <I {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></I>
export const IconShare = (p: IconProps) => <I {...p}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></I>
export const IconFilm = (p: IconProps) => <I {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M17 4v16M2 9h4M2 15h4M18 9h4M18 15h4"/></I>
export const IconSave = (p: IconProps) => <I {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></I>
export const IconGuests = (p: IconProps) => <I {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></I>
export const IconStats = (p: IconProps) => <I {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></I>
export const IconTarget = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></I>
export const IconTimer = (p: IconProps) => <I {...p}><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 3h6M12 3v2"/></I>
export const IconMic = (p: IconProps) => <I {...p}><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></I>
export const IconVideo = (p: IconProps) => <I {...p}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></I>
export const IconSun = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></I>
export const IconLogout = (p: IconProps) => <I {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></I>
export const IconPrint = (p: IconProps) => <I {...p}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></I>
export const IconReel = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 0 1 7.07 2.93M22 12a10 10 0 0 1-2.93 7.07M12 22a10 10 0 0 1-7.07-2.93M2 12a10 10 0 0 1 2.93-7.07"/></I>
export const IconSettings = (p: IconProps) => <I {...p}><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="8" cy="6" r="2" fill="var(--bg)" strokeWidth={1.75}/><circle cx="16" cy="12" r="2" fill="var(--bg)" strokeWidth={1.75}/><circle cx="10" cy="18" r="2" fill="var(--bg)" strokeWidth={1.75}/></I>
export const IconHeart = ({ filled, ...p }: IconProps & { filled?: boolean }) => <I {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={filled ? 'white' : 'none'}/></I>
export const IconCalendar = (p: IconProps) => <I {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></I>
export const IconLive = (p: IconProps) => <I {...p}><circle cx="12" cy="12" r="3" fill="white" stroke="none"/><path d="M6.3 6.3a8 8 0 0 0 0 11.4"/><path d="M17.7 6.3a8 8 0 0 1 0 11.4"/></I>
export const IconLocation = (p: IconProps) => <I {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></I>
