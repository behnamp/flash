// Flash App — Phosphor Icons
// Source: figma.com/community/file/1063138616574654762
// Package: @phosphor-icons/react

export {
  // Navigation
  ArrowLeft as IconBack,
  ArrowRight as IconArrowRight,
  CaretRight as IconCaretRight,
  DotsThreeVertical as IconMenu,

  // Core app
  Camera as IconShutter,
  CameraRotate as IconFlip,
  CameraSlash as IconCameraOff,
  Images as IconGallery,
  Image as IconImage,
  QrCode as IconQR,
  FilmReel as IconReel,
  FilmStrip as IconFilm,
  Slideshow as IconSlideshow,

  // Users & social
  Users as IconGuests,
  UserCircle as IconProfile,
  GlobeHemisphereWest as IconGlobe,

  // Actions
  Plus as IconPlus,
  Check as IconCheck,
  CheckCircle as IconCheckCircle,
  X as IconClose,
  XCircle as IconXCircle,
  PencilSimple as IconEdit,
  Trash as IconDelete,
  CopySimple as IconCopy,
  LinkSimple as IconLink,
  UploadSimple as IconUpload,
  DownloadSimple as IconSave,
  ShareNetwork as IconShare,
  DotsThree as IconDots,

  // Status & feedback
  Warning as IconWarning,
  WarningCircle as IconWarningCircle,
  CheckCircle as IconSuccess,
  Hourglass as IconHourglass,
  SpinnerGap as IconSpinner,
  Eye as IconEye,
  EyeSlash as IconEyeOff,

  // Media & modes
  Microphone as IconMic,
  VideoCamera as IconVideo,
  Sparkle as IconSparkle,
  Aperture as IconAperture,

  // Stats & info
  ChartBar as IconStats,
  Target as IconTarget,
  Timer as IconTimer,
  Clock as IconClock,
  CalendarBlank as IconCalendar,
  MapPin as IconLocation,
  Tag as IconTag,
  Medal as IconMedal,
  Star as IconStar,
  Ticket as IconTicket,

  // Auth & settings
  SignOut as IconLogout,
  Key as IconKey,
  Lock as IconReveal,
  GearSix as IconSettings,
  Envelope as IconEmail,

  // Reactions
  Heart as IconHeart,
  Fire as IconFire,
  Smiley as IconLaugh,

  // Post-event
  Printer as IconPrint,
  Broadcast as IconLive,
  Scan as IconScan,

  // Event types
  Confetti as IconParty,
  Airplane as IconTrip,
  Briefcase as IconCorporate,
  MusicNote as IconFestival,
  Trophy as IconSports,
  Moon as IconNightlife,

  // Reveal modes
  Lightning as IconInstant,
  Play as IconEndEvent,
  ArrowsClockwise as IconRolling,
  SunHorizon as IconMorning,

  // Plan features
  SealCheck as IconPlanCheck,
  Storefront as IconVenue,
} from '@phosphor-icons/react'

// ── Custom icons not in Phosphor ──────────────────────────────────────────────

// Flash brand bolt
export const IconFlash = ({ size = 24, color = '#e8ff47', style }: { size?: number; color?: string; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <path d="M13 2L4 13.5H11L9 22L20 9.5H13V2Z" fill={color} />
  </svg>
)

// Wedding ring with diamond
export const IconWedding = ({ size = 24, color = 'white', weight }: { size?: number; color?: string; weight?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    {/* Ring band — thick circle, open at top where diamond sits */}
    <path d="M8.5 10.5A6 6 0 1 0 15.5 10.5" strokeWidth="1.6" fill="none"/>
    {/* Diamond gem — faceted like reference image */}
    {/* Outer diamond silhouette */}
    <path d="M8.5 8.5L12 4L15.5 8.5L12 13Z" strokeWidth="1.2" fill="none"/>
    {/* Top facet row */}
    <path d="M8.5 8.5L10 5.8L12 4" strokeWidth="0.9" />
    <path d="M15.5 8.5L14 5.8L12 4" strokeWidth="0.9" />
    {/* Horizontal girdle line */}
    <line x1="8.5" y1="8.5" x2="15.5" y2="8.5" strokeWidth="0.9" />
    {/* Center facet lines going to bottom point */}
    <path d="M10 5.8L12 13" strokeWidth="0.7" />
    <path d="M14 5.8L12 13" strokeWidth="0.7" />
    <path d="M9.5 8.5L12 13" strokeWidth="0.7" />
    <path d="M14.5 8.5L12 13" strokeWidth="0.7" />
  </svg>
)

// Birthday cake
export const IconBirthday = ({ size = 24, color = 'white', weight }: { size?: number; color?: string; weight?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 10V8M12 10V8M16 10V8" />
    <path d="M8 8c0-1.5 1.5-2.5 0-4M12 8c0-1.5 1.5-2.5 0-4M16 8c0-1.5 1.5-2.5 0-4" />
    <rect x="3" y="10" width="18" height="11" rx="2" />
    <path d="M3 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2" />
  </svg>
)

// Morning / sunrise for reveal mode
export const IconMilestone = ({ size = 24, color = 'white', weight }: { size?: number; color?: string; weight?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

// Question mark for "other"
export const IconQuestion = ({ size = 24, color = 'white', weight }: { size?: number; color?: string; weight?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
  </svg>
)

// Duplicate / copy event
export const IconDuplicate = ({ size = 24, color = 'white', weight }: { size?: number; color?: string; weight?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

// Stop / end event
export const IconStop = ({ size = 24, color = 'white', weight }: { size?: number; color?: string; weight?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <rect x="9" y="9" width="6" height="6" fill={color} stroke="none" />
  </svg>
)
