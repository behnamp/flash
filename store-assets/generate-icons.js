// Run with: node generate-icons.js
// Requires: npm install sharp

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

// SVG source for the Flash icon
const svgIcon = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Yellow background -->
  <rect width="1024" height="1024" fill="#e8ff47"/>
  <!-- Flash bolt, centered -->
  <path d="M576 80L192 560H448L400 944L832 400H560L576 80Z" 
        fill="#0a0a0a" stroke="none"/>
</svg>
`

async function generateIcons() {
  // iOS App Store icon (no alpha, no rounding)
  await sharp(Buffer.from(svgIcon))
    .resize(1024, 1024)
    .flatten({ background: '#e8ff47' })
    .png({ compressionLevel: 9 })
    .toFile('ios-1024.png')
  console.log('✓ ios-1024.png')

  // iOS sizes (Xcode needs these in Assets.xcassets)
  const iosSizes = [20,29,40,58,60,76,80,87,120,152,167,180,1024]
  for (const size of iosSizes) {
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .flatten({ background: '#e8ff47' })
      .png()
      .toFile(`ios-${size}.png`)
    console.log(`✓ ios-${size}.png`)
  }

  // Android sizes
  const androidSizes = [
    { name: 'mdpi', size: 48 },
    { name: 'hdpi', size: 72 },
    { name: 'xhdpi', size: 96 },
    { name: 'xxhdpi', size: 144 },
    { name: 'xxxhdpi', size: 192 },
  ]
  for (const { name, size } of androidSizes) {
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .flatten({ background: '#e8ff47' })
      .png()
      .toFile(`android-${name}-${size}.png`)
    console.log(`✓ android-${name}-${size}.png`)
  }

  // Google Play store icon
  await sharp(Buffer.from(svgIcon))
    .resize(512, 512)
    .flatten({ background: '#e8ff47' })
    .png()
    .toFile('google-play-512.png')
  console.log('✓ google-play-512.png')
}

generateIcons().catch(console.error)
