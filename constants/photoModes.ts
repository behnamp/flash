export const PHOTO_MODES = {
  "Film Emulation": [
    { id:"kodak", sampleScene:"🌅", name:"Kodak Gold", icon:"🌅", bg:"linear-gradient(135deg,#c8742a,#e8a84e)" },
    { id:"fuji", sampleScene:"🌿", name:"Fuji Superia", icon:"🌿", bg:"linear-gradient(135deg,#4a8c6a,#7ab89e)" },
    { id:"portra", sampleScene:"💐", name:"Portra 400", icon:"🤍", bg:"linear-gradient(135deg,#c4a882,#e8d4b8)" },
    { id:"ilford", sampleScene:"🖤", name:"Ilford HP5", icon:"⬛", bg:"linear-gradient(135deg,#1a1a1a,#888)" },
    { id:"cinestill", sampleScene:"🌃", name:"Cinestill 800T", icon:"🌃", bg:"linear-gradient(135deg,#1a0a1a,#8b4c8b)" },
    { id:"lomo", sampleScene:"🎨", name:"Lomography", icon:"🎨", bg:"linear-gradient(135deg,#8b1a1a,#4a1a8b)" },
  ],
  "Era & Decade": [
    { id:"super8", sampleScene:"🎞", name:"70s Super 8", icon:"🎞", bg:"linear-gradient(135deg,#c8a832,#e8c84e)" },
    { id:"vhs", sampleScene:"📼", name:"80s VHS", icon:"📼", bg:"linear-gradient(135deg,#1a1a4a,#3a3a8b)" },
    { id:"nineties", sampleScene:"📸", name:"90s P&S", icon:"📷", bg:"linear-gradient(135deg,#c8c082,#e8d8a0)" },
    { id:"y2k", sampleScene:"💿", name:"Y2K Digital", icon:"💿", bg:"linear-gradient(135deg,#8b4ac8,#c84a8b)" },
    { id:"polaroid", sampleScene:"🤍", name:"Polaroid", icon:"🟫", bg:"linear-gradient(135deg,#e8dcc8,#f4f0e8)" },
  ],
  "Mood": [
    { id:"golden", sampleScene:"🌇", name:"Golden Hour", icon:"🌇", bg:"linear-gradient(135deg,#e8882a,#f8c84e)" },
    { id:"bluehour", sampleScene:"🌆", name:"Blue Hour", icon:"🌆", bg:"linear-gradient(135deg,#1a2a4a,#2a4a8b)" },
    { id:"neonnoir", sampleScene:"🌉", name:"Neon Noir", icon:"🌉", bg:"linear-gradient(135deg,#0a0a1a,#2a004a)" },
    { id:"softdream", sampleScene:"🌸", name:"Soft Dream", icon:"🌸", bg:"linear-gradient(135deg,#e8d4e8,#f4e8f4)" },
    { id:"harsh", sampleScene:"🎬", name:"Harsh Truth", icon:"🎬", bg:"linear-gradient(135deg,#1a1a1a,#4a4a4a)" },
    { id:"desert", sampleScene:"🏜", name:"Desert Fade", icon:"🌵", bg:"linear-gradient(135deg,#c8a870,#e8c88a)" },
  ],
  "Event-Specific": [
    { id:"weddingf", sampleScene:"💒", name:"Wedding Film", icon:"💐", bg:"linear-gradient(135deg,#f4f0ec,#fff8f4)" },
    { id:"nightclub", sampleScene:"🎶", name:"Night Club", icon:"🎶", bg:"linear-gradient(135deg,#0a001a,#2a004a)" },
    { id:"sportsf", sampleScene:"🏆", name:"Sports Action", icon:"⚽", bg:"linear-gradient(135deg,#1a2a1a,#2a5a2a)" },
    { id:"festivalf", sampleScene:"🎪", name:"Festival Dust", icon:"🎪", bg:"linear-gradient(135deg,#c83a1a,#e8781a)" },
  ],
  "Experimental": [
    { id:"doubleexp", sampleScene:"👥", name:"Double Exposure", icon:"👻", bg:"linear-gradient(135deg,#1a0a2a,#4a1a6a)" },
    { id:"lightleak", sampleScene:"✨", name:"Light Leak", icon:"✨", bg:"linear-gradient(135deg,#c84a0a,#4a0a8b)" },
    { id:"cross", sampleScene:"🎭", name:"Cross Process", icon:"🔀", bg:"linear-gradient(135deg,#0a4a0a,#c84a00)" },
    { id:"glitch", sampleScene:"⚡", name:"Glitch Art", icon:"⚡", bg:"linear-gradient(135deg,#ff003c,#8b00ff)" },
    { id:"infrared", sampleScene:"🌱", name:"Infrared", icon:"🌿", bg:"linear-gradient(135deg,#c8f4c8,#a8e8a8)" },
  ],
}

export const ALL_MODES = Object.values(PHOTO_MODES).flat()
export type PhotoMode = typeof ALL_MODES[0]
