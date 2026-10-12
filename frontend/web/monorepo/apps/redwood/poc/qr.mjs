// "OPEN ON MOBILE" (@App(mobileQr), design/mobile-app-hub.md): the QR of the "add this UI" link the
// Mateu mobile app understands, and the model of the header dialog that shows it.
//
// The encoder is a plain-JS copy of the web lib's
// libs/mateu/src/mateu/ui/infra/ui/qr/qrEncoder.ts + mobileLink.ts (the VB bridge shares no code
// with that lib): a small, dependency-free QR Code encoder (ISO/IEC 18004), byte mode, versions
// 1–40, the four error-correction levels, the eight masks with the standard penalty rules. The two
// copies are pinned by the same decode round-trip (poc/test-mobile.mjs decodes with jsQR, a dev
// dependency of libs/mateu). Internals carry a `qr` prefix: every poc module shares ONE scope in the
// bridge (make-amd.mjs).
//
// The link carries NO secret — only where the UI lives. Credentials are entered at login (OIDC).

import { chromeText } from './i18n.mjs'

const QR_ECC_PER_BLOCK = {
  L: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
}
const QR_BLOCKS = {
  L: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
}
const QR_FORMAT_BITS = { L: 1, M: 0, Q: 3, H: 2 }

/** Modules available for data + ECC in a version (everything but the function patterns). */
export function qrRawDataModules(version) {
  let result = (16 * version + 128) * version + 64
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2
    result -= (25 * numAlign - 10) * numAlign - 55
    if (version >= 7) result -= 36
  }
  return result
}

/** Data codewords a version holds at an error-correction level. */
export function qrDataCodewords(version, ecc) {
  return Math.floor(qrRawDataModules(version) / 8) - QR_ECC_PER_BLOCK[ecc][version] * QR_BLOCKS[ecc][version]
}

function qrGfMul(x, y) {
  let z = 0
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d)
    z ^= ((y >>> i) & 1) * x
  }
  return z & 0xff
}

function qrRsDivisor(degree) {
  const result = new Array(degree).fill(0)
  result[degree - 1] = 1
  let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = qrGfMul(result[j], root)
      if (j + 1 < degree) result[j] ^= result[j + 1]
    }
    root = qrGfMul(root, 0x02)
  }
  return result
}

function qrRsRemainder(data, divisor) {
  const result = new Array(divisor.length).fill(0)
  for (const b of data) {
    const factor = b ^ result.shift()
    result.push(0)
    divisor.forEach((coef, i) => { result[i] ^= qrGfMul(coef, factor) })
  }
  return result
}

function qrAppendBits(bits, value, length) {
  for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1)
}

function qrDataCodewordsFor(bytes, version, ecc) {
  const capacityBits = qrDataCodewords(version, ecc) * 8
  const bits = []
  qrAppendBits(bits, 0b0100, 4) // byte mode
  qrAppendBits(bits, bytes.length, version <= 9 ? 8 : 16)
  for (const b of bytes) qrAppendBits(bits, b, 8)
  qrAppendBits(bits, 0, Math.min(4, capacityBits - bits.length))
  qrAppendBits(bits, 0, (8 - (bits.length % 8)) % 8)
  for (let pad = 0xec; bits.length < capacityBits; pad ^= 0xec ^ 0x11) qrAppendBits(bits, pad, 8)
  const out = []
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j]
    out.push(byte)
  }
  return out
}

function qrWithErrorCorrection(data, version, ecc) {
  const numBlocks = QR_BLOCKS[ecc][version]
  const blockEccLen = QR_ECC_PER_BLOCK[ecc][version]
  const rawCodewords = Math.floor(qrRawDataModules(version) / 8)
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks)
  const shortBlockLen = Math.floor(rawCodewords / numBlocks)
  const divisor = qrRsDivisor(blockEccLen)
  const blocks = []
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const len = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1)
    const dat = data.slice(k, k + len)
    k += len
    const eccBytes = qrRsRemainder(dat, divisor)
    if (i < numShortBlocks) dat.push(0)
    blocks.push(dat.concat(eccBytes))
  }
  const result = []
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((block, j) => {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(block[i])
    })
  }
  return result
}

function qrAlignmentPositions(version, size) {
  if (version === 1) return []
  const numAlign = Math.floor(version / 7) + 2
  const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2
  const result = [6]
  for (let pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos)
  return result
}

