import { maxArtworkBytes, maxJsonBytes, parseConfig, type ShoeConfig } from '../domain/config'

export function download(url: string, name: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
}
export function fileName(extension: string) {
  return (
    'idc-court-01-design-' +
    new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15) +
    '.' +
    extension
  )
}
export function exportJson(config: ShoeConfig) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(config, null, 2)], { type: 'application/json;charset=utf-8' }),
  )
  download(url, fileName('json'))
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
export function decode(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('This image could not be opened.'))
    image.src = src
  })
}
export async function importJson(file: File) {
  if (file.size > maxJsonBytes) throw new Error('The JSON file exceeds the 1 MB limit.')
  const config = parseConfig(await file.text())
  if (config.artwork) await decode(config.artwork.dataUrl)
  return config
}
export async function importArtwork(file: File) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
    throw new Error('Choose a PNG, JPG or WebP image.')
  if (file.size > maxArtworkBytes) throw new Error('The image exceeds the 5 MB limit.')
  const url = URL.createObjectURL(file)
  try {
    const image = await decode(url),
      canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('This browser could not process the image.')
    let maxDim = 420
    for (;;) {
      const scale = Math.min(1, maxDim / Math.max(image.width, image.height))
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/png')
      if (dataUrl.length <= 240000)
        return { name: Array.from(file.name).slice(0, 90).join('') || 'artwork.png', dataUrl }
      maxDim = Math.floor(maxDim * 0.7)
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}
