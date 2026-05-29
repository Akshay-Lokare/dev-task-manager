import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import waitOn from 'wait-on'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const PORT = process.env.VITE_PORT || '5173'
const devUrl = `http://localhost:${PORT}`

const vite = spawn('npx', ['vite', '--port', PORT, '--strictPort'], {
  cwd: root,
  shell: true,
  stdio: ['inherit', 'pipe', 'inherit'],
  env: { ...process.env, BROWSER: 'none' },
})

vite.stdout.on('data', (chunk) => process.stdout.write(chunk))

vite.on('error', (err) => {
  console.error('Failed to start Vite:', err.message)
  process.exit(1)
})

try {
  await waitOn({ resources: [devUrl], timeout: 30000, interval: 200 })
} catch {
  console.error(`Vite did not start on ${devUrl}. Close any old dev servers and try again.`)
  vite.kill()
  process.exit(1)
}

const electron = spawn('npx', ['electron', '.'], {
  cwd: root,
  shell: true,
  stdio: 'inherit',
  env: { ...process.env, VITE_DEV_SERVER_URL: devUrl },
})

const shutdown = () => {
  vite.kill()
  electron.kill()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

electron.on('exit', (code) => {
  vite.kill()
  process.exit(code ?? 0)
})
