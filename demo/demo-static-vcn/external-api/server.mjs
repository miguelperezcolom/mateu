// THE EXTERNAL API — not a Mateu backend.
//
// A tiny, dependency-free REST server standing in for somebody else's API (think OCI's
// /20160918/vcns): the static UI talks to it straight from the browser, with CORS, exactly as it
// would talk to a public cloud API. It is in the demo only so the e2e is deterministic and writable
// (delete really deletes; POST /__reset puts the seed back). Nothing in here knows about Mateu.
//
//   GET    /api/vcns                     → [ {id, displayName, cidrBlock, compartment, lifecycleState, …} ]
//   GET    /api/vcns/:id                 → one VCN (404 when absent)
//   DELETE /api/vcns/:id                 → 204 (and its subnets go with it)
//   GET    /api/vcns/:id/subnets         → [ {id, vcnId, displayName, cidrBlock, lifecycleState} ]
//   POST   /__reset                      → reseeds (test hook)
//
// Usage: node server.mjs [port]   (default 8790)
import http from 'node:http'

const port = Number(process.argv[2] ?? process.env.PORT ?? 8790)

const STATES = ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'PROVISIONING', 'TERMINATING']
const COMPARTMENTS = ['prod', 'dev', 'sandbox']

function seed() {
  const vcns = []
  const subnets = []
  for (let i = 1; i <= 12; i++) {
    const id = String(i)
    vcns.push({
      id,
      displayName: `vcn-${COMPARTMENTS[i % 3]}-${String(i).padStart(2, '0')}`,
      cidrBlock: `10.${i}.0.0/16`,
      compartment: COMPARTMENTS[i % 3],
      lifecycleState: STATES[i % STATES.length],
      dnsLabel: `vcn${i}`,
      timeCreated: `2026-0${1 + (i % 9)}-1${i % 10}T10:00:00Z`,
    })
    const n = 1 + (i % 3)
    for (let s = 1; s <= n; s++) {
      subnets.push({
        id: `${id}-${s}`,
        vcnId: id,
        displayName: `subnet-${s === 1 ? 'public' : 'private'}-${s}`,
        cidrBlock: `10.${i}.${s}.0/24`,
        lifecycleState: s === 3 ? 'PROVISIONING' : 'AVAILABLE',
      })
    }
  }
  return { vcns, subnets }
}

let db = seed()

const send = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': '*',
  })
  res.end(body === undefined ? '' : JSON.stringify(body))
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`)
  const parts = url.pathname.split('/').filter(Boolean)
  if (req.method === 'OPTIONS') return send(res, 204)
  if (req.method === 'POST' && url.pathname === '/__reset') {
    db = seed()
    return send(res, 200, { reset: true })
  }
  if (parts[0] !== 'api' || parts[1] !== 'vcns') return send(res, 404, { error: 'not found' })
  const id = parts[2]
  if (!id) {
    if (req.method === 'GET') return send(res, 200, db.vcns)
    return send(res, 405, { error: 'method not allowed' })
  }
  const vcn = db.vcns.find(v => v.id === id)
  if (!vcn) return send(res, 404, { error: `VCN ${id} not found` })
  if (parts[3] === 'subnets' && req.method === 'GET') {
    return send(res, 200, db.subnets.filter(s => s.vcnId === id))
  }
  if (parts.length === 3 && req.method === 'GET') return send(res, 200, vcn)
  if (parts.length === 3 && req.method === 'DELETE') {
    db.vcns = db.vcns.filter(v => v.id !== id)
    db.subnets = db.subnets.filter(s => s.vcnId !== id)
    return send(res, 204)
  }
  return send(res, 405, { error: 'method not allowed' })
})

server.listen(port, () => console.log(`external API (not Mateu) on http://localhost:${port}/api/vcns`))