const QR_MASKS = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
]

function qrNewMatrix(size) {
  const m = {
    size,
    modules: Array.from({ length: size }, () => new Array(size).fill(false)),
    isFunction: Array.from({ length: size }, () => new Array(size).fill(false)),
  }
  m.setFunction = (x, y, dark) => { m.modules[y][x] = dark; m.isFunction[y][x] = true }
  return m
}

function qrDrawFormatBits(m, ecc, mask) {
  const data = (QR_FORMAT_BITS[ecc] << 3) | mask
  let rem = data
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
  const bits = ((data << 10) | rem) ^ 0x5412
  const bit = (i) => ((bits >>> i) & 1) !== 0
  const size = m.size
  for (let i = 0; i <= 5; i++) m.setFunction(8, i, bit(i))
  m.setFunction(8, 7, bit(6))
  m.setFunction(8, 8, bit(7))
  m.setFunction(7, 8, bit(8))
  for (let i = 9; i < 15; i++) m.setFunction(14 - i, 8, bit(i))
  for (let i = 0; i < 8; i++) m.setFunction(size - 1 - i, 8, bit(i))
  for (let i = 8; i < 15; i++) m.setFunction(8, size - 15 + i, bit(i))
  m.setFunction(8, size - 8, true) // the dark module
}

function qrDrawFunctionPatterns(m, version) {
  const size = m.size
  for (let i = 0; i < size; i++) {
    m.setFunction(6, i, i % 2 === 0)
    m.setFunction(i, 6, i % 2 === 0)
  }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy))
        const x = cx + dx
        const y = cy + dy
        if (x >= 0 && x < size && y >= 0 && y < size) m.setFunction(x, y, dist !== 2 && dist !== 4)
      }
    }
  }
  const align = qrAlignmentPositions(version, size)
  const n = align.length
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          m.setFunction(align[i] + dx, align[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
        }
      }
    }
  }
  qrDrawFormatBits(m, 'M', 0) // reserves the area; redrawn with the real values later
  if (version >= 7) {
    let rem = version
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25)
    const bits = (version << 12) | rem
    for (let i = 0; i < 18; i++) {
      const bit = ((bits >>> i) & 1) !== 0
      const a = size - 11 + (i % 3)
      const b = Math.floor(i / 3)
      m.setFunction(a, b, bit)
      m.setFunction(b, a, bit)
    }
  }
}

function qrDrawCodewords(m, codewords) {
  const size = m.size
  let i = 0
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j
        const upward = ((right + 1) & 2) === 0
        const y = upward ? size - 1 - vert : vert
        if (!m.isFunction[y][x] && i < codewords.length * 8) {
          m.modules[y][x] = ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0
          i++
        }
      }
    }
  }
}

function qrApplyMask(m, mask) {
  const fn = QR_MASKS[mask]
  for (let y = 0; y < m.size; y++) {
    for (let x = 0; x < m.size; x++) {
      if (!m.isFunction[y][x] && fn(x, y)) m.modules[y][x] = !m.modules[y][x]
    }
  }
}

/** The standard penalty score (rules N1–N4): lower is easier to read. */
export function qrPenalty(modules) {
  const size = modules.length
  let score = 0
  const line = (get) => {
    let run = 1
    for (let i = 1; i < size; i++) {
      if (get(i) === get(i - 1)) {
        run++
        if (run === 5) score += 3
        else if (run > 5) score++
      } else run = 1
    }
    for (let i = 0; i + 6 < size; i++) {
      if (get(i) && !get(i + 1) && get(i + 2) && get(i + 3) && get(i + 4) && !get(i + 5) && get(i + 6)) {
        const lightBefore = [1, 2, 3, 4].every((k) => i - k < 0 || !get(i - k))
        const lightAfter = [7, 8, 9, 10].every((k) => i + k >= size || !get(i + k))
        if (lightBefore || lightAfter) score += 40
      }
    }
  }
  for (let y = 0; y < size; y++) line((x) => modules[y][x])
  for (let x = 0; x < size; x++) line((y) => modules[y][x])
  for (let y = 0; y + 1 < size; y++) {
    for (let x = 0; x + 1 < size; x++) {
      const c = modules[y][x]
      if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) score += 3
    }
  }
  let dark = 0
  for (const row of modules) for (const cell of row) if (cell) dark++
  const total = size * size
  score += Math.ceil(Math.abs(dark * 20 - total * 10) / total - 1) * 10
  return score
}

