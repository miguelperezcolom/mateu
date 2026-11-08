// A Figma plugin runs with origin `null` and Cloudflare's API answers no CORS, so the plugin cannot
// call it. Deploy this Worker in YOUR Cloudflare account (free plan) and give the plugin its url: it
// forwards Cloudflare Pages calls and adds the CORS headers. It stores nothing and adds no
// credentials: the token is the one each request brings, and nothing but the Pages API is reachable.
const ALLOWED = /^\/client\/v4\/(accounts\/[^/]+\/pages\/projects(\/|$)|pages\/assets\/)/
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Max-Age': '7200',
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
    const url = new URL(request.url)
    if (!ALLOWED.test(url.pathname) || !['GET', 'POST'].includes(request.method)) {
      return new Response('Only the Cloudflare Pages API', { status: 403, headers: CORS })
    }
    const headers = {}
    for (const h of ['authorization', 'content-type']) {
      if (request.headers.get(h)) headers[h] = request.headers.get(h)
    }
    const upstream = await fetch(`https://api.cloudflare.com${url.pathname}${url.search}`, {
      method: request.method,
      headers,
      body: request.method === 'POST' ? request.body : undefined,
    })
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...CORS, 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
    })
  },
}
