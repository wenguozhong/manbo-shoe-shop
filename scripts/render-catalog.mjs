import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, rename, rm, rmdir, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const output = join(root, 'public', 'images')
const variants = ['shadow', 'origin', 'volt']
const filenames = variants.map((color) => 'court-01-' + color + '.webp')
const directory = await mkdtemp(join(root, '.catalog-render-'))
const entry = join(directory, 'index.html')
const pageSource = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <link rel="icon" href="data:,">
  <title>IDC COURT 01 catalog render</title>
  <style>html,body,#root,.viewer{width:100%;height:100%;margin:0;overflow:hidden}</style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import { createRef, createElement } from 'react'
    import { createRoot } from 'react-dom/client'
    import Viewer from '/src/three/Viewer.tsx'
    import { createConfig, readColor } from '/src/domain/config.ts'
    const color = readColor(new URLSearchParams(location.search).get('color'))
    const ref = createRef()
    createRoot(document.querySelector('#root')).render(createElement(Viewer, {
      ref, config: createConfig(color), interactive: false
    }))
    window.captureCatalog = () => ref.current?.capture('catalog')
  </script>
</body>
</html>`

// Frame the dark colorway first and reuse its bounds for the entire collection.
async function frameProduct(bounds) {
  await document.fonts.ready
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  const url = window.captureCatalog()
  if (!url) throw new Error('The 3D viewer could not export its WebGL frame.')
  const image = new Image()
  image.src = url
  await image.decode()

  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.drawImage(image, 0, 0)
  if (!bounds) {
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
    let left = canvas.width,
      right = -1,
      top = canvas.height,
      bottom = -1
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4
        const red = Math.abs(data[i] - data[0])
        const green = Math.abs(data[i + 1] - data[1])
        const blue = Math.abs(data[i + 2] - data[2])
        if (Math.max(red, green, blue) < 34) continue
        left = Math.min(left, x)
        right = Math.max(right, x)
        top = Math.min(top, y)
        bottom = Math.max(bottom, y)
      }
    }
    if (right - left < canvas.width * 0.28 || bottom - top < canvas.height * 0.12) {
      throw new Error('The renderer returned a blank or incomplete product frame.')
    }
    bounds = { left, right, top, bottom }
  }
  canvas.width = 1000
  canvas.height = 760
  context.fillStyle = '#f0f0ed'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.imageSmoothingQuality = 'high'
  const scale = (canvas.width * 0.82) / (bounds.right - bounds.left + 1)
  const x = canvas.width / 2 - ((bounds.left + bounds.right) / 2) * scale
  const y = canvas.height / 2 - ((bounds.top + bounds.bottom) / 2) * scale
  context.drawImage(image, x, y, image.width * scale, image.height * scale)
  return { bounds, data: canvas.toDataURL('image/webp', 0.89).split(',')[1] }
}

let server
let browser
try {
  await writeFile(entry, pageSource)
  server = await createServer({
    root,
    configFile: false,
    appType: 'mpa',
    logLevel: 'warn',
    cacheDir: 'node_modules/.vite-catalog',
    server: { host: '127.0.0.1', port: 0, hmr: false },
    esbuild: { jsx: 'automatic' },
    optimizeDeps: { entries: [basename(directory) + '/index.html'] },
  })
  await server.listen()
  const installedChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
      (existsSync(installedChrome) ? installedChrome : undefined),
    headless: true,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  })
  const page = await browser.newPage({
    viewport: { width: 1250, height: 950 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  })
  page.on('pageerror', (error) => console.error(error.message))
  const address = new URL(basename(directory) + '/index.html', server.resolvedUrls.local[0])
  let bounds = null
  for (const [i, color] of variants.entries()) {
    address.searchParams.set('color', color)
    await page.goto(address.href, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.locator('.viewer[data-ready="true"] canvas').waitFor({ timeout: 90000 })
    const framed = await page.evaluate(frameProduct, bounds)
    bounds = framed.bounds
    await writeFile(join(directory, filenames[i]), Buffer.from(framed.data, 'base64'))
  }
  await mkdir(output, { recursive: true })
  for (const name of filenames) {
    await rename(join(directory, name), join(output, name))
    console.log('Rendered ' + name)
  }
} finally {
  try {
    await browser?.close()
    await server?.close()
  } finally {
    if (dirname(directory) === root && basename(directory).startsWith('.catalog-render-')) {
      await Promise.all(
        ['index.html', ...filenames].map((name) => rm(join(directory, name), { force: true })),
      )
      await rmdir(directory)
    }
  }
}
