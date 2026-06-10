import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')

const sourceImagePath = path.join(rootDir, 'public', 'heart.png')
const buildDir = path.join(rootDir, 'build')
const iconPngPath = path.join(buildDir, 'icon.png')
const icon256Path = path.join(buildDir, 'icon-256.png')
const iconIcoPath = path.join(buildDir, 'icon.ico')

const ZOOM = 1.35
const ICO_SIZES = [16, 32, 48, 64, 128, 256]

const makeZoomedSquare = async (size, outputPath) => {
  const zoomedSize = Math.round(size * ZOOM)
  const cropOffset = Math.max(0, Math.floor((zoomedSize - size) / 2))

  await sharp(sourceImagePath)
    .resize(zoomedSize, zoomedSize, { fit: 'cover', position: 'attention' })
    .extract({ left: cropOffset, top: cropOffset, width: size, height: size })
    .png()
    .toFile(outputPath)
}

const makeResizedBuffer = async (size) => {
  const zoomedSize = Math.round(size * ZOOM)
  const cropOffset = Math.max(0, Math.floor((zoomedSize - size) / 2))

  return sharp(sourceImagePath)
    .resize(zoomedSize, zoomedSize, { fit: 'cover', position: 'attention' })
    .extract({ left: cropOffset, top: cropOffset, width: size, height: size })
    .png()
    .toBuffer()
}

await fs.mkdir(buildDir, { recursive: true })

await makeZoomedSquare(512, iconPngPath)
await makeZoomedSquare(256, icon256Path)

const icoBuffers = await Promise.all(ICO_SIZES.map(makeResizedBuffer))
const icoBuffer = await pngToIco(icoBuffers)
await fs.writeFile(iconIcoPath, icoBuffer)

console.log('Generated zoomed app icons from public/heart.png')
