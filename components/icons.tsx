// Flash App — Phosphor Icons
// Source: figma.com/community/file/1063138616574654762
// Package: @phosphor-icons/react

export {
  Camera as IconShutter,
  Images as IconGallery,
  QrCode as IconQR,
  ArrowLeft as IconBack,
  ArrowsClockwise as IconFlip,
  Users as IconGuests,
  ChartBar as IconStats,
  Target as IconTarget,
  Timer as IconTimer,
  Microphone as IconMic,
  VideoCamera as IconVideo,
  Moon as IconNightlife,
  SignOut as IconLogout,
  Printer as IconPrint,
  FilmStrip as IconFilm,
  Heart as IconHeart,
  Fire as IconFire,
  Star as IconMilestone,
  MapPin as IconLocation,
  CalendarBlank as IconCalendar,
  Broadcast as IconLive,
  Lock as IconReveal,
  Plus as IconPlus,
  Check as IconCheck,
  DownloadSimple as IconSave,
  ShareNetwork as IconShare,
  Confetti as IconParty,
  Airplane as IconTrip,
  Briefcase as IconCorporate,
  MusicNote as IconFestival,
  Trophy as IconSports,
  Play as IconEndEvent,
  ArrowsCounterClockwise as IconRolling,
  SealCheck as IconPlanCheck,
  Storefront as IconVenue,
  Lightning as IconInstant,
} from '@phosphor-icons/react'

// Custom icons not in Phosphor
export const IconFlash = ({ size = 24, color = '#e8ff47', style }: { size?: number; color?: string; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <path d="M13 2L4 13.5H11L9 22L20 9.5H13V2Z" fill={color} />
  </svg>
)

export const IconClose = ({ size = 24, color = 'white', weight }: { size?: number; color?: string; weight?: string }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill={color}>
    <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
  </svg>
)

export const IconCopy = ({ size = 24, color = 'white', weight }: { size?: number; color?: string; weight?: string }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill={color}>
    <path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32Zm-56,176H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"/>
  </svg>
)

export const IconReel = ({ size = 24, color = 'white', weight }: { size?: number; color?: string; weight?: string }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="128" cy="128" r="96"/>
    <circle cx="128" cy="128" r="32"/>
    <line x1="128" y1="32" x2="128" y2="64"/>
    <line x1="128" y1="192" x2="128" y2="224"/>
    <line x1="32" y1="128" x2="64" y2="128"/>
    <line x1="192" y1="128" x2="224" y2="128"/>
  </svg>
)

export const IconWedding = ({ size = 24, color = 'white', weight }: { size?: number; color?: string; weight?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Ring band - circle viewed from front */}
    <path d="M12 21a7 7 0 1 0 0-14 7 7 0 0 0 0 14z"/>
    <path d="M12 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    {/* Diamond on top */}
    <path d="M9 7l3-4 3 4-3 3-3-3z"/>
    <path d="M9 7h6"/>
    {/* Band sides */}
    <path d="M9.5 9.5C9 10.5 9 11.5 9 14"/>
    <path d="M14.5 9.5C15 10.5 15 11.5 15 14"/>
  </svg>
)

export const IconBirthday = ({ size = 24, color = 'white', weight }: { size?: number; color?: string; weight?: string }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill={color}>
    <path d="M240,184a8,8,0,0,1-8,8c-20.12,0-33.69-7.3-45.35-13.61C176.26,172.26,165.69,167,148,167s-28.26,5.26-38.65,11.39C97.69,184.7,84.12,192,64,192s-33.69-7.3-45.35-13.61A8,8,0,1,1,26.35,165c9.39,5.19,19.63,11,37.65,11s28.26-5.26,38.65-11.39C114.31,158.3,127.88,151,148,151s33.69,7.3,45.35,13.61C203.74,169.74,214.31,175,232,175A8,8,0,0,1,240,184Zm0-64c0,4.42-20.12,8-48,8s-48-3.58-48-8,20.12-8,48-8S240,115.58,240,120Zm-128,0c0,4.42-20.12,8-48,8S16,124.42,16,120s20.12-8,48-8S112,115.58,112,120ZM80,96V72a16,16,0,0,1,32,0V96Zm64,0V72a16,16,0,0,1,32,0V96Z"/>
  </svg>
)

export const IconMorning = ({ size = 24, color = 'white', weight }: { size?: number; color?: string; weight?: string }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill={color}>
    <path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM40,128a8,8,0,0,0-8-8H8a8,8,0,0,0,0,16H32A8,8,0,0,0,40,128Zm208-8H224a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Zm-96,88a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,152,216Z"/>
  </svg>
)

export const IconQuestion = ({ size = 24, color = 'white', weight }: { size?: number; color?: string; weight?: string }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill={color}>
    <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/>
  </svg>
)
