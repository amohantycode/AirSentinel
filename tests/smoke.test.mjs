import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { setTimeout as delay } from 'node:timers/promises'
import { after, before, test } from 'node:test'

let server
let baseUrl
let serverOutput = ''
const fixture = JSON.parse(await readFile(new URL('../public/data-2025-latest.json', import.meta.url), 'utf8'))

before(async () => {
  // Reserve a free port so tests do not collide with a developer's app.
  const probe = createServer()
  probe.listen(0, '127.0.0.1')
  await once(probe, 'listening')
  const port = probe.address().port
  await new Promise((resolve, reject) => probe.close(error => error ? reject(error) : resolve()))
  baseUrl = `http://127.0.0.1:${port}`

  const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }
  for (const name of ['WEATHER_API_KEY', 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']) {
    env[name] = ''
  }
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)], {
    cwd: new URL('../', import.meta.url),
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  server.stdout.on('data', chunk => { serverOutput += chunk })
  server.stderr.on('data', chunk => { serverOutput += chunk })
  let startupError
  server.on('error', error => { startupError = error })
  for (let attempt = 0; attempt < 100; attempt++) {
    if (startupError) throw startupError
    if (server.exitCode !== null) throw new Error(`Production server exited. Run npm run build first.\n${serverOutput}`)
    try {
      const response = await fetch(`${baseUrl}/api/observations?limit=1`, { signal: AbortSignal.timeout(1000) })
      if (response.ok) return
    } catch { /* Wait for the server to bind its port. */ }
    await delay(100)
  }
  throw new Error(`Production server did not become ready.\n${serverOutput}`)
}, { timeout: 20000 })

after(async () => {
  if (!server || server.exitCode !== null) return
  const exited = once(server, 'exit')
  server.kill('SIGTERM')
  const forceStop = setTimeout(() => server.kill('SIGKILL'), 5000)
  try { await exited } finally { clearTimeout(forceStop) }
})

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(5000), ...options })
  return { status: response.status, body: await response.json() }
}

for (const path of ['/', '/map', '/about', '/forecast', '/resources']) {
  test(`page ${path} renders in the production build`, async () => {
    const response = await fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(5000) })
    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type'), /text\/html/)
    assert.match(await response.text(), /AirSentinel/)
  })
}

test('observations return the requested number of historical records with provenance', async () => {
  const { status, body } = await request('/api/observations?limit=3')
  assert.equal(status, 200)
  assert.equal(body.success, true)
  assert.equal(body.count, 3)
  assert.equal(body.data.length, 3)
  assert.equal(body.source, '2025 Historical Data')
  assert.equal(body.data[0].location_name, fixture[0].location)
  assert.equal(body.data[0].observed_at, fixture[0].date)
  assert.equal(body.data[0].aqi, fixture[0].aqi)
  assert.equal(body.data[0].lat, fixture[0].latitude)
  assert.equal(body.data[0].lon, fixture[0].longitude)
})

test('location filtering is case-insensitive and preserves matching records', async () => {
  const location = fixture[0].location.toUpperCase()
  const expected = fixture.filter(row => row.location.toUpperCase().includes(location)).slice(0, 2)
  const { status, body } = await request(`/api/observations?location=${encodeURIComponent(location)}&limit=2`)
  assert.equal(status, 200)
  assert.equal(body.count, expected.length)
  assert.deepEqual(body.data.map(row => row.location_name), expected.map(row => row.location))
})

test('an unmatched location returns an empty result', async () => {
  const { status, body } = await request('/api/observations?location=nonexistent-test-location')
  assert.equal(status, 200)
  assert.equal(body.count, 0)
  assert.deepEqual(body.data, [])
})

test('assessment rejects a missing start before invoking forecasting', async () => {
  const { status, body } = await request('/api/assess')
  assert.equal(status, 400)
  assert.match(body.error, /start/)
})

test('historical endpoint rejects unsupported date windows', async () => {
  const { status, body } = await request('/api/historical-aq?days=2')
  assert.equal(status, 400)
  assert.equal(body.success, false)
})

test('current conditions report missing configuration without calling a provider', async () => {
  const { status, body } = await request('/api/current-aq?city=Washington,DC')
  assert.equal(status, 500)
  assert.match(body.error, /WEATHER_API_KEY/)
})

test('forecasts report missing configuration without invoking Python', async () => {
  const { status, body } = await request('/api/forecasts?city=Washington,DC')
  assert.equal(status, 500)
  assert.match(body.error, /WEATHER_API_KEY/)
})

test('geocoding an empty query returns no results without contacting the provider', async () => {
  const { status, body } = await request('/api/geocode?q=')
  assert.equal(status, 200)
  assert.deepEqual(body.results, [])
})

test('community report rejects an empty body before a database write', async () => {
  const { status, body } = await request('/api/reports', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  })
  assert.equal(status, 400)
  assert.equal(body.success, false)
})
