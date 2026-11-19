import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { setTimeout as delay } from 'node:timers/promises'

const FPS = 24
const DURATION = 26
const WIDTH = 1920
const HEIGHT = 1080
const PORT = 9344
const STAGE = 'http://127.0.0.1:3000/thomas/stage.html'
const FRAMES = '/tmp/thomas-motion-frames'
const OUTPUT = 'public/thomas/thomas-ghostframe.mp4'
const POSTER = 'public/thomas/poster.jpg'
const preview = process.argv.includes('--preview')

function waitForExit(child) {
  return new Promise((resolve) => child.on('exit', resolve))
}

async function waitForDebugger() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      if (response.ok) return response.json()
    } catch {
      await delay(200)
    }
  }
  throw new Error('Chrome DevTools did not start')
}

class Cdp {
  constructor(ws) {
    this.ws = ws
    this.nextId = 0
    this.pending = new Map()
    ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (!message.id || !this.pending.has(message.id)) return
      const { resolve, reject } = this.pending.get(message.id)
      this.pending.delete(message.id)
      if (message.error) reject(new Error(JSON.stringify(message.error)))
      else resolve(message.result)
    })
  }

  send(method, params = {}) {
    const id = ++this.nextId
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
}

async function openSocket(url) {
  const ws = new WebSocket(url)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })
  return new Cdp(ws)
}

const chrome = spawn('google-chrome', [
  '--headless=new',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  `--window-size=${WIDTH},${HEIGHT}`,
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=/tmp/thomas-motion-chrome',
  'about:blank'
], { stdio: 'ignore' })

try {
  await waitForDebugger()
  const pages = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((response) => response.json())
  const page = pages.find((entry) => entry.type === 'page')
  if (!page?.webSocketDebuggerUrl) throw new Error('No Chrome page target')
  const cdp = await openSocket(page.webSocketDebuggerUrl)
  await cdp.send('Page.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: 1,
    mobile: false
  })
  await cdp.send('Page.navigate', { url: STAGE })
  await delay(800)
  const ready = await cdp.send('Runtime.evaluate', {
    expression: 'window.ready()',
    awaitPromise: true,
    returnByValue: true
  })
  if (ready.exceptionDetails) {
    throw new Error(JSON.stringify(ready.exceptionDetails))
  }

  rmSync(FRAMES, { recursive: true, force: true })
  mkdirSync(FRAMES, { recursive: true })

  const times = preview
    ? [1.4, 5.0, 8.4, 11.8, 15.2, 18.6, 21.6, 24.6]
    : Array.from({ length: FPS * DURATION }, (_, index) => index / FPS)

  for (let index = 0; index < times.length; index += 1) {
    const time = times[index]
    await cdp.send('Runtime.evaluate', {
      expression: `window.seek(${time}); new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`,
      awaitPromise: true
    })
    const shot = await cdp.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 90,
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 },
      captureBeyondViewport: false
    })
    const name = preview ? `preview-${String(index + 1).padStart(2, '0')}.jpg` : `frame-${String(index + 1).padStart(4, '0')}.jpg`
    writeFileSync(`${FRAMES}/${name}`, Buffer.from(shot.data, 'base64'))
    if (!preview && index % 24 === 0) console.log(`frame ${index + 1}/${times.length}`)
  }

  if (preview) {
    console.log(`previews written to ${FRAMES}`)
  } else {

  const encode = spawn('ffmpeg', [
    '-y',
    '-framerate', String(FPS),
    '-i', `${FRAMES}/frame-%04d.jpg`,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', '18',
    '-preset', 'medium',
    '-movflags', '+faststart',
    OUTPUT
  ], { stdio: 'inherit' })
  const encodeCode = await waitForExit(encode)
  if (encodeCode !== 0) throw new Error(`ffmpeg exited ${encodeCode}`)

  const poster = spawn('ffmpeg', [
    '-y',
    '-ss', '5.0',
    '-i', OUTPUT,
    '-frames:v', '1',
    POSTER
  ], { stdio: 'inherit' })
  const posterCode = await waitForExit(poster)
  if (posterCode !== 0) throw new Error(`poster ffmpeg exited ${posterCode}`)
  console.log(`wrote ${OUTPUT}`)
  }
} finally {
  chrome.kill('SIGTERM')
}