/**
 * Encodes `text` (as UTF-8 bytes) in the smallest version that holds it at `ecc`, with the mask of
 * lowest penalty: { size, version, modules[y][x] (true = dark) }. Throws when it does not fit.
 */
export function encodeQr(text, ecc = 'M') {
  const bytes = Array.from(new TextEncoder().encode(text))
  let version = 1
  for (; version <= 40; version++) {
    const headerBits = 4 + (version <= 9 ? 8 : 16)
    if (headerBits + bytes.length * 8 <= qrDataCodewords(version, ecc) * 8) break
  }
  if (version > 40) throw new Error('Text too long for a QR code')
  const codewords = qrWithErrorCorrection(qrDataCodewordsFor(bytes, version, ecc), version, ecc)
  const size = version * 4 + 17
  let best
  let bestScore = Infinity
  for (let mask = 0; mask < 8; mask++) {
    const m = qrNewMatrix(size)
    qrDrawFunctionPatterns(m, version)
    qrDrawCodewords(m, codewords)
    qrApplyMask(m, mask)
    qrDrawFormatBits(m, ecc, mask)
    const score = qrPenalty(m.modules)
    if (score < bestScore) {
      bestScore = score
      best = m
    }
  }
  return { size, version, modules: best.modules }
}

/** The symbol as an SVG document with the 4-module quiet zone, always dark-on-white. */
export function qrSvg(qr, border = 4) {
  const dim = qr.size + border * 2
  let path = ''
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.modules[y][x]) path += `M${x + border},${y + border}h1v1h-1z`
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges">`
    + `<rect width="100%" height="100%" fill="#fff"/><path d="${path}" fill="#000"/></svg>`
}

/** The SVG as a data URI, for an <img> (which carries the alt text a screen reader needs). */
export function qrDataUri(text, ecc = 'M') {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(qrSvg(encodeQr(text, ecc)))
}

// ── the link (mobileLink.ts) ────────────────────────────────────────────────────────────────

export const MOBILE_ADD_URL = 'https://mateu.io/add'

const qrTrimSlashes = (s) => s.replace(/\/+$/, '')

/**
 * https://mateu.io/add?u=<url-encoded absolute base URL>[&r=<url-encoded route>]
 * `baseUrl` is the mount ('' for the root, '/crm'; an absolute URL is kept); `route` is relative to
 * the mount and is omitted when empty or '/'.
 */
export function mobileAddUrl(origin, baseUrl, route) {
  const base = String(baseUrl == null ? '' : baseUrl).trim()
  let absolute
  if (/^https?:\/\//i.test(base)) {
    absolute = qrTrimSlashes(base)
  } else {
    const path = base && base !== '/' ? qrTrimSlashes(base.startsWith('/') ? base : '/' + base) : ''
    absolute = qrTrimSlashes(origin) + path
  }
  let url = `${MOBILE_ADD_URL}?u=${encodeURIComponent(absolute)}`
  const r = String(route == null ? '' : route).trim()
  if (r && r !== '/') url += `&r=${encodeURIComponent(r)}`
  return url
}

// ── the dialog ──────────────────────────────────────────────────────────────────────────────

/** A phone (or any touch-first device): it gets the link instead of the QR. */
export const MOBILE_QR_PHONE_QUERY = '(max-width: 600px), (pointer: coarse)'

export function isPhoneLike(win = typeof window !== 'undefined' ? window : null) {
  return !!(win && win.matchMedia && win.matchMedia(MOBILE_QR_PHONE_QUERY).matches)
}

/**
 * What the "Open on mobile" dialog shows. Pure: { url, img, alt, phone }.
 * `img` is empty on a phone (the dialog shows the "Open in the Mateu app" link there).
 */
export function mobileQrModelOf({ title, origin, mount, route, phone } = {}) {
  const url = mobileAddUrl(origin || '', mount || '', route || '')
  return {
    url,
    phone: !!phone,
    img: phone ? '' : qrDataUri(url),
    alt: chromeText('mobileQrAlt', { app: title || chromeText('mobileQrThisApp') }),
  }
}
