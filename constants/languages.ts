export const LANGUAGES = [
  { code:"en", flag:"🇬🇧", name:"English", dir:"ltr" },
  { code:"ar", flag:"🇸🇦", name:"العربية", dir:"rtl" },
  { code:"fa", flag:"🇮🇷", name:"فارسی", dir:"rtl" },
  { code:"fr", flag:"🇫🇷", name:"Français", dir:"ltr" },
  { code:"es", flag:"🇪🇸", name:"Español", dir:"ltr" },
  { code:"pt", flag:"🇧🇷", name:"Português", dir:"ltr" },
  { code:"de", flag:"🇩🇪", name:"Deutsch", dir:"ltr" },
  { code:"it", flag:"🇮🇹", name:"Italiano", dir:"ltr" },
  { code:"tr", flag:"🇹🇷", name:"Türkçe", dir:"ltr" },
  { code:"ko", flag:"🇰🇷", name:"한국어", dir:"ltr" },
  { code:"ja", flag:"🇯🇵", name:"日本語", dir:"ltr" },
  { code:"zh", flag:"🇨🇳", name:"中文", dir:"ltr" },
  { code:"hi", flag:"🇮🇳", name:"हिन्दी", dir:"ltr" },
  { code:"ru", flag:"🇷🇺", name:"Русский", dir:"ltr" },
  { code:"nl", flag:"🇳🇱", name:"Nederlands", dir:"ltr" },
  { code:"pl", flag:"🇵🇱", name:"Polski", dir:"ltr" },
  { code:"sv", flag:"🇸🇪", name:"Svenska", dir:"ltr" },
  { code:"he", flag:"🇮🇱", name:"עברית", dir:"rtl" },
  { code:"th", flag:"🇹🇭", name:"ภาษาไทย", dir:"ltr" },
  { code:"vi", flag:"🇻🇳", name:"Tiếng Việt", dir:"ltr" },
] as const

export type Language = typeof LANGUAGES[0]
export const getLang = (code: string) => LANGUAGES.find(l => l.code === code) ?? LANGUAGES[0]
