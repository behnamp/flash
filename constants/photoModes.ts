export const PHOTO_MODES = {
  "Film": [
    { id: "kodak",    name: "Kodak Gold",    bg: "linear-gradient(135deg,#c8742a,#e8a84e)" },
    { id: "ilford",   name: "Black & White", bg: "linear-gradient(135deg,#1a1a1a,#888)" },
    { id: "portra",   name: "Portra 400",    bg: "linear-gradient(135deg,#c4a882,#e8d4b8)" },
    { id: "polaroid", name: "Polaroid",      bg: "linear-gradient(135deg,#e8dcc8,#f4f0e8)" },
    { id: "golden",   name: "Golden Hour",   bg: "linear-gradient(135deg,#e8882a,#f8c84e)" },
  ]
}

export const ALL_MODES = Object.values(PHOTO_MODES).flat()
