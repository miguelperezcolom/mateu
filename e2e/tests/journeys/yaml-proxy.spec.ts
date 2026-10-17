import { test, expect } from '@playwright/test';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { posts } from './_support';

/**
 * Writing from YAML through the server, against a REAL upstream (the demo-starwars shape, without
 * the internet): a definition-only page (journeys/proxied.yaml, no view model) whose actions are
 * `proxy: true` REST calls carrying `${secret.J_UPSTREAM_KEY}`. The upstream below is a plain node
 * server that answers 401 unless the X-Api-Key header is the secret, and records what it received —
 * so a success proves the SERVER injected the key, and the browser's traffic proves it never saw it.
 *
 * The secret comes from mvc-app1's JourneySecrets (a SecretsProvider bean). The upstream port is
 * fixed (19395) because the YAML names it; the file runs serially so only one upstream listens.
 */

const SECRET = 'j-upstream-0a6f' // JourneySecrets.UPSTREAM_KEY
const PORT = 19395

type Received = { method: string, url: string, key: string | undefined, body: string }
const received: Received[] = []
let upstream: http.Server

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  upstream = http.createServer((req, res) => {
    let body = ''
    req.on('data', c => { body += c })
    req.on('end', () => {
      const key = req.headers['x-api-key'] as string | undefined
      received.push({ method: req.method!, url: req.url!, key, body })
      res.setHeader('content-type', 'application/json')
      if (key !== SECRET) { res.statusCode = 401; res.end('{"error":"bad key"}'); return }
      if (req.method === 'GET' && req.url!.startsWith('/address')) {
        const zip = new URL(req.url!, 'http://x').searchParams.get('zip')
        res.end(JSON.stringify({ address: { street: zip === '28001' ? 'Gran Vía 1' : 'Unknown street' } }))
        return
      }
      if (req.method === 'POST' && req.url === '/notes') {
        const note = JSON.parse(body)
        res.statusCode = 201
        res.end(JSON.stringify({ noteId: 'N-' + received.filter(r => r.method === 'POST').length, ...note }))
        return
      }
      res.statusCode = 404; res.end('{}')
    })
  })
  await new Promise<void>(resolve => upstream.listen(PORT, '127.0.0.1', resolve))
  expect((upstream.address() as AddressInfo).port).toBe(PORT)
})

test.afterAll(async () => {
  await new Promise(resolve => upstream.close(resolve))
})

test.beforeEach(() => { received.length = 0 })

test.describe('YAML actions through the server (/j/proxied)', () => {

  test('a proxied read reaches the upstream with the secret and merges the result', async ({ page }) => {
    const sent = posts(page)
    const browserSaw: string[] = []
    page.on('request', r => browserSaw.push(r.url() + ' ' + JSON.stringify(r.headers()) + ' ' + (r.postData() ?? '')))
    await page.goto('/j/proxied')
    await page.getByRole('textbox', { name: 'Zip' }).fill('28001')
    await page.getByRole('button', { name: 'Look up' }).click()

    await expect(page.getByRole('textbox', { name: 'Street' })).toHaveValue('Gran Vía 1')
    await expect(page.getByText('Address found').first()).toBeVisible()

    expect(received).toEqual([{ method: 'GET', url: '/address?zip=28001', key: SECRET, body: '' }])
    expect(sent.some(s => s.body.includes('__restfetch__'))).toBe(true)
    // neither the key nor the upstream ever travelled through this browser
    expect(browserSaw.join('\n')).not.toContain(SECRET)
    expect(browserSaw.join('\n')).not.toContain(`:${PORT}`)
  })

  test('a proxied write posts the JSON body with the secret and shows the result', async ({ page }) => {
    const browserSaw: string[] = []
    page.on('request', r => browserSaw.push(r.url() + ' ' + (r.postData() ?? '')))
    await page.goto('/j/proxied')
    await page.getByRole('textbox', { name: 'Zip' }).fill('08001')
    // a quote and a backslash: the values are JSON-escaped into the body
    await page.getByRole('textbox', { name: 'Note', exact: true }).fill('Ring "twice" \\ please')
    await page.getByRole('button', { name: 'Save note', exact: true }).click()

    await expect(page.getByText('Note saved').first()).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Note id' })).toHaveValue('N-1')

    expect(received).toHaveLength(1)
    expect(received[0].method).toBe('POST')
    expect(received[0].key).toBe(SECRET)
    expect(JSON.parse(received[0].body)).toEqual({ zip: '08001', note: 'Ring "twice" \\ please' })
    expect(browserSaw.join('\n')).not.toContain(SECRET)
  })

  // A by-ref action on a page whose mount has no app shell: the catalogue used to travel only in
  // AppDto.restSources, so the click failed with a console warning. Now every response carries the
  // REST sources its components reference (UIIncrementDto.restSources).
  test('a proxied write named by ref (sources.yaml) works on a page with no app shell', async ({ page }) => {
    await page.goto('/j/proxied')
    await page.getByRole('textbox', { name: 'Note', exact: true }).fill('by ref')
    await page.getByRole('button', { name: 'Save note by ref' }).click()
    await expect(page.getByText('Note saved').first()).toBeVisible()
    expect(received.map(r => r.key)).toEqual([SECRET])
  })

  test('an upstream that refuses is reported to the user and nothing is merged', async ({ page }) => {
    await page.goto('/j/proxied')
    await page.getByRole('textbox', { name: 'Zip' }).fill('28001')
    // the upstream now rejects every key: as if it had been rotated without telling the app
    const realKey = SECRET
    upstream.removeAllListeners('request')
    upstream.on('request', (req, res) => {
      received.push({ method: req.method!, url: req.url!, key: req.headers['x-api-key'] as string, body: '' })
      res.statusCode = 401; res.end('{}')
    })
    await page.getByRole('button', { name: 'Look up' }).click()
    await expect(page.getByRole('alert').filter({ hasText: /Request failed|401/ }).first()).toBeAttached()
    await expect(page.getByText('Address found')).toHaveCount(0)
    await expect(page.getByRole('textbox', { name: 'Street' })).toHaveValue('')
    expect(received.map(r => r.key)).toEqual([realKey])
  })
})
